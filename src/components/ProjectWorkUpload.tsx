'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface WorkSubmission {
  _id: string;
  title: string;
  status: string;
  approvedPercentage?: number;
  adminNote?: string;
  createdAt: string;
}

interface MilestoneOption {
  _id: string;
  title: string;
  status: string;
  dueDate?: string;
}

export default function ProjectWorkUpload({
  projectId,
  milestones,
  canSubmitWork = true,
  projectComplete = false,
  onSubmitted,
}: {
  projectId: string;
  milestones: MilestoneOption[];
  canSubmitWork?: boolean;
  projectComplete?: boolean;
  onSubmitted?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<WorkSubmission[]>([]);

  const activeMilestones = milestones.filter((m) => m.status !== 'completed');

  const disabled = projectComplete || !canSubmitWork || activeMilestones.length === 0;
  const disabledReason = projectComplete
    ? 'Project is 100% complete — submissions are closed.'
    : activeMilestones.length === 0
    ? 'No active milestones assigned. Wait for admin to assign an active milestone.'
    : !canSubmitWork
    ? 'Work submission is not available for this project right now.'
    : '';

  const fetchMySubmissions = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/work-submissions`, { skipAuthRedirect: true });
      setMySubmissions(res.data.submissions || []);
    } catch (e) {
      console.error('Failed to load my submissions:', e);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMySubmissions();
  }, [fetchMySubmissions]);

  useEffect(() => {
    if (activeMilestones.length === 1) {
      setMilestoneId(activeMilestones[0]._id);
    }
  }, [activeMilestones]);

  const handleSubmit = async () => {
    if (disabled) return;
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title for your submission');
      return;
    }
    if (!milestoneId) {
      alert('Please select an active milestone');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('milestoneId', milestoneId);
      if (description.trim()) formData.append('description', description.trim());

      await api.post(`/projects/${projectId}/work-submissions`, formData, {
        skipAuthRedirect: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setDescription('');
      setFile(null);
      await fetchMySubmissions();
      onSubmitted?.();
      alert('Work submitted! Admin will review and assign your contribution & hours.');
    } catch (e: unknown) {
      console.error('Upload failed:', e);
      const err = e as { response?: { data?: { error?: string } } };
      alert(err.response?.data?.error || 'Failed to upload work.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${disabled ? 'bg-gray-100 border-gray-200 opacity-80' : 'bg-gray-50 border-gray-200'}`}>
      <h3 className="text-lg font-semibold mb-1">Submit Work</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload deliverables for an active milestone. Admin reviews and sets your contribution & hours — you do not enter percentages.
      </p>

      {disabled && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          {disabledReason}
        </div>
      )}

      <div className={`space-y-3 ${disabled ? 'pointer-events-none' : ''}`}>
        <div>
          <label className="text-xs text-gray-500">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Phase 1 deliverable"
            disabled={disabled}
            className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What did you complete?"
            disabled={disabled}
            className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Active milestone *</label>
          <select
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-100"
          >
            <option value="">Select milestone</option>
            {activeMilestones.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m.status})
                {m.dueDate ? ` — due ${new Date(m.dueDate).toLocaleDateString()}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Work file *</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.zip,.txt,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={disabled}
            className="w-full text-sm disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || uploading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
        >
          {uploading ? 'Uploading…' : '📤 Upload Work for Review'}
        </button>
      </div>

      {mySubmissions.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">My submissions</h4>
          <div className="space-y-2">
            {mySubmissions.map((sub) => (
              <div key={sub._id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                <span>{sub.title}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    sub.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : sub.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {sub.status}
                  {sub.status === 'approved' && sub.approvedPercentage !== undefined
                    ? ` · ${sub.approvedPercentage}% project`
                    : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
