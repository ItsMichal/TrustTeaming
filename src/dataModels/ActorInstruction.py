import re
import rom

class ActorInstruction(rom.Model):
    code = rom.String(required=True, index=True, keygen=rom.IDENTITY_CI)
    roundId = rom.Integer(index=True, required=True)
    time = rom.Integer(required=True)
    color = rom.String(required=True)
    lat = rom.Float(required=True)
    lon = rom.Float(required=True)
    message = rom.String(required=True, default=b"")
    experiment_config = rom.ManyToOne('ExperimentConfig', on_delete="cascade", required=True)

    def toJSON(self):
        return {
            "code": self.code.decode(),
            "roundId": self.roundId,
            "time": self.time,
            "color": self.color.decode(),
            "lat": self.lat,
            "lon": self.lon,
            "message": self.message.decode()
        }

    def __str__(self):
        return "Code - {}\tRound Id - {}\nLat - {}\tLon - {}\tMessage - {}\n".format(self.code, self.round_id, self.lat, self.lon, self.message)