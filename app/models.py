from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    moneySources = db.relationship("MoneySource", backref="User", lazy=True)
    Accounts = db.relationship("Account", backref="User", lazy=True)

    def __repr__(self):
        return '<User %r>' % self.username

class MoneySource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    date = db.Column(db.Integer, nullable=True)
    frequency = db.Column(db.Integer, nullable=True)
    endFrom = db.Column(db.Integer, nullable=True)
    startFrom = db.Column(db.Integer, nullable=True)
    account = db.Column(db.String(80), nullable=False)
    basedOnDate = db.Column(db.Boolean, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    appliedTo = db.Column(db.String(80), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    originalBalance = db.Column(db.Integer, nullable=False)
    creditLimit = db.Column(db.Integer, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


