'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { MessageCircle, Send, CheckCircle, ArrowLeft, Clock } from 'lucide-react';

const FEEDBACK_TYPES = [
  { value: 'Performance Review', label: 'Performance Review', description: 'Request a formal performance evaluation from your manager or HR' },
  { value: 'Project Feedback', label: 'Project Feedback', description: 'Get feedback on your recent project contributions' },
  { value: 'Peer Feedback', label: 'Peer Feedback', description: 'Request feedback from team members you worked with' },
  { value: '360 Review', label: '360° Review', description: 'Comprehensive feedback from multiple stakeholders' },
  { value: 'General Feedback', label: 'General Feedback', description: 'Open-ended feedback on your work and growth' },
];

interface FeedbackRequestItem {
  _id: string;
  requestType: string;
  message?: string;
  status: string;
  hrResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

export default function RequestFeedbackPage() {
  const router = useRouter();
  const [requestType, setRequestType] = useState('Performance Review');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState<FeedbackRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/employees/me/feedback-requests');
      setRequests(res.data || []);
    } catch (error) {
      console.error('Error fetching feedback requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/employees/me/request-feedback', {
        requestType,
        message: message.trim() || undefined,
      });
      setSubmitted(true);
      setMessage('');
      await fetchRequests();
    } catch (error) {
      console.error('Error submitting feedback request:', error);
      alert('Failed to submit feedback request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'resolved' || status === 'closed') return 'bg-green-100 text-green-800';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Feedback</h1>
          <p className="text-gray-600">Ask HR or Admin for performance feedback</p>
        </div>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Request submitted</p>
            <p className="text-sm text-green-700">HR and Admin can see your request and will reply here.</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Feedback requests are visible to HR and Admin. Include context about what you would like reviewed so they can respond faster.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Feedback Type *</label>
          <div className="space-y-2">
            {FEEDBACK_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  requestType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="requestType"
                  value={type.value}
                  checked={requestType === type.value}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Message (optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Describe what you'd like feedback on..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/employee/feedback"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Sending...' : 'Submit Request'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          My Feedback Requests
        </h2>
        {loadingRequests ? (
          <div className="animate-pulse h-20 bg-gray-100 rounded" />
        ) : requests.length === 0 ? (
          <p className="text-gray-500 text-sm">No requests yet. Submit one above and HR will respond here.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="border rounded-lg p-4">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{req.requestType}</h3>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(req.status)}`}>
                    {req.status.replace('-', ' ')}
                  </span>
                </div>
                {req.message && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{req.message}</p>
                )}
                {req.hrResponse ? (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-1">HR / Admin Response</p>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{req.hrResponse}</p>
                    {req.respondedAt && (
                      <p className="text-xs text-blue-600 mt-1">{new Date(req.respondedAt).toLocaleString()}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Waiting for HR response...</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
