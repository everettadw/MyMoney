import base64
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify, redirect, render_template, request, url_for
from .models import MoneySource, User
from . import app, db, login_manager

@login_manager.user_loader # User loader
def load_user(user_id):
    return User.query.filter_by(id=user_id).first()

@login_manager.request_loader # Request User loader
def load_user_from_request(request):

    # first, try to login using the api_key url arg
    api_key = request.args.get('api_key')
    if api_key:
        user = User.query.filter_by(api_key=api_key).first()
        if user:
            return user

    # next, try to login using Basic Auth
    api_key = request.headers.get('Authorization')
    if api_key:
        api_key = api_key.replace('Basic ', '', 1)
        try:
            api_key = base64.b64decode(api_key)
        except TypeError:
            pass
        user = User.query.filter_by(api_key=api_key).first()
        if user:
            return user

    # finally, return None if both methods did not login the user
    return None

# Drop and recreate all the tables
@app.route("/resetdb")
def reset_db():
    db.drop_all()
    db.create_all()
    User.create(username="admin", email="business.eadw@gmail.com", password=generate_password_hash("Ai12eqfav%"))
    User.create(username="guest", email="guest@gmail.com", password=generate_password_hash("testing"))
    return redirect(url_for('logout'))

@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    if request.method == 'POST':
        user = User.query.filter_by(username=request.get_json()['username']).first()
        if user and check_password_hash(user.password, request.get_json()['password']):
            login_user(user, remember=True)
            return jsonify({
                "Status": "SUCCESS"
            })
        return jsonify({
            "Status": "FAILURE"
        })

    return render_template('login.html')

@app.route("/logout", methods=['GET'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/users", methods=['GET'])
@login_required
def get_users():
    users = User.query.all()
    if users == None:
        return jsonify({
            "Error": "No users exist."
        })
    return_json = []
    for user in users:
        user_json = user.json()
        user_json['MoneySources'] = len(user.money_sources)
        return_json.append(user_json)
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
    return_json[0]['MoneySources'] = [money_source.json() for money_source in user_ex.money_sources]
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
@login_required
def create_money_source():
    proper_request = request.get_json()
    test_source = MoneySource.create(
        return_obj=True,
        name='Rent',
        type='Expense',
        user_id=current_user.id,
        date='00012022',
        account="Capital One Checkings",
        based_on_date=True,
        amount=1100
    )
    return jsonify(test_source.json())