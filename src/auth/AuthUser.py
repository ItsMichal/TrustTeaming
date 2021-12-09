from flask_login import UserMixin

class AuthUser(UserMixin):
    id = None
    cur_code = ""
    def __init__(self, id):
        self.id = id
