import rom


class RoundConfig(rom.Model):
    user_id = rom.Integer(required=True, index=True)
    experiment_id = rom.Integer(required=True, index=True)
    round_id = rom.Integer(index=True, required=True)
    layers = rom.Json(required=True)
    question = rom.String(required=True)
    time = rom.Integer(required=True)
    target_date = rom.Date(required=True)
    max_red = rom.Integer(required=True)
    max_green = rom.Integer(required=True)
    experiment_config = rom.ManyToOne('ExperimentConfig', on_delete="cascade", required=True)

    unique_together = [
        ('experiment_id', 'round_id', 'user_id')
    ]

    def __str__(self):
        return "User Id - {}\tExp Id - {}\tRound Id - {}\nQuestion - {}\nExperiment Ref - {}\n".format(self.user_id, self.experiment_id, self.round_id, self.question, repr(self.experiment_config))