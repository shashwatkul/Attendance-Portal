/* File: src/components/AddEmployeeForm.js
  Description: UPDATED - The form now includes all profile fields and a photo upload.
*/
import React, { useState } from 'react';
import api from '../api';

const AddEmployeeForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHr, setIsHr] = useState(false);
  const [jobRole, setJobRole] = useState('Employee');
  const [employeeId, setEmployeeId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null); // For the file object
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Use FormData to send both text and file data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('is_hr', isHr);
    formData.append('job_role', jobRole);
    formData.append('employee_id', employeeId);
    formData.append('contact_number', contactNumber);
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }

    try {
      const res = await api.post('/admin/users/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.message);
      // Clear form on success
      setName(''); setEmail(''); setPassword(''); setIsHr(false);
      setJobRole('Employee'); setEmployeeId(''); setContactNumber(''); setProfilePhoto(null);
      // Reset file input visually
      if (document.getElementById('profilePhoto')) {
        document.getElementById('profilePhoto').value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Add New Employee</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Job Role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="p-2 border rounded" />
            <input type="text" placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="p-2 border rounded" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-2 border rounded" required />
        </div>
        <div>
            <label htmlFor="profilePhoto" className="block text-sm font-medium text-slate-700">Profile Photo</label>
            <input type="file" id="profilePhoto" onChange={(e) => setProfilePhoto(e.target.files[0])} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="isHr" checked={isHr} onChange={(e) => setIsHr(e.target.checked)} className="h-4 w-4 text-indigo-600 rounded" />
          <label htmlFor="isHr" className="ml-2 block text-sm text-gray-900">Make this user an HR Admin?</label>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Create Employee</button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
};

export default AddEmployeeForm;
