/* File: src/components/EditProfileModal.js
  Description: NEW - A modal for employees to update their profile icon.
*/
import React, { useState } from 'react';
import api from '../api';

const EditProfileModal = ({ user, onClose, onSuccess }) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!profilePhoto) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profile_photo', profilePhoto);

    try {
      const res = await api.post('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
      // Automatically close the modal on success after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) { // ✅ FIXED: Added missing curly brace
      setError(err.response?.data?.message || 'Failed to update profile icon.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Update Profile Icon</h2>
        <p className="text-slate-500 mb-6">Choose a new profile photo or animated avatar (.gif).</p>
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label htmlFor="profilePhoto" className="block text-sm font-medium text-slate-700">New Profile Photo</label>
            <input 
              type="file" 
              id="profilePhoto"
              onChange={(e) => setProfilePhoto(e.target.files[0])} 
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept=".png,.jpg,.jpeg,.gif"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center mb-4">{message}</p>}

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;