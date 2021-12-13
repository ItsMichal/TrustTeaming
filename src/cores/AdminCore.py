import sys
from flask.helpers import url_for
from flask_classful import FlaskView, method, route
from flask import Blueprint, session
from flask import request
from werkzeug.utils import redirect
from DataManager import DataManager

sys.path.append("..") #python bs
from views import AdminView
from auth import AuthCore
from util.csvToDataModel import csvToDataModel

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

    @admin_bp.route('/')  
    def index():
        return AdminCore.adminPortal()

    @admin_bp.route('/logout', methods=['GET','POST'])
    def logout():
        AuthCore.logout_user()
        return redirect(url_for("login.index"))

    @admin_bp.route('/configUpload', methods=['POST'])
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


        if csvConfig is None or csvConfig.content_type == "application/octet-stream":
            session['configMsg'] = "No file received by server!"
            return redirect(url_for('admin.index'))

        if csvConfig.content_type != "text/csv":
            session['configMsg'] = "Not a valid CSV file!"
            return redirect(url_for('admin.index'))
        
        try:
            csvToDataModel(csvConfig, code, force)
        except BaseException as err:
            session['configMsg'] = err.__str__()
            return redirect(url_for('admin.index')) 

        session['configMsg'] = "Success! " + code + " now ready for use."
        return redirect(url_for('admin.index'))

    @admin_bp.route('/getConfig', methods=['GET', 'POST'])
    def getConfig():
        return DataManager().getExperimentsJSON()
        # return redirect(url_for("admin.index"))