import rom
#TODO- add support for deleted pins

class Pin(rom.Model):
    pinId = rom.Integer(required=True, index=True)
    liveExperiment = rom.ManyToOne('LiveExperiment', on_delete="cascade")
    message = rom.String(required=True, default=b"")
    code = rom.String(required=True,  index=True, keygen=rom.IDENTITY)
    color = rom.String(required=True, default=b"red")
    timePlaced = rom.DateTime(required=True, unique=True)
    aiPlaced = rom.Boolean(required=True, default=False)
    userPlaced = rom.String(required=True, default=b"")
    userMoved = rom.String(default=b"")
    deleted = rom.Boolean(required=True, default=False)
    lat = rom.Float()
    lon = rom.Float()

    unique_together = [
        ('pinId', 'code')
    ]

    def toJSON(self):
        return {
            'pinId': self.pinId,
            'message': self.message.decode(),
            'color': self.color.decode(),
            'timePlaced': str(self.timePlaced),
            'userPlaced': self.userPlaced.decode(),
            'aiPlaced': self.aiPlaced,
            'deleted': self.deleted,
            'userMoved': self.userMoved.decode(),
            'lat': self.lat,
            'lon': self.lon,
        }
