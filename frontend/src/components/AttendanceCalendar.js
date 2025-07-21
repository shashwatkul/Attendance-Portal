
/* File: src/components/AttendanceCalendar.js
  Description: UPDATED - Now includes the LeaveStatus component.
*/
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api';
import 'react-calendar/dist/Calendar.css';
import LeaveRequestForm from './LeaveRequestForm';
import LeaveStatus from './LeaveStatus'; // ✅ Import the new component
import Announcements from './Announcements';
import ContactHRForm from './ContactHRForm'; // ✅ Import new component
import ProfileCard from './ProfileCard'; // ✅ Import new component
import EditProfileModal from './EditProfileModal'; // ✅ Import new component


// --- Icon Components (for better UI) ---
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlaneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.73 1.73A9 9 0 0120.49 15" /></svg>;
const ChatIcon = () => <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;

const AttendanceCalendar = ({ user, onLogout }) => {
  const [attendance, setAttendance] = useState([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [holidays, setHolidays] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]); // State for leave requests
  const [view, setView] = useState('calendar'); // 'calendar', 'leaveForm', 'leaveHistory'
  const [isMarking, setIsMarking] = useState(false); // To show a loading state
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ NEW: State for refresh button
  // ✅ FIXED: Added the missing useState definitions for profile data.
  const [profileData, setProfileData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false); // ✅ New state for edit modal
  const fetchProfile = useCallback(() => {
    if (user) {
      api.get('/profile')
        .then(res => setProfileData(res.data))
        .catch(err => console.error("Failed to fetch profile:", err));
    }
  }, [user]);
  


 const fetchAllData = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      // Fetch all data points concurrently for speed
      const [attendanceRes, leaveHistoryRes, holidaysRes] = await Promise.all([
        api.get(`/attendance/${month}`),
        api.get('/leave/history'),
        api.get(`/holidays/${month}`)
      ]);
      setAttendance(attendanceRes.data);
      setLeaveHistory(leaveHistoryRes.data);
      setHolidays(holidaysRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, month]);
    // ✅ NEW: Fetch the user's full profile data when the component loads
 useEffect(() => {
    fetchProfile();
    fetchAllData();
  }, [user, month, fetchProfile, fetchAllData]);



  // ✅ NEW: Calculation for the monthly summary
