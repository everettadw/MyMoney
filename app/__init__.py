from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config.from_pyfile("config.py")

db = SQLAlchemy(app)

from .models import User, MoneySource, Account
from . import views