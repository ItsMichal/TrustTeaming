
#Shared Map
import sys
from flask.blueprints import Blueprint
from data import DataManager

sys.path.append("..") #python bs
from views import SharedView
from auth import AuthCore
from flask import (session, request)
from TrustTeaming import socketio
from flask_socketio import emit

class SharedCore(object):
    route_prefix = "/shared"
    shared_bp = Blueprint('shared', __name__, url_prefix=route_prefix)

    @AuthCore.require_login
    def sharedMap():
        return SharedView.DefaultSharedView(session["user_id"])

    @shared_bp.route('/')
    def index():
        return SharedCore.sharedMap()

    @AuthCore.require_login
    @shared_bp.route('/requestConfig')
    def requestConfig():
        return {"code": AuthCore.get_user().cur_code,
                # "config": DataManager().getLiveExperimentJSON(AuthCore().get_user().cur_code), #DEPREC: should get this from livecore
                "user": AuthCore.get_user().id }
    