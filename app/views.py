from datetime import date
from flask import jsonify, redirect, render_template, request, url_for
from .models import MoneySource, User
from . import app, db

@app.route("/resetdb")
def reset_db():
    db.drop_all()
    db.create_all()
    User.create(username="admin", email="business.eadw@gmail.com")
    return redirect(url_for('create_money_source'))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/users", methods=['GET'])
def get_users():
    users = User.query.all()
    if users == None:
        return jsonify({
            "Error": "No users exist."
        })
    return_json = []
    for user in users:
        return_json.append(user.json())
    return jsonify(return_json)    

@app.route("/users/<username>", methods=['GET'])
def get_user(username):
    user_ex = User.query.filter_by(username=username).first()
    if user_ex == None:
        return jsonify({
            "Error": "User does not exist."
        })
    return_json = []
    return_json.append(user_ex.json())
    for money_source in user_ex.money_sources:
        return_json.append(money_source.json())
    return jsonify(return_json)

@app.route("/users/new", methods=['POST'])
def create_user():
    request_body = request.get_json()
    if ('username' not in request_body) or ('email' not in request_body):
        return jsonify({
            "Error": "Fields 'username' and 'email' are required."
        })
    new_user = User(username=request_body['username'], email=request_body['email'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "Success": "User '" + request_body['username'] + "' created."
    })

@app.route("/users/delete", methods=['POST'])
def delete_user():
    proper_request = request.get_json()
    if proper_request == None:
        return jsonify({
            "Error": "This endpoint will only accept content-types of application/json."
        })
    user_to_delete = User.query.filter_by(username=proper_request['username']).first()
    if user_to_delete == None:
        return jsonify({
            "Error": "User does not exist."
        })
    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({
        "Success": "User '" + proper_request['username'] + "' has been deleted."
    })

@app.route("/moneysources", methods=['GET'])
def get_money_sources():
    money_sources = MoneySource.query.all()
    if money_sources == None:
        return jsonify({
            "Error": "There are no money sources."
        })
    return_json = []
    for money_source in money_sources:
        return_json.append(money_source.json())
    return jsonify(return_json)

@app.route("/moneysources/new", methods=['POST', 'GET'])
def create_money_source():
    proper_request = request.get_json()
    test_source = MoneySource.create(
        return_obj=True,
        name='Rent',
        type='Expense',
        user_id=1,
        date='00012022',
        account="Capital One Checkings",
        based_on_date=True,
        amount=1100
    )
    return jsonify(test_source.json())