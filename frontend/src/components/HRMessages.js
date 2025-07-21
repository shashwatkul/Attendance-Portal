/* File: src/components/HRMessages.js
  Description: NEW - A component for HR to view all incoming messages.
*/
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const HRMessages = () => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get('/admin/messages');
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (messageId) => {
    try {
        await api.post(`/admin/messages/${messageId}/read`);
        fetchMessages(); // Refresh the list
    } catch (err) {
        alert('Failed to mark as read.');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Employee Messages</h3>
      <div className="space-y-4">
        {messages.length > 0 ? messages.map(msg => (
          <div key={msg.id} className={`p-4 rounded-lg shadow-sm ${msg.is_read ? 'bg-slate-100' : 'bg-amber-50 border-l-4 border-amber-400'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800">{msg.sender_name}</p>
                <p className="text-sm text-slate-500">{msg.sender_email}</p>
              </div>
              <span className="text-xs text-slate-400">{msg.created_at}</span>
            </div>
            <p className="mt-3 text-slate-700">{msg.content}</p>
            {!msg.is_read && (
              <div className="text-right mt-2">
                <button onClick={() => handleMarkAsRead(msg.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  Mark as Read
                </button>
              </div>
            )}
          </div>
        )) : (
          <p className="text-slate-500">There are no messages.</p>
        )}
      </div>
    </div>
  );
};

export default HRMessages;