'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface WorkSubmission {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  submittedPercentage: number;
  approvedPercentage?: number;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  employee?: {
    user?: { name?: string };
    position?: string;
  };
  milestone?: { title?: string };
}

export default function AdminWorkReviewPanel({
  projectId,
  onReviewed,
}: {
  projectId: string;
  onReviewed?: (project: { completionPercentage?: number }) => void;
}) {
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [approvedPct, setApprovedPct] = useState('');
  const [contributionPct, setContributionPct] = useState('');
  const [hoursLogged, setHoursLogged] = useState('8');
  const [adminNote, setAdminNote] = useState('');

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/work-submissions`, { skipAuthRedirect: true });
      setSubmissions(res.data.submissions || []);
    } catch (e) {
      console.error('Failed to load work submissions:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const startReview = (sub: WorkSubmission) => {
    setReviewingId(sub._id);
    setApprovedPct('');
    setContributionPct('');
    setHoursLogged('8');
    setAdminNote('');
  };

  const submitReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await api.patch(
        `/projects/work-submissions/${submissionId}/review`,
        {
          status,
          approvedPercentage: status === 'approved' ? Number(approvedPct) : undefined,
          contributionPercentage: status === 'approved' && contributionPct ? Number(contributionPct) : undefined,
          hoursLogged: status === 'approved' ? Number(hoursLogged) : undefined,
          adminNote: adminNote.trim() || undefined,
        },
        { skipAuthRedirect: true }
      );
      setReviewingId(null);
      await fetchSubmissions();
      if (res.data.project) onReviewed?.(res.data.project);
    } catch (e) {
      console.error('Review failed:', e);
      alert('Failed to submit review');
    }
  };

  const pending = submissions.filter((s) => s.status === 'pending');

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Work Submissions</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-gray-500">No work submitted yet. Employees can upload from their project view.</p>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <p className="text-sm font-medium text-orange-700">{pending.length} pending review</p>
          )}
          {submissions.map((sub) => (
            <div
              key={sub._id}
              className={`border rounded-lg p-4 ${
                sub.status === 'pending'
                  ? 'border-orange-200 bg-orange-50'
                  : sub.status === 'approved'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-medium text-gray-900">{sub.title}</h4>
                  <p className="text-sm text-gray-600">
                    by {sub.employee?.user?.name || 'Employee'}
                    {sub.milestone?.title ? ` · ${sub.milestone.title}` : ''}
                  </p>
                  {sub.description && <p className="text-sm text-gray-500 mt-1">{sub.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted {new Date(sub.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    sub.status === 'pending'
                      ? 'bg-orange-200 text-orange-800'
                      : sub.status === 'approved'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={sub.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Preview / Download
                </a>
                {sub.status === 'pending' && reviewingId !== sub._id && (
                  <button
                    type="button"
                    onClick={() => startReview(sub)}
                    className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Review
                  </button>
                )}
              </div>

              {reviewingId === sub._id && (
                <div className="mt-4 p-3 bg-white rounded border space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Project completion %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={approvedPct}
                        onChange={(e) => setApprovedPct(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Employee contribution %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={contributionPct}
                        onChange={(e) => setContributionPct(e.target.value)}
                        placeholder="Auto from completion"
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Hours logged</label>
                      <input
                        type="number"
                        min={0}
                        value={hoursLogged}
                        onChange={(e) => setHoursLogged(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Note to employee</label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Feedback or rejection reason"
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => submitReview(sub._id, 'approved')}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve & update completion
                    </button>
                    <button
                      type="button"
                      onClick={() => submitReview(sub._id, 'rejected')}
                      className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewingId(null)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {sub.status === 'approved' && sub.approvedPercentage !== undefined && (
                <p className="text-xs text-green-700 mt-2">
                  Approved at {sub.approvedPercentage}% project completion
                  {sub.adminNote ? ` · ${sub.adminNote}` : ''}
                </p>
              )}
              {sub.status === 'rejected' && sub.adminNote && (
                <p className="text-xs text-red-700 mt-2">Reason: {sub.adminNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
