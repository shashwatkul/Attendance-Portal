/* File: src/components/EditEmployeeModal.js
  Description: NEW - A modal form for HR to edit an employee's details.
*/
import React, { useState } from 'react';
import api from '../api';

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [isHr, setIsHr] = useState(employee.is_hr);
  const [password, setPassword] = useState(''); // For resetting password
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    const payload = { name, email, is_hr: isHr };
    if (password) {
      payload.password = password;
    }

    try {
      await api.put(`/admin/users/${employee.id}/update`, payload);
      alert('Employee updated successfully!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mt-1" required />
          </div>
          <div className="mb-4">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mt-1" required />
          </div>
          <div className="mb-4">
            <label>New Password (optional)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full p-2 border rounded mt-1" />
          </div>
          <div className="flex items-center mb-6">
            <input type="checkbox" id="editIsHr" checked={isHr} onChange={(e) => setIsHr(e.target.checked)} className="h-4 w-4" />
            <label htmlFor="editIsHr" className="ml-2">Make this user an HR Admin?</label>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;