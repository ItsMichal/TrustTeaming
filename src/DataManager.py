import json
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
            util.set_connection_settings(host="127.0.0.1", db=1) # update this to be reusable
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
                print(oldExperiment)
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
    
    # Deprec
    # def getExperimentById(self, given_experiment_id):
    #     try:
    #         getExperimentCfg = ExperimentConfig.query.filter(experiment_id=given_experiment_id).first()
    #         return getExperimentCfg
    #     except BaseException as err:
    #         print(err)
    #         return None
    
    def getExperimentByCode(self, code) -> ExperimentConfig:
        try:
            getExperimentRelatedToCode = ExperimentConfig.get_by(code=code.encode())
            return getExperimentRelatedToCode
        except BaseException as err:
            print(err)
            return None

    def getRoundConfig(self, user_id, code, round_id):
        try:
            getRoundCfg = RoundConfig.query.filter(user_id=user_id).filter(round_id=round_id).filter(code=code).first()
            print(getRoundCfg)
            return getRoundCfg
        except BaseException as err:
            print(err)

    def getExperimentsJSON(self):
        all_exps = ExperimentConfig.query.all()

        returnJson = {"configs":[]}

        for exp in all_exps:
            code = exp.code.decode()
            valid_uids = exp.valid_uids
            rounds = []

            for rnd in exp.roundConfigs:
                rounds.append({"round_id":rnd.round_id, "user_id":rnd.user_id, "question":rnd.question.decode()})
            returnJson["configs"].append({"code":code, "valid_uids":valid_uids, "rounds":rounds})

        print(returnJson)
        return returnJson


if __name__ == '__main__':
    DataManager()