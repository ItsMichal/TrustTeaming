from flask import Flask
from flask_classful import FlaskView
from flask import render_template
from flask_socketio import emit
import sys
import json
sys.path.append("..") #python bs
from views import LoginView
from flask_socketio import  Namespace

#FlaskView is actually a controller :)
class LoginCoreFV(FlaskView, Namespace):
    route_base = '/'

    def index(self):
        return LoginView.LoginPage()

    def on_login(self, data):
        # TODO hookup to redis
        print(data)
        
