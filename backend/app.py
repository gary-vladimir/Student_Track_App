# app.py
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Group, Student

app = Flask(__name__)
CORS(app)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:genio123@localhost:5432/student_track_app_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)


@app.route("/api/groups", methods=["GET"])
def get_groups():
    groups = Group.query.all()
    return jsonify([group.to_dict() for group in groups])


@app.route("/api/groups/<int:group_id>/students", methods=["GET"])
def get_students_by_group(group_id):
    students = Student.query.filter_by(group_id=group_id).all()
    return jsonify([student.to_dict() for student in students])


@app.route("/api/groups", methods=["POST"])
def create_group():
    data = request.get_json()
    if "title" not in data or not data["title"]:
        return jsonify({"error": "Title is required and cannot be blank"}), 400
    if "group_cost" not in data or not isinstance(data["group_cost"], int):
        return jsonify({"error": "group_cost is required and must be an integer"}), 400

    new_group = Group(title=data["title"], group_cost=data["group_cost"])
    db.session.add(new_group)
    db.session.commit()
    return jsonify(new_group.to_dict()), 201


@app.route("/api/students", methods=["POST"])
def create_student():
    data = request.get_json()
    new_student = Student(
        name=data["name"],
        payment_day=data["payment_day"],
        status=data["status"],
        parent_phone_number=data["parent_phone_number"],
        group_id=data["group_id"],
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify(new_student.to_dict()), 201


@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted"}), 200


@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json()
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    required_fields = [
        "name",
        "payment_day",
        "status",
        "parent_phone_number",
        "cost",
        "paid_amount",
        "group_id",
    ]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} is required and cannot be blank"}), 400

    group = Group.query.get(data["group_id"])
    if group is None:
        return jsonify({"error": "Group not found"}), 404

    student.name = data["name"]
    student.payment_day = data["payment_day"]
    student.status = data["status"]
    student.parent_phone_number = data["parent_phone_number"]
    student.cost = data["cost"]
    student.paid_amount = data["paid_amount"]
    student.group_id = data["group_id"]

    db.session.commit()
    return jsonify(student.to_dict()), 200


if __name__ == "__main__":
    app.run(debug=True)
