
import json
from dataModels.LiveExperiment import LiveExperiment
import sys

from dataModels.RoundConfig import RoundConfig

sys.path.append("..") #python bs
from TrustTeaming import socketio
from flask_socketio import emit, Namespace


class LiveCore(Namespace):
    route_base : str = "/live"

    def __init__(self, live_data : LiveExperiment):
        self.data = live_data
        self.code = live_data.config.code.decode()
        super().__init__(self.route_base+self.code)
        print("Live core initialized", self.route_base+self.code)

    def getCurRoundCfg(self, userid) -> RoundConfig:
        for cfg in self.data.config.roundConfigs:
            if cfg.user_id == int(userid) and cfg.round_id == self.data.curRoundNum:
                print(cfg)
                return cfg
        
        return None

    def getAllowedCategories(self, userid):
        return self.getCurRoundCfg(userid).layers

    def getCurrentDate(self, userid):
        return self.getCurRoundCfg(userid).target_date

    # Client-side Live

    @socketio.on('crimeLiveConfig', namespace=route_base)
    def on_crimeLiveConfig(self, req={}):
        if 'userId' in req:
            emit('liveCfg', {
                'curDate': self.getCurrentDate(req['userId']).__str__(),
                'categories': self.getAllowedCategories(req['userId'])
            }, broadcast=True)