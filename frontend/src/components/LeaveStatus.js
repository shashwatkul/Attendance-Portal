/* File: src/components/LeaveStatus.js
  Description: NEW - A component for employees to view their leave request history.
*/
import React, { useState, useEffect } from 'react';
import api from '../api';

const LeaveStatus = () => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leave/history');
        setLeaveHistory(res.data);
      } catch (err) {
        setError('Failed to fetch leave history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600 bg-green-100';
      case 'Rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) return <p>Loading leave history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8 p-6 border-t border-gray-200">
      <h3 className="text-xl font-bold mb-4">📜 My Leave History</h3>
      <div className="space-y-4">
        {leaveHistory.length > 0 ? leaveHistory.map(req => (
          <div key={req.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-indigo-600">{req.leave_type}</p>
                <p className="font-semibold">{req.start_date} to {req.end_date}</p>
                <p className="text-sm text-gray-600 mt-1">Reason: {req.reason}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">Requested on: {req.requested_at}</p>
          </div>
        )) : (
          <p>You have not submitted any leave requests yet.</p>
        )}
      </div>
    </div>
  );
};

export default LeaveStatus;
