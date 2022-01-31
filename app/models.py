from . import db

class BaseMixin(object):
    @classmethod
    def create(cls, return_obj = False, **kw):
        obj = cls(**kw)
        db.session.add(obj)
        db.session.commit()
        if return_obj:
            return obj

    def json(self):
        attrs = [col.name for col in self.__table__.columns]
        return_json = {}
        for attr in attrs:
            return_json[attr] = getattr(self, attr)
        return return_json

class User(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    money_sources = db.relationship("MoneySource", backref="User", lazy=True)
    accounts = db.relationship("Account", backref="User", lazy=True)

    def __repr__(self):
        return '<User %r>' % self.username

class MoneySource(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    date_tag = db.Column(db.String(8), nullable=True)
    frequency = db.Column(db.Integer, nullable=True)
    end_from = db.Column(db.Integer, nullable=True)
    start_from = db.Column(db.Integer, nullable=True)
    account = db.Column(db.String(80), nullable=False)
    based_on_date = db.Column(db.Boolean, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    applied_to = db.Column(db.String(80), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__( self, **attr ):
        for att in attr:
            setattr(self, att, attr[att])

class Account(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    original_balance = db.Column(db.Integer, nullable=False)
    credit_limit = db.Column(db.Integer, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


