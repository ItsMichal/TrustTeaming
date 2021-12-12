from flask.helpers import url_for

from flask import session
from werkzeug.utils import redirect

from auth.AuthUser import AuthUser
#Singleton AuthCore
class AuthCore():
    # jwt_inst = JWTManager()
    _instance = None
    
    def __new__(self):
        if self._instance is None:
            print("Creating Experiment Config")
            self._instance = super(AuthCore, self).__new__(self)
        return self._instance

    def login_user(code, user_id):
        session['code'] = code
        session['user_id'] = user_id
        if code == "SHINE":
            session['auth'] = True
        else:
            session['auth'] = False

    def get_user():
        if 'user_id' in session and 'code' in session and 'auth' in session:
            return AuthUser(session['user_id'], session['code'], session['auth'])
        else:
            return None

    def logout_user():
        session.clear()
 
    def require_admin(func):
        def route(*args, **kwargs):
            print(AuthCore.get_user())
            if(AuthCore.get_user() is None or not AuthCore.get_user().auth):
                session['errorMsg'] = "Unauthorized!"
                return redirect(url_for("login.index"))
            else:
                return func(*args, **kwargs)
            
        return route  