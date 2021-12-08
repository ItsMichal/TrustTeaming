from flask import Flask
from cores import LoginCoreFV
from flask_socketio import SocketIO, Namespace

# Initialize Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!ilovejam'
socketio = SocketIO(app)

loginCore = LoginCoreFV('/loginSocket')
loginCore.register(app, route_base='/')
socketio.on_namespace(loginCore)

# For eventual call from trustteaming
def startWebserver():
    socketio.run(app)

if __name__ == '__main__':
    socketio.run(app)