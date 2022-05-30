from enum import unique
import rom
from rom.columns import NO_ACTION_DEFAULT

#valid states
#idle- no experiment running
#wait- waiting for users to ready up
#live- running experiment round

class LiveExperiment(rom.Model):
    time_started = rom.DateTime(required=True)
    config = rom.OneToOne('ExperimentConfig', on_delete='cascade', unique=True, required=True)
    state = rom.String(required=True, default=b"idle")
    timeInRound = rom.Integer(required=True, default=0)
    curRoundNum = rom.Integer(required=True, default=1)
    users = rom.Json(required=True, default={}) #TODO- replace with data model and proper logout
    curPins = rom.OneToMany('Pin')

    def __str__(self):
        return "-\nLive Experiment - {}\nTimestamp {}\nState - {}\ncurRound - {}\n-".format(self.config.code, self.time_started, self.state, self.curRoundNum)