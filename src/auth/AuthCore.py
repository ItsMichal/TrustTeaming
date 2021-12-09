from flask_login import LoginManager, login_user

from auth.AuthUser import AuthUser

class AuthCore(LoginManager):
    _user_callback = None

    def __init__(self, app):
        super().__init__(app)
        self._user_callback = self.load_user

    def load_user(user_id):
        return AuthUser(user_id)

    def login_user(User):
        login_user(User, remember=True)