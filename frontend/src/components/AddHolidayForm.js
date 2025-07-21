/* File: src/components/AddHolidayForm.js
  Description: NEW - A form for HR to add a new company holiday.
*/
import React, { useState } from 'react';
import api from '../api';

const AddHolidayForm = () => {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await api.post('/admin/holidays/add', { date, name });
      setMessage(res.data.message);
      setDate('');
      setName('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Add Company Holiday</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="holidayDate" className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              id="holidayDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="holidayName" className="block text-sm font-medium text-slate-700">Holiday Name</label>
            <input
              type="text"
              id="holidayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Year's Day"
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                         focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
        {message && <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Holiday
        </button>
      </form>
    </div>
  );
};

export default AddHolidayForm;

