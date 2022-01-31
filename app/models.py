from . import db

class BaseMixin(object):
    @classmethod
    def create(cls, returnObj = False, **kw):
        obj = cls(**kw)
        db.session.add(obj)
        db.session.commit()
        if returnObj:
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
    moneySources = db.relationship("MoneySource", backref="User", lazy=True)
    Accounts = db.relationship("Account", backref="User", lazy=True)

    def __repr__(self):
        return '<User %r>' % self.username

class MoneySource(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    date = db.Column(db.String(8), nullable=True)
    frequency = db.Column(db.Integer, nullable=True)
    endFrom = db.Column(db.Integer, nullable=True)
    startFrom = db.Column(db.Integer, nullable=True)
    account = db.Column(db.String(80), nullable=False)
    basedOnDate = db.Column(db.Boolean, nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    appliedTo = db.Column(db.String(80), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__( self, **attr ):
        for att in attr:
            setattr(self, att, attr[att])


    # def json(self):
    #     return {
    #         'id': self.id,
    #         'user_id': self.user_id,
    #         'name': self.name,
    #         'type': self.type,
    #         'date': self.date,
    #         'frequency': self.frequency,
    #         'endFrom': self.endFrom,
    #         'startFrom': self.startFrom,
    #         'account': self.account,
    #         'basedOnDate': self.basedOnDate,
    #         'amount': self.amount,
    #         'appliedTo': self.appliedTo
    #     }

class Account(BaseMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    originalBalance = db.Column(db.Integer, nullable=False)
    creditLimit = db.Column(db.Integer, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


