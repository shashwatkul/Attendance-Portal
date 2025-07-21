/* File: src/components/ManageHolidays.js
  Description: NEW - A component for HR to view and revoke holidays.
*/
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const ManageHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  
  const fetchHolidays = useCallback(async () => {
    try {
      const res = await api.get('/admin/holidays/all');
      // Sort holidays by date
      const sortedHolidays = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(sortedHolidays);
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleDelete = async (holidayDate, holidayName) => {
    if (window.confirm(`Are you sure you want to revoke the holiday "${holidayName}" on ${holidayDate}?`)) {
      try {
        await api.post('/admin/holidays/delete', { date: holidayDate });
        alert('Holiday revoked successfully.');
        fetchHolidays(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to revoke holiday.');
      }
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Manage Company Holidays</h3>
      <div className="space-y-3">
        {holidays.length > 0 ? holidays.map(holiday => (
          <div key={holiday.date} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
            <div>
              <p className="font-medium text-slate-800">{holiday.name}</p>
              <p className="text-sm text-slate-500">{holiday.date}</p>
            </div>
            <button 
              onClick={() => handleDelete(holiday.date, holiday.name)} 
              className="text-rose-600 hover:text-rose-900 font-medium"
            >
              Revoke
            </button>
          </div>
        )) : (
          <p className="text-slate-500">No holidays have been added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManageHolidays;
