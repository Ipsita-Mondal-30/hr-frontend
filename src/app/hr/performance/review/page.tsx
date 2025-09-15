'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

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
  performanceScore: number;
}

export default function PerformanceReviewPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reviewPeriod: '',
    overallRating: 5,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    managerComments: '',
    ratings: {
      technical: 5,
      communication: 5,
      teamwork: 5,
      leadership: 5,
      problemSolving: 5,
      timeManagement: 5,
      initiative: 5,
      qualityOfWork: 5
    }
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/hr/employees');
      setEmployees(response.data?.employees || response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      showToast.warning('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      await api.post('/feedback', {
        type: 'performance_review',
        employee: selectedEmployee,
        content: `Performance Review - ${formData.reviewPeriod}

STRENGTHS:
${formData.strengths}

AREAS FOR IMPROVEMENT:
${formData.areasForImprovement}

GOALS FOR NEXT PERIOD:
${formData.goals}

MANAGER COMMENTS:
${formData.managerComments}`,
        ratings: formData.ratings,
        overallRating: formData.overallRating,
        reviewPeriod: formData.reviewPeriod
      });
      
      showToast.success('Performance review submitted successfully!');
      router.push('/hr/performance');
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast.error('Error submitting performance review');
    } finally {
      setLoading(false);
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

  const averageRating = Object.values(formData.ratings).reduce((sum, rating) => sum + rating, 0) / Object.keys(formData.ratings).length;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Performance Review</h1>
          <p className="text-gray-600">Conduct comprehensive performance evaluation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Employee & Review Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an employee...</option>
                  {Array.isArray(employees) && employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.user?.name || 'No Name'} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Period</label>
                <select
                  value={formData.reviewPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewPeriod: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select period...</option>
                  <option value="Q1 2024">Q1 2024</option>
                  <option value="Q2 2024">Q2 2024</option>
                  <option value="Q3 2024">Q3 2024</option>
                  <option value="Q4 2024">Q4 2024</option>
                  <option value="Annual 2024">Annual 2024</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Ratings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Performance Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData.ratings).map(([category, rating]) => (
                <div key={category} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRatingChange(category, value)}
                        className={`w-10 h-10 rounded-full ${
                          rating >= value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        } hover:bg-blue-400 transition-colors font-semibold`}
                      >
                        {value}
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                Average Rating: <span className="font-semibold">{averageRating.toFixed(1)}/5</span>
              </div>
            </div>
          </div>

          {/* Review Sections */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Review Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Strengths</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="Highlight the employee's key strengths and achievements..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement</label>
                <textarea
                  value={formData.areasForImprovement}
                  onChange={(e) => setFormData(prev => ({ ...prev, areasForImprovement: e.target.value }))}
                  placeholder="Identify areas where the employee can improve..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goals for Next Period</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="Set specific, measurable goals for the next review period..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manager Comments</label>
                <textarea
                  value={formData.managerComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerComments: e.target.value }))}
                  placeholder="Additional comments and recommendations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Overall Performance Rating</h2>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, overallRating: value }))}
                  className={`w-16 h-16 rounded-full ${
                    formData.overallRating >= value
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  } hover:bg-green-400 transition-colors font-bold text-lg`}
                >
                  {value}
                </button>
              ))}
              <div className="ml-4">
                <div className="text-lg font-semibold">{formData.overallRating}/5</div>
                <div className="text-sm text-gray-600">
                  {formData.overallRating >= 5 ? 'Outstanding' :
                   formData.overallRating >= 4 ? 'Exceeds Expectations' :
                   formData.overallRating >= 3 ? 'Meets Expectations' :
                   formData.overallRating >= 2 ? 'Below Expectations' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}