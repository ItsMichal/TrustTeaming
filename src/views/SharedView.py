from flask import render_template

def DefaultSharedView(user_id=""):
    return render_template("Experiment/Shared/sharedMap.html", user_id=user_id)