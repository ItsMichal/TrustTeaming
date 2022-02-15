import rom
#TODO- add support for deleted pins

class Pin(rom.Model):
    pin_id = rom.Integer(required=True)
    live_experiment = rom.ManyToOne('LiveExperiment', on_delete="cascade")
    color = rom.String(required=True)
    timePlaced = rom.DateTime(required=True, unique=True)
    userPlaced = rom.Integer(required=True)
    deleted = rom.Boolean(required=True, default=False)
    lat = rom.Float()
    lon = rom.Float()

    unique_together = [
        ('pin_id', 'live_experiment')
    ]
