/* File: src/components/PostAnnouncement.js
  Description: NEW - A form for HR to post a new announcement.
*/
import React, { useState } from 'react';
import api from '../api';

const PostAnnouncement = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.post('/admin/announcements/create', { content });
      setMessage(res.data.message);
      setContent(''); // Clear textarea on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Post a New Announcement</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Write your announcement here..."
          required
        ></textarea>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Post Announcement
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
    </div>
  );
};

export default PostAnnouncement;
