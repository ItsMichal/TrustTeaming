from flask import Flask
from auth.AuthCore import AuthCore
from cores import AdminCore, LoginCore
from flask_socketio import SocketIO, Namespace

# Initialize Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!ilovejam'
socketio = SocketIO(app)

authCore = AuthCore(app)

loginCore = LoginCore(authCore,'/loginSocket')
loginCore.register(app, route_base='/')

adminCore = AdminCore(authCore,'/adminSocket')
adminCore.register(app, route_base='/admin')
socketio.on_namespace(loginCore)

# For eventual call from trustteaming
def startWebserver():
    socketio.run(app)

if __name__ == '__main__':
    socketio.run(app, port=8080)