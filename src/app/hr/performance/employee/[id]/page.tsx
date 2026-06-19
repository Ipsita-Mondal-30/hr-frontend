'use client';

import { notify } from '@/lib/notify';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Employee {
  _id: string;
  employeeId?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  position: string;
  department?: { name: string };
  manager?: { user?: { name: string } };
  performanceScore: number;
  hireDate?: string;
  employmentType?: string;
  status?: string;
}

interface FeedbackItem {
  _id: string;
  title?: string;
  type?: string;
  feedback: string;
  rating: number;
  createdAt: string;
  reviewPeriod?: string;
  status?: string;
  aiSummary?: string;
  ratings?: Record<string, number>;
  givenBy: { name: string; email?: string };
}

interface OKRItem {
  _id: string;
  objective: string;
  description?: string;
  overallProgress: number;
  status: string;
  period: string;
  year: number;
  keyResults?: Array<{ title: string; targetValue: number; currentValue: number; unit: string }>;
}

interface PerformanceData {
  employee: Employee;
  metrics: {
    projectsCompleted: number;
    averageRating: number;
    feedbackCount: number;
    okrsCount: number;
    completedOKRs: number;
  };
  recentFeedback: FeedbackItem[];
  okrs: OKRItem[];
}

interface KeyResultForm {
  title: string;
  targetValue: number;
  unit: string;
  weight: number;
}

const EMPTY_KR: KeyResultForm = { title: '', targetValue: 100, unit: '%', weight: 1 };

