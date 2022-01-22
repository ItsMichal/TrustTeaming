import rom

class ExperimentConfig(rom.Model):
    code = rom.String(unique=True, required=True, index=True, keygen=rom.IDENTITY_CI)
    valid_uids = rom.Json(required=True)
    live_experiment = rom.OneToOne('LiveExperiment', on_delete='cascade')
    roundConfigs = rom.OneToMany('RoundConfig')     

    def __str__(self):
        return "-\nCode - {}\nRounds - {}\nValid Users{}\n-".format(self.code, [x.__str__() for x in self.roundConfigs], self.valid_uids.__str__())