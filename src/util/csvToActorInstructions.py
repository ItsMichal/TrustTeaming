from csv import reader
from werkzeug.datastructures import FileStorage
import io
from ast import literal_eval
from data import DataManager
from dataModels.ActorInstruction import ActorInstruction
from dataModels.ExperimentConfig import ExperimentConfig

from dataModels.RoundConfig import RoundConfig

def csvToActorInstructions(file : FileStorage, code : str):
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csvConfigReader = reader(stream)
    print(csvConfigReader)
    next(csvConfigReader)

    config = DataManager().getExperimentByCode(code)

    if len(config.actorInstructions) > 0:
        print("Deleting old instructions")
        for instruction in config.actorInstructions:
            instruction.delete()

    for row in csvConfigReader:
        #Check validity
        if len(row) != 6:
            raise(BaseException("Wrong CSV format!"))

        # Get all CSV entries
        roundId = int(row[0])
        time = int(row[1])
        color = row[2]
        lat = float(row[3])
        lon = float(row[4])
        message =  row[5]

        #Create obj for instruction
        newInstruction = ActorInstruction(roundId=roundId, code=code, time=time, color=color, lat=lat, lon=lon, message=message, experiment_config=config)
        newInstruction.save()
        

    # end of for loop

       




    