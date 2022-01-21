import rom

class Pin(rom.model):
    pin_id = rom.Integer(required=True)
    live_experiment = rom.ManyToOne('LiveExperiment')
    color = rom.String(required=True)
    timePlaced = rom.DateTime(required=True, unique=True)

    unique_together = [
        ('pin_id', 'live_experiment')
    ]
