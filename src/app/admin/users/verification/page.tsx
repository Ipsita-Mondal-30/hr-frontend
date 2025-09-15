'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

interface PendingHR {
  _id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  companySize?: string;
  industry?: string;
  verificationDocuments?: string[];
  createdAt: string;
  notes?: string;
}

export default function HRVerification() {
  const [pendingHRs, setPendingHRs] = useState<PendingHR[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHR, setSelectedHR] = useState<PendingHR | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchPendingHRs();
  }, []);

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
    try {
      console.log(`🔄 ${approved ? 'Approving' : 'Rejecting'} HR:`, hrId);
      
      const response = await api.put(`/admin/users/${hrId}/verify-hr`, {
        action: approved ? 'approve' : 'reject',
        notes: verificationNotes
      });
      
      console.log('✅ HR verification response:', response.data);
      
      // Remove from pending list immediately
      setPendingHRs(prev => prev.filter(hr => hr._id !== hrId));
      setSelectedHR(null);
      setVerificationNotes('');
      
      showToast.success(`HR ${approved ? 'approved' : 'rejected'} successfully`);
      
      // Also refresh the list to ensure consistency
      setTimeout(fetchPendingHRs, 1000);
    } catch (err) {
      console.error('Failed to verify HR:', err);
      showToast.error('Failed to process verification');
      // Refresh on error to ensure consistency
      fetchPendingHRs();
    }
  };

  const sendVerificationEmail = async (hrId: string) => {
    try {
      await api.post(`/admin/users/${hrId}/send-verification-email`);
      showToast.success('Verification email sent successfully');
    } catch (err) {
      console.error('Failed to send verification email:', err);
      showToast.error('Failed to send verification email');
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Account Verification</h1>
        <p className="text-gray-600">Review and approve HR account applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingHRs.length}</div>
          <div className="text-sm text-gray-600">Pending Verification</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600">Approved Today</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">0</div>
          <div className="text-sm text-gray-600">Rejected Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending List */}
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
                      <p className="text-sm text-gray-500">{hr.position} at {hr.company}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(hr.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                    {hr.verificationDocuments && hr.verificationDocuments.length > 0 && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {hr.verificationDocuments.length} Documents
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

        {/* Details Panel */}
        <div className="bg-white rounded-lg shadow-sm border">
          {selectedHR ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div><strong>Name:</strong> {selectedHR.name}</div>
                    <div><strong>Email:</strong> {selectedHR.email}</div>
                    <div><strong>Phone:</strong> {selectedHR.phone || 'Not provided'}</div>
                    <div><strong>Position:</strong> {selectedHR.position}</div>
                  </div>
                </div>

                {/* Company Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Company Information</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div><strong>Company:</strong> {selectedHR.company}</div>
                    <div><strong>Industry:</strong> {selectedHR.industry || 'Not specified'}</div>
                    <div><strong>Company Size:</strong> {selectedHR.companySize || 'Not specified'}</div>
                    {selectedHR.website && (
                      <div>
                        <strong>Website:</strong>{' '}
                        <a 
                          href={selectedHR.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedHR.website}
                        </a>
                      </div>
                    )}
                    {selectedHR.linkedIn && (
                      <div>
                        <strong>LinkedIn:</strong>{' '}
                        <a 
                          href={selectedHR.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                {selectedHR.verificationDocuments && selectedHR.verificationDocuments.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Verification Documents</h3>
                    <div className="space-y-2">
                      {selectedHR.verificationDocuments.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <div className="text-blue-600 mr-3">📄</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Document {index + 1}
                            </div>
                            <div className="text-xs text-gray-500">Click to view</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Notes */}
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

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => verifyHR(selectedHR._id, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => verifyHR(selectedHR._id, false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    ❌ Reject
                  </button>
                  <button
                    onClick={() => sendVerificationEmail(selectedHR._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    📧 Email
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