'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Employee {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department: {
    name: string;
  };
}

type FeedbackType = 'performance' | 'peer' | 'self';

function isAxiosLikeError(e: unknown): e is { response?: { data?: unknown } } {
  return typeof e === 'object' && e !== null && 'response' in e;
}

export default function GiveFeedbackPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    feedback: '',
    ratings: {
      communication: 5,
      teamwork: 5,
      technical: 5,
      leadership: 5,
      initiative: 5,
    },
    type: 'performance' as FeedbackType,
    isAnonymous: false,
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        console.log('🔍 Fetching employee data for feedback:', employeeId);
        const response = await api.get<Employee>(`/hr/employees/${employeeId}`);
        console.log('✅ Employee data received:', response.data);
        setEmployee(response.data);
      } catch (error: unknown) {
        console.error('❌ Error fetching employee:', error);
        if (isAxiosLikeError(error)) {
          console.error('❌ Error details:', error.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const handleRatingChange = (category: keyof typeof formData.ratings, rating: number) => {
    setFormData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/feedback`, {
        employee: employeeId,
        content: formData.feedback,
        ratings: formData.ratings,
        type: formData.type,
        isAnonymous: formData.isAnonymous,
      });

      alert('Feedback submitted successfully!');
      router.push('/hr/performance');
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">The employee could not be found.</p>
        <button
          onClick={() => router.push('/hr/performance')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Performance
        </button>
      </div>
    );
  }

  const ratingCategories = [
    { key: 'communication', label: 'Communication', description: 'Clarity and effectiveness in communication' },
    { key: 'teamwork', label: 'Teamwork', description: 'Collaboration and team contribution' },
    { key: 'technical', label: 'Technical Skills', description: 'Job-related technical competencies' },
    { key: 'leadership', label: 'Leadership', description: 'Leadership qualities and initiative' },
    { key: 'initiative', label: 'Initiative', description: 'Proactiveness and problem-solving' },
  ] as const;

  const renderStars = (category: keyof typeof formData.ratings, currentRating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(category, star)}
            className={`text-2xl ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Give Feedback to {employee.user?.name || 'Unknown Employee'}</h1>
        <p className="text-gray-600">
          {employee.position || 'Unknown Position'} • {employee.department?.name || 'No Department'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Feedback Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'performance', label: 'Performance Review', description: 'Formal performance evaluation' },
              { value: 'peer', label: 'Peer Feedback', description: 'Colleague-to-colleague feedback' },
              { value: 'self', label: 'Self Assessment', description: 'Employee self-evaluation' },
            ].map((type) => (
              <label key={type.value} className="relative">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as FeedbackType,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.type === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Ratings</h3>
          <div className="space-y-6">
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{category.label}</h4>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="ml-6">
                  {renderStars(
                    category.key as keyof typeof formData.ratings,
                    formData.ratings[category.key as keyof typeof formData.ratings]
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Written Feedback */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Written Feedback</h3>
          <textarea
            value={formData.feedback}
            onChange={(e) => setFormData((prev) => ({ ...prev, feedback: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed feedback about the employee&apos;s performance, strengths, areas for improvement, and any specific examples..."
            required
          />
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Options</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">Submit as anonymous feedback</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/hr/performance')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}
