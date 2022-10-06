
# Runs the AI


from data import CrimeDataManager
from data.CrimeDataManager import CrimeInstance
from dataModels.Pin import Pin


class ScoreCore():
    """Score Core is responsible for the scoring in this experiment.
    """

    def __init__(self, crimeDataMgr : CrimeDataManager):
        self.crimeDataMgr = crimeDataMgr
    

    #     # TODO: Implement crime weights in a satisfactory way
    #     # self.crime_weights = {
    #     #     'aggravated-assault': 2,
    #     #     'all-other-crimes': 0,
    #     #     'arson': 2, 
    #     #     'auto-theft': 1,
    #     #     'burglary': 2,
    #     #     'drug-alcohol': 1,
    #     #     'larceny': 1,
    #     #     'murder': 2, 
    #     #     'other-crimes-against-persons': 0, 
    #     #     'public-disorder': 0, 
    #     #     'robbery': 2, 
    #     #     'theft-from-motor-vehicle': 1, 
    #     #     'traffic-accident': 1, 
    #     #     'white-collar-crime': 0
    #     # }
    

    def start(self):
        self.runEvents()
        print("Actor running!")

    def calculateScores(self, pins : list[Pin], date : str, categories : list[str]):
        """Calculates the users' scores based on a list of pins, the target date, and categories

        Args:
            pins (list[Pin]): List of Pins to score
            date (str): Target Date string in format YYYY-MM-DD
            categories (list[str]): List of Crime Categories to score against

        Returns:
            (dict, dict): Returns a tuple of the scores dict (by userId), 
            and then the list of local crimes to be displayed for review
        """
        
        # Split pin list based on user

        scores = {}

        #TODO: config for radius
        pinsToLocalCrimes = self.crimeDataMgr.getCrimesInPinsRadius(pins, 500, date, date, categories)
        print("PINS TO LOCAL", pinsToLocalCrimes)

        for pin in pins:
            userToCredit = pin.userMoved.decode() if pin.userMoved.decode() != "" else pin.userPlaced.decode()

            localCrimes : list[CrimeInstance] = pinsToLocalCrimes[pin.pinId]

            if(userToCredit in scores):
                scores[userToCredit] += len(localCrimes)
            else:
                scores[userToCredit] = len(localCrimes)
        
        return (scores, self.crimeDataMgr.getCrimeDataFromTotalOutput(pinsToLocalCrimes))



        # DataManager().crimeDataMgr.calculateScores(pins)

