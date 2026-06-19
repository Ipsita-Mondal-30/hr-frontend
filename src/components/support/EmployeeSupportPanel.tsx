'use client';

import { notify } from '@/lib/notify';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface EmployeeInfo {
  user?: { name: string; email: string };
  position?: string;
}

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
  status: string;
  hrResponse?: string;
  respondedAt?: string;
  employee: EmployeeInfo;
  createdAt: string;
}

interface FeedbackRequestItem {
  _id: string;
  requestType: string;
  message?: string;
  status: string;
  hrResponse?: string;
  respondedAt?: string;
  employee: EmployeeInfo;
  createdAt: string;
}

interface EmployeeSupportPanelProps {
  apiBase: '/hr/support' | '/admin/support';
  title?: string;
}

type Tab = 'tickets' | 'feedback';

export default function EmployeeSupportPanel({
  apiBase,
  title = 'Employee Support'
}: EmployeeSupportPanelProps) {
  const [tab, setTab] = useState<Tab>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const [ticketsRes, feedbackRes] = await Promise.all([
        api.get(`${apiBase}/tickets${params}`),
        api.get(`${apiBase}/feedback-requests${params}`)
      ]);
      setTickets(ticketsRes.data || []);
      setFeedbackRequests(feedbackRes.data || []);
    } catch (error) {
      console.error('Error fetching support data:', error);
    } finally {
      setLoading(false);
    }
  }, [apiBase, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRespond = async (id: string, type: Tab, status = 'resolved') => {
    if (!responseText.trim()) {
      notify('Please enter a response');
      return;
    }
    try {
      setSubmitting(true);
      const path =
        type === 'tickets'
          ? `${apiBase}/tickets/${id}/respond`
          : `${apiBase}/feedback-requests/${id}/respond`;
      await api.put(path, { response: responseText.trim(), status });
      setResponseText('');
      setActiveId(null);
      await fetchData();
      notify('Response sent to employee');
    } catch (error) {
      console.error('Error sending response:', error);
      notify('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'resolved' || status === 'closed') return 'bg-green-100 text-green-800';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const renderItem = (
    id: string,
    type: Tab,
    headline: string,
    subline: string,
    body: string,
    status: string,
    hrResponse?: string,
    respondedAt?: string
  ) => (
    <div key={id} className="border rounded-lg p-5 bg-white shadow-sm">
      <div className="flex flex-wrap justify-between gap-2 mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{headline}</h3>
          <p className="text-sm text-gray-600">{subline}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full capitalize h-fit ${getStatusColor(status)}`}>
          {status.replace('-', ' ')}
        </span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{body}</p>
      {hrResponse && (
        <div className="mb-3 p-3 bg-green-50 border border-green-100 rounded text-sm">
          <p className="font-medium text-green-800 mb-1">Your response</p>
          <p className="text-green-900 whitespace-pre-wrap">{hrResponse}</p>
          {respondedAt && (
            <p className="text-xs text-green-600 mt-1">{new Date(respondedAt).toLocaleString()}</p>
          )}
        </div>
      )}
      {status !== 'closed' && (
        <div className="space-y-2">
          <textarea
            value={activeId === id ? responseText : ''}
            onFocus={() => setActiveId(id)}
            onChange={(e) => {
              setActiveId(id);
              setResponseText(e.target.value);
            }}
            rows={3}
            placeholder="Write your reply to the employee..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond(id, type, 'resolved')}
              disabled={submitting || activeId !== id || !responseText.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Reply & Resolve'}
            </button>
            <button
              onClick={() => handleRespond(id, type, 'in-progress')}
              disabled={submitting || activeId !== id || !responseText.trim()}
              className="px-3 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Reply & Mark In Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const openFeedback = feedbackRequests.filter((r) => r.status === 'open').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">View and respond to employee help requests and feedback requests</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'open', 'in-progress', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('tickets')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'tickets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Contact HR ({tickets.length}{openTickets > 0 ? ` · ${openTickets} open` : ''})
        </button>
        <button
          onClick={() => setTab('feedback')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'feedback' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Feedback Requests ({feedbackRequests.length}{openFeedback > 0 ? ` · ${openFeedback} open` : ''})
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse h-32 bg-gray-100 rounded" />
      ) : tab === 'tickets' ? (
        tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
            No help & support tickets from employees yet
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) =>
              renderItem(
                ticket._id,
                'tickets',
                ticket.subject,
                `${ticket.employee?.user?.name || 'Employee'} · ${ticket.employee?.user?.email || ''} · ${ticket.category} · ${new Date(ticket.createdAt).toLocaleString()}`,
                ticket.message,
                ticket.status,
                ticket.hrResponse,
                ticket.respondedAt
              )
            )}
          </div>
        )
      ) : feedbackRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          No feedback requests from employees yet
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackRequests.map((req) =>
            renderItem(
              req._id,
              'feedback',
              req.requestType,
              `${req.employee?.user?.name || 'Employee'} · ${req.employee?.user?.email || ''} · ${new Date(req.createdAt).toLocaleString()}`,
              req.message || '(No additional message)',
              req.status,
              req.hrResponse,
              req.respondedAt
            )
          )}
        </div>
      )}
    </div>
  );
}
