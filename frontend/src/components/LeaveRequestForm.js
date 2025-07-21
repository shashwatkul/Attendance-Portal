/* File: src/components/LeaveRequestForm.js */
import React, { useState } from 'react';
import api from '../api'; // Use our central api utility

const LeaveRequestForm = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!startDate || !endDate || !reason) {
      setError('All fields are required.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date cannot be before the start date.');
      return;
    }

     // ✅ NEW: Added a confirmation dialog
    if (window.confirm("Are you sure you want to submit this leave request?")) {
      try {
        const res = await api.post('/leave/request', {
          startDate,
          endDate,
          reason,
          leaveType,
        });
        setMessage(res.data.message);
        setStartDate('');
        setEndDate('');
        setReason('');
        setLeaveType('Casual Leave');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred.');
      }
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Apply for Leave</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700">Type of Leave</label>
          <select
            id="leaveType"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Casual Leave</option>
            <option>Sick Leave</option>
            <option>Earned Leave</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Leave</label>
          <textarea
            id="reason"
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Please provide a reason for your leave request."
            required
          ></textarea>
        </div>
        
        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        {message && <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default LeaveRequestForm;
