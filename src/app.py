from flask import Flask
from cores import LoginCoreFV
from flask_socketio import SocketIO, Namespace

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!ilovejam'
socketio = SocketIO(app)

loginCore = LoginCoreFV('/loginSocket')
loginCore.register(app, route_base='/')
socketio.on_namespace(loginCore)


if __name__ == '__main__':
    socketio.run(app)