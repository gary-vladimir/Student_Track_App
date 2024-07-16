# models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Group(db.Model):
    __tablename__ = "groups"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    students = db.relationship("Student", backref="group", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "students": [student.to_dict() for student in self.students],
        }


class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    payment_day = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    parent_phone_number = db.Column(db.String(20), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "payment_day": self.payment_day,
            "status": self.status,
            "parent_phone_number": self.parent_phone_number,
        }
