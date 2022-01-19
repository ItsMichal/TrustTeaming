class AuthUser(object):
    id = None
    cur_code = ""
    auth = False

    def __init__(self, user_id, cur_code="", auth=False):
        super().__init__()
        self.id = user_id
        self.auth = auth
        self.cur_code = cur_code