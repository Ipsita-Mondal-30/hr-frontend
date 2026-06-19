'use client';
import { notify } from '@/lib/notify';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface EmployeeProfile {
  _id: string;
  employeeId: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department?: {
    name: string;
  };
  manager?: {
    user: { name: string };
    position: string;
  };
  performanceScore: number;
  projectContribution: number;
  hireDate: string;
  employmentType: string;
  salary?: number;
  skills: Array<{
    name: string;
    level: string;
    verified: boolean;
  }>;
  resume?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  };
  status: string;
}

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate' });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [feedbackType, setFeedbackType] = useState('Performance Review');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [trainingTopic, setTrainingTopic] = useState('');
  const [trainingMessage, setTrainingMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      await api.put('/employees/me/skills', { skills: profile.skills });
      setEditing(false);
      notify('Skills updated successfully!');
      await fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      notify('Error saving skills');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      notify('New password must be at least 8 characters');
      return;
    }
    try {
      setChangingPassword(true);
      await api.post('/auth/change-password', { currentPassword, newPassword });
      notify('Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: unknown) {
      const msg =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to change password';
      notify(msg || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      notify('Please select a resume file');
      return;
    }
    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append('file', resumeFile);
      await api.post('/employees/me/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify('Resume uploaded successfully! HR and Admin have been notified.');
      setShowResumeModal(false);
      setResumeFile(null);
      await fetchProfile();
    } catch (error) {
      console.error('Error uploading resume:', error);
      notify('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const submitFeedbackRequest = async () => {
    try {
      await api.post('/employees/me/request-feedback', {
        requestType: feedbackType,
        message: feedbackMessage.trim() || undefined,
      });
      notify('Feedback request sent to HR/Admin!');
      setShowFeedbackModal(false);
      setFeedbackMessage('');
    } catch {
      notify('Failed to submit feedback request');
    }
  };

  const submitTrainingRequest = async () => {
    if (!trainingTopic.trim()) {
      notify('Please enter a training topic');
      return;
    }
    try {
      await api.post('/employees/me/request-training', {
        topic: trainingTopic.trim(),
        message: trainingMessage.trim() || undefined,
      });
      notify('Training request sent to HR/Admin!');
      setShowTrainingModal(false);
      setTrainingTopic('');
      setTrainingMessage('');
    } catch {
      notify('Failed to submit training request');
    }
  };

  const addSkill = () => {
    if (!profile || !newSkill.name.trim()) return;

    const skillExists = (profile.skills || []).some(
      (skill) => skill.name.toLowerCase() === newSkill.name.toLowerCase()
    );

    if (skillExists) {
      notify('Skill already exists');
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            skills: [...(prev.skills || []), { ...newSkill, verified: false }],
          }
        : null
    );

    setNewSkill({ name: '', level: 'intermediate' });
  };

  const removeSkill = (skillName: string) => {
    if (!profile) return;

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            skills: (prev.skills || []).filter((skill) => skill.name !== skillName),
          }
        : null
    );
  };

  const calculateProfileCompleteness = () => {
    if (!profile) return 0;

    const fields = [
      profile.user.name,
      profile.user.email,
      profile.position,
      profile.department?.name,
      profile.skills?.length ? 'skills' : '',
      profile.hireDate,
      profile.employmentType,
    ];

    const completedFields = fields.filter((field) => field && field.toString().trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-gray-600">Please contact HR to set up your employee profile.</p>
      </div>
    );
  }

  const completeness = calculateProfileCompleteness();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage employee information and skills</p>
        </div>
        <div className="flex space-x-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Profile Completeness</span>
          <span className="text-sm font-bold text-blue-900">{completeness}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
        {completeness < 100 && (
          <p className="text-xs text-blue-700 mt-2">
            Complete the profile to improve visibility and opportunities
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-semibold text-2xl">
                  {profile.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{profile.user.name}</h2>
              <p className="text-gray-600">{profile.position}</p>
              <p className="text-sm text-gray-500">ID: {profile.employeeId}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{profile.user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Change password
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-gray-900">{profile.department?.name || 'Not assigned'}</p>
                <p className="text-xs text-gray-500">Managed by HR/Admin</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <p className="text-gray-900">
                  {profile.manager?.user?.name
                    ? `${profile.manager.user.name}${profile.manager.position ? ` (${profile.manager.position})` : ''}`
                    : 'Not assigned'}
                </p>
                <p className="text-xs text-gray-500">Assigned by HR/Admin</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <p className="text-gray-900 capitalize">
                  {profile.employmentType.replace('-', ' ')}
                </p>
                <p className="text-xs text-gray-500">Set by HR</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <p className="text-gray-900">{new Date(profile.hireDate).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">Official record</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    profile.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : profile.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Performance Score</span>
                  <span>{profile.performanceScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${profile.performanceScore}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Project Contribution</span>
                  <span>{profile.projectContribution}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${profile.projectContribution}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Competencies</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {(profile.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    skill.verified
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {skill.name} ({skill.level})
                  {skill.verified && <span className="ml-1">✓</span>}
                  {editing && (
                    <button
                      onClick={() => removeSkill(skill.name)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Skill name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, level: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Career Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <p className="text-gray-900">
                  {Math.floor(
                    (new Date().getTime() - new Date(profile.hireDate).getTime()) /
                      (1000 * 60 * 60 * 24 * 365)
                  )}{' '}
                  years
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Career Level
                </label>
                <p className="text-gray-900">
                  {profile.performanceScore >= 90
                    ? 'Senior'
                    : profile.performanceScore >= 70
                    ? 'Mid-level'
                    : 'Junior'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowResumeModal(true)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="text-sm font-medium">Update Resume</div>
              </button>
              <button
                onClick={() => (window.location.href = '/employee/performance')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm font-medium">Set Goals</div>
              </button>
              <button
                onClick={() => setShowTrainingModal(true)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm font-medium">Request Training</div>
              </button>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-center"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium">Request Feedback</div>
              </button>
            </div>
          </div>

          {/* Resume */}
          {profile.resume?.fileUrl && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Resume</h3>
              <p className="text-sm text-gray-600 mb-2">{profile.resume.fileName}</p>
              <p className="text-xs text-gray-500 mb-3">
                Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()}
              </p>
              <a
                href={profile.resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View / Download Resume →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Resume Upload Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Update Resume</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowResumeModal(false);
                    setResumeFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResumeUpload}
                  disabled={uploadingResume || !resumeFile}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingResume ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Request Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option>Performance Review</option>
                  <option>Project Feedback</option>
                  <option>Skill Assessment</option>
                  <option>General Feedback</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Any specific areas you'd like feedback on..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedbackRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Request Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Training</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Training Topic *</label>
                <input
                  type="text"
                  value={trainingTopic}
                  onChange={(e) => setTrainingTopic(e.target.value)}
                  placeholder="e.g. Advanced React, AWS Certification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Details (Optional)</label>
                <textarea
                  rows={3}
                  value={trainingMessage}
                  onChange={(e) => setTrainingMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Why you need this training..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTrainingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitTrainingRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Change password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={changePassword}
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {changingPassword ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
