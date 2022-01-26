from flask import jsonify, render_template, request
from .models import User
from . import app, db

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/user/<username>", methods=['GET'])
def get_user(username):
    user_ex = User.query.filter_by(username=username).first()
    if user_ex == None:
        return jsonify({
            "Error": "User does not exist."
        })
    return jsonify({
        "username":user_ex.username,
        "email": user_ex.email
    })

@app.route("/new/user", methods=['POST'])
def create_user():
    request_body = request.get_json()
    if ('username' not in request_body) or ('email' not in request_body):
        return jsonify({
            "Error": "Fields 'username' and 'email' are required."
        })
    new_user = User(username=request_body['username'], email=request_body['email'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(request.get_json())

@app.route("/delete/user/<username>")
def delete_user(username):
    user_to_delete = User.query.filter_by(username=username).first()
    if user_to_delete == None:
        return jsonify({
            "Error": "User does not exist."
        })
    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({
        "Success": "User '" + username + "' has been deleted."
    })