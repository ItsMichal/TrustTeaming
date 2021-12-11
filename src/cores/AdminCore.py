import sys
from flask.helpers import url_for
from flask_classful import FlaskView, method, route
from flask import Blueprint, session
from werkzeug.utils import redirect

sys.path.append("..") #python bs
from views import AdminView
from auth import AuthCore

#FlaskView is actually a controller :)
class AdminCore(object):
    route_base = '/admin'
    admin_bp = Blueprint('admin', __name__, url_prefix=route_base)
    
    @AuthCore.require_admin
    def adminPortal():
        return AdminView.DefaultAdminView(session['user_id'])

    @admin_bp.route('/')  
    def index():
        return AdminCore.adminPortal()

    @admin_bp.route('/logout', methods=['POST'])
    def logout():
        AuthCore.logout_user()
        return redirect(url_for("login.index"))

    @admin_bp.route('/configUpload', methods=['POST'])
    def configUpload():

