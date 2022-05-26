#TBC

#Shared Map
import sys
from flask.blueprints import Blueprint
from data import DataManager

sys.path.append("..") #python bs
from views import CrimeView
from auth import AuthCore
from flask import (session, request)
from TrustTeaming import socketio
from flask_socketio import emit

class CrimeCore(object):
    route_prefix = "/crime"
    crime_bp = Blueprint('crime', __name__, url_prefix=route_prefix)

    @AuthCore.require_login
    def crimeMap():
        return CrimeView.DefaultCrimeView(session["user_id"])

    @crime_bp.route('/')
    def index():
        return CrimeCore.crimeMap()

    @crime_bp.route('/requestPins', methods=['POST'])
    def requestCrimeData():
      
        if("startDate" in request.get_json() and "endDate" in request.get_json()):
           

            
            return {
                'dates': 
                     DataManager().crimeDataMgr.getCrimeDataFromRange(request.get_json()['startDate'], request.get_json()['endDate'])
            }
        else:
            return "Yikes", 400

    @crime_bp.route('/requestStartEnd')
    def requestStartEndRange():
        startEnd = DataManager().crimeDataMgr.getMaxRange()
        return {'startDate': startEnd[0], 'endDate': startEnd[1]}