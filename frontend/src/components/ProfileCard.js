/* File: src/components/ProfileCard.js
  Description: NEW - A modal component to display the employee ID card.
*/
import React from 'react';
import api from '../api'; // Used to construct the full image URL

const ProfileCard = ({ user, onClose }) => {
  if (!user) return null;

  // Construct the full URL for the profile photo, handling the base URL
  const fullPhotoUrl = user.profile_photo_url ? `${api.defaults.baseURL}${user.profile_photo_url}` : 'https://i.pravatar.cc/128';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="bg-air-force-blue p-4 text-center text-white font-bold text-xl tracking-widest">
          EMPLOYEE ID
        </div>
        <div className="p-8 flex flex-col items-center">
          <img 
            src={fullPhotoUrl} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 -mt-24 mb-4 bg-white"
            // Fallback in case the image fails to load
            onError={(e) => { e.target.onerror = null; e.target.src='https://i.pravatar.cc/128' }} 
          />
          <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500 font-medium">{user.job_role || 'Employee'}</p>
          
          <div className="w-full mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-slate-600">Employee ID</span>
              <span className="text-slate-800 font-mono">{user.employee_id || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-slate-600">Email</span>
              <span className="text-slate-800">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Contact</span>
              <span className="text-slate-800">{user.contact_number || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
