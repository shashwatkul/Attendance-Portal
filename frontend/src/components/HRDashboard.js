/* File: src/components/HRDashboard.js
  Description: The main container component for the HR portal with a new tabbed layout.
*/
import React, { useState } from 'react';
import AddEmployeeForm from './AddEmployeeForm';
import AllAttendanceTable from './AllAttendanceTable';
import LeaveApproval from './LeaveApproval';
import AttendanceReportDownloader from './AttendanceReportDownloader';
import ManageEmployees from './ManageEmployees';
import PostAnnouncement from './PostAnnouncement';
import AddHolidayForm from './AddHolidayForm'; // ✅ Import new component
import ManageHolidays from './ManageHolidays'; // ✅ Import new component
import ManualMarkAttendance from './ManualMarkAttendance';
import HRMessages from './HRMessages'; // ✅ Import new component

// --- Icon Components ---
const AnnounceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.354 5.166 18 6.518 18 8a3 3 0 01-3 3h-1.832A4.001 4.001 0 005.436 13.683z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const DocumentDownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CalendarPlusIcon = () => <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 14v4m-2-2h4" /></svg>;
const CalendarMinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 14h6" /></svg>;
const PencilAltIcon = () => <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ChatIcon = () => <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;

const HRDashboard = ({ user, onLogout }) => {
  const [view, setView] = useState('leaveApprovals'); // Default view for HR

  const renderContent = () => {
    switch (view) {
      case 'postAnnouncement': return <PostAnnouncement />;
      case 'addEmployee': return <AddEmployeeForm />;
      case 'manageEmployees': return <ManageEmployees />;
      case 'reports': return <AttendanceReportDownloader />;
      case 'allAttendance': return <AllAttendanceTable />;
      case 'addHoliday': return <AddHolidayForm />; // ✅ New case
      case 'manageHolidays': return <ManageHolidays />; // ✅ New case
      case 'manualMark': return <ManualMarkAttendance />;
      case 'messages': return <HRMessages />; // ✅ New case
      default: return <LeaveApproval />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">HR Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Logged in as Paypanda HR</p>
          </div>
          <button onClick={onLogout} className="mt-4 sm:mt-0 px-4 py-2 bg-rose-500 text-white font-semibold rounded-md shadow-sm hover:bg-rose-600 transition-colors">Logout</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="space-y-2 p-4 bg-white rounded-xl shadow-sm">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Core Actions</h3>
              {[
                { label: 'Leave Approvals', view: 'leaveApprovals', icon: <CheckBadgeIcon /> },
                { label: 'Post Announcement', view: 'postAnnouncement', icon: <AnnounceIcon /> },
                { label: 'Add Holiday', view: 'addHoliday', icon: <CalendarPlusIcon /> }, // ✅ New nav item
                { label: 'Manage Holidays', view: 'manageHolidays', icon: <CalendarMinusIcon /> }, // ✅ New nav item
                { label: 'View Messages', view: 'messages', icon: <ChatIcon /> },
              ].map(item => (
                <button key={item.view} onClick={() => setView(item.view)} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${view === item.view ? 'bg-indigo-500 text-white shadow' : 'hover:bg-slate-100 text-slate-700'}`}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <h3 className="px-3 pt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Employee Management</h3>
              {[
                { label: 'Add Employee', view: 'addEmployee', icon: <UsersIcon /> },
                { label: 'Manage Employees', view: 'manageEmployees', icon: <UsersIcon /> },
                { label: 'Manual Attendance', view: 'manualMark', icon: <PencilAltIcon /> },
              ].map(item => (
                <button key={item.view} onClick={() => setView(item.view)} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${view === item.view ? 'bg-indigo-500 text-white shadow' : 'hover:bg-slate-100 text-slate-700'}`}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <h3 className="px-3 pt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reports & Data</h3>
               {[
                { label: 'Download Reports', view: 'reports', icon: <DocumentDownloadIcon /> },
                { label: 'View All Attendance', view: 'allAttendance', icon: <DocumentDownloadIcon /> },
              ].map(item => (
                <button key={item.view} onClick={() => setView(item.view)} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${view === item.view ? 'bg-indigo-500 text-white shadow' : 'hover:bg-slate-100 text-slate-700'}`}>
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
