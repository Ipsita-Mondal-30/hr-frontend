'use client';

import { notify } from '@/lib/notify';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface PendingHR {
  _id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  companySize?: string;
  industry?: string;
  verificationDocuments?: string[];
  createdAt: string;
  notes?: string;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

export default function HRVerification() {
  const [pendingHRs, setPendingHRs] = useState<PendingHR[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHR, setSelectedHR] = useState<PendingHR | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [companyForm, setCompanyForm] = useState({
    company: '',
    industry: '',
    companySize: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingHRs();
  }, []);

  useEffect(() => {
    if (selectedHR) {
      setCompanyForm({
        company: selectedHR.company || '',
        industry: selectedHR.industry || '',
        companySize: selectedHR.companySize || '',
      });
      setVerificationNotes('');
    }
  }, [selectedHR]);

  const fetchPendingHRs = async () => {
    try {
      const res = await api.get('/admin/users/pending-verification');
      setPendingHRs(res.data);
    } catch (err) {
      console.error('Failed to fetch pending HRs:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyHR = async (hrId: string, approved: boolean) => {
    if (approved) {
      if (!companyForm.company.trim() || !companyForm.industry.trim() || !companyForm.companySize.trim()) {
        notify('Please fill in Company, Industry, and Company Size before approving');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await api.put(`/admin/users/${hrId}/verify-hr`, {
        action: approved ? 'approve' : 'reject',
        notes: verificationNotes,
        ...(approved ? companyForm : {}),
      });

      console.log('✅ HR verification response:', response.data);

      setPendingHRs((prev) => prev.filter((hr) => hr._id !== hrId));
      setSelectedHR(null);
      setVerificationNotes('');
      setCompanyForm({ company: '', industry: '', companySize: '' });

      notify(`HR ${approved ? 'approved' : 'rejected'} successfully`);
      setTimeout(fetchPendingHRs, 1000);
    } catch (err: unknown) {
      console.error('Failed to verify HR:', err);
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response: { data: { error: string } } }).response.data.error
          : 'Failed to process verification';
      notify(message);
      fetchPendingHRs();
    } finally {
      setSubmitting(false);
    }
  };

  const sendVerificationEmail = async (hrId: string) => {
    try {
      await api.post(`/admin/users/${hrId}/send-verification-email`);
      notify('Verification email sent successfully');
    } catch (err) {
      console.error('Failed to send verification email:', err);
      notify('Failed to send verification email');
    }
  };

  const hrProfileComplete = selectedHR?.phone?.trim() && selectedHR?.position?.trim();

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Account Verification</h1>
        <p className="text-gray-600">
          HR users complete phone and position on their profile. You add company details when approving.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingHRs.length}</div>
          <div className="text-sm text-gray-600">Pending Verification</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">—</div>
          <div className="text-sm text-gray-600">Approved Today</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">—</div>
          <div className="text-sm text-gray-600">Rejected Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Applications</h2>
          </div>

          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {pendingHRs.length > 0 ? (
              pendingHRs.map((hr) => (
                <div
                  key={hr._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedHR?._id === hr._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedHR(hr)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{hr.name}</h3>
                      <p className="text-sm text-gray-600">{hr.email}</p>
                      <p className="text-sm text-gray-500">
                        {hr.position || 'Position pending'} · {hr.phone || 'Phone pending'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(hr.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                    {hr.phone && hr.position ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Profile complete
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        Awaiting HR profile
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">No pending HR verifications</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {selectedHR ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">HR Profile (filled by HR user)</h3>
                  {!hrProfileComplete && (
                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      HR has not completed phone and position yet. They can update this at{' '}
                      <span className="font-medium">/hr/profile</span> before you approve.
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div><strong>Name:</strong> {selectedHR.name}</div>
                    <div><strong>Email:</strong> {selectedHR.email}</div>
                    <div><strong>Phone:</strong> {selectedHR.phone || 'Not provided'}</div>
                    <div><strong>Position:</strong> {selectedHR.position || 'Not provided'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Company Information (you fill on approval)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <input
                        type="text"
                        value={companyForm.company}
                        onChange={(e) => setCompanyForm({ ...companyForm, company: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                      <select
                        value={companyForm.industry}
                        onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select industry</option>
                        {INDUSTRY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Size *</label>
                      <select
                        value={companyForm.companySize}
                        onChange={(e) => setCompanyForm({ ...companyForm, companySize: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select company size</option>
                        {COMPANY_SIZE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Verification Notes</h3>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this verification..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => verifyHR(selectedHR._id, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
                  >
                    {submitting ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => verifyHR(selectedHR._id, false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => sendVerificationEmail(selectedHR._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">👈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
              <p className="text-gray-500">Choose an HR application from the list to review details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
