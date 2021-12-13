from flask import Flask
from DataManager import DataManager
from auth.AuthCore import AuthCore
from cores import AdminCore, LoginCore
from flask_socketio import SocketIO, Namespace

# Eventually convert this to class to be called by TrustTeaming.py

# Initialize Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!ilovejam'
app.config['JWT_SECRET_KEY'] = "laughinggoat"
app.config['UPLOAD_FOLDER'] = 'temp'

socketio = SocketIO(app)
authCore = AuthCore()

dataManager = DataManager()

adminCore = AdminCore()
app.register_blueprint(adminCore.admin_bp)

loginCore = LoginCore()
app.register_blueprint(loginCore.login_bp)

print(app.url_map)

# For eventual call from trustteaming
def startWebserver():
    socketio.run(app)

if __name__ == '__main__':
    socketio.run(app, port=8080, debug=True, use_reloader=True)