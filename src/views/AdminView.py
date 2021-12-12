from flask import render_template

def DefaultAdminView(cur_user="admin", config_msg = ""):
    return render_template("Admin/defaultAdmin.html", cur_user=cur_user, config_msg=config_msg)