import rom

class ExperimentConfig(rom.Model):
    code = rom.String(unique=True, required=True, index=True, keygen=rom.IDENTITY_CI)
    valid_uids = rom.Json(required=True)
    live_experiment = rom.OneToMany('LiveExperiment')
    roundConfigs = rom.OneToMany('RoundConfig')     

    def __str__(self):
        return "-\nCode - {}\nRounds - {}\nValid Users - {}\nLive Ref - {}\n-".format(self.code, [x.__str__() for x in self.roundConfigs], self.valid_uids.__str__(), self.live_experiment)