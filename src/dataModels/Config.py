import rom


class RoundConfig(rom.Model):
    user_id = rom.Integer()
    experiment_id = rom.Integer()
    round_id = rom.Integer()
    layers = rom.Json()
    question = rom.String()
    time = rom.Integer()
    target_date = rom.Date()
    max_red = rom.Integer()
    max_green = rom.Integer()
    experiment_config = rom.ManyToOne('ExperimentConfig', on_delete="cascade",required=True)

    unique_together = [
        ('experiment_id', 'round_id', 'user_id')
    ]