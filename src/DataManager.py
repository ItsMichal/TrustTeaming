import redis

from rom import util
from dataModels.Experiment import ExperimentConfig
from dataModels.Config import RoundConfig
import datetime

# Singleton Data Mgr class
# https://python-patterns.guide/gang-of-four/singleton/

class DataManager(object):
    _instance = None
    def __new__(self):
        if self._instance is None:
            print("Creating Experiment Config")
            self._instance = super(DataManager, self).__new__(self)
            util.set_connection_settings(host="127.0.0.1", db=1)
            # DataManager.createExperimentConfig(1,repr(2134))
            # self.createRoundConfig(2, 1, 2, ['testlayer', 'testlayer2'], 'Who is the barnacle?', 120, datetime.datetime.now(), 8,8)
            print(self._instance.getExperimentConfig(1))
            print(self._instance.getRoundConfig(2,1,2))
            print(self._instance.getRoundConfig(2,1,1))
        return self._instance


    def createRoundConfig(self, user_id, experiment_id, round_id, layers, question, time, target_date, max_red, max_green):
        try:
            experiment_config = self.getExperimentConfig(experiment_id)

            newRoundConfig = RoundConfig(user_id=user_id, experiment_id=experiment_id, 
                                        round_id=round_id, layers=layers, question=question, 
                                        time=time, target_date=target_date, max_red=max_red,
                                        max_green=max_green, experiment_config=experiment_config)

            newRoundConfig.save()
        except AttributeError:
            print("Could not create round data - AttrError")

    def createExperimentConfig(self, experiment_id, code):
        try:
            newExperimentConfig = ExperimentConfig(experiment_id=experiment_id, code=code)
            newExperimentConfig.save()
        except AttributeError as ater:
            print("Could not create round data - AttrError " ,ater)

    def getExperimentConfig(self, given_experiment_id):
        try:
            getExperimentCfg = ExperimentConfig.query.filter(experiment_id=given_experiment_id).first()
            return getExperimentCfg
        except BaseException as err:
            print(err)

    def getRoundConfig(self, user_id, experiment_id, round_id):
        try:
            getRoundCfg = RoundConfig.query.filter(user_id=user_id).filter(experiment_id=experiment_id).filter(round_id=round_id).first()
            return getRoundCfg
        except BaseException as err:
            print(err)

if __name__ == '__main__':
    DataManager()