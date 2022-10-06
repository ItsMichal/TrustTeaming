
import datetime
import threading
from re import U
from data.CrimeDataManager import CrimeDataManager
from dataModels.ActorInstruction import ActorInstruction
from dataModels.LiveExperiment import LiveExperiment
from dataModels.LiveUser import LiveUser
from dataModels.Pin import Pin
import sys
import rom.exceptions
from dataModels.RoundConfig import RoundConfig
from live.ActorCore import ActorCore
from live.ScoreCore import ScoreCore

sys.path.append("..") #python bs
from TrustTeaming import socketio
from flask_socketio import emit, Namespace

#TODO: Change emit live cur data so it emits all users' versions of the round data, instead of just user 1
class LiveCore(Namespace):
    """LiveCore is responsible for everything that happens in realtime.
    It is also in need of a refactor if you have time, because I don't"""

    route_base : str = "/live"

    # Initialize a new live experiment.
    def __init__(self, dataMgr : CrimeDataManager, live_data : LiveExperiment):

        # Class vars
        self.data : LiveExperiment = live_data #see LiveData.py for structure
        self.data.update(state=b'idle')
        self.crimeDataMgr = dataMgr
        self.code = live_data.config.code.decode() 
        self.last_pinId = 0 # used for pin ID gen
        self.timers = {}
        self.actor = None #only one actor at a time for now
        self.scoreCore = ScoreCore(self.crimeDataMgr)
        self.reviewCrimes = {}
        #TODO: allow multiple actors if needed later on

        #this is used for the flask-socketio implementation
        super().__init__(self.route_base+self.code)

        #this block deletes previously exisitng
        #items that may conflict with this in the db
        # TODO: Possibly refactor into own function?
        for thing in LiveUser.query.filter(code=self.code):
            thing.delete()
            print("DELETED USER!")
        for pin in Pin.query.filter(code=self.code):
            pin.delete()
        
        # Initialize the live users
        self.initLiveUsers()
        print("Live core initialized", self.route_base+self.code)

    def __del__(self):
        print("Deleting live core")
        super().__del__()

    def checkForActor(self):
        actors = ActorInstruction.query.filter(code=self.code).all()
        if len(actors) > 0:
            return True
        else:
            return False

    # Creates the live users based on the config
    def initLiveUsers(self):
        for userId in self.data.config.valid_uids:
            print("Creating user: {}".format(userId))
            newLiveUser = LiveUser(userId=str(userId), code=self.code, liveExperiment=self.data, ready=False)
            newLiveUser.save(force=True)
        if self.checkForActor():
            #TODO: allow for naming of actors/ai
            newActor = LiveUser(userId=str("AI"), code=self.code, liveExperiment=self.data, ready=True, isActor=True)
            newActor.save(force=True)
        print("CREATED USERS!", self.data.users)

    # Sets a user to ready
    def setUserReady(self, userid):
        userQuery = (LiveUser.query
            .filter(userId=str(userid))
            .filter(code=self.code)
            .all())

        if len(userQuery) == 1:
            userQuery[0].update(ready=True)
            userQuery[0].save()
            return 1
        else:
            print("ERROR - User ID not in users!")
            return 0

    def getRoundCfg(self, roundId, userId=None) -> RoundConfig:
        if(userId is None):
            print(self.data.users)
            userId = self.data.users[0].userId.decode()
            
        for cfg in self.data.config.roundConfigs:
            if cfg.user_id == int(userId) and cfg.round_id == roundId:
                return cfg
        
        return None

    def getCurRoundCfg(self, userid=None) -> RoundConfig:        
        return self.getRoundCfg(self.data.curRoundNum, userid)

    def getAllowedCategories(self, userid=None):
        return self.getCurRoundCfg(userid).layers

    def getCurrentDate(self, userid=None):
        return self.getCurRoundCfg(userid).target_date

    #Emits an updated experiment state to the clients
    def emitCurLiveData(self, userid=None):
        socketio.emit('sharedLiveData', 
        {
            'timeStarted': str(self.data.timeStarted),
            'timeRoundStarted': str(self.data.timeRoundStarted),
            'state': self.data.state.decode(),
            'curRoundNum': self.data.curRoundNum,
            'users': {user.userId.decode():user.toJSON() for user in self.data.users},
            'curPins': {pin.pinId:pin.toJSON() for pin in self.data.curPins},
            'curRoundCfg': self.getCurRoundCfg(userid).toJSON(),
            'reviewCrimes': self.reviewCrimes,
        }, broadcast=True, namespace=self.route_base+self.code)

    def countCurPinColors(self) -> dict:
        colors = {"red": 0, "green": 0}
        for pin in self.data.curPins:
            if pin.color.decode() in colors:
                colors[pin.color.decode()] += 1
            else:
                colors[pin.color.decode()] = 1
        return colors

    # Handles the creation of a pin in the DB
    def placePin(self, lat, lon, color, userId, aiPlaced=False):
        # print(Pin.query.filter(code=self.code))

        #Check for overflow
        if(not aiPlaced):
            colors = self.countCurPinColors()
            print("COLOR", colors)
            curConfig = self.getCurRoundCfg(userId)
            if(color == "red" and colors["red"] >= curConfig.max_red):
                self.emitCurLiveData()
                return False
            elif(color == "green" and colors["green"] >= curConfig.max_green):
                self.emitCurLiveData()
                return False
                


        while True:
            try:
                newPin = Pin(pinId=self.last_pinId, 
                            color=color,
                            code=self.code,
                            liveExperiment=self.data,
                            aiPlaced=aiPlaced,
                            timePlaced=datetime.datetime.now(),
                            userPlaced=userId,
                            lat=lat,
                            lon=lon)

                
                newPin.save(force=True)
            except rom.exceptions.UniqueKeyViolation:
                print("Id {} Taken!".format(self.last_pinId))
                self.last_pinId += 1
                #Failsafe, but cannot have more than 10,000 pins
                #at any time
                if(self.last_pinId > 10000):
                    break
            else:
                break
                
        self.data.curPins.append(newPin)

        self.last_pinId+=1

        self.emitCurLiveData()

        return newPin.toJSON()

    def deletePin(self, pinId, userId):
        #TODO: Use userId for logging

        pinToDelete = (Pin.query
            .filter(pinId=pinId)
            .filter(code=self.code)
            .all())
        
        if(len(pinToDelete) == 1):
            # delete
            pinToDelete[0].delete()
            print("Pin deleted successfully!")
        else:
            print("No pin found!!!")

    def movePin(self, pinId, userId, newLat, newLon):
        pinToMove = (Pin.query
            .filter(pinId=pinId)
            .filter(code=self.code)
            .all())   
        print(pinToMove)

        if(len(pinToMove) == 1):
            pinToMove[0].update(lat=newLat, lon=newLon, userMoved=userId.encode())
            pinToMove[0].save()
            print("Pin moved!")
        else:
            #Ideally never ends up here
            print("Pin to be moved unsuccessfully located :(")
    
    def checkReadyToStartRound(self):
        print(self.data.users)
        for user in self.data.users:
            if not user.ready:
                return False
        return True

    def startupActorForCurRound(self):
        instructions = ActorInstruction.query.filter(code=self.code).filter(roundId=self.data.curRoundNum).all()
        print("ACTOR INST", instructions)
        if(len(instructions) > 0):
            self.actor = ActorCore(instructions, self.placePin)
            self.actor.start()
            return True
        else:
            return False

    def startNextRound(self):
        print("STARTING NEXT ROUND", self.getCurRoundCfg().time)
        self.reviewCrimes = {}
        for user in self.data.users:
            if(not user.isActor):
                user.update(ready=False)
                user.save()

        self.data.timeRoundStarted = datetime.datetime.now()
        self.data.state = b'running'
        self.data.save()
        self.timers['roundTimer'] = threading.Timer(self.getCurRoundCfg().time, self.endRound)
        self.timers['roundTimer'].start()
        self.startupActorForCurRound()
        self.emitCurLiveData()
    


    def endRound(self):
        #TODO score calculation
        print("ENDING ROUND")

        (protoScores, crimesToReview) = self.scoreCore.calculateScores(self.data.curPins, self.getCurrentDate().__str__(), self.getAllowedCategories())
        print(protoScores)
        self.reviewCrimes = crimesToReview

        #TODO change Pin structure
        #to allow for multiple rounds
        #without having to delete

        self.data.state = b'review'
        self.data.save()
        self.emitCurLiveData()
    
    def endReview(self):
        for pin in self.data.curPins:
            pin.delete()
        self.last_pinId = 0

        if(self.getRoundCfg(self.data.curRoundNum+1) is not None):
            self.data.curRoundNum += 1
        else:
            self.endExperiment()
        self.data.state = b'idle'
        self.data.save()
        self.emitCurLiveData()


    def endExperiment(self):
        #TODO: final data export
        self.data.state = b'ended'

    # Stales out ready after 15 seconds to ensure everyone is ready
    def staleReady(self, user : int):
        if (self.data.state.decode() == "idle"):
            userQuery = (LiveUser.query
                .filter(userId=str(user))
                .filter(code=self.code)
                .all())

            #TODO dangerous assumption that user exists here
            # userQuery[0].update(ready=False)
            userQuery[0].save()
            self.emitCurLiveData()
            print("STALED", userQuery[0].toJSON())

    # Client-side Live
    # CLIENT SIDE FUNCTIONS/SOCKETIO HERE

    def on_crimeLiveConfig(self, req={}):
        if 'userId' in req:
            emit('liveCfg', {
                'curDate': self.getCurrentDate(req['userId']).__str__(),
                'categories': self.getAllowedCategories(req['userId'])
            }, broadcast=True)

    def on_requestLiveData(self, req={}):
        self.emitCurLiveData()
    
    def on_readyUp(self, req={}):
        print("USER READYING", req)
        if 'userId' in req:
            if(self.setUserReady(req['userId'])):
                self.emitCurLiveData()

                if(self.checkReadyToStartRound()):
                    if('review' in req and req['review']):
                        self.endReview()
                    else:
                        self.startNextRound()

                if(req['userId'] in self.timers):
                    self.timers[req['userId']].cancel()
                self.timers[req['userId']] = threading.Timer(15.0, self.staleReady, args=(req['userId'],))
                self.timers[req['userId']].start()
    # handles pin place events
    def on_pinPlaced(self, req={}):
        print("PIN PLACED!", req)
        if 'lat' in req and 'lon' in req and 'userId' in req and 'color' in req:
            self.placePin(req['lat'], req['lon'], req['color'], req['userId'])

    #handles pin delete events from the client
    def on_pinDeleted(self, req={}):
        print("PIN DELTED!", req)
        if 'userId' in req and 'pinId' in req:
            self.deletePin(req['pinId'], req['userId'])
            self.emitCurLiveData()

    #handles pin move events from the client
    def on_pinMoved(self, req={}):
        print("PIN MOVED", req)
        if ('userId' in req and 'pinId' in req and 'lat' in req and 'lon' in req):

            self.movePin(req['pinId'],req['userId'], req['lat'], req['lon'])
            self.emitCurLiveData()