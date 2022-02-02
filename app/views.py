import base64
from flask_login import current_user, login_required, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask import flash, jsonify, make_response, redirect, render_template, request, url_for
from .models import Account, MoneySource, User
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

# Gets rid of the next arg in url when a user
# tries to access a page without being logged in.
@login_manager.unauthorized_handler
def handle_needs_login():
    if ( request.method == 'POST' ):
        return make_response(jsonify({"Error": "You are not authorized to use this resource."}), 401)
    flash("Please login to access that page.")
    return redirect(url_for('login'))

# Drop and recreate all the tables
@app.route("/resetdb")
def reset_db():
    db.drop_all()
    db.create_all()
    User.create({
        "first_name": "Everett",
        "last_name": "Daniels-Wright",
        "username": "admin",
        "email": "business.eadw@gmail.com",
        "password": generate_password_hash("Ai12eqfav%")
    })
    User.create({
        "first_name": "Darren",
        "last_name": "Wright",
        "username": "guest",
        "email": "guest@gmail.com",
        "password": generate_password_hash("testing")
    })
    return redirect(url_for('logout'))

@app.route("/", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('calendar'))

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

@app.route("/calendar")
@login_required
def calendar():
    return render_template("calendar.html")

@app.route("/settings")
@login_required
def settings():
    return render_template("settings.html")

@app.route("/users", methods=['POST'])
@login_required
def get_users():
    users = User.query.all()
    return_json = []
    for user in users:
        user_json = user.json()
        user_json['money_sources'] = len(user.money_sources)
        user_json['accounts'] = len(user.accounts)
        return_json.append(user_json)
    return jsonify(return_json)    

@app.route("/users/<username>", methods=['POST'])
@login_required
def get_user(username):
    user_ex = User.query.filter_by(username=username).first()
    if user_ex == None:
        return jsonify([])
    return_json = []
    return_json.append(user_ex.json())
    return_json[0]['MoneySources'] = [money_source.json() for money_source in user_ex.money_sources]
    return jsonify(return_json)

@app.route("/users/new", methods=['POST'])
@login_required
def create_user():
    request_body = request.get_json()
    request_body['password'] = generate_password_hash(request_body['password'])
    User.create(request_body)
    return jsonify({
        "Success": "User '" + request_body['username'] + "' created."
    })

@app.route("/users/delete", methods=['POST'])
@login_required
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

@app.route("/moneysources", methods=['POST'])
@login_required
def get_money_sources():
    money_sources = MoneySource.query.all()
    return_json = []
    for money_source in money_sources:
        return_json.append(money_source.json())
    return jsonify(return_json)

@app.route("/moneysources/new", methods=['POST'])
@login_required
def create_money_source():
    proper_request = request.get_json()
    proper_request['user_id'] = current_user.id
    test_source = MoneySource.create(proper_request, True)
    return jsonify(test_source.json())

@app.route("/moneysources/delete-all", methods=['POST'])
@login_required
def delete_all_money_sources():
    for money_source in current_user.money_sources:
        money_source.remove()

    return jsonify({"Status": "Success!"})

@app.route("/accounts", methods=['POST'])
@login_required
def get_accounts():
    accounts = Account.query.all()
    return_json = []
    for account in accounts:
        return_json.append(account.json())
    return jsonify(return_json)

@app.route("/accounts/new", methods=['POST'])
@login_required
def create_account():
    proper_request = request.get_json()
    proper_request['user_id'] = current_user.id
    new_account = Account.create(proper_request, True)
    return jsonify(new_account.json())
