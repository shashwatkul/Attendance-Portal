/* File: src/components/LeaveApproval.js
  Description: NEW - A component for HR to manage incoming leave requests.
*/
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const LeaveApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/leave/requests');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to fetch leave requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
        return;
    }
    try {
      await api.post(`/admin/leave/requests/${requestId}/update`, { status });
      alert(`Request has been ${status.toLowerCase()}.`);
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert('Failed to update status.');
      console.error(err);
    }
  };

  if (loading) return <p>Loading leave requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Manage Leave Requests</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length > 0 ? requests.map(req => (
              <tr key={req.id}>
                <td className="px-4 py-4">{req.employee_name}</td>
                 <td className="px-4 py-4 font-medium">{req.leave_type}</td>
                <td className="px-4 py-4">{req.start_date} to {req.end_date}</td>
                <td className="px-4 py-4 max-w-xs truncate">{req.reason}</td>
                <td className="px-4 py-4">{req.status}</td>
                <td className="px-4 py-4 space-x-2">
                  {req.status === 'Pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="text-green-600 hover:text-green-900">Approve</button>
                      <button onClick={() => handleUpdateStatus(req.id, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No pending leave requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApproval;