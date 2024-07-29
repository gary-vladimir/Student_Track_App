from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Group, Student, Payment, student_group_association

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
    groups = Group.query.order_by(Group.id).all()
    return jsonify([group.to_dict() for group in groups])


@app.route("/api/groups/<int:group_id>", methods=["GET"])
def get_group(group_id):
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404
    return jsonify(group.to_dict())


@app.route("/api/groups/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    group = Group.query.get(group_id)
    if group is None:
        return jsonify({"error": "Group not found"}), 404
    if len(group.students) > 0:
        return jsonify({"error": "Group has students. Cannot delete."}), 400

    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted"}), 200


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
def add_student_to_group(group_id):
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
def remove_student_from_group(group_id, student_id):
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
def add_payment(student_id):
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
def delete_payment(student_id, payment_id):
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
def get_students():
    students = Student.query.all()
    return jsonify([student.to_dict() for student in students])


# Endpoint to get student details including payments
@app.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(student.to_dict()), 200


@app.route("/api/students/<int:student_id>/payment_status", methods=["GET"])
def get_payment_status(student_id):
    student = Student.query.get(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404

    current_month = datetime.utcnow().month
    total_cost = sum(group.group_cost for group in student.groups)
    total_paid = sum(
        payment.amount
        for payment in student.payments
        if payment.date.month == current_month
    )

    previous_month_total = sum(
        payment.amount
        for payment in student.payments
        if payment.date.month == current_month - 1
    )
    previous_month_cost = total_cost

    status = "PAID" if total_paid >= total_cost else "PENDING"
    pending_amount = max(0, total_cost - total_paid)

    if previous_month_total < previous_month_cost:
        status = "BEHIND"
        pending_amount += previous_month_cost - previous_month_total

    return jsonify({"status": status, "pending_amount": pending_amount}), 200


if __name__ == "__main__":
    app.run(debug=True)
