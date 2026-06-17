'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  HelpCircle,
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  Mail,
  FileText,
  DollarSign,
  BookOpen
} from 'lucide-react';

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
  status: string;
  hrResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

const FAQ = [
  {
    q: 'How do I view my payslip?',
    a: 'Go to Payroll in the sidebar. Approved and paid payslips can be viewed and downloaded as PDF, including an official version with a company stamp.'
  },
  {
    q: 'How do I request feedback from my manager or HR?',
    a: 'Use Request Feedback under Quick Actions, or visit the Feedback section. HR will be notified and can schedule a review.'
  },
  {
    q: 'Who do I contact about payroll issues?',
    a: 'Submit a support ticket below with category "Payroll". HR typically responds within 1–2 business days.'
  },
  {
    q: 'How do I update my profile or resume?',
    a: 'Open My Profile to update skills or upload your resume. HR and Admin are notified when you upload a new resume.'
  }
];

export default function EmployeeHelpPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: 'other',
    priority: 'medium',
    message: ''
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees/me/support-tickets');
      setTickets(res.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/employees/me/support-tickets', form);
      setSubmitted(true);
      setForm({ subject: '', category: 'other', priority: 'medium', message: '' });
      await fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit support request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-blue-600" />
          Help & Support
        </h1>
        <p className="text-gray-600 mt-1">Get help from HR — submit a request and track responses here</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/employee/feedback/request" className="bg-white border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <MessageCircle className="w-5 h-5 text-blue-600 mb-2" />
          <div className="font-medium text-gray-900">Request Feedback</div>
          <div className="text-sm text-gray-500">Ask for a performance review</div>
        </Link>
        <Link href="/employee/payroll" className="bg-white border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <DollarSign className="w-5 h-5 text-green-600 mb-2" />
          <div className="font-medium text-gray-900">Payroll Help</div>
          <div className="text-sm text-gray-500">View payslips & salary</div>
        </Link>
        <Link href="/employee/profile" className="bg-white border rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
          <FileText className="w-5 h-5 text-purple-600 mb-2" />
          <div className="font-medium text-gray-900">Profile & Resume</div>
          <div className="text-sm text-gray-500">Update your information</div>
        </Link>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="font-medium text-gray-900">{item.q}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Submit ticket */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Contact HR
        </h2>

        {submitted && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Request submitted</p>
              <p className="text-sm text-green-700">HR has been notified and will respond here.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              placeholder="Brief summary of your issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="payroll">Payroll</option>
                <option value="benefits">Benefits</option>
                <option value="leave">Leave & Time Off</option>
                <option value="it">IT / System Access</option>
                <option value="hr-policy">HR Policy</option>
                <option value="workplace">Workplace Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={5}
              placeholder="Describe your question or issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit to HR'}
          </button>
        </form>
      </div>

      {/* My tickets */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          My Support Requests
        </h2>

        {loading ? (
          <div className="animate-pulse h-24 bg-gray-100 rounded" />
        ) : tickets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No support requests yet. Submit one above if you need help from HR.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="border rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 capitalize">
                      {ticket.category.replace('-', ' ')} · {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                {ticket.hrResponse && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-1">HR Response</p>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{ticket.hrResponse}</p>
                    {ticket.respondedAt && (
                      <p className="text-xs text-blue-600 mt-1">
                        {new Date(ticket.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
