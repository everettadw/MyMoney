from flask import Flask

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config.from_pyfile("config.py")

from . import views