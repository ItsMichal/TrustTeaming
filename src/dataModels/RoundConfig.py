import rom

class RoundConfig(rom.Model):
    code = rom.String(required=True, index=True, keygen=rom.IDENTITY_CI)
    user_id = rom.Integer(required=True, index=True)
    round_id = rom.Integer(index=True, required=True)
    layers = rom.Json(required=True)
    question = rom.String(required=True)
    time = rom.Integer(required=True)
    target_date = rom.Date(required=True)
    max_red = rom.Integer(required=True)
    max_green = rom.Integer(required=True)
    experiment_config = rom.ManyToOne('ExperimentConfig', on_delete="cascade", required=True)

    unique_together = [
        ('code', 'round_id', 'user_id')
    ]

    def __str__(self):
        return "User Id - {}\tCode - {}\tRound Id - {}\nQuestion - {}\n".format(self.user_id, self.code, self.round_id, self.question)