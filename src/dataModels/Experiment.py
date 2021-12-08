import rom

class ExperimentConfig:
    experiment_id = rom.Integer(index=True, unique=True)
    code = rom.String(unique=True)
    roundConfigs = rom.OneToMany('RoundConfig')     