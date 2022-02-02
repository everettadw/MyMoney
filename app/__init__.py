from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config.from_pyfile("config.py")

db = SQLAlchemy(app)

login_manager = LoginManager(app=app)
login_manager.login_view = 'login'
login_manager.login_message = "Please login to access that page."

from .models import User, MoneySource, Account
from . import views