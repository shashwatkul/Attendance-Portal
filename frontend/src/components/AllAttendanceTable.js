/* File: src/components/AllAttendanceTable.js
  Description: A table to display all attendance records for HR.
*/
import React, { useState, useEffect } from 'react';
import api from '../api';

const AllAttendanceTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllAttendance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/attendance/all');
        setRecords(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch attendance records.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendance();
  }, []);

  if (loading) return <p>Loading all attendance records...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">All Employee Attendance</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.length > 0 ? records.map((record, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{record.employee_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.login_time || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.logout_time || 'N/A'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllAttendanceTable;