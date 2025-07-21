/* File: src/components/Announcements.js
  Description: UPDATED - A visually improved component for announcements.
*/
import React, { useState, useEffect } from 'react';
import api from '../api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    api.get('/announcements').then(res => setAnnouncements(res.data)).catch(console.error);
  }, []);
  return (
    <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
      <h3 className="font-bold text-slate-800 mb-3 text-lg">📢 Announcements</h3>
      <div className="space-y-3">
        {announcements.length > 0 ? announcements.map(ann => (
          <div key={ann.id} className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{ann.content}</p>
            <p className="text-xs text-slate-400 mt-2 text-right">
              - {ann.author}, {ann.created_at}
            </p>
          </div>
        )) : <p className="text-sm text-slate-500">No recent announcements.</p>}
      </div>
    </div>
  );
};

export default Announcements;
