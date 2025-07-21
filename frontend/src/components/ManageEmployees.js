/* File: src/components/ManageEmployees.js
  Description: A visually enhanced component for HR to view, edit, and delete employees.
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';
import EditEmployeeModal from './EditEmployeeModal';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get('/admin/users/all');
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${employeeId}/delete`);
        alert('Employee deleted successfully.');
        fetchEmployees(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete employee.');
      }
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Manage Employees</h3>
      
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-medium text-slate-900">{emp.name}</td>
                <td className="px-4 py-4 text-slate-500">{emp.email}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.is_hr ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {emp.is_hr ? 'HR Admin' : 'Employee'}
                  </span>
                </td>
                <td className="px-4 py-4 space-x-4">
                  <button onClick={() => setEditingEmployee(emp)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                  <button onClick={() => handleDelete(emp.id)} className="text-rose-600 hover:text-rose-900 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={() => {
            setEditingEmployee(null);
            fetchEmployees(); // Refresh list after successful edit
          }}
        />
      )}
    </div>
  );
};

export default ManageEmployees;