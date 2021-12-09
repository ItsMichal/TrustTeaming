from flask import render_template

def DefaultAdminView():
    return render_template("Admin/defaultAdmin.html")