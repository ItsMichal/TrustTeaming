from enum import unique
import rom
from rom.columns import NO_ACTION_DEFAULT

#valid states

class LiveUser(rom.Model):
    userId = rom.String(required=True, index=True,keygen=rom.IDENTITY)
    code = rom.String(required=True, index=True,keygen=rom.IDENTITY)
    liveExperiment = rom.ManyToOne('LiveExperiment', on_delete='cascade', required=True)
    ready = rom.Boolean(required=True, default=False)
    scores = rom.Json(required=True, default={})
    isActor = rom.Boolean(required=True, default=False)

    unique_together = [
        ('userId', 'code')
    ]

    def toJSON(self):
        return  {
            'ready': self.ready,
            'code': self.code.decode(),
            'scores': self.scores,
            'userId': self.userId.decode(),
            'isActor': self.isActor,
        }

    def __str__(self):
        return "-\nLive User - {}\nCode - {}\nReady - {}\nScores - {}".format(self.userId, self.code, self.ready, self.scores)