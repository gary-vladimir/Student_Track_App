import unittest
import json
import os
import warnings
from app import app
from models import db, Group, Student, Payment
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
warnings.filterwarnings("ignore", category=DeprecationWarning)


class TestApp(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

        self.admin_token = os.getenv("ADMIN_JWT_TOKEN")
        self.teacher_token = os.getenv("TEACHER_JWT_TOKEN")

        if not self.admin_token or not self.teacher_token:
            raise ValueError("JWT tokens not found in environment variables")

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_get_groups_success_admin(self):
        with app.app_context():
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
        with app.app_context():
            group = Group(title="Test Group", group_cost=100)
            db.session.add(group)
            db.session.commit()

        headers = {"Authorization": f"Bearer {self.teacher_token}"}
        response = self.client.get("/api/groups", headers=headers)
        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Test Group")

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
