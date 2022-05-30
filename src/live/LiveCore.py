
from dataModels.LiveExperiment import LiveExperiment
import sys

sys.path.append("..") #python bs
from TrustTeaming import socketio
from flask_socketio import emit, Namespace


class LiveCore(Namespace):
    route_base : str = "/live"

    

    def __init__(self, live_data : LiveExperiment):
        self.data = live_data
        self.code = live_data.config.code.decode()
        super().__init__('/live_'+self.code)
        print("Live core initialized", '/live_'+self.code)

    def getAllowedCategories(self):
        print(self.data.config)

    # Client-side Live

    # @socketio.on('crimeLiveConfig', namespace=route_base)
    def on_crimeLiveConfig(self, req={}):
        print("yep", req)
        emit('liveCfg', 'woo!')