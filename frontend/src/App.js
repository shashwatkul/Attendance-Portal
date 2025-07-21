/* File: src/App.js
  Description: The main app component, updated to route users based on their role.
*/
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AttendanceCalendar from './components/AttendanceCalendar';
import HRDashboard from './components/HRDashboard'; // ✅ Import the new HR dashboard
import { jwtDecode } from 'jwt-decode';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          // The login response now includes is_hr, so let's get it from the token
          // You might need to add 'is_hr' to your JWT payload in the backend if you haven't already
          setUser({ 
            name: decodedUser.name, 
            email: decodedUser.email, 
            is_hr: decodedUser.is_hr 
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const renderContent = () => {
    if (!user) {
      return <Login setUser={setUser} />;
    }

    // ✅ Check the user's role and render the appropriate dashboard
    if (user.is_hr) {
      return <HRDashboard onLogout={handleLogout} />;
    } else {
      return <AttendanceCalendar user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {renderContent()}
    </div>
  );
}

export default App;
