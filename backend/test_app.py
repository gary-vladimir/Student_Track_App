import unittest
import json
import os
import warnings
from app import app, db
from models import Group, Student, Payment
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
warnings.filterwarnings("ignore", category=DeprecationWarning)


class TestApp(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()

        self.admin_token = os.getenv("ADMIN_JWT_TOKEN")
        self.teacher_token = os.getenv("TEACHER_JWT_TOKEN")
        self.invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkludmFsaWQgVG9rZW4iLCJpYXQiOjE1MTYyMzkwMjJ9.InvalidSignature"

        if not self.admin_token or not self.teacher_token:
            raise ValueError("JWT tokens not found in environment variables")

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_get_groups_success_admin(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.client.get("/api/groups", headers=headers)
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["title"], "Test Group")

    def test_get_groups_success_teacher(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            response = self.client.get("/api/groups", headers=headers)
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["title"], "Test Group")

    def test_get_groups_fail_no_permission(self):
        headers = {"Authorization": f"Bearer {self.invalid_token}"}
        response = self.client.get("/api/groups", headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_create_group_success_admin(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        data = {"title": "New Group", "group_cost": 150}
        response = self.client.post("/api/groups", json=data, headers=headers)
        result = json.loads(response.data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(result["title"], "New Group")
        self.assertEqual(result["group_cost"], 150)

    def test_create_group_fail_teacher(self):
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        data = {"title": "New Group", "group_cost": 150}
        response = self.client.post("/api/groups", json=data, headers=headers)

        self.assertEqual(response.status_code, 403)

    def test_create_group_fail_no_permission(self):
        headers = {"Authorization": f"Bearer {self.invalid_token}"}
        data = {"title": "New Group", "group_cost": 150}
        response = self.client.post("/api/groups", json=data, headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_get_group_success_admin(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.client.get(f"/api/groups/{group.id}", headers=headers)
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(data["title"], "Test Group")

    def test_get_group_success_teacher(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            response = self.client.get(f"/api/groups/{group.id}", headers=headers)
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(data["title"], "Test Group")

    def test_get_group_fail_no_permission(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.invalid_token}"}
            response = self.client.get(f"/api/groups/{group.id}", headers=headers)
            self.assertEqual(response.status_code, 401)

    def test_delete_group_success_admin(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.client.delete(f"/api/groups/{group.id}", headers=headers)

            self.assertEqual(response.status_code, 200)

    def test_delete_group_fail_teacher(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            response = self.client.delete(f"/api/groups/{group.id}", headers=headers)
            self.assertEqual(response.status_code, 403)

    def test_delete_group_fail_no_permission(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.invalid_token}"}
            response = self.client.delete(f"/api/groups/{group.id}", headers=headers)
            self.assertEqual(response.status_code, 401)

    def test_update_group_success_admin(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            data = {"group_cost": 150}
            response = self.client.patch(
                f"/api/groups/{group.id}", json=data, headers=headers
            )
            result = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(result["group_cost"], 150)

    def test_update_group_fail_teacher(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            data = {"group_cost": 150}
            response = self.client.patch(
                f"/api/groups/{group.id}", json=data, headers=headers
            )

            self.assertEqual(response.status_code, 403)

    def test_update_group_fail_no_permission(self):
        with self.app_context:
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.invalid_token}"}
            data = {"group_cost": 150}
            response = self.client.patch(
                f"/api/groups/{group.id}", json=data, headers=headers
            )

            self.assertEqual(response.status_code, 401)

    def test_create_student_success_admin(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        data = {"name": "New Student", "parent_phone_number": "1234567890"}
        response = self.client.post("/api/students", json=data, headers=headers)
        result = json.loads(response.data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(result["name"], "New Student")

    def test_create_student_fail_teacher(self):
        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        data = {"name": "New Student", "parent_phone_number": "1234567890"}
        response = self.client.post("/api/students", json=data, headers=headers)
        self.assertEqual(response.status_code, 403)

    def test_create_student_fail_no_permission(self):
        headers = {"Authorization": f"Bearer {self.invalid_token}"}
        data = {"name": "New Student", "parent_phone_number": "1234567890"}
        response = self.client.post("/api/students", json=data, headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_get_students_success_admin(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.client.get("/api/students", headers=headers)
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["name"], "Test Student")

    def test_get_students_success_teacher(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            response = self.client.get("/api/students", headers=headers)
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["name"], "Test Student")

    def test_get_students_fail_no_permission(self):
        headers = {"Authorization": f"Bearer {self.invalid_token}"}
        response = self.client.get("/api/students", headers=headers)
        self.assertEqual(response.status_code, 401)

    def test_delete_student_success_admin(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.client.delete(
                f"/api/students/{student.id}", headers=headers
            )

            self.assertEqual(response.status_code, 200)

    def test_delete_student_fail_teacher(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            response = self.client.delete(
                f"/api/students/{student.id}", headers=headers
            )

            self.assertEqual(response.status_code, 403)

    def test_delete_student_fail_no_permission(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.invalid_token}"}
            response = self.client.delete(
                f"/api/students/{student.id}", headers=headers
            )

            self.assertEqual(response.status_code, 401)

    def test_add_payment_success_admin(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            data = {"amount": 100}
            response = self.client.post(
                f"/api/students/{student.id}/payments", json=data, headers=headers
            )
            result = json.loads(response.data)

            self.assertEqual(response.status_code, 201)
            self.assertEqual(result["amount"], 100)

    def test_add_payment_success_teacher(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            data = {"amount": 100}
            response = self.client.post(
                f"/api/students/{student.id}/payments", json=data, headers=headers
            )

            self.assertEqual(response.status_code, 403)

    def test_add_payment_fail_no_permission(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            db.session.add(student)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.invalid_token}"}
            data = {"amount": 100}
            response = self.client.post(
                f"/api/students/{student.id}/payments", json=data, headers=headers
            )
            self.assertEqual(response.status_code, 401)

    def test_get_payment_status_success_admin(self):
        with self.app_context:
            student = Student(name="Test Student", parent_phone_number="1234567890")
            group = Group(title="Test Group", group_cost=100)
            student.groups.append(group)
            db.session.add(student)
            db.session.add(group)
            db.session.commit()

            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.client.get(
                f"/api/students/{student.id}/payment_status", headers=headers
            )
            data = json.loads(response.data)

            self.assertEqual(response.status_code, 200)
            self.assertIn("status", data)
            self.assertIn("pending_amount", data)

    def test_get_payment_status_success_teacher(self):
        with app.app_context():
            student = Student(name="Test Student", parent_phone_number="1234567890")
            group = Group(title="Test Group", group_cost=100)
            student.groups.append(group)
            db.session.add(student)
            db.session.add(group)


class CustomTestResult(unittest.TextTestResult):
    def addSuccess(self, test):
        super().addSuccess(test)
        self.stream.write("PASS ")
        self.stream.flush()


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestApp)
    runner = unittest.TextTestRunner(verbosity=2, resultclass=CustomTestResult)
    result = runner.run(suite)

    print(f"\nRan {result.testsRun} tests")
    if result.wasSuccessful():
        print("All tests PASSED!")
    else:
        print(
            f"Tests FAILED. Failures: {len(result.failures)}, Errors: {len(result.errors)}"
        )