function isAxiosError(error: unknown): error is { response?: { data?: { error?: string } } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default function EmployeePerformanceDetails() {
  const params = useParams();
  const employeeId = params.id as string;
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOkrModal, setShowOkrModal] = useState(false);
  const [submittingOkr, setSubmittingOkr] = useState(false);
  const [okrForm, setOkrForm] = useState({
    objective: '',
    description: '',
    period: 'Q1',
    year: new Date().getFullYear(),
    keyResults: [{ ...EMPTY_KR }] as KeyResultForm[]
  });

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await api.get(`/employees/${employeeId}/performance`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) fetchPerformanceData();
  }, [employeeId, fetchPerformanceData]);

  const handleAssignOkr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!okrForm.objective.trim()) {
      notify('Objective is required');
      return;
    }
    const validKrs = okrForm.keyResults.filter((kr) => kr.title.trim());
    if (validKrs.length === 0) {
      notify('Add at least one key result');
      return;
    }

    setSubmittingOkr(true);
    try {
      await api.post('/okrs', {
        employee: employeeId,
        objective: okrForm.objective,
        description: okrForm.description,
        period: okrForm.period,
        year: okrForm.year,
        keyResults: validKrs
      });
      setShowOkrModal(false);
      setOkrForm({
        objective: '',
        description: '',
        period: 'Q1',
        year: new Date().getFullYear(),
        keyResults: [{ ...EMPTY_KR }]
      });
      await fetchPerformanceData();
      notify('OKR assigned successfully. The employee can view it on their performance page.');
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.error || 'Failed to assign OKR'
        : 'Failed to assign OKR';
      notify(message);
    } finally {
      setSubmittingOkr(false);
    }
  };

  const addKeyResult = () => {
    setOkrForm((prev) => ({
      ...prev,
      keyResults: [...prev.keyResults, { ...EMPTY_KR }]
    }));
  };

  const updateKeyResult = (index: number, field: keyof KeyResultForm, value: string | number) => {
    setOkrForm((prev) => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) =>
        i === index ? { ...kr, [field]: value } : kr
      )
    }));
  };

  const removeKeyResult = (index: number) => {
    setOkrForm((prev) => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">The employee performance data could not be loaded.</p>
        <Link href="/hr/performance" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Back to Performance
        </Link>
      </div>
    );
  }

  const { employee, metrics, recentFeedback = [], okrs = [] } = data;

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatType = (type?: string) =>
    type ? type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Feedback';

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.user?.name || 'Unknown Employee'} — Performance Details
          </h1>
          <p className="text-gray-600">
            {employee.position || 'Employee'} • {employee.department?.name || 'No Department'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowOkrModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Assign OKR
          </button>
          <Link
            href="/hr/performance/review"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Conduct Review
          </Link>
          <Link
            href={`/hr/performance/feedback/${employeeId}`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Give Feedback
          </Link>
          <Link href="/hr/performance" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Back to Performance
          </Link>
        </div>
      </div>

      {/* Employee Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
            <p className="font-medium text-gray-900">{employee.user?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p className="font-medium text-gray-900">{employee.user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Employee ID</p>
            <p className="font-medium text-gray-900">{employee.employeeId || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Position</p>
            <p className="font-medium text-gray-900">{employee.position || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Department</p>
            <p className="font-medium text-gray-900">{employee.department?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Manager</p>
            <p className="font-medium text-gray-900">{employee.manager?.user?.name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Hire Date</p>
            <p className="font-medium text-gray-900">
              {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Employment Type</p>
            <p className="font-medium text-gray-900 capitalize">{employee.employmentType || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p className="font-medium text-gray-900 capitalize">{employee.status || 'active'}</p>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Performance Score</p>
          <p className="text-2xl font-bold text-gray-900">{employee.performanceScore || 0}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Projects Completed</p>
          <p className="text-2xl font-bold text-gray-900">{metrics?.projectsCompleted || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics?.averageRating ? `${metrics.averageRating.toFixed(1)}/5` : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm font-medium text-gray-600">OKRs Completed</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics?.completedOKRs || 0}/{metrics?.okrsCount || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
            <span className="text-sm text-gray-500">{metrics?.feedbackCount || 0} total</span>
          </div>
          <div className="p-6">
            {recentFeedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p>No feedback available</p>
                <p className="text-sm">Feedback will appear here when provided</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentFeedback.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title || formatType(item.type)}</h4>
                        <p className="text-sm text-gray-600">
                          by {item.givenBy.name}
                          {item.reviewPeriod && ` • ${item.reviewPeriod}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 text-sm">{'★'.repeat(Math.round(item.rating))}{'☆'.repeat(5 - Math.round(item.rating))}</div>
                        <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {item.ratings && Object.keys(item.ratings).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(item.ratings)
                          .filter(([, v]) => v > 0)
                          .map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {key.replace(/([A-Z])/g, ' $1')}: {value}/5
                            </span>
                          ))}
                      </div>
                    )}

                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{item.feedback}</pre>

                    {item.aiSummary && (
                      <p className="mt-2 text-xs text-purple-700 bg-purple-50 p-2 rounded">{item.aiSummary}</p>
                    )}

                    {item.status && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                        {item.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current OKRs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Current OKRs</h3>
            <button
              onClick={() => setShowOkrModal(true)}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              + Assign OKR
            </button>
          </div>
          <div className="p-6">
            {okrs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <p>No OKRs assigned</p>
                <p className="text-sm mb-4">Assign objectives for this employee to track progress</p>
                <button
                  onClick={() => setShowOkrModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                >
                  Assign First OKR
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {okrs.map((okr) => (
                  <div key={okr._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{okr.objective}</h4>
                      <span className="text-xs text-gray-500">{okr.period} {okr.year}</span>
                    </div>
                    {okr.description && <p className="text-sm text-gray-600 mb-3">{okr.description}</p>}

                    {okr.keyResults && okr.keyResults.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {okr.keyResults.map((kr, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex justify-between">
                            <span>{kr.title}</span>
                            <span>{kr.currentValue}/{kr.targetValue} {kr.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{okr.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(okr.overallProgress)}`}
                            style={{ width: `${okr.overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        okr.status === 'completed' ? 'bg-green-100 text-green-800' :
                        okr.status === 'at-risk' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {okr.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign OKR Modal */}
      {showOkrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Assign OKR to {employee.user?.name}</h2>
              <button onClick={() => setShowOkrModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleAssignOkr} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objective *</label>
                <input
                  type="text"
                  value={okrForm.objective}
                  onChange={(e) => setOkrForm((p) => ({ ...p, objective: e.target.value }))}
                  placeholder="e.g. Improve customer satisfaction scores"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={okrForm.description}
                  onChange={(e) => setOkrForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
                  <select
                    value={okrForm.period}
                    onChange={(e) => setOkrForm((p) => ({ ...p, period: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'Annual'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <select
                    value={okrForm.year}
                    onChange={(e) => setOkrForm((p) => ({ ...p, year: parseInt(e.target.value, 10) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Key Results *</label>
                  <button type="button" onClick={addKeyResult} className="text-sm text-purple-600 hover:text-purple-800">
                    + Add Key Result
                  </button>
                </div>
                <div className="space-y-3">
                  {okrForm.keyResults.map((kr, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={kr.title}
                          onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                          placeholder="Key result title"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {okrForm.keyResults.length > 1 && (
                          <button type="button" onClick={() => removeKeyResult(index)} className="text-red-500 text-sm px-2">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', parseFloat(e.target.value) || 0)}
                          placeholder="Target"
                          min={1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          placeholder="Unit (%, tasks)"
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                          type="number"
                          value={kr.weight}
                          onChange={(e) => updateKeyResult(index, 'weight', parseFloat(e.target.value) || 1)}
                          placeholder="Weight"
                          min={0.1}
                          step={0.1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowOkrModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOkr}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {submittingOkr ? 'Assigning...' : 'Assign OKR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
