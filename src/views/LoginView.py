from flask import render_template

def LoginPage(errorMsg, logged_in=False, user_id="", code=""):
    return render_template("Login/login.html", errorMsg=errorMsg, logged_in=logged_in,
                                                user_id=user_id, code=code)