import sys
from flask.helpers import url_for
from flask_classful import FlaskView, method, route
from flask import Blueprint, session
from flask import request
from werkzeug.utils import redirect
from DataManager import DataManager
from cores.CrimeCore import CrimeCore

sys.path.append("..") #python bs
from views import ExperimentView
from auth import AuthCore
from util.csvToDataModel import csvToDataModel

class ExperimentCore(object):
    route_base : str = '/trust'
    experiment_bp : Blueprint = Blueprint('trust', __name__, url_prefix=route_base)

    def __init__(self):
        #Register own blueprint
        self.crime_core : CrimeCore = CrimeCore()
        self.experiment_bp.register_blueprint(self.crime_core.crime_bp)
        print("Crime Map registered")

    @AuthCore.require_login
    def landing():
        return ExperimentView.DefaultExperimentView()

    @experiment_bp.route('/')
    def index():
        return ExperimentCore.landing()