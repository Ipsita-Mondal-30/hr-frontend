'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';

interface HireRecommendation {
  _id: string;
  scheduledAt: string;
  completedAt?: string;
  type: string;
  status: string;
  recording?: { url: string; fileName?: string; uploadedAt?: string; type?: string };
  scorecard?: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
    overall: number;
    feedback: string;
    recommendation: string;
  };
  hireApproval?: { status: string; recommendedAt?: string };
  application?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    status: string;
    matchScore?: number;
    resumeUrl?: string;
    parsedResume?: { skills?: string[] };
    atsAnalysis?: { overallScore?: number; strengths?: string[] };
    job?: {
      title: string;
      companyName: string;
      description?: string;
      minSalary?: number;
      maxSalary?: number;
    };
    candidate?: { name: string; email: string };
  };
  interviewer?: { name: string; email: string; company?: string };
}

export default function AdminHireApprovalsPage() {
  const [items, setItems] = useState<HireRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HireRecommendation | null>(null);
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastCredentials, setLastCredentials] = useState<{ email: string; temporaryPassword: string } | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<HireRecommendation[]>('/admin/hire-approvals');
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const selectItem = (item: HireRecommendation) => {
    setSelected(item);
    setPosition(item.application?.job?.title || '');
    setSalary(String(item.application?.job?.minSalary || ''));
    setAdminNotes('');
    setLastCredentials(null);
  };

  const approve = async () => {
    if (!selected) return;
    if (!selected.recording?.url) {
      alert('No meeting recording on file. Cannot approve without reviewing the recording.');
      return;
    }
    setProcessing(true);
    try {
      const res = await api.post(`/admin/hire-approvals/${selected._id}/approve`, {
        position,
        salary: salary ? Number(salary) : undefined,
        adminNotes,
      });
      setLastCredentials(res.data.credentials);
      alert(res.data.message || 'Hire approved');
      setSelected(null);
      fetchItems();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Approval failed';
      alert(msg || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    if (!adminNotes.trim()) {
      alert('Please add notes explaining the rejection');
      return;
    }
    setProcessing(true);
    try {
      await api.post(`/admin/hire-approvals/${selected._id}/reject`, { adminNotes });
      alert('Hire recommendation rejected');
      setSelected(null);
      fetchItems();
    } catch {
      alert('Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-6 animate-pulse h-64 bg-gray-100 rounded" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hire Approvals</h1>
        <p className="text-sm sm:text-base text-gray-600">Review HR hire recommendations, watch meeting recordings, and onboard employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{items.length}</p>
          <p className="text-sm text-gray-600">Pending hire reviews</p>
        </div>
      </div>

      {lastCredentials && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-green-800">Employee credentials sent</p>
          <p>Email: {lastCredentials.email}</p>
          <p>Temporary password: {lastCredentials.temporaryPassword}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b font-semibold">Pending recommendations</div>
          <div className="divide-y max-h-[32rem] overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-8 text-center text-gray-500">No pending hire recommendations</p>
            ) : (
              items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${
                    selected?._id === item._id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <p className="font-medium">{item.application?.name || 'Candidate'}</p>
                  <p className="text-sm text-gray-600">{item.application?.job?.title}</p>
                  <p className="text-xs text-gray-500">HR: {item.interviewer?.name}</p>
                  {item.scorecard && (
                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Recommend hire · {item.scorecard.overall}/5
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          {!selected ? (
            <p className="text-gray-500 text-center py-16">Select a candidate to review details and recording</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">{selected.application?.name}</h2>
                <p className="text-sm text-gray-600">{selected.application?.email}</p>
                <p className="text-sm text-gray-600">{selected.application?.phone || '—'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Role</span><p className="font-medium">{selected.application?.job?.title}</p></div>
                <div><span className="text-gray-500">Company</span><p className="font-medium">{selected.application?.job?.companyName}</p></div>
                <div><span className="text-gray-500">Match score</span><p className="font-medium">{selected.application?.matchScore ?? '—'}%</p></div>
                <div><span className="text-gray-500">HR interviewer</span><p className="font-medium">{selected.interviewer?.name}</p></div>
              </div>

              {selected.recording?.url && (
                <div>
                  <h3 className="font-medium mb-2">Meeting recording</h3>
                  <a
                    href={selected.recording.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    Open recording ({selected.recording.fileName || 'link'})
                  </a>
                  {selected.recording.url.match(/\.(mp4|webm|mov)/i) || selected.recording.type === 'upload' ? (
                    <video controls className="w-full mt-2 rounded border max-h-48" src={selected.recording.url} />
                  ) : null}
                </div>
              )}

              {selected.scorecard && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <h3 className="font-medium">HR Scorecard</h3>
                  <p>Overall: {selected.scorecard.overall}/5 · Technical: {selected.scorecard.technicalSkills}/5</p>
                  <p>Communication: {selected.scorecard.communication}/5 · Problem solving: {selected.scorecard.problemSolving}/5</p>
                  <p>Cultural fit: {selected.scorecard.culturalFit}/5</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selected.scorecard.feedback}</p>
                </div>
              )}

              {selected.application?.parsedResume?.skills?.length ? (
                <div>
                  <h3 className="font-medium text-sm mb-1">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {selected.application.parsedResume.skills.slice(0, 12).map((s) => (
                      <span key={s} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 pt-2 border-t">
                <h3 className="font-medium">Create employee account</h3>
                <input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Position title"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Salary (optional)"
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Admin notes (required for rejection)"
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={approve}
                    disabled={processing || !selected.recording?.url}
                    className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve & create employee
                  </button>
                  <button
                    type="button"
                    onClick={reject}
                    disabled={processing}
                    className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
