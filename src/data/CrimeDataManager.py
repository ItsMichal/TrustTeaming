from ast import List
from cmath import pi
from dataclasses import dataclass
import dataclasses
import datetime
import os
from time import strptime
import pandas as pd
import numpy as np
from math import sin, cos,atan2, sqrt, pi
import configparser
from dataModels.Pin import Pin


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
    color: str


class CrimeDataManager(object):
    dataMgr = None
    crimeData = None
    
    def __init__(self, filepath : str ="updatedcrimedata"):
        # Load data into memory
        self.crimeData = pd.read_feather(os.path.join(os.path.dirname(__file__),filepath))    


    # UTIL FUNCS

    def calcDist(self, latOne, lonOne, latTwo, lonTwo):
        # return geopy.distance.distance((latOne, lonOne), (latTwo, lonTwo)).m
        R = 6371.000
        # x = (lonOne-lonTwo) * cos(0.5*(latTwo-latOne))
        # y = latTwo-latOne
        # d = R * sqrt(x*x + y*y)
        # return d
        rad = pi/180
        rLatOne = latOne * rad
        rLatTwo = latTwo * rad

        sinDLat = sin((latTwo-latOne) * rad/2)
        sinDLon = sin((lonTwo-lonOne) * rad/2)
        a = sinDLat * sinDLat + cos(rLatOne) * cos(rLatTwo) * sinDLon * sinDLon
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        return R * c * 1000

        # dlat = latOne-latTwo
        # dlon = lonOne-lonTwo
        # a = (sin(dlat/2))**2 + cos(latOne) * cos(latTwo) * (sin(dlon/2))**2
        # c = 2*atan2(sqrt(a), sqrt(1-a))
        # return R*c

    def radFilter(self, lat, lon, radius, dfRow):
        latRow = float(dfRow["GEO_LAT"])
        lonRow = float(dfRow["GEO_LON"])
        return self.calcDist(lat,lon,latRow,lonRow) <= (radius)

    def filterDfByDist(self, df, lat, lon, radius):
        return df[df.apply(lambda x: self.radFilter(lat,lon,radius,x), axis=1)]

    def filterDfByDateRange(self, df : pd.DataFrame, start : str, end : str, categories : list[str]):
        print("HERO-", start, end, categories)

        startDateProto = strptime(start, '%Y-%m-%d')
        endDateProto = strptime(end, '%Y-%m-%d')
       
        startDate = pd.Timestamp(startDateProto.tm_year, startDateProto.tm_mon, startDateProto.tm_mday, 0, 0, 0)
        endDate = pd.Timestamp(endDateProto.tm_year, endDateProto.tm_mon, endDateProto.tm_mday, 23, 59, 59)

        tempCrimeData = df.loc[(df['FIRST_OCCURRENCE_DATE'] >= startDate) & (df['FIRST_OCCURRENCE_DATE'] <= endDate)]

        tempCrimeData = tempCrimeData[tempCrimeData['OFFENSE_CATEGORY_ID'].isin(categories)]

        return tempCrimeData


    def sampleDf(self, df : pd.DataFrame) -> pd.DataFrame:
        """Samples a dataframe to a max of 500 rows.

        Args:
            df (pd.DataFrame): dataframe

        Returns:
            pd.DataFrame: sampled dataframe
        """
        numToSample = 500
        maxResults = len(df.index)

        if(numToSample > len(df.index)):
            numToSample = len(df.index)

        df = df.sample(numToSample, random_state=1337)

        return (df, numToSample, maxResults)
        
    def dataframeToCrimeInstances(self, df: pd.DataFrame) -> list[CrimeInstance]:
        """Converts a dataframe to a list of CrimeInstances."""
        def mapToCI(arr):
            return dataclasses.asdict(CrimeInstance(
                arr[0], arr[1],arr[2],arr[3],arr[4],
                arr[5],arr[6],str(arr[7]),str(arr[8]),str(arr[9]),arr[10],
                arr[11],arr[12],arr[13], arr[14] == 1, arr[15] == 1, arr[16]
            ))

        output = list(map(mapToCI, df.values.tolist()))

        return output
    # END UTIL FUNCS

    def getCrimesInPinsRadius(self, pins : list[Pin], radius : float, startDate : str, endDate: str, categories : list[str]):
        """Gets the CrimeInstances in the given radius of the given pins, for the given date range and categories.

        Args:
            pins (list[Pin]): List of pins to get crimes in radius of.
            radius (float): The radius to search in meters.
            startDate (str): Start date to search in format YYYY-MM-DD. (inclusive)
            endDate (str): End date to search in format YYYY-MM-DD. (inclusive)
            categories (list[str]): List of crime categories to filter by.

        Returns:
            dict : Map of pinId to list of CrimeInstances.
        """
        
        datedDf = self.filterDfByDateRange(self.crimeData, startDate, endDate, categories)

        (sampledDf,_,_) = self.sampleDf(datedDf)

        totalOutput = {}
        print(sampledDf)
        for pin in pins:
            rangedDf = self.filterDfByDist(sampledDf, pin.lat, pin.lon, radius) 
            coloredDf = rangedDf[rangedDf['COLOR'] == pin.color.decode()]
            output = self.dataframeToCrimeInstances(coloredDf)
            totalOutput[pin.pinId] = output

        return totalOutput


    def getCrimeDataFromTotalOutput(self, totalOutput : dict[str, list[CrimeInstance]]) -> list[CrimeInstance]:
        """Gadget function to get a standard output a la getCrimeDataFromRange from the above function.
            Consolidates the data from map to list.

        Args:
            totalOutput (dict[str, list[CrimeInstance]]): The output from getCrimesInPinsRadius

        Returns:
            list[CrimeInstance]: An output of the form like getCrimeDataFromRange, minus crime map specific args (numToSample, maxResults)
        """
        output = []

        for pinId in totalOutput:
            output += totalOutput[pinId]

        return output

    def getCrimeDataFromRange(self, start : str, end : str, categories : list[str]):
        """Gets CrimeData from a range of dates, and a list of categories. Additionally returns metadata about
        the number of results and the capped amount (currently 500 due to web performance reasons)

        Args:
            start (str): Datestring of the start date (inclusive)
            end (str): Datestring of the end date (inclusive) 
            categories (list[str]): List of crime categories

        Returns:
            An object with dates->list[CrimeInstance], numToSample : int, maxResults : int
        """
        tempCrimeData = self.filterDfByDateRange(self.crimeData, start, end, categories)

        (output, numToSample, maxResults) = self.sampleDf(tempCrimeData)

        output = self.dataframeToCrimeInstances(output)

        return {'dates': output, 'numResults': numToSample, 'maxResults': maxResults}

    def getMaxRange(self) -> list[datetime.datetime]:
        return [min(self.crimeData['FIRST_OCCURRENCE_DATE']), max(self.crimeData['FIRST_OCCURRENCE_DATE'])]

    