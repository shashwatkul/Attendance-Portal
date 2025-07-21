# File: create_hr_user.py
# Place this file in your project's root directory.

import sys
import os
from getpass import getpass

# This ensures that Python can find your 'backend' package
instance_path = os.path.join(os.path.dirname(__file__), 'instance')

from backend.app import create_app, db, bcrypt
from backend.models import User

# Create a Flask app instance to work with the database
app = create_app()

# Use the app's context to interact with the database
with app.app_context():
    print("--- Create HR Admin User ---")
    
    # Get user input
    name = input("Enter the full name for the HR user: ").strip()
    email = input("Enter the email address for the HR user: ").strip().lower()
    password = getpass("Enter a secure password: ")
    confirm_password = getpass("Confirm the password: ")

    # --- Validations ---
    if not all([name, email, password]):
        print("\nError: Name, email, and password cannot be empty.")
        sys.exit(1)

    if password != confirm_password:
        print("\nError: Passwords do not match. Aborting.")
        sys.exit(1)

    if User.query.filter_by(email=email).first():
        print(f"\nError: A user with the email '{email}' already exists.")
        sys.exit(1)

    # --- Create User ---
    try:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        hr_user = User(name=name, email=email, password=hashed_password, is_hr=True)

        db.session.add(hr_user)
        db.session.commit()

        print(f"\n✅ Success! HR user '{name}' with email '{email}' has been created.")
    except Exception as e:
        print(f"\n❌ An error occurred while creating the user: {e}")

