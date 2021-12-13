from csv import reader
from datetime import datetime
import json
from werkzeug.datastructures import FileStorage
import io
from DataManager import DataManager

from dataModels.Config import RoundConfig

def csvToDataModel(file : FileStorage, code : str, force : bool = False):
    print("really?")
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csvConfigReader = reader(stream)
    print(csvConfigReader)
    next(csvConfigReader)

    max_red_for_rid = None
    max_grn_for_rid = None
    cur_rid = None
    exp_created = False
    print(csvConfigReader)

    for row in csvConfigReader:
        #Check validity
        if len(row) is not 8:
            raise(BaseException("Wrong CSV format!"))


        # Get all CSV entries
        if not exp_created:
            print("Creating Experiment")
            DataManager().createExperimentConfig(code=code, force=force)
            exp_created = True   

        user_id = int(row[0])

        # TODO- add this logic to DataManager!
        print("Updating uids")
        experimentInst = DataManager().getExperimentByCode(code) 
        experimentInst.valid_uids.append(user_id)
        experimentInst.valid_uids = list(set(experimentInst.valid_uids))
        experimentInst.save()

        round_num = int(row[1])
        layers = json.loads(row[2])
        question = row[3]
        time = int(row[4])
        date = datetime.strptime(row[5], "%m/%d/%Y")
        
        # This logic avoids conflicting max value problems
        # by only respecting the first entry for the round id
        if(cur_rid is None or round_num != cur_rid):
            cur_rid = round_num
            max_grn_for_rid = int(row[6])
            max_red_for_rid = int(row[7])
        


        #Create obj for Round
        DataManager().createRoundConfig(code= code, user_id=user_id,
                                    round_id=round_num, layers=layers, question=question,
                                    time=time, target_date=date, max_red=max_red_for_rid,
                                    max_green=max_grn_for_rid, force=force)

    # end of for loop

       




    