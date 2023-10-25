from enum import unique
import rom
from rom.columns import NO_ACTION_DEFAULT

#valid states
#idle- no experiment running
#wait- waiting for users to ready up
#live- running experiment round

class LiveExperiment(rom.Model):
    timeStarted = rom.DateTime(required=True)
    config = rom.OneToOne('ExperimentConfig', required=True, on_delete='cascade')
    state = rom.String(required=True, default=b"idle")
    timeRoundStarted = rom.DateTime()
    curRoundNum = rom.Integer(required=True, default=1)
    users = rom.OneToMany('LiveUser')
    curPins = rom.OneToMany('Pin')

    def __str__(self):
        return "-\nLive Experiment - {}\nTimestamp {}\nState - {}\ncurRound - {}\n-".format(self.config.code, self.timeStarted, self.state, self.curRoundNum)