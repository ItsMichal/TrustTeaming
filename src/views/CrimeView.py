from flask import render_template

def DefaultCrimeView(user_id=""):
    return render_template("Experiment/Crime/crimeMap.html", user_id=user_id)