from flask import render_template

def LoginPage(errorMsg):
    return render_template("Login/login.html", errorMsg=errorMsg)