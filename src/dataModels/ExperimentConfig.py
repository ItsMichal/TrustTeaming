import rom

class ExperimentConfig(rom.Model):
    code = rom.String(unique=True, required=True, index=True, keygen=rom.IDENTITY_CI)
    valid_uids = rom.Json(required=True)
    liveExperiment = rom.OneToMany('LiveExperiment')
    roundConfigs = rom.OneToMany('RoundConfig')   
    actorInstructions = rom.OneToMany('ActorInstruction')  

    def toJSON(self):
        return {
            "code": self.code.decode(),
            "valid_uids": self.valid_uids,
            "rounds": [rnd.toJSON() for rnd in self.roundConfigs],
            "actorInstructions": [ai.toJSON() for ai in self.actorInstructions]
        }

    def __str__(self):
        return "-\nCode - {}\nRounds - {}\nValid Users - {}\nLive Ref - {}\n-".format(self.code, [x.__str__() for x in self.roundConfigs], self.valid_uids.__str__(), self.liveExperiment)