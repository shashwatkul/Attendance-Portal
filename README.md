
# Attendance Portal & HR Management System 🏢

A full-stack web application designed for modern corporate environments, providing a streamlined and efficient way for employees to manage attendance and for HR to oversee employee data and generate reports. This project features distinct dashboards for employees and HR administrators, ensuring secure and role-based access to information.

## 🌐 Live Demo


The application is deployed on Render and is accessible via the following URL:

Live App URL: https://attendancepaypanda.netlify.app/

[![Watch Demo](https://github.com/shashwatkul/Attendance-Portal/blob/main/Demo/Screenshot_Dashboard.PNG)](https://github.com/shashwatkul/Attendance-Portal/blob/main/Demo/Employee%20Attendance%20App%20and%205%20more%20pages%20-%20Profile%201%20-%20Microsoft%E2%80%8B%20Edge%202025-07-24%2018-32-19.mp4)

## ✨ Features

### For Employees
- **Secure Login:** Authenticate using JWT to access a personal dashboard.

- **Location-Based Attendance:** Employees can mark their attendance with a single click, with location verification ensuring they are within a 50-meter radius of the office.

- **Interactive Calendar:** A visual calendar displays personal attendance history, company holidays, and approved leave days.

- **Profile Management:** Employees can view and update their profile details and photo.

- **Announcements:** Stay informed with company-wide announcements posted by HR.

### HR Administrator Dashboard
- **Employee Management:** A secure portal to create, view, edit, and delete employee profiles.

- **Holiday Management:** Add or revoke company holidays, which are immediately reflected on all employee calendars.

- **Leave Request Approval:** Review and take action on pending leave requests, with automated notifications sent to the employee.

- **Manual Attendance:** Manually mark or update attendance records for employees to handle exceptions.

- **Attendance Reports:** Generate and download detailed attendance reports in CSV format for a selected month or a specific employee.

## 🛠️ Tech Stack

### Backend
- **Python 3.10+**

- **Flask:** The web framework for building the REST API.

- **Flask-SQLAlchemy:** ORM to interact with the database.

- **PostgreSQL:** The relational database for persistent data storage.

### Frontend
- **React:** A JavaScript library for building the user interface.

- **Tailwind CSS:** A utility-first CSS framework for rapid and responsive styling.

### Deployment

- **Render:** Deployment of backend.
- **Netflify** Deployment of Frontend.


## 🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites
Make sure you have the following installed:
- Python 3.9+

- Node.js and npm

- A code editor (e.g., VS Code)

- Postman (for API testing)

- PostgreSQL client

- Git

### 1. Backend Setup
1. **Clone the repository:**

```bash
git clone <https://github.com/shashwatkul/Attendance-Portal.git>
cd attendance-portal
```
    
2. **Create and activate a Python virtual environment:**
``` bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows (Command Prompt)
python -m venv venv
venv\Scripts\activate
```
3. **Install dependencies**
```bash
pip install -r requirements.txt
```
4. **Configure the database connection:**

- Set your DATABASE_URL as an environment variable. Replace the placeholder URL with your actual PostgreSQL connection string. This connects your local application to your live Render database.
```bash
# On macOS/Linux
export DATABASE_URL="postgresql://user:password@host:port/database"

# On Windows (Command Prompt)
set DATABASE_URL="postgresql://user:password@host:port/database"
```

### 2. Frontend Setup:
1. Open a new terminal and navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install the Node.js packages:
``` bash
npm install
```

3. Start the React development server:
```bash
npm start
```
The frontend will open in your browser, likely at http://localhost:3000.

### Creating the First HR User
Since public registration is disabled, you must create the first HR user via a script.

1. Make sure your backend server is not running.

2. In your activated backend terminal, run
```bash
python create_hr_user.py
```


## 🤝 Contributing


Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project

2. Create your Feature Branch (git checkout -b feature/AmazingFeature)

3. Commit your Changes (git commit -m 'Add some AmazingFeature')

4. Push to the Branch (git push origin feature/AmazingFeature)

5. Open a Pull Request


## ❓ FAQ

####  Q1) Can I run this on a different port?
Ans- Yes. To change the backend port, modify the app.run() command in run.py. For the frontend, you can create a .env file in the frontend directory and add PORT=3001.

#### Q2) How do I add a new type of leave?
Ans- You can add a new <option> to the LeaveRequestForm.js component and ensure the backend LeaveRequest model can accommodate the new string.


## Documentation

For more detailed information on specific components or backend logic, please refer to the inline comments within the source code. Key files to review include:

- backend/app.py: Contains all API routes and business logic.

- backend/models.py: Defines the database structure.

- frontend/src/components/AttendanceCalendar.js: The main dashboard for employees.

- frontend/src/components/HRDashboard.js: The main dashboard for HR admins.

## 👥 Authors
- Shashwat Kulshrestha - Initial Work


## 📄 License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License


## 💬 Feedback

Feedback is welcome! If you have suggestions for improving this application, please feel free to open an issue or submit a pull request.
- Email: shashwat.kul@gmail.com
