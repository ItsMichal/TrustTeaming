from flask import render_template
import os

def LoginPage():
    # return os.getcwd()
    return render_template("Login/login.html")