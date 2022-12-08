import code
from os import name
from socket import socket
import sys
from flask.helpers import url_for
from flask import Blueprint, Response, session
from flask import request
from werkzeug.utils import redirect
from data import DataManager
from util.csvToActorInstructions import csvToActorInstructions

sys.path.append("..") #python bs
from views import AdminView
from auth import AuthCore
from util.csvToDataModel import csvToDataModel
from TrustTeaming import socketio
from flask_socketio import emit

#FlaskView is actually a controller :)
class AdminCore(object):
    route_base = '/admin'
    admin_bp = Blueprint('admin', __name__, url_prefix=route_base)
    
    @AuthCore.require_admin
    def adminPortal():
        configMsg =""
        if('configMsg' in session):
            configMsg = session['configMsg']
            session['configMsg'] = ""
        return AdminView.DefaultAdminView(session['user_id'], config_msg=configMsg)

    @admin_bp.route('/', endpoint='index')  
    @AuthCore.require_admin
    def index():
        return AdminCore.adminPortal()

    @admin_bp.route('/logout', methods=['GET','POST'])
    def logout():
        AuthCore.logout_user()
        return redirect(url_for("login.index"))

    @admin_bp.route('/downloadResults', methods=['GET'], endpoint='downloadResults')
    @AuthCore.require_admin
    def downloadResults():
        if("code" in request.args):
            dataframe = DataManager().getLiveCore(request.args.get('code')).logger.resultsToDf()
            return Response(
                dataframe.to_csv(),
                mimetype="text/csv",
                headers={"Content-disposition":
                            "attachment; filename=results-"+request.args.get('code')+".csv"})
        else:
            return Response({"error":"No code provided"}, status=400)


    @admin_bp.route('/deleteExperiment', methods=['POST'], endpoint='deleteExperiment')
    @AuthCore.require_admin
    def deleteExperiment():
        print("DELETING")
        print(request.get_json()['code'])
        if("code" in request.get_json()):
            DataManager().deleteExperimentConfig(request.get_json()['code'])
            return Response({"success":"Deleted experiment"}, status=200)
        else:
            return Response({"error":"No code provided"}, status=400)

    @admin_bp.route('/configUpload', methods=['POST'], endpoint='configUpload')
    @AuthCore.require_admin
    def configUpload():
        csvConfig = request.files.get('config')
        code = request.form.get('code')
        forceRaw = request.form.get('force')
        force = forceRaw is not None
        
        if code is None or code == '':
            session['configMsg'] = "Please enter a code for this config!"
            return redirect(url_for('admin.index'))

        if code == "SHINE":
            session['configMsg'] = "Cannot set 'secret' admin code as experiment code!"
            return redirect(url_for('admin.index'))

        if DataManager().getExperimentByCode(code) is not None and not force:
            session['configMsg'] = "Code is already in use! Choose a different code."
            return redirect(url_for('admin.index'))

        if len(code) > 10:
            session['configMsg'] = "Code is greater than 10 characters!"
            return redirect(url_for('admin.index'))

        # print(csvConfig)

        if csvConfig is None or csvConfig.content_type == "application/octet-stream":
            session['configMsg'] = "No file received by server!"
            return redirect(url_for('admin.index'))

        if csvConfig.content_type != "text/csv" and csvConfig.content_type != "application/vnd.ms-excel":
            session['configMsg'] = "Not a valid CSV file! (Also check Redis server)"
            return redirect(url_for('admin.index'))
        
        try:
            csvToDataModel(csvConfig, code, force)
        except BaseException as err:
            session['configMsg'] = err.__str__()
            return redirect(url_for('admin.index')) 

        session['configMsg'] = "Success! " + code + " now ready for use."
        return redirect(url_for('admin.index'))

    @admin_bp.route('/instructionsUpload', methods=['POST'], endpoint='instructionsUpload')
    @AuthCore.require_admin
    def instructionUpload():
        csvConfig = request.files.get('config')
        code = request.form.get('code')
        forceRaw = request.form.get('force')
        force = forceRaw is not None
        
        if code is None or code == '':
            session['configMsg'] = "You should never see this!"
            return redirect(url_for('admin.index'))

        if csvConfig is None or csvConfig.content_type == "application/octet-stream":
            session['configMsg'] = "No file received by server!"
            return redirect(url_for('admin.index'))

        if csvConfig.content_type != "text/csv" and csvConfig.content_type != "application/vnd.ms-excel":
            session['configMsg'] = "Not a valid CSV file! (Also check Redis server)"
            return redirect(url_for('admin.index'))
        
        try:
            csvToActorInstructions(csvConfig, code)
        except BaseException as err:
            session['configMsg'] = err.__str__()
            return redirect(url_for('admin.index')) 

        session['configMsg'] = "Success! " + code + "'s AI instructions now ready for use."
        return redirect(url_for('admin.index'))

    @admin_bp.route('/getConfig', methods=['GET', 'POST'])
    def getConfig():
        return DataManager().getExperimentsJSON()

    @socketio.on('sendLive', namespace=route_base)
    def liveRequest(req={}):
        emit('liveexp', DataManager().getLiveExperimentsJSON())
    
    @socketio.on('sendStart', namespace=route_base)
    def requestStartLive(req={}):
        if("code" in req):
            DataManager().initializeExperiment(req["code"])
            # print(newExp)
        else:
            print("No attr!")

    @socketio.on('stopExperiment', namespace=route_base)
    def stopExperiment(req={}):
        if("code" in req):
            DataManager().stopExperiment(req["code"])

    @socketio.on('echo', namespace=route_base)
    def testCmd(req):
        emit('echo', 'Pong!')