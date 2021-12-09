from flask import Flask
from flask_classful import FlaskView
from flask import render_template
from flask_socketio import emit
import sys
import json
from cores.BaseCore import BaseCore
sys.path.append("..") #python bs
from views import LoginView
from flask_socketio import  Namespace

#FlaskView is actually a controller :)
class LoginCore(BaseCore):
    route_base = '/'

    def index(self):
        return LoginView.LoginPage()

    def on_login(self, data):
        # TODO hookup to redis
        code = data.get('code', 'empyty')
        
        print(code)

        if(code == "SHINE"):
            #Redir to admin portal
            emit('redirect', {'redirectUrl':'/admin'})
        else:
            #Check against redis for configs
            expCfg = self.dataMgr.getExperimentConfig(code)
            print(type(expCfg))
        
        # Error
        emit('errormsg', {'errorMsg':'Damn bro u fucked up on god 🥺💕'})

