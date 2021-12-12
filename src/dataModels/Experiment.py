import rom

class ExperimentConfig(rom.Model):
    experiment_id = rom.Integer(index=True, unique=True)
    code = rom.String(unique=True, required=True, index=True, keygen=rom.IDENTITY_CI)
    roundConfigs = rom.OneToMany('RoundConfig')     

    def __str__(self):
        return "-\nExperiment - {}\nCode - {}\nRounds - {}\n-".format(self.experiment_id, self.code, self.roundConfigs.__str__())