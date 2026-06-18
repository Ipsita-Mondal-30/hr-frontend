'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'hr' | 'admin' | 'employee';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: {
    company?: string;
    location?: string;
    skills?: string[];
  };
}

type RoleFilter = 'all' | 'candidate' | 'hr' | 'admin' | 'employee';

function isApiError(err: unknown): err is { response?: { data?: { error?: string; message?: string } } } {
  return typeof err === 'object' && err !== null && 'response' in err;
}

function apiErrorMessage(err: unknown, fallback: string) {
  if (isApiError(err)) {
    return err.response?.data?.error || err.response?.data?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' ? '/admin/users' : `/admin/users?role=${filter}`;
      const res = await api.get<User[]>(endpoint);
      setUsers(res.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch users:', err);
      alert(apiErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );
    } catch (err: unknown) {
      console.error('Failed to update user status:', err);
      alert(apiErrorMessage(err, 'Failed to update user status'));
    } finally {
      setActionLoading(null);
    }
  };

  const resetPassword = async (userId: string, email: string) => {
    if (!confirm(`Reset password for ${email}? A temporary password will be emailed to the user.`)) return;

    setActionLoading(`reset-${userId}`);
    try {
      const res = await api.post<{ message: string; emailSent?: boolean; temporaryPassword?: string }>(
        `/admin/users/${userId}/reset-password`
      );
      const { message, emailSent, temporaryPassword } = res.data;
      if (!emailSent && temporaryPassword) {
        alert(`${message}\n\nTemporary password: ${temporaryPassword}`);
      } else {
        alert(message || 'Password reset email sent successfully');
      }
    } catch (err: unknown) {
      console.error('Failed to reset password:', err);
      alert(apiErrorMessage(err, 'Failed to reset password'));
    } finally {
      setActionLoading(null);
    }
  };

  const verifyHR = async (userId: string, name: string) => {
    if (!confirm(`Verify HR account for ${name}?`)) return;

    setActionLoading(`verify-${userId}`);
    try {
      const res = await api.put<User>(`/admin/users/${userId}/verify`, { approved: true });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isVerified: res.data.isVerified ?? true } : user
        )
      );
      alert('HR account verified successfully');
    } catch (err: unknown) {
      console.error('Failed to verify HR:', err);
      alert(apiErrorMessage(err, 'Failed to verify HR account'));
    } finally {
      setActionLoading(null);
    }
  };

  const bulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (!confirm(`${action} ${selectedUsers.length} selected users?`)) return;

    const count = selectedUsers.length;
    setActionLoading(`bulk-${action}`);
    try {
      await api.post('/admin/users/bulk-action', {
        userIds: selectedUsers,
        action,
      });

      if (action === 'delete') {
        setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user._id)));
      } else {
        const isActive = action === 'activate';
        setUsers((prev) =>
          prev.map((user) =>
            selectedUsers.includes(user._id) ? { ...user, isActive } : user
          )
        );
      }

      setSelectedUsers([]);
      alert(`Successfully ${action}d ${count} users`);
    } catch (err: unknown) {
      console.error(`Failed to ${action} users:`, err);
      alert(apiErrorMessage(err, `Failed to ${action} users`));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'hr':
        return 'bg-blue-100 text-blue-800';
      case 'candidate':
        return 'bg-green-100 text-green-800';
      case 'employee':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/users/verification"
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            HR Verification
          </Link>
          <Link
            href="/admin/users/candidates"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View Candidates
          </Link>
          <Link
            href="/admin/users/hr"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View HR Users
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as RoleFilter)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="candidate">Candidates</option>
              <option value="employee">Employees</option>
              <option value="hr">HR Users</option>
              <option value="admin">Admins</option>
            </select>

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => bulkAction('activate')}
                disabled={!!actionLoading}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
              >
                Activate ({selectedUsers.length})
              </button>
              <button
                onClick={() => bulkAction('deactivate')}
                disabled={!!actionLoading}
                className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm disabled:opacity-50"
              >
                Deactivate ({selectedUsers.length})
              </button>
              <button
                onClick={() => bulkAction('delete')}
                disabled={!!actionLoading}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
              >
                Delete ({selectedUsers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map((user) => user._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.role === 'hr' && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        disabled={actionLoading === user._id}
                        className={`px-3 py-1 text-xs rounded disabled:opacity-50 ${
                          user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => resetPassword(user._id, user.email)}
                        disabled={actionLoading === `reset-${user._id}`}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        Reset Password
                      </button>

                      {user.role === 'hr' && !user.isVerified && (
                        <button
                          onClick={() => verifyHR(user._id, user.name)}
                          disabled={actionLoading === `verify-${user._id}`}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'hr').length}
          </div>
          <div className="text-sm text-gray-600">HR Users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'candidate').length}
          </div>
          <div className="text-sm text-gray-600">Candidates</div>
        </div>
      </div>
    </div>
  );
}
