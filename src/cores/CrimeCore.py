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


    # Get list of valid crime types at the current moment.
    @crime_bp.route('/getUserListOfCrimeTypes')
    def precheck_returnCrimeTypesForUser():
        return CrimeCore.returnCrimeTypesForUser()

    @AuthCore.require_login
    def returnCrimeTypesForUser():
        return ""
