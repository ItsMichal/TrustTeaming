from flask import Flask
from cores import LoginCoreFV
from flask_socketio import SocketIO, Namespace

# Initialize Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'dataiscoool'
socketio = SocketIO(app)

loginCore = LoginCoreFV('/loginSocket')
loginCore.register(app, route_base='/')
socketio.on_namespace(loginCore)

# For eventual call from trustteaming
def startWebserver():
    socketio.run(app)

if __name__ == '__main__':
    socketio.run(app, port="8080")