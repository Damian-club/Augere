from core.db import SessionLocal
from models.user import User

db = SessionLocal()

users = db.query(User).all()

if not users:
    print("No hay usuarios registrados.")
else:
    for u in users:
        print(f"Email: {u.email}")
        print(f"Hash: {u.pwd_hash}")
        print("--------")

db.close()
