# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table
student_group_association = db.Table(
    "student_group_association",
    db.Column("student_id", db.Integer, db.ForeignKey("students.id"), primary_key=True),
    db.Column("group_id", db.Integer, db.ForeignKey("groups.id"), primary_key=True),
)


class Group(db.Model):
    __tablename__ = "groups"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    group_cost = db.Column(db.Integer, nullable=False)
    students = db.relationship(
        "Student",
        secondary=student_group_association,
        backref=db.backref("groups", lazy=True),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "group_cost": self.group_cost,
            "students": [student.to_dict() for student in self.students],
        }


class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    parent_phone_number = db.Column(db.String(20), nullable=False)
    payments = db.relationship(
        "Payment", backref="student", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "parent_phone_number": self.parent_phone_number,
            "payments": [payment.to_dict() for payment in self.payments],
        }


class Payment(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "date": self.date.isoformat(),
            "student_id": self.student_id,
        }
