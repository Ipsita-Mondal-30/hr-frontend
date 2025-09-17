'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Star } from 'lucide-react';

interface Employee {
  _id: string;
  employeeId: string;
  user: {
    name: string;
    email: string;
  };
  position: string;
  department?: {
    name: string;
  };
}

export default function NewFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employee');
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'performance',
    content: '',
    ratings: {
      technical: 5,
      communication: 5,
      teamwork: 5,
      leadership: 5,
      problemSolving: 5,
      timeManagement: 5
    },
    isAnonymous: false,
    tags: [] as string[]
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    } else {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/hr/employees/${employeeId}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      alert('No employee selected');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        ...formData,
        employee: employeeId
      });
      
      alert('Feedback submitted successfully!');
      router.push('/hr/employees');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employeeId || !employee) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-4">Please select a valid employee to give feedback.</p>
        <button
          onClick={() => router.push('/hr/employees')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Give Feedback to {employee.user?.name || 'Unknown Employee'}
        </h1>
        <p className="text-gray-600">
          {employee.position || 'Unknown Position'} • {employee.department?.name || 'No Department'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Feedback Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Type</h3>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="performance">Performance Review</option>
            <option value="peer">Peer Feedback</option>
            <option value="general">General Feedback</option>
          </select>
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Ratings</h3>
          <div className="space-y-4">
            {Object.entries(formData.ratings).map(([category, rating]) => (
              <div key={category} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingChange(category, value)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        rating >= value
                          ? 'bg-yellow-400 border-yellow-400 text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      <Star size={16} fill={rating >= value ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Feedback</h3>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Provide detailed feedback about the employee's performance, strengths, and areas for improvement..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Anonymous Option */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Submit this feedback anonymously</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}