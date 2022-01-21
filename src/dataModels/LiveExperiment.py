import rom

class LiveExperiment(rom.Model):
    timeInRound = rom.Integer(required=True, default=0)
    curRound = rom.Integer(required=True, default=1)