/* File: src/components/ContactHRForm.js
  Description: NEW - A component for employees to send a message to HR.
*/
import React, { useState } from 'react';
import api from '../api';

const ContactHRForm = () => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.post('/messages/send', { content });
      setMessage(res.data.message);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Contact HR</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="messageContent" className="block text-sm font-medium text-slate-700">Your Message</label>
          <textarea
            id="messageContent"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Write your message to the HR department here..."
            required
          ></textarea>
        </div>
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
        {message && <p className="text-sm text-center text-green-600">{message}</p>}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactHRForm;

