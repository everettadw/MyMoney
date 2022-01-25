from flask import jsonify, render_template
from . import User, app

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/user/<username>")
def get_user(username):
    return User.query.filter_by(username=username).first().email