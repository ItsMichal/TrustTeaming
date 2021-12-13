from flask import Flask, Blueprint, session, redirect, url_for
from flask.helpers import url_for
from flask import render_template
from flask import request
import sys
import json
from auth.AuthCore import AuthCore


sys.path.append("..") #python bs
from views import LoginView
from DataManager import DataManager

#FlaskView is actually a controller :)
class LoginCore(object):
    route_base = '/'
    login_bp = Blueprint('login', __name__, url_prefix=route_base)

    @login_bp.route('/')
    def index():
        message = ""
        if('errorMsg' in session and session['errorMsg'] != ""):
            message = session['errorMsg']
        session['errorMsg'] = ""
        user = AuthCore.get_user()
        if(user is not None):
            return LoginView.LoginPage(errorMsg=message, logged_in=True,
                                            user_id=user.id, code=user.cur_code)

        return LoginView.LoginPage(message)
    
    @login_bp.route('/login', methods=['POST'])    
    def login():
        # TODO hookup to redis
        code = request.form.get('code', None)
        
        user_id = request.form.get('user_id', None)

        if(user_id is '' or user_id is None):
            session['errorMsg'] = 'Must enter User ID'
            return redirect(url_for('login.index'))
            
        if(len(user_id) > 10):
            session['errorMsg'] = 'Invalid User ID- greater than 10 characters'
            return redirect(url_for('login.index'))
            
        if(code is '' or code is None):
            session['errorMsg'] = 'Must enter Code'
            return redirect(url_for('login.index'))

        if(len(code) > 10):
            session['errorMsg'] = 'Invalid Code- greater than 10 characters'
            return redirect(url_for('login.index'))

        if("SHINE" in code):
            #Redir to admin portal
            AuthCore().login_user(code=code, user_id=user_id)
            return redirect(url_for('admin.index'))
        else:
            #Check against redis for configs
            expCfg = DataManager().getExperimentByCode(code)
            
            if(expCfg is None):
                session['errorMsg'] = "Code not found in configuration."
                return redirect(url_for('login.index'))

            
        
        AuthCore().login_user(code=code, user_id=user_id)

        return redirect(url_for('login.index'))