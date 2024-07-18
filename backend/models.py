# models.py
from flask_sqlalchemy import SQLAlchemy

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
    name = db.Column(db.String(100), nullable=False)
    payment_day = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    parent_phone_number = db.Column(db.String(20), nullable=False)
    cost = db.Column(db.Integer, nullable=False, default=0)
    paid_amount = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        group_cost_sum = (
            db.session.query(db.func.sum(Group.group_cost))
            .join(student_group_association)
            .filter(student_group_association.c.student_id == self.id)
            .scalar()
            or 0
        )
        return {
            "id": self.id,
            "name": self.name,
            "payment_day": self.payment_day,
            "status": self.status,
            "parent_phone_number": self.parent_phone_number,
            "cost": self.cost or group_cost_sum,
            "paid_amount": self.paid_amount,
        }
