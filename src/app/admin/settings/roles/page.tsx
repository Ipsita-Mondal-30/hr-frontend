'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Role {
  _id: string;
  title: string;
  description?: string;
  departmentId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    departmentId: '' 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, deptsRes] = await Promise.all([
        api.get('/admin/roles'),
        api.get('/admin/departments')
      ]);
      setRoles(rolesRes.data);
      setDepartments(deptsRes.data);
    } catch (err: unknown) {
      console.error('Failed to fetch data:', err);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Role title is required');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        departmentId: formData.departmentId || null
      };

      if (editingRole) {
        // Update existing role
        const res = await api.put(`/admin/roles/${editingRole._id}`, submitData);
        setRoles(roles.map(role => 
          role._id === editingRole._id ? res.data : role
        ));
        alert('Role updated successfully');
      } else {
        // Create new role
        const res = await api.post('/admin/roles', submitData);
        setRoles([res.data, ...roles]);
        alert('Role created successfully');
      }
      
      setShowModal(false);
      setEditingRole(null);
      setFormData({ title: '', description: '', departmentId: '' });
    } catch (err: unknown) {
      console.error('Failed to save role:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const error = err as { response?: { data?: { error?: string } } };
        alert(error.response?.data?.error || 'Failed to save role');
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Failed to save role');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({ 
      title: role.title, 
      description: role.description || '',
      departmentId: role.departmentId?._id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete "${role.title}"?`)) return;

    try {
      await api.delete(`/admin/roles/${role._id}`);
      setRoles(roles.filter(r => r._id !== role._id));
      alert('Role deleted successfully');
    } catch (err: unknown) {
      console.error('Failed to delete role:', err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const error = err as { response?: { data?: { error?: string } } };
        alert(error.response?.data?.error || 'Failed to delete role');
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Failed to delete role');
      }
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ title: '', description: '', departmentId: '' });
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
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage job roles and positions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Role
        </button>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {roles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
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
                {roles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {role.departmentId?.name || 'No department'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {role.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(role)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
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
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-500 mb-4">Create your first role to get started</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Role
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRole ? 'Edit Role' : 'Add Role'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the role"
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
                  {saving ? 'Saving...' : (editingRole ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
