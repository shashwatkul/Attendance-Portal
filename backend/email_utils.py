# File: backend/email_utils.py

import os
import smtplib
from email.message import EmailMessage

def send_leave_request_email(user, start_date, end_date, reason,leave_type):
    """
    Sends a leave request email to the HR department.

    Args:
        user: The user object of the employee requesting leave.
        start_date (str): The start date of the leave.
        end_date (str): The end date of the leave.
        reason (str): The reason for the leave.

    Returns:
        tuple: A tuple containing a boolean indicating success and a message.
    """
    # Using hardcoded values for local testing as requested.
    # WARNING: Not secure for production.
    sender_email = os.environ.get('SENDER_EMAIL')
    sender_password = os.environ.get('SENDER_PASSWORD')
    hr_email = os.environ.get('HR_EMAIL')
    if not all([sender_email, sender_password, hr_email]):
        print("SERVER_ERROR: Email configuration is missing.")
        return False, 'Could not send request. The server email configuration is incomplete.'

    msg = EmailMessage()
    msg['Subject'] = f"Leave Request from {user.name}"
    msg['From'] = sender_email
    msg['To'] = hr_email
    msg.set_content(
        f"""
        Hello HR,

        A leave request has been submitted by an employee.

        Employee Details:
        - Name: {user.name}
        - Email: {user.email}

        Leave Details:
        - Type of Leave: {leave_type}
        - From: {start_date}
        - To: {end_date}
        - Reason: {reason}

        Please review this request.

        Thank you,
        Attendance Portal
        """
    )

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True, 'Leave request sent successfully to HR.'
    except Exception as e:
        print(f"EMAIL_SEND_ERROR: {e}")
        return False, 'An error occurred while sending the email.'

# ✅ NEW: Function to notify employees of leave status updates
def send_leave_status_update_email(leave_request):
    """
    Sends an email to an employee about the status update of their leave request.
    """
    sender_email = os.environ.get('SENDER_EMAIL')
    sender_password = os.environ.get('SENDER_PASSWORD')


    if not all([sender_email, sender_password]):
        print("SERVER_ERROR: Email configuration is missing.")
        return False, 'Server email configuration is incomplete.'

    msg = EmailMessage()
    msg['Subject'] = f"Update on Your Leave Request"
    msg['To'] = leave_request.user.email
    msg['From'] = sender_email
    msg.set_content(
        f"Hello {leave_request.user.name},\n\n"
        f"This is an update regarding your leave request from {leave_request.start_date.strftime('%Y-%m-%d')} to {leave_request.end_date.strftime('%Y-%m-%d')}.\n\n"
        f"Your request has been: {leave_request.status.upper()}\n\n"
        f"Thank you,\nHR Department"
    )

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return True, 'Status update email sent to employee.'
    except Exception as e:
        print(f"EMAIL_SEND_ERROR: {e}")
        return False, 'Failed to send status update email.'
