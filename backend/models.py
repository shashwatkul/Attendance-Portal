from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_hr = db.Column(db.Boolean, default=False, nullable=False)

    # ✅ NEW: Fields for the employee ID card
    job_role = db.Column(db.String(100), nullable=True, default="Employee")
    employee_id = db.Column(db.String(50), unique=True, nullable=True)
    contact_number = db.Column(db.String(20), nullable=True)
    profile_photo = db.Column(db.String(200), nullable=True, default='default.png') # Stores the filename

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    is_read = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship('User', backref=db.backref('messages', lazy=True, cascade="all, delete-orphan"))



class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # present, absent, holiday
    login_time = db.Column(db.Time, nullable=True)   # ✅ newly added
    logout_time = db.Column(db.Time, nullable=True)  # ✅ newly added

    user = db.relationship('User', backref=db.backref('attendance_records', lazy=True, cascade="all, delete-orphan"))



# ✅ This is the missing class definition
class LeaveRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    leave_type = db.Column(db.String(50), nullable=False, default='Casual Leave')
    status = db.Column(db.String(20), nullable=False, default='Pending') # Pending, Approved, Rejected
    requested_at = db.Column(db.DateTime, default=datetime.now)

    # Relationship to easily access the user who made the request
    user = db.relationship('User', backref=db.backref('leave_requests', lazy=True, cascade="all, delete-orphan"))

class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # HR user who posted it
    user = db.relationship('User', backref=db.backref('announcements', lazy=True))
