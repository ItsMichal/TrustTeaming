

from datetime import datetime
from dataModels.Pin import Pin
from dataModels.LogEntry import LogEntry
import pandas as pd
import rom


class LogDataManager():

    def __init__(self, liveCore):
        self.liveCore = liveCore
        self.code = liveCore.code
        self.clearEvents()

    def clearEvents(self):
        self.logEntries = []
        
        for log in LogEntry.query.filter(code=self.code):
            log.delete()
            print("Deleted log entry")
        
        print("Cleared logs")

    def logEvent(self, action : str,  primaryUser : str, secondaryUser : str = None, pin : Pin = None,):
        logEntry = LogEntry(
            serverTime = datetime.now(),
            roundNumber = self.liveCore.data.curRoundNum,
            code = self.code,
            eventName = action,
            
            primaryUserId = primaryUser,
            secondaryUserId = secondaryUser
        )
        if(pin is not None):
            logEntry.update(
                pinId = pin.pinId,
                pinLat = pin.lat,
                pinLon = pin.lon,
                pinColor = pin.color
            )
        
        if(secondaryUser is not None):
            logEntry.update(secondaryUserId = secondaryUser)

        self.logEntries.append(logEntry)

        logEntry.save()
    
    def retrieveLogs(self):
        return LogEntry.query.filter(code=self.code).all()

    def resultsToDf(self):
        dfExport = pd.DataFrame([log.toJSON() for log in self.retrieveLogs()])
        print(dfExport)
        return dfExport