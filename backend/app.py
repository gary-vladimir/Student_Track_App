from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Group, Student, Payment, student_group_association
from datetime import datetime
from sqlalchemy import func
from dotenv import load_dotenv
import os
from auth import requires_auth, AuthError

load_dotenv()

CLIENT_ORIGIN_URL = os.getenv("CLIENT_ORIGIN_URL", "http://localhost:3000")
CORS(app, resources={r"/*": {"origins": CLIENT_ORIGIN_URL}})

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": CLIENT_ORIGIN_URL}})

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", "postgresql://postgres:genio123@localhost:5432/student_track_app_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)


@app.route("/api/groups", methods=["GET"])
@requires_auth("get:groups")
def get_groups(payload):
    groups = Group.query.order_by(Group.id).all()
    return jsonify([group.to_dict() for group in groups])


@app.route("/api/groups/<int:group_id>", methods=["GET"])
@requires_auth("get:group")
def get_group(payload, group_id):
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404
    return jsonify(group.to_dict())


@app.route("/api/groups/<int:group_id>", methods=["DELETE"])
@requires_auth("delete:group")
def delete_group(payload, group_id):
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404
    if len(group.students) > 0:
        return jsonify({"error": "Group has students. Cannot delete."}), 400

    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted"}), 200


@app.route("/api/groups/<int:group_id>/students", methods=["GET"])
@requires_auth("get:students_by_group")
def get_students_by_group(payload, group_id):
    students = (
        Student.query.join(student_group_association)
        .filter(student_group_association.c.group_id == group_id)
        .all()
    )
    return jsonify([student.to_dict() for student in students])


@app.route("/api/groups", methods=["POST"])
@requires_auth("create:group")
def create_group(payload):
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
@requires_auth("patch:group")
def update_group(payload, group_id):
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
@requires_auth("create:student")
def create_student(payload):
    data = request.get_json()
    new_student = Student(
        name=data["name"],
        parent_phone_number=data["parent_phone_number"],
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
@requires_auth("delete:student")
def delete_student(payload, student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted"}), 200


@app.route("/api/students/<int:student_id>", methods=["PATCH"])
@requires_auth("patch:student")
def update_student(payload, student_id):
    data = request.get_json()
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # Validate data
    allowed_fields = [
        "name",
        "parent_phone_number",
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


@app.route("/api/groups/<int:group_id>/students", methods=["POST"])
@requires_auth("add:student_to_group")
def add_student_to_group(payload, group_id):
    data = request.get_json()
    student_id = data.get("student_id")

    group = Group.query.get(group_id)
    student = Student.query.get(student_id)

    if not group or not student:
        return jsonify({"error": "Group or student not found"}), 404

    group.students.append(student)
    db.session.commit()

    return jsonify({"message": "Student added to group"}), 200


@app.route("/api/groups/<int:group_id>/students/<int:student_id>", methods=["DELETE"])
@requires_auth("remove:student_from_group")
def remove_student_from_group(payload, group_id, student_id):
    group = Group.query.get(group_id)
    student = Student.query.get(student_id)

    if group is None:
        return jsonify({"error": "Group not found"}), 404

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    if student in group.students:
        group.students.remove(student)
        db.session.commit()
        return jsonify({"message": "Student removed from group"}), 200
    else:
        return jsonify({"error": "Student not in group"}), 400


@app.route("/api/students/<int:student_id>/payments", methods=["POST"])
@requires_auth("create:payment")
def add_payment(payload, student_id):
    data = request.get_json()
    amount = data.get("amount")
    if amount is None:
        return jsonify({"error": "Amount is required"}), 400

    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    total_group_cost = sum(group.group_cost for group in student.groups)
    payment = Payment(
        amount=amount, student_id=student_id, group_cost_at_payment=total_group_cost
    )
    db.session.add(payment)
    db.session.commit()

    return jsonify(payment.to_dict()), 201


@app.route(
    "/api/students/<int:student_id>/payments/<int:payment_id>", methods=["DELETE"]
)
@requires_auth("delete:payment")
def delete_payment(payload, student_id, payment_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    payment = Payment.query.get(payment_id)
    if payment is None or payment.student_id != student_id:
        return jsonify({"error": "Payment not found for this student"}), 404

    db.session.delete(payment)
    db.session.commit()

    return jsonify({"message": "Payment deleted"}), 200


@app.route("/api/students", methods=["GET"])
@requires_auth("get:students")
def get_students(payload):
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students])


# Endpoint to get student details including payments
@app.route("/api/students/<int:student_id>", methods=["GET"])
@requires_auth("get:student")
def get_student(payload, student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(student.to_dict()), 200


@app.route("/api/students/<int:student_id>/payment_status", methods=["GET"])
@requires_auth("get:payment_status")
def get_payment_status(payload, student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    total_group_cost = sum(group.group_cost for group in student.groups)

    current_year = datetime.utcnow().year
    current_month = datetime.utcnow().month

    total_payments = (
        db.session.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.student_id == student_id,
            func.extract("year", Payment.date) == current_year,
            func.extract("month", Payment.date) == current_month,
        )
        .scalar()
    )

    if total_payments == 0:
        status = "PENDING"
        pending_amount = total_group_cost
    elif total_payments < total_group_cost:
        status = "PENDING"
        pending_amount = total_group_cost - total_payments
    elif total_payments >= total_group_cost:
        status = "PAID"
        pending_amount = 0

    return jsonify({"status": status, "pending_amount": pending_amount}), 200


# Error handlers
@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({"error": "Bad Request", "message": str(error)}), 400


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not Found", "message": str(error)}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error", "message": str(error)}), 500


@app.errorhandler(405)
def method_not_allowed_error(error):
    return jsonify({"error": "Method Not Allowed", "message": str(error)}), 405


@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
