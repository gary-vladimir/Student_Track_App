from flask import Flask, jsonify
from flask_cors import CORS
from models import db, Group, Student

app = Flask(__name__)
CORS(app)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:genio123@localhost:5432/student_track_app_db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

@app.route("/")
def home_route():
    return jsonify({"message": "Home Route"})


@app.route("/api/data", methods=["GET"])
def get_data():
    data = {"message": "Hello Gary from Flask!"}
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
