# manage.py
from flask.cli import FlaskGroup
from app import app, db
from models import Group, Student, Payment

cli = FlaskGroup(app)


@cli.command("create_tables")
def create_tables():
    with app.app_context():
        db.create_all()
    print("Tables created successfully.")


if __name__ == "__main__":
    cli()
