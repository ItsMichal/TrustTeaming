# Takes a json from a request and returns a new data model
import json
from dataModels.ExperimentConfig import ExperimentConfig
from dataModels.RoundConfig import RoundConfig
from dataModels.ActorInstruction import ActorInstruction

#import datamanager
from data import DataManager


def jsonToRounds(experiment_config, rounds : list):
        for round in rounds:
            DataManager.createRoundConfig(
                user_id=round['userId'],
                code=experiment_config.code,
                round_id=round['roundId'],
                layers=round['layers'],
                question=round['question'],
                time=round['time'],
                target_date=round['targetDate'],
                max_red=round['maxRed'],
                max_green=round['maxGreen'],
                survey_link=round['surveyLink'],
                show_review=round['showReview'],
                force=True
            )

# takes a json and creates an ExperimentConfig config from it
def jsonToConfig(json) -> ExperimentConfig:
    try:
        # create a new experiment config using the code and DataManager
        newExperimentConfig = DataManager().createExperimentConfig(code=json['code'], force=True)

        #get valid uids from rounds as set
        valid_uids = set()
        for round in json['rounds']:
            valid_uids.add(round['userId'])

        # add the valid uids to the experiment config
        newExperimentConfig.valid_uids = list(valid_uids)

        # save the experiment config
        newExperimentConfig.save()

        # add the rounds to the experiment config, first converting the json to RoundConfig objects
        jsonToRounds(newExperimentConfig, json['rounds'])


        # add AI instructions to the experiment config if they exist
        if 'actorInstructions' in json:
            for aiCfg in json['actorInstructions']:
                ActorInstruction(
                    roundId=aiCfg['roundId'],
                    code=newExperimentConfig.code,
                    time=aiCfg['time'],
                    color=aiCfg['color'],
                    lat=aiCfg['lat'],
                    lon=aiCfg['lon'],
                    message=aiCfg['message'],
                    experiment_config=newExperimentConfig
                ).save()
        

        return newExperimentConfig
    except BaseException as err:
        print(err)
        raise err
