import os
import json
from functools import wraps
from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta
import io
import csv
import math 

from backend.models import db, User, Attendance, LeaveRequest, Announcement, Message


bcrypt = Bcrypt()



UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ NEW: Define office coordinates and max distance
# NOTE: These coordinates are for Noida, India. Replace with your actual office location.
OFFICE_LATITUDE = 28.583417
OFFICE_LONGITUDE = 77.314006
MAX_DISTANCE_METERS = 200

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the distance between two points on Earth using the Haversine formula.
    Returns distance in meters.
    """
    R = 6371e3  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    CORS(
        app, 
        origins="*", # WARNING: For debugging only.
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"]
    )

    upload_path = os.path.join(app.instance_path, UPLOAD_FOLDER)
    os.makedirs(upload_path, exist_ok=True)
    
    app.config['UPLOAD_FOLDER'] = upload_path
    app.config['SECRET_KEY'] =  os.environ.get('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    bcrypt.init_app(app)
    with app.app_context():
        db.create_all()

    # --- Decorators (remain the same) ---
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                token = request.headers['Authorization'].split(" ")[1]
            if not token:
                return jsonify({'message': 'Token is missing!'}), 401
            try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                current_user = User.query.get(data['user_id'])
                if not current_user:
                    return jsonify({'message': 'User not found!'}), 401
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                return jsonify({'message': 'Token is invalid or expired!'}), 401
            return f(current_user, *args, **kwargs)
        return decorated


    def hr_required(f):
        @wraps(f)
        @token_required
        def decorated(current_user, *args, **kwargs):
            if not current_user.is_hr:
                return jsonify({'message': 'Access denied. HR privileges required.'}), 403
            return f(current_user, *args, **kwargs)
        return decorated


    # --- Routes ---
    
    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        
        # ✅ REMOVED: Temporary debugging code has been removed for production.
        if user and bcrypt.check_password_hash(user.password, data['password']):
            token = jwt.encode({
                'user_id': user.id, 'name': user.name, 'email': user.email, 'is_hr': user.is_hr,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify(token=token, user={'name': user.name, 'email': user.email, 'is_hr': user.is_hr})
        
        return jsonify(message='Invalid credentials'), 401
    
    
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/profile', methods=['GET'])
    @token_required
    def get_profile(current_user):
        return jsonify({
            'name': current_user.name, 'email': current_user.email,
            'job_role': current_user.job_role, 'employee_id': current_user.employee_id,
            'contact_number': current_user.contact_number,
            'profile_photo_url': f"/uploads/{current_user.profile_photo}"
        })

    @app.route('/profile/update', methods=['POST'])
    @token_required
    def update_profile(current_user):
        if 'profile_photo' not in request.files:
            return jsonify({'message': 'No profile photo file found.'}), 400
        file = request.files['profile_photo']
        if file.filename == '':
            return jsonify({'message': 'No file selected.'}), 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp_filename = f"{datetime.now().timestamp()}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], timestamp_filename))
            current_user.profile_photo = timestamp_filename
            db.session.commit()
            return jsonify({'message': 'Profile icon updated successfully.'})
        return jsonify({'message': 'Invalid file type.'}), 400

    # --- Employee Routes ---
    @app.route('/attendance/<month>', methods=['GET'])
    @token_required
    def get_attendance(current_user, month):
        try:
            start_date = datetime.strptime(month, "%Y-%m").date()
        except ValueError:
            return jsonify(message="Invalid month format. Please use YYYY-MM."), 400

        year, month_num = start_date.year, start_date.month
        if month_num == 12:
            end_date = start_date.replace(year=year + 1, month=1, day=1)
        else:
            end_date = start_date.replace(month=month_num + 1, day=1)

        records = Attendance.query.filter(
            Attendance.user_id == current_user.id,
            Attendance.date >= start_date,
            Attendance.date < end_date
        ).all()

        return jsonify([
            {
                "date": record.date.strftime('%Y-%m-%d'), "status": record.status,
                "login_time": record.login_time.strftime('%I:%M %p') if record.login_time else None,
                "logout_time": record.logout_time.strftime('%I:%M %p') if record.logout_time else None
            } for record in records
        ])
    
    # ✅ MODIFIED: This route now requires location data and validates it.
    @app.route('/attendance/mark', methods=['POST'])
    @token_required
    def mark_attendance(current_user):
         # ✅ FIXED: Use request.get_json(silent=True) for more robust error handling.
        # This prevents the 415 error from crashing the server.
        data = request.get_json(silent=True)
        if not data:
            return jsonify(message="Invalid request format. Must be JSON with 'Content-Type: application/json' header."), 415

        latitude = data.get('latitude')
        longitude = data.get('longitude')

        if latitude is None or longitude is None:
            return jsonify(message="Location data is required to mark attendance."), 400

        # Calculate distance from the office
        distance = calculate_distance(latitude, longitude, OFFICE_LATITUDE, OFFICE_LONGITUDE)

        if distance > MAX_DISTANCE_METERS:
            return jsonify(message=f"You are approximately {int(distance)} meters away from the office. You must be within {MAX_DISTANCE_METERS} meters to mark attendance."), 403 # 403 Forbidden

        # If distance check passes, proceed with the original logic
        today = datetime.now().date()
        if Attendance.query.filter_by(user_id=current_user.id, date=today).first():
            return jsonify(message="Attendance already marked for today"), 409
        
        record = Attendance(user_id=current_user.id, date=today, status='present', login_time=datetime.now().time())
        db.session.add(record)
        db.session.commit()
        return jsonify(message="Attendance marked successfully. You are within the allowed distance."), 201
    
    @app.route('/attendance/logout', methods=['POST'])
    @token_required
    def mark_logout(current_user):
        now_system = datetime.now()
        today = now_system.date()
        attendance = Attendance.query.filter_by(user_id=current_user.id, date=today).first()
        if not attendance:
            return jsonify(message="Login has not been marked for today"), 404
        if attendance.logout_time:
            return jsonify(message="Logout already marked for today"), 409
        
        attendance.logout_time = now_system.time()
        db.session.commit()
        return jsonify(message="Logout time updated successfully")


    @app.route('/messages/send', methods=['POST'])
    @token_required
    def send_message_to_hr(current_user):
        data = request.json
        content = data.get('content')

        if not content:
            return jsonify({'message': 'Message content cannot be empty.'}), 400

        new_message = Message(content=content, user_id=current_user.id)
        db.session.add(new_message)
        db.session.commit()

        return jsonify({'message': 'Your message has been sent to HR.'}), 201
    
    
    # ✅ NEW: Endpoint for all employees to get the latest announcements
    @app.route('/announcements', methods=['GET'])
    @token_required
    def get_announcements(current_user):
        # Fetch the 5 most recent announcements
        announcements = Announcement.query.order_by(Announcement.created_at.desc()).limit(5).all()
        return jsonify([{
            'id': ann.id,
            'content': ann.content,
            'created_at': ann.created_at.strftime('%Y-%m-%d %H:%M'),
            'author': ann.user.name
        } for ann in announcements])

    @app.route('/admin/create-initial-hr', methods=['POST'])
    def create_initial_hr():
        # This key MUST be set as an environment variable on your Render server.
        secret_key = os.environ.get('INITIAL_HR_CREATION_KEY')
        data = request.json
        
        # 1. Check for the secret key
        if not secret_key or data.get('secret_key') != secret_key:
            return jsonify({'message': 'Unauthorized.'}), 403

        # 2. Check if an HR user already exists
        if User.query.filter_by(is_hr=True).first():
            return jsonify({'message': 'An HR user already exists. This endpoint is disabled.'}), 403

        # 3. Get user details from the request
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not all([name, email, password]):
            return jsonify({'message': 'Name, email, and password are required.'}), 400

        # 4. Create the HR user
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        new_hr_user = User(name=name, email=email, password=hashed_pw, is_hr=True)
        db.session.add(new_hr_user)
        db.session.commit()

        return jsonify({'message': f'HR user {name} created successfully. Please remove the INITIAL_HR_CREATION_KEY for security.'}), 201

    # --- Leave Management Routes ---

    @app.route('/leave/request', methods=['POST'])
    @token_required
    def request_leave(current_user):
        # ✅ FIXED: Import the function here, inside the route
        from backend.email_utils import send_leave_request_email
        
        data = request.json
        start_date_str = data.get('startDate')
        end_date_str = data.get('endDate')
        reason = data.get('reason')

        # ✅ NEW: Get leave_type from the request
        leave_type = data.get('leaveType')

        if not all([start_date_str, end_date_str, reason, leave_type]):
            return jsonify({'message': 'All fields, including leave type, are required.'}), 400

        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

        # ✅ NEW: Save the leave_type to the database
        new_request = LeaveRequest(
            user_id=current_user.id, 
            start_date=start_date, 
            end_date=end_date, 
            reason=reason,
            leave_type=leave_type
        )
        db.session.add(new_request)
        db.session.commit()

        send_leave_request_email(current_user, start_date_str, end_date_str, reason, leave_type)
        return jsonify({'message': 'Leave request submitted successfully.'}), 201
    

    @app.route('/leave/history', methods=['GET'])
    @token_required
    def get_leave_history(current_user):
        requests = LeaveRequest.query.filter_by(user_id=current_user.id).order_by(LeaveRequest.requested_at.desc()).all()
        return jsonify([{
            'id': req.id,
            'start_date': req.start_date.strftime('%Y-%m-%d'),
            'end_date': req.end_date.strftime('%Y-%m-%d'),
            'reason': req.reason,
            'status': req.status,
            # ✅ NEW: Return the leave_type
            'leave_type': req.leave_type,
            'requested_at': req.requested_at.strftime('%Y-%m-%d %H:%M')
        } for req in requests])
        
    # ✅ FIXED: Re-added the missing /holidays route

    @app.route('/holidays/<month>', methods=['GET'])
    @token_required
    def get_holidays(current_user, month):
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
            return jsonify(message="Invalid month format. Please use YYYY-MM."), 400

        file_path = os.path.join(os.path.dirname(__file__), 'holidays.json')
        if not os.path.exists(file_path):
            return jsonify(message="Holiday data file not found"), 500

        with open(file_path, 'r') as f:
            all_holidays = json.load(f)

        holidays_in_month = [h for h in all_holidays if h.get("date", "").startswith(month)]
        return jsonify(holidays_in_month)
    

    #--- HR ADMIN RECORD ---
    # ✅ NEW: Endpoint to get a list of all users for the report dropdown
    @app.route('/admin/users/all', methods=['GET'])
    @hr_required
    def get_all_users(current_user):
        users = User.query.all()
        return jsonify([{'id': u.id, 'name': u.name, 'email': u.email} for u in users])
    
    @app.route('/admin/users/add', methods=['POST'])
    @hr_required
    def add_employee(current_user):
        # Text data is now in request.form
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        is_hr = request.form.get('is_hr', 'false').lower() == 'true'
        job_role = request.form.get('job_role', 'Employee')
        employee_id = request.form.get('employee_id')
        contact_number = request.form.get('contact_number')

        if not all([name, email, password, employee_id]):
            return jsonify({'message': 'Name, email, password, and Employee ID are required.'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'An employee with this email already exists.'}), 409
        if User.query.filter_by(employee_id=employee_id).first():
            return jsonify({'message': 'This Employee ID is already in use.'}), 409

        photo_filename = 'default.png' # Default photo
        if 'profile_photo' in request.files:
            file = request.files['profile_photo']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp_filename = f"{datetime.now().timestamp()}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], timestamp_filename))
                photo_filename = timestamp_filename

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(
            name=name, email=email, password=hashed_pw, is_hr=is_hr,
            job_role=job_role, employee_id=employee_id, 
            contact_number=contact_number, profile_photo=photo_filename
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': f'Employee {name} created successfully.'}), 201
       
    
     # ✅ NEW: Endpoint for HR to update an employee's details
    @app.route('/admin/users/<int:user_id>/update', methods=['PUT'])
    @hr_required
    def update_employee(current_user, user_id):
        user_to_update = User.query.get(user_id)
        if not user_to_update:
            return jsonify({'message': 'User not found.'}), 404

        data = request.json
        # Update fields if they are provided in the request
        if 'name' in data:
            user_to_update.name = data['name']
        if 'email' in data:
            # Check if the new email is already taken by another user
            existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing_user:
                return jsonify({'message': 'This email is already in use by another account.'}), 409
            user_to_update.email = data['email']
        if 'is_hr' in data:
            user_to_update.is_hr = data['is_hr']
        # Optional: Allow password reset
        if 'password' in data and data['password']:
            user_to_update.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        db.session.commit()
        return jsonify({'message': f'Employee {user_to_update.name} updated successfully.'})

    # ✅ NEW: Endpoint for HR to delete an employee
    @app.route('/admin/users/<int:user_id>/delete', methods=['DELETE'])
    @hr_required
    def delete_employee(current_user, user_id):
        # Prevent HR from deleting their own account
        if current_user.id == user_id:
            return jsonify({'message': 'You cannot delete your own account.'}), 403

        user_to_delete = User.query.get(user_id)
        if not user_to_delete:
            return jsonify({'message': 'User not found.'}), 404

        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({'message': f'Employee {user_to_delete.name} has been deleted.'})
    

    #--- HR ADMIN ATTENDANCE RECORD ---
    @app.route('/admin/attendance/all', methods=['GET'])
    @hr_required
    def get_all_attendance(current_user):
        all_records = db.session.query(Attendance, User).join(User, Attendance.user_id == User.id).all()
        return jsonify([{"employee_name": u.name, "employee_email": u.email, "date": r.date.strftime('%Y-%m-%d'), "status": r.status, "login_time": r.login_time.strftime('%I:%M %p') if r.login_time else None, "logout_time": r.logout_time.strftime('%I:%M %p') if r.logout_time else None} for r, u in all_records])
    
     # ✅ NEW: Endpoint for HR to manually mark or update attendance
    @app.route('/admin/attendance/manual-mark', methods=['POST'])
    @hr_required
    def manual_mark_attendance(current_user):
        data = request.json
        employee_email = data.get('email')
        date_str = data.get('date')
        status = data.get('status') # 'present' or 'absent'

        if not all([employee_email, date_str, status]):
            return jsonify({'message': 'Employee email, date, and status are required.'}), 400

        if status not in ['present', 'absent']:
            return jsonify({'message': "Status must be either 'present' or 'absent'."}), 400

        employee = User.query.filter_by(email=employee_email).first()
        if not employee:
            return jsonify({'message': 'Employee not found.'}), 404

        try:
            attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Please use YYYY-MM-DD.'}), 400

        # Check if a record for this day already exists
        existing_record = Attendance.query.filter_by(user_id=employee.id, date=attendance_date).first()

        if existing_record:
            # Update the existing record
            existing_record.status = status
            message = f"Attendance for {employee.name} on {date_str} has been updated to '{status}'."
        else:
            # Create a new record
            new_record = Attendance(
                user_id=employee.id,
                date=attendance_date,
                status=status
                # Login/logout times are left null for manual entries
            )
            db.session.add(new_record)
            message = f"Attendance for {employee.name} on {date_str} has been marked as '{status}'."

        db.session.commit()
        return jsonify({'message': message}), 200
    
    
    
    # ✅ NEW: Endpoint for HR to post a new announcement
    @app.route('/admin/announcements/create', methods=['POST'])
    @hr_required
    def create_announcement(current_user):
        data = request.json
        content = data.get('content')

        if not content:
            return jsonify({'message': 'Announcement content cannot be empty.'}), 400

        new_announcement = Announcement(content=content, user_id=current_user.id)
        db.session.add(new_announcement)
        db.session.commit()

        return jsonify({'message': 'Announcement posted successfully.'}), 201


     # ✅ NEW: Endpoint for HR to view all incoming messages
    @app.route('/admin/messages', methods=['GET'])
    @hr_required
    def get_all_messages(current_user):
        messages = Message.query.order_by(Message.created_at.desc()).all()
        return jsonify([{
            'id': msg.id,
            'sender_name': msg.user.name,
            'sender_email': msg.user.email,
            'content': msg.content,
            'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M'),
            'is_read': msg.is_read
        } for msg in messages])
        
    @app.route('/admin/messages/<int:message_id>/read', methods=['POST'])
    @hr_required
    def mark_message_as_read(current_user, message_id):
        message = Message.query.get(message_id)
        if not message:
            return jsonify({'message': 'Message not found.'}), 404
        
        message.is_read = True
        db.session.commit()
        return jsonify({'message': 'Message marked as read.'})


    # --- HR Admin Leave Management Routes ---
    @app.route('/admin/leave/requests', methods=['GET'])
    @hr_required
    def get_all_leave_requests(current_user):
        requests = LeaveRequest.query.order_by(LeaveRequest.requested_at.desc()).all()
        return jsonify([{
            'id': req.id,
            'employee_name': req.user.name,
            'employee_email': req.user.email,
            'start_date': req.start_date.strftime('%Y-%m-%d'),
            'end_date': req.end_date.strftime('%Y-%m-%d'),
            'reason': req.reason,
            'status': req.status,
            # ✅ NEW: Return the leave_type
            'leave_type': req.leave_type
        } for req in requests])

    @app.route('/admin/leave/requests/<int:request_id>/update', methods=['POST'])
    @hr_required
    def update_leave_status(current_user, request_id):
        # ✅ FIXED: Import the function here, inside the route
        from backend.email_utils import send_leave_status_update_email
        
        data = request.json
        new_status = data.get('status')

        if new_status not in ['Approved', 'Rejected']:
            return jsonify({'message': 'Invalid status provided.'}), 400

        leave_request = LeaveRequest.query.get(request_id)
        if not leave_request:
            return jsonify({'message': 'Leave request not found.'}), 404

        leave_request.status = new_status
        db.session.commit()

        send_leave_status_update_email(leave_request)

        return jsonify({'message': f'Leave request has been {new_status.lower()}.'})
    
    # ✅ NEW: Endpoint for HR to add a new holiday
    @app.route('/admin/holidays/all', methods=['GET'])
    @hr_required
    def get_all_holidays(current_user):
        file_path = os.path.join(os.path.dirname(__file__), 'holidays.json')
        if not os.path.exists(file_path):
            return jsonify([])
        with open(file_path, 'r') as f:
            all_holidays = json.load(f)
        return jsonify(all_holidays)

      
    @app.route('/admin/holidays/add', methods=['POST'])
    @hr_required
    def add_holiday(current_user):
        data = request.json
        holiday_date = data.get('date') # Expected format: 'YYYY-MM-DD'
        holiday_name = data.get('name')

        if not all([holiday_date, holiday_name]):
            return jsonify({'message': 'Date and name are required for the holiday.'}), 400

        file_path = os.path.join(os.path.dirname(__file__), 'holidays.json')
        
        try:
            with open(file_path, 'r+') as f:
                holidays = json.load(f)
                
                # Check if holiday with the same date already exists
                if any(h['date'] == holiday_date for h in holidays):
                    return jsonify({'message': f'A holiday on {holiday_date} already exists.'}), 409

                # Add the new holiday
                holidays.append({'date': holiday_date, 'name': holiday_name})
                
                # Go back to the beginning of the file to overwrite it
                f.seek(0)
                json.dump(holidays, f, indent=2)
                f.truncate()

            return jsonify({'message': f'Holiday "{holiday_name}" on {holiday_date} added successfully.'}), 201

        except FileNotFoundError:
            # If the file doesn't exist, create it with the first holiday
            with open(file_path, 'w') as f:
                json.dump([{'date': holiday_date, 'name': holiday_name}], f, indent=2)
            return jsonify({'message': f'Holiday "{holiday_name}" on {holiday_date} added successfully.'}), 201
        except Exception as e:
            return jsonify({'message': f'An error occurred: {e}'}), 500
        
    
    # ✅ NEW: Endpoint for HR to delete a holiday
    @app.route('/admin/holidays/delete', methods=['POST'])
    @hr_required
    def delete_holiday(current_user):
        data = request.json
        holiday_date = data.get('date')
        if not holiday_date:
            return jsonify({'message': 'Date is required to delete a holiday.'}), 400

        file_path = os.path.join(os.path.dirname(__file__), 'holidays.json')
        if not os.path.exists(file_path):
            return jsonify({'message': 'Holiday file not found.'}), 404

        try:
            with open(file_path, 'r+') as f:
                holidays = json.load(f)
                original_count = len(holidays)
                updated_holidays = [h for h in holidays if h.get('date') != holiday_date]

                if len(updated_holidays) == original_count:
                    return jsonify({'message': f'No holiday found on {holiday_date}.'}), 404

                f.seek(0)
                json.dump(updated_holidays, f, indent=2)
                f.truncate()
            return jsonify({'message': f'Holiday on {holiday_date} has been revoked.'}), 200
        except Exception as e:
            return jsonify({'message': f'An error occurred: {e}'}), 500
    

    @app.route('/admin/reports/attendance', methods=['GET'])
    @hr_required
    def download_attendance_report(current_user):
        month = request.args.get('month')
        employee_email = request.args.get('employee_email')
        if not month: return jsonify({'message': 'A month (YYYY-MM) is required.'}), 400
        
        try:
            start_date = datetime.strptime(month, "%Y-%m").date()
        except ValueError:
            return jsonify(message="Invalid month format."), 400

        year, month_num = start_date.year, start_date.month
        end_date = start_date.replace(year=year + 1 if month_num == 12 else year, month=1 if month_num == 12 else month_num + 1, day=1)
        
        # --- Calculate Total Working Days ---
        holidays_file = os.path.join(os.path.dirname(__file__), 'holidays.json')
        with open(holidays_file, 'r') as f:
            all_holidays = json.load(f)
        
        month_holidays = {datetime.strptime(h['date'], '%Y-%m-%d').date() for h in all_holidays if h['date'].startswith(month)}
        
        total_working_days = 0
        current_day = start_date
        while current_day < end_date:
            # Monday is 0 and Sunday is 6
            if current_day.weekday() < 6 and current_day not in month_holidays:
                total_working_days += 1
            current_day += timedelta(days=1)

        # --- Fetch and Process Attendance Data ---
        query = db.session.query(Attendance, User).join(User, Attendance.user_id == User.id).filter(Attendance.date >= start_date, Attendance.date < end_date)
        if employee_email:
            query = query.filter(User.email == employee_email)
        
        records = query.all()
        
        employee_data = {}
        for record, user in records:
            if user.email not in employee_data:
                employee_data[user.email] = {'name': user.name, 'present_days': 0}
            if record.status == 'present':
                employee_data[user.email]['present_days'] += 1

        # --- Generate CSV ---
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Employee Name', 'Email', 'Present Days', 'Total Working Days in Month'])
        
        for email, data in employee_data.items():
            writer.writerow([data['name'], email, data['present_days'], total_working_days])
            
        output.seek(0)
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = f"attachment; filename=attendance_summary_{month}.csv"
        response.headers["Content-type"] = "text/csv"
        return response

    return app
