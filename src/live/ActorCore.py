
# Runs the AI

from dataModels.ActorInstruction import ActorInstruction
from eventlet.green import threading

class ActorCore():
    def __init__(self, instructions, pinPlacerFunc, id = "AI"):
        self.instructions = instructions
        self.pinPlacer = pinPlacerFunc
        self.id = id
        self.timers = []
        print("ACTOR SETUP!")

    def start(self):
        self.runEvents()
        print("Actor running!")

    def runEvents(self):
        for instruction in self.instructions:
            self.timers.append(
                threading.Timer(
                    instruction.time, 
                    self.placePin, 
                    args=
                        (instruction.lat, 
                        instruction.lon, 
                        instruction.color,
                        instruction.message)
                    ).start()
                )

    def placePin(self, lat, lon, color, message):
        print("AI PLACING PIN!")
        self.pinPlacer(lat, lon, color, self.id, message, True)

