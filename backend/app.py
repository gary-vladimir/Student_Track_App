# app.py
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Group, Student, student_group_association

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
    students = (
        Student.query.join(student_group_association)
        .filter(student_group_association.c.group_id == group_id)
        .all()
    )
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


@app.route("/api/groups/<int:group_id>", methods=["PATCH"])
def update_group(group_id):
    data = request.get_json()
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404

    if "group_cost" in data:
        if data["group_cost"] is None or not isinstance(data["group_cost"], int):
            return (
                jsonify({"error": "group_cost is required and must be an integer"}),
                400,
            )
        group.group_cost = data["group_cost"]

    db.session.commit()
    return jsonify(group.to_dict()), 200


@app.route("/api/students", methods=["POST"])
def create_student():
    data = request.get_json()
    new_student = Student(
        name=data["name"],
        payment_day=data["payment_day"],
        status=data["status"],
        parent_phone_number=data["parent_phone_number"],
        cost=data.get("cost", 0),
        paid_amount=data.get("paid_amount", 0),
    )
    db.session.add(new_student)
    db.session.commit()

    # Add student to groups
    group_ids = data.get("group_ids", [])
    for group_id in group_ids:
        group = Group.query.get(group_id)
        if group:
            group.students.append(new_student)
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


@app.route("/api/students/<int:student_id>", methods=["PATCH"])
def update_student(student_id):
    data = request.get_json()
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # Validate data
    allowed_fields = [
        "name",
        "payment_day",
        "status",
        "parent_phone_number",
        "cost",
        "paid_amount",
    ]
    for field in allowed_fields:
        if field in data and data[field] is None:
            return jsonify({"error": f"{field} cannot be blank"}), 400

    # Update student
    for key, value in data.items():
        if key in allowed_fields:
            setattr(student, key, value)

    # Update student groups
    if "group_ids" in data:
        student.groups = []
        group_ids = data.get("group_ids", [])
        for group_id in group_ids:
            group = Group.query.get(group_id)
            if group:
                student.groups.append(group)

    db.session.commit()
    return jsonify(student.to_dict()), 200


if __name__ == "__main__":
    app.run(debug=True)
