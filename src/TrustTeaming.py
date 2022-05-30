#Necessary imports
from asyncio.log import logger
from flask import Flask
from flask_socketio import SocketIO, Namespace


#The all-holy global SocketIO instance
#Modeled after https://github.com/miguelgrinberg/Flask-SocketIO-Chat
#Basically this allows for global singleton usage of the
#socketio instance
socketio = SocketIO()

# For eventual call from trustteaming
def startWebserver(debug=False):

    # Import here to avoid circular imports
    from data import DataManager
    from auth.AuthCore import AuthCore
    from cores import AdminCore, LoginCore, ExperimentCore
    
    #Start Flask app
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'shinelabnotverysecret'

    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    #Start AuthCore and data manager
    AuthCore()
    DataManager()

    #Start cores
    adminCore = AdminCore()
    app.register_blueprint(adminCore.admin_bp)

    loginCore = LoginCore()
    app.register_blueprint(loginCore.login_bp)

    experimentCore = ExperimentCore()
    app.register_blueprint(experimentCore.experiment_bp)

    #Initialize the socketio app
    socketio.init_app(app)

    if(not debug):
        socketio.run(app)
    else:
        socketio.run(app, log_output=True, port=8080, debug=True, use_reloader=True)