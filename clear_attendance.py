from backend.app import app, db
from backend.models import Attendance

with app.app_context():
    deleted = db.session.query(Attendance).delete()
    db.session.commit()
    print(f"✅ Deleted {deleted} attendance records.")
