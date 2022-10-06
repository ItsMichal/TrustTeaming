
# Runs the AI

from dataModels.ActorInstruction import ActorInstruction
import threading

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
                        instruction.color)
                    ).start()
                )

    def placePin(self, lat, lon, color):
        print("AI PLACING PIN!")
        self.pinPlacer(lat, lon, color, self.id, True)

