/* File: src/components/ManualMarkAttendance.js
  Description: NEW - A form for HR to manually mark attendance for an employee.
*/
import React, { useState, useEffect } from 'react';
import api from '../api';

const ManualMarkAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('present');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/admin/users/all');
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedEmployee) {
      setError('Please select an employee.');
      return;
    }

    try {
      const res = await api.post('/admin/attendance/manual-mark', {
        email: selectedEmployee,
        date,
        status,
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Manual Attendance Entry</h3>
      <p className="text-sm text-slate-500 mb-6">
        Use this form to mark an employee as present or absent on a specific day, such as a weekend or a day they forgot to log in.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeSelect" className="block text-sm font-medium text-slate-700">Employee</label>
          <select
            id="employeeSelect"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>-- Select an Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.email}>{emp.name} ({emp.email})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="attendanceDate" className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              id="attendanceDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="statusSelect" className="block text-sm font-medium text-slate-700">Status</label>
            <select
              id="statusSelect"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        {message && <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Attendance
        </button>
      </form>
    </div>
  );
};

export default ManualMarkAttendance;