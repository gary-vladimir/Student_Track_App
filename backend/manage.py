from flask.cli import FlaskGroup
from app import app, db
from models import Group, Student, Payment

cli = FlaskGroup(app)

if __name__ == "__main__":
    cli()
