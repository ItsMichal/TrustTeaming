from flask import render_template

def DefaultExperimentView(user_id=""):
    return render_template("Experiment/landing.html", user_id=user_id)