from ast import List
from dataclasses import dataclass
import dataclasses
import datetime
import os
from time import strptime
import pandas as pd
import numpy as np

@dataclass
class CrimeInstance:
    index: int
    incidentId: int
    offenseId: int
    offsenseCode: int
    offenseCodeExt: int
    offenseTypeId: str
    offsenseCategoryId: str
    firstOccuranceDate: str
    lastOccuranceDate: str
    reportedDate: str
    incidentAddress: str
    geoLon: float
    geoLat: float
    districtId: int
    isCrime: bool
    isTraffic: bool


class CrimeDataManager(object):
    dataMgr = None
    crimeData = None
    
    def __init__(self, filepath : str ="updatedcrimedata"):
        # Load data into memory
        self.crimeData = pd.read_feather(os.path.join(os.path.dirname(__file__),filepath))
        # return self

    def getCrimeDataFromRange(self, start : str, end : str, categories : list[str]):

        startDateProto = strptime(start, '%Y-%m-%d')
        endDateProto = strptime(end, '%Y-%m-%d')
       
        startDate = pd.Timestamp(startDateProto.tm_year, startDateProto.tm_mon, startDateProto.tm_mday)
        endDate = pd.Timestamp(endDateProto.tm_year, endDateProto.tm_mon, endDateProto.tm_mday)


        tempCrimeData = self.crimeData.loc[(self.crimeData['FIRST_OCCURRENCE_DATE'] > startDate) & (self.crimeData['FIRST_OCCURRENCE_DATE'] < endDate)]

        tempCrimeData = tempCrimeData[tempCrimeData['OFFENSE_CATEGORY_ID'].isin(categories)]
        
        numToSample = 200
        maxResults = len(tempCrimeData.index)

        if(numToSample > len(tempCrimeData.index)):
            numToSample = len(tempCrimeData.index)

        tempCrimeData = tempCrimeData.sample(numToSample)

        def mapToCI(arr):
            return dataclasses.asdict(CrimeInstance(
                arr[0], arr[1],arr[2],arr[3],arr[4],
                arr[5],arr[6],arr[7],arr[8],arr[9],arr[10],
                arr[11],arr[12],arr[13], arr[14] == 1, arr[15] == 1
            ))

        output = list(map(mapToCI, tempCrimeData.values.tolist()))        
        return {'dates': output, 'numResults': numToSample, 'maxResults': maxResults}

    def getMaxRange(self) -> list[datetime.datetime]:
        return [min(self.crimeData['FIRST_OCCURRENCE_DATE']), max(self.crimeData['FIRST_OCCURRENCE_DATE'])]
