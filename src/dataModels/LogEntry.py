#TODO- define data structure(s) for logging events

import rom

#valid states
#idle- no experiment running
#wait- waiting for users to ready up
#live- running experiment round

class LogEntry(rom.Model):
    code = rom.String(required=True, index=True, keygen=rom.IDENTITY_CI)
    serverTime = rom.DateTime(required=True)
    roundNumber = rom.Integer(required=True)
    eventName = rom.String(required=True)
    primaryUserId = rom.String(required=True, index=True,keygen=rom.IDENTITY_CI)
    secondaryUserId = rom.String(required=False, index=True,keygen=rom.IDENTITY_CI)
    pinId = rom.Integer(required=False)
    pinLat = rom.Float(required=False)
    pinLon = rom.Float(required=False)
    pinColor = rom.String(required=False, index=True,keygen=rom.IDENTITY_CI)

    def toJSON(self):
        return {
            "code": self.code.decode(),
            "serverTime": str(self.serverTime),
            "roundNumber": self.roundNumber,
            "eventName": self.eventName.decode(),
            "primaryUserId": self.primaryUserId.decode(),
            "secondaryUserId": self.secondaryUserId.decode() if self.secondaryUserId is not None else "",
            "pinId": self.pinId,
            "pinLat": self.pinLat,
            "pinLon": self.pinLon,
            "pinColor": self.pinColor.decode() if self.pinColor is not None else ""
        }
    
    def __str__(self):
        return self.toJSON()