// ✅ FIXED: Replaced the entire summary logic with a more direct and accurate calculation.
  const monthlySummary = useMemo(() => {
    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    
    let totalWorkingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const holidayDates = new Set(holidays.map(h => h.date));
    const approvedLeaves = leaveHistory.filter(req => req.status === 'Approved');
    const presentDates = new Set(attendance.filter(a => a.status === 'present').map(a => a.date));

    for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = `${month}-${String(i).padStart(2, '0')}`;
        const [y, m, d] = fullDate.split('-').map(Number);
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        const dayOfWeek = dateObj.getUTCDay();

        const isHoliday = holidayDates.has(fullDate);
        const isWorkingDay = dayOfWeek !== 0 && !isHoliday; // Mon-Sun (0 is Sunday)

        if (isWorkingDay) {
            totalWorkingDays++;
        }

        const isOnLeave = approvedLeaves.some(req => {
            const [sy, sm, sd] = req.start_date.split('-').map(Number);
            const [ey, em, ed] = req.end_date.split('-').map(Number);
            const startDate = new Date(Date.UTC(sy, sm - 1, sd));
            const endDate = new Date(Date.UTC(ey, em - 1, ed));
            return startDate <= dateObj && dateObj <= endDate;
        });

        if (isOnLeave) {
            leaveDays++;
        }
        
        // Count absent days: It must be a past working day, not present, and not on leave.
        if (isWorkingDay && dateObj < today && !presentDates.has(fullDate) && !isOnLeave) {
            absentDays++;
        }
    }
    
    presentDays = presentDates.size;

    return {
      totalWorkingDays,
      presentDays,
      absentDays,
      leaveDays
    };
  }, [month, attendance, holidays, leaveHistory]);

  const handleMarkLogout = async () => {
    if (window.confirm("Are you sure you want to mark your logout time?")) {
      try {
        const res = await api.post('/attendance/logout');
        alert(res.data.message);
         // ✅ FIXED: Await the data refresh to ensure state is updated before next render
        await fetchAllData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error marking logout');
      }
    }
  };


   // ✅ MODIFIED: This function now handles geolocation
  const handleMarkToday = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsMarking(true); // Show loading indicator

    // --- Success Callback ---
    const success = async (position) => {
      const { latitude, longitude } = position.coords;
      
      // ✅ FIXED: Create a plain JavaScript object to ensure correct JSON serialization.
      const locationData = {
        latitude: latitude,
        longitude: longitude
      };

      try {
        const res = await api.post('/attendance/mark', locationData);
        alert(res.data.message);
        fetchAllData(); // ✅ CHANGED: Refresh all data after action
      } catch (err) {
        // Display the specific error message from the backend (e.g., "too far away")
        alert(err.response?.data?.message || 'Error marking attendance');
      } finally {
        setIsMarking(false); // Hide loading indicator
      }
    };

    // --- Error Callback ---
    const error = (err) => {
      let errorMessage = 'Unable to retrieve your location.';
      if (err.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Location permission was denied. Please enable it in your browser settings to mark attendance.';
      }
      alert(errorMessage);
      setIsMarking(false); // Hide loading indicator
    };

    // Request the user's location
    navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
  };

  const renderCalendar = () => {
    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const firstDayOfMonth = new Date(year, mon - 1, 1).getDay();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCells = [];
    const today = new Date().getDate();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
     // ✅ FIXED: Using a more robust, timezone-safe method to generate leave dates
    const approvedLeaveDates = new Set();
    leaveHistory.filter(req => req.status === 'Approved').forEach(req => {
        const [sy, sm, sd] = req.start_date.split('-').map(Number);
        const [ey, em, ed] = req.end_date.split('-').map(Number);
        let currentDate = new Date(Date.UTC(sy, sm - 1, sd));
        const endDate = new Date(Date.UTC(ey, em - 1, ed));
        
        while(currentDate <= endDate) {
            approvedLeaveDates.add(currentDate.toISOString().slice(0, 10));
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
    });



    for (let i = 0; i < firstDayOfMonth; i++) dayCells.push(<div key={`empty-${i}`}></div>);
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = `${month}-${String(i).padStart(2, '0')}`;
      const holiday = holidays.find(h => h.date === fullDate);
      const attendanceRecord = attendance.find(a => a.date === fullDate);
      const isOnLeave = approvedLeaveDates.has(fullDate);
      
      let cellClass = 'bg-white text-slate-700';
      if (holiday) cellClass = 'bg-sky-100 text-sky-800 font-semibold';
      else if (isOnLeave) cellClass = 'bg-violet-400 text-white font-semibold';
      else if (attendanceRecord) cellClass = 'bg-emerald-500 text-white font-bold';
      else if (new Date(fullDate) < new Date() && new Date(fullDate).getDay() !== 0) cellClass = 'bg-rose-400 text-white';
      else if (new Date(fullDate).getDay() === 0) cellClass = 'bg-slate-100 text-slate-400';
      
      const isToday = i === today && month === currentMonth;
      const todayClass = isToday ? 'ring-2 ring-indigo-500' : '';

      const tooltip = holiday 
        ? holiday.name 
        : attendanceRecord 
        ? `Login: ${attendanceRecord.login_time || 'N/A'}\nLogout: ${attendanceRecord.logout_time || 'N/A'}` 
        : 'Absent';
        
      dayCells.push(<div key={fullDate} title={tooltip} className={`h-16 flex items-center justify-center rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${cellClass} ${todayClass}`}>{i}</div>);
    }
    return <><div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-500 mb-2">{weekdays.map(day => <div key={day}>{day}</div>)}</div><div className="grid grid-cols-7 gap-2">{dayCells}</div></>;
  };

  const renderContent = () => {
    switch (view) {
      case 'leaveForm': return <LeaveRequestForm />;
      case 'leaveHistory': return <LeaveStatus />;
      case 'contactHR': return <ContactHRForm />; // ✅ New case
      default: return (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
            <button onClick={handleMarkToday} className="flex-1 sm:flex-none w-full sm:w-auto px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md shadow-sm hover:bg-emerald-600 transition-colors">Mark Present</button>
            <button onClick={handleMarkLogout} className="flex-1 sm:flex-none w-full sm:w-auto px-4 py-2 bg-slate-500 text-white font-semibold rounded-md shadow-sm hover:bg-slate-600 transition-colors">Mark Logout</button>
              
                  {/* ✅ NEW: Refresh Button */}
                  <button 
                    onClick={fetchAllData} 
                    disabled={isRefreshing}
                    className="w-full sm:w-auto p-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshIcon />
                  </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Present', value: monthlySummary.presentDays, color: 'text-emerald-600', icon: <CheckCircleIcon /> },
              { label: 'Absent', value: monthlySummary.absentDays, color: 'text-rose-600', icon: <XCircleIcon /> },
              { label: 'On Leave', value: monthlySummary.leaveDays, color: 'text-violet-600', icon: <PlaneIcon /> },
              { label: 'Working Days', value: monthlySummary.totalWorkingDays, color: 'text-slate-700', icon: <BriefcaseIcon /> },
            ].map(item => (
              <div key={item.label} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                <div className={item.color}>{item.icon}</div>
                <div>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-sm text-slate-500 font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          {renderCalendar()}
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Employee Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {user.name}!</p>
          </div>
            <div className="flex items-center gap-4">
            {/* ✅ NEW: Profile Icon Button */}
            <button onClick={() => setShowProfile(true)} className="h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-500 hover:ring-4 hover:ring-indigo-200 transition-all">
              <img 
                src={profileData ? `${api.defaults.baseURL}${profileData.profile_photo_url}` : '[https://i.pravatar.cc/48](https://i.pravatar.cc/48)'} 
                alt="My Profile" 
                className="h-full w-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src='[https://i.pravatar.cc/48](https://i.pravatar.cc/48)' }}
              />
            </button>
          <button onClick={onLogout} className="mt-4 sm:mt-0 px-4 py-2 bg-rose-500 text-white font-semibold rounded-md shadow-sm hover:bg-rose-600 transition-colors">Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="space-y-2 p-4 bg-white rounded-xl shadow-sm">
               {/* ✅ NEW: Added an Edit Profile button */}
              <button onClick={() => setShowEditProfile(true)} className="w-full text-left font-semibold text-indigo-600 hover:bg-indigo-50 p-3 rounded-md">
                  Edit My Profile
              </button>
              <hr className="my-2"/>
              {[
                { label: 'Calendar', view: 'calendar', icon: <CalendarIcon /> },
                { label: 'Apply for Leave', view: 'leaveForm', icon: <MailIcon /> },
                { label: 'My Leave Status', view: 'leaveHistory', icon: <HistoryIcon /> },
                { label: 'Contact HR', view: 'contactHR', icon: <ChatIcon /> },
              ].map(item => (
                <button key={item.view} onClick={() => setView(item.view)} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${view === item.view ? 'bg-indigo-500 text-white shadow' : 'hover:bg-slate-100 text-slate-700'}`}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <Announcements />
          </aside>

          <main className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
            {renderContent()}
          </main>
        </div>
          {/* ✅ NEW: Conditionally render the Profile Card modal */}
        {showProfile && <ProfileCard user={profileData} onClose={() => setShowProfile(false)} />}
           {/* ✅ NEW: Conditionally render the Edit Profile Modal */}
        {showEditProfile && 
            <EditProfileModal 
                user={profileData} 
                onClose={() => setShowEditProfile(false)}
                onSuccess={() => {
                    setShowEditProfile(false);
                    fetchProfile(); // Re-fetch profile data after update
                }}
            />
        }
      </div>
    </div>
  );
};

export default AttendanceCalendar;