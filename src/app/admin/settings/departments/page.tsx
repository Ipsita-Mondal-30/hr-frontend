'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';

interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch (err: unknown) {
      const e = err as ApiError;
      console.error('Failed to fetch departments:', e);
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Department name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        // Update existing department
        const res = await api.put(`/admin/departments/${editingDept._id}`, formData);
        setDepartments(departments.map((dept) => (dept._id === editingDept._id ? res.data : dept)));
        toast.success('Department updated successfully');
      } else {
        // Create new department
        const res = await api.post('/admin/departments', formData);
        setDepartments([res.data, ...departments]);
        toast.success('Department created successfully');
      }

      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: '', description: '' });
    } catch (err: unknown) {
      const e = err as ApiError;
      console.error('Failed to save department:', e);
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Are you sure you want to delete "${dept.name}"?`)) return;

    try {
      await api.delete(`/admin/departments/${dept._id}`);
      setDepartments(departments.filter((d) => d._id !== dept._id));
      toast.success('Department deleted successfully');
    } catch (err: unknown) {
      const e = err as ApiError;
      console.error('Failed to delete department:', e);
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Failed to delete department');
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage organizational departments</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Department
        </button>
      </div>

      {/* Departments List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {departments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {dept.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏛️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500 mb-4">Create your first department to get started</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Department
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDept ? 'Edit Department' : 'Add Department'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Engineering, Marketing, Sales"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the department"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {saving ? 'Saving...' : editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
