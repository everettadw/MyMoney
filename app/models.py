from flask_login import UserMixin
from . import db

class BaseMixin(object):
    @classmethod
    def create(cls, kw, return_obj = False):
        obj = cls(kw)
        db.session.add(obj)
        db.session.commit()
        if return_obj:
            return obj

    def remove(self):
        db.session.delete(self)
        db.session.commit()

    def json(self):
        attrs = [col.name for col in self.__table__.columns]
        return_json = {}
        for attr in attrs:
            return_json[attr] = getattr(self, attr)
        return return_json

    def __init__( self, attrObj ):
        print(attrObj)
        for att in attrObj:
            setattr(self, att, attrObj[att])

class User(BaseMixin, UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    money_sources = db.relationship("MoneySource", backref="User", lazy=True)
    accounts = db.relationship("Account", backref="User", lazy=True)

    def __repr__(self):
        return '<User %r>' % self.username

class MoneySource(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    date = db.Column(db.String(8), nullable=True)
    frequency = db.Column(db.Integer, nullable=True)
    end_from = db.Column(db.String(8), nullable=True)
    start_from = db.Column(db.String(8), nullable=True)
    account = db.Column(db.String(80), nullable=False)
    based_on_date = db.Column(db.Boolean, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    applied_to = db.Column(db.String(80), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return '<MoneySource %r>' % self.name

class Account(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    balance = db.Column(db.Integer, nullable=False)
    credit_limit = db.Column(db.Integer, nullable=True)
    last_updated = db.Column(db.String(8), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return '<Account %r>' % self.name


