import json
import redis

from rom import util
from live.LiveCore import LiveCore
from data.CrimeDataManager import CrimeDataManager
from dataModels.ExperimentConfig import ExperimentConfig
from dataModels.RoundConfig import RoundConfig
from dataModels.LiveExperiment import LiveExperiment
from dataModels.Pin import Pin
from TrustTeaming import socketio
import datetime

# Singleton Data Mgr class
# https://python-patterns.guide/gang-of-four/singleton/

class DataManager(object):
    _instance = None
    crimeDataMgr = None

    def __initializeLiveExps(self):
        all_exps = LiveExperiment.query.all()

        for exp in all_exps:
            new_core = LiveCore(exp)
            self.liveCores[exp.config.code.decode()] = new_core
            socketio.on_namespace(new_core)

    def __new__(self):
        if self._instance is None:
            print("Creating Experiment Config")
            self._instance = super(DataManager, self).__new__(self)
            self.crimeDataMgr = CrimeDataManager()
            self.liveCores = {}
            util.set_connection_settings(host="127.0.0.1", db=1) # update this to be reusable
            self._instance.__initializeLiveExps()
        return self._instance


    def createRoundConfig(self, user_id, code, round_id, layers, question, time, target_date, max_red, max_green, force=False):
        try:
            experiment_config = self.getExperimentByCode(code)

            if(force):
                oldRConfig = self.getRoundConfig(user_id=user_id, code=code, round_id=round_id)
                if(oldRConfig is not None):
                    oldRConfig.delete()

            newRoundConfig = RoundConfig(user_id=user_id, code=code, 
                                        round_id=round_id, layers=layers, question=question, 
                                        time=time, target_date=target_date, max_red=max_red,
                                        max_green=max_green, experiment_config=experiment_config)

            newRoundConfig.save()
        except AttributeError as attr:
            print("Could not create round data - AttrError", attr)

    def createExperimentConfig(self, code, force=False):
        try:
            if(force):
                oldExperiment = self.getExperimentByCode(code)
                # print(oldExperiment)
                if(oldExperiment is not None):
                    oldExperiment.delete()
            
            newExperimentConfig = ExperimentConfig(code=code, valid_uids=[])
            newExperimentConfig.save(force=True)
        except AttributeError as ater:
            print("Could not create experiment data - AttrError " ,ater)
            raise ater
        except BaseException as err:
            print(err)
            raise err
    
    def getExperimentByCode(self, code) -> ExperimentConfig:
        try:
            getExperimentRelatedToCode = ExperimentConfig.get_by(code=code.encode())
            return getExperimentRelatedToCode
        except BaseException as err:
            print(err)
            return None

    def getLiveExperimentByCode(self, code) -> LiveExperiment:
        try:
            getExperimentRelatedToCode = ExperimentConfig.get_by(code=code.encode())
            # print(getExperimentRelatedToCode.live_experiment)
            return getExperimentRelatedToCode.live_experiment
        except BaseException as err:
            print(err)
            return None

    def getRoundConfig(self, user_id, code, round_id):
        try:
            getRoundCfg = RoundConfig.query.filter(user_id=user_id).filter(round_id=round_id).filter(code=code).first()
            # print(getRoundCfg)
            return getRoundCfg
        except BaseException as err:
            print(err)

    def getExperimentConfigJSON(self, code):
        returnJson = {}
        
        exp = self.getExperimentByCode(code)
        code = exp.code.decode()
        valid_uids = exp.valid_uids
        rounds = []

        for rnd in exp.roundConfigs:
            rounds.append({"round_id":rnd.round_id, "user_id":rnd.user_id, "question":rnd.question.decode()})
        
        returnJson = {"code":code, "valid_uids":valid_uids, "rounds":rounds}
        
        return returnJson


    def getExperimentsJSON(self):
        all_exps = ExperimentConfig.query.all()

        returnJson = {"configs":[]}

        for exp in all_exps:
            code = exp.code.decode()
            valid_uids = exp.valid_uids
            rounds = []

            for rnd in exp.roundConfigs:
                rounds.append({"round_id":rnd.round_id, "user_id":rnd.user_id, "question":rnd.question.decode(), "layers": rnd.layers})
            returnJson["configs"].append({"code":code, "valid_uids":valid_uids, "rounds":rounds})

        return returnJson

    #TODO- add pins
    def getLiveExperimentJSON(self, code):
        live_exp = self.getLiveExperimentByCode(code)


        returnJson = {"time_started": live_exp.time_started.isoformat(timespec='milliseconds'), "code": live_exp.config.code.decode(), 
                        "config": self.getExperimentConfigJSON(live_exp.config.code.decode()),
                        "state": live_exp.state.decode(), "timeInRound": live_exp.timeInRound,
                        "curRoundNum": live_exp.curRoundNum, "users":live_exp.users}        
        
        return returnJson

    def getLiveExperimentsJSON(self):
        all_exp = LiveExperiment.query.all()

        returnJson = {"live_experiments":{}}

        for exp in all_exp:
            returnJson["live_experiments"][exp.config.code.decode()] = self.getLiveExperimentJSON(exp.config.code.decode())

        return returnJson



    # Stops an experiment by deleting it
    # TODO- add save feature once logging implemented
    def stopExperiment(self, code):
        if code in self.liveCores:
            self.liveCores.pop(code)

        target_exp = self.getExperimentByCode(code)
        target_exp.live_experiment.delete()
        target_exp.save(force=True)


    # Initialize the Live Experiment based on an Experiment Config (via its code)
    def initializeExperiment(self, code, force=False):
        target_exp = self.getExperimentByCode(code)

        #Check if exp exists, and stop or abort according to force
        print(target_exp.live_experiment)
        if(target_exp.live_experiment is not None):
            if(force):
                self.stopExperiment(code)
            else:
                raise Exception("Live experiment already running for this config. Try with force.")
        
        newLiveExperiment = LiveExperiment(config=target_exp, time_started=datetime.datetime.now())
        newLiveExperiment.save()

        self.liveCores[code] = LiveCore(newLiveExperiment);
        
        return newLiveExperiment

    def getLiveCore(self, code):
        if code in self.liveCores:
            return self.liveCores[code]
        else:
            return None

if __name__ == '__main__':
    DataManager()