from flask_classful import FlaskView
import sys
from cores.BaseCore import BaseCore
sys.path.append("..") #python bs
from views import AdminView
from flask_socketio import  Namespace

#FlaskView is actually a controller :)
class AdminCore(BaseCore):
    route_base = '/admin'

    def index(self):
        return AdminView.DefaultAdminView()

    def on_login(self, data):
        # TODO hookup to redis
        print(data)
        
