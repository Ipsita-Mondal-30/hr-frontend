'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

interface Feedback {
  _id: string;
  type: string;
  content: string;
  overallRating: number;
  ratings: Record<string, number>;
  employee: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
    position: string;
  };
  reviewer: {
    name: string;
  };
  isAnonymous: boolean;
  createdAt: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback');
      setFeedback(response.data?.feedback || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback data');
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading feedback...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Employee Feedback</h1>
          <p className="text-gray-600">View and manage employee feedback</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/hr/feedback/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Feedback
          </Link>
          <Link
            href="/hr/feedback/give"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Give Feedback
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Feedback ({feedback.length})</h2>
        </div>

        {feedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No feedback found</p>
            <Link href="/hr/feedback/new" className="text-blue-600 hover:text-blue-800 text-sm">
              Give your first feedback →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div key={item._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {item.employee?.user?.name || 'Unknown Employee'}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {item.type}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <span className="mr-1">★</span>
                        <span className="text-sm font-medium">{item.overallRating}/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.employee?.position}</p>
                    <p className="text-gray-700">{item.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {item.isAnonymous ? 'Anonymous' : `By ${item.reviewer?.name}`} •{' '}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/hr/employees/${item.employee?._id}`}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    View Employee
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}