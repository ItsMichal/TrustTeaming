from flask import Flask
from DataManager import DataManager
from auth.AuthCore import AuthCore
from cores import AdminCore, LoginCore
from flask_socketio import SocketIO, Namespace

from cores.ExperimentCore import ExperimentCore

# Eventually convert this to class to be called by TrustTeaming.py

# Initialize Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'shinelabnotverysecret'

socketio = SocketIO(app)
authCore = AuthCore()

dataManager = DataManager()

adminCore = AdminCore()
app.register_blueprint(adminCore.admin_bp)

loginCore = LoginCore()
app.register_blueprint(loginCore.login_bp)

experimentCore = ExperimentCore()
app.register_blueprint(experimentCore.experiment_bp)

# For eventual call from trustteaming
def startWebserver():
    socketio.run(app)

if __name__ == '__main__':
    socketio.run(app, port=8080, debug=True, use_reloader=True)