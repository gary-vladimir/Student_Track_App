from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home_route():
    return jsonify({"message": "Home Route"})


@app.route("/api/data", methods=["GET"])
def get_data():
    data = {"message": "Hello Gary from Flask!"}
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
