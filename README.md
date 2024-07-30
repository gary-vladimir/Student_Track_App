---

# Student Track App

The **Student Track App** is a comprehensive platform designed to help administrators manage students and groups, track payments, and maintain student records efficiently. This open-source project provides an intuitive interface and easy-to-use functionalities for managing educational institutions' administrative tasks.

## Features

- **Student Management**: Add, edit, and delete student records.
- **Group Management**: Create groups, assign students to groups, and manage group details.
- **Payment Tracking**: Record payments made by students, view payment history, and track pending amounts.
- **Payment Status**: Automatic calculation of the student's payment status (PAID, PENDING, BEHIND).

## Screenshots

["Student Track App UI"](/StudentTrackApp.png)

## Installation

### Prerequisites

- **Backend**: Python 3.9+, Flask, PostgreSQL
- **Frontend**: Node.js, npm, React

### Setup

1. **Clone the repository**:
   ```
   git clone https://github.com/gary-vladimir/Student_Track_App.git
   cd Student_Track_app
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Create a virtual environment and install dependencies:
     ```
     python -m venv venv
     source venv/bin/activate  # On Windows use `venv\Scripts\activate`
     pip install -r requirements.txt
     ```

   - Run the backend server:
     ```
     python app.py
     ```

3. **Frontend Setup**:

   - Install the dependencies:
     ```
     npm install
     ```
   - Start the frontend development server:
     ```
     npm start
     ```

## Usage

- Navigate to `http://localhost:3000` to use the application.
- The main dashboard provides options to manage students and groups.
- Click on a student or group to view and edit details.

## API Documentation

The backend API provides endpoints for managing students, groups, and payments. Here's a brief overview:

- `GET /api/groups`: Fetch all groups.
- `GET /api/groups/<group_id>`: Fetch details of a specific group.
- `POST /api/groups`: Create a new group.
- `PATCH /api/groups/<group_id>`: Update group details.
- `DELETE /api/groups/<group_id>`: Delete a group.

- `GET /api/students`: Fetch all students.
- `GET /api/students/<student_id>`: Fetch details of a specific student.
- `POST /api/students`: Create a new student.
- `PATCH /api/students/<student_id>`: Update student details.
- `DELETE /api/students/<student_id>`: Delete a student.

- `POST /api/students/<student_id>/payments`: Add a payment for a student.
- `DELETE /api/students/<student_id>/payments/<payment_id>`: Delete a specific payment.

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Contact

For any questions or suggestions, please contact us at [gary@garybricks.com].

---
