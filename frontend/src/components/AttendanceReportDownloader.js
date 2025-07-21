/* File: src/components/AttendanceReportDownloader.js
  Description: NEW - A component for HR to download attendance reports.
*/
import React, { useState, useEffect } from 'react';
import api from '../api';

const AttendanceReportDownloader = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(''); // Store email
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all users to populate the dropdown
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/admin/users/all');
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setError('Could not load employee list.');
      }
    };
    fetchEmployees();
  }, []);

  const handleDownload = async () => {
    setError('');
    if (!month) {
      setError('Please select a month.');
      return;
    }

    try {
      // Build the URL with query parameters
      let url = `/admin/reports/attendance?month=${month}`;
      if (selectedEmployee) {
        url += `&employee_email=${selectedEmployee}`;
      }

      const response = await api.get(url, {
        responseType: 'blob', // Important: we expect a file blob
      });

      // Create a URL for the blob
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      // Create a temporary link to trigger the download
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      const fileName = `attendance_report_${month}${selectedEmployee ? '_' + selectedEmployee : ''}.csv`;
      fileLink.setAttribute('download', fileName);
      document.body.appendChild(fileLink);
      
      fileLink.click(); // Simulate click to download

      // Clean up
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);

    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download report. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Download Attendance Report</h3>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>
        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Employee</label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.email}>{emp.name} ({emp.email})</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Download CSV
        </button>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default AttendanceReportDownloader;

