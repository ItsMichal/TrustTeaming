#TBC

#Shared Map
import sys
from flask.blueprints import Blueprint

sys.path.append("..") #python bs
from views import CrimeView
from auth import AuthCore
from flask import session

class CrimeCore(object):
    route_prefix = "/crime"
    crime_bp = Blueprint('crime', __name__, url_prefix=route_prefix)

    @AuthCore.require_login
    def crimeMap():
        return CrimeView.DefaultCrimeView(session["user_id"])

    @crime_bp.route('/')
    def index():
        return CrimeCore.crimeMap()
