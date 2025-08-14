'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface SupportTicket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'account' | 'billing' | 'feature_request' | 'other';
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  messages: Array<{
    _id: string;
    message: string;
    sender: {
      name: string;
      role: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const endpoint = filter === 'all' ? '/admin/support/tickets' : `/admin/support/tickets?status=${filter}`;
      const res = await api.get(endpoint);
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/status`, { status });
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? { ...ticket, status: status as any } : ticket
      ));
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
      alert('Ticket status updated successfully');
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      alert('Failed to update ticket status');
    }
  };

  const assignTicket = async (ticketId: string, adminId: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/assign`, { adminId });
      // Refresh tickets to get updated assignment info
      fetchTickets();
      alert('Ticket assigned successfully');
    } catch (err) {
      console.error('Failed to assign ticket:', err);
      alert('Failed to assign ticket');
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await api.post(`/admin/support/tickets/${selectedTicket._id}/reply`, {
        message: replyMessage
      });
      
      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, res.data.message]
      });
      setReplyMessage('');
      alert('Reply sent successfully');
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support requests</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {tickets.filter(t => t.status === 'open').length}
          </div>
          <div className="text-sm text-gray-600">Open Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {tickets.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {tickets.filter(t => t.priority === 'urgent').length}
          </div>
          <div className="text-sm text-gray-600">Urgent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedTicket?._id === ticket._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">#{ticket.ticketNumber}</h3>
                      <p className="text-sm text-gray-600 truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">{ticket.user.name} ({ticket.user.email})</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {ticket.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎫</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-500">No support tickets match your current filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="bg-white rounded-lg shadow-sm border">
          {selectedTicket ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      #{selectedTicket.ticketNumber}
                    </h2>
                    <p className="text-gray-600">{selectedTicket.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket._id, e.target.value)}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>User:</strong> {selectedTicket.user.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedTicket.user.email}
                  </div>
                  <div>
                    <strong>Priority:</strong>{' '}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedTicket.category.replace('_', ' ')}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Updated:</strong> {new Date(selectedTicket.updatedAt).toLocaleString()}
                  </div>
                </div>

                {/* Original Message */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Original Message</h3>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Messages */}
                {selectedTicket.messages.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Conversation</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedTicket.messages.map((message) => (
                        <div
                          key={message._id}
                          className={`p-3 rounded-md ${
                            message.sender.role === 'admin' 
                              ? 'bg-blue-50 ml-4' 
                              : 'bg-gray-50 mr-4'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-medium text-gray-900">
                              {message.sender.name} ({message.sender.role})
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reply</h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={sendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm"
                    >
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">👈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Ticket</h3>
              <p className="text-gray-500">Choose a support ticket from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}