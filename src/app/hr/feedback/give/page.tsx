'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

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

export default function GiveFeedbackPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
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
      alert('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      await api.post('/feedback', {
        ...formData,
        employee: selectedEmployee
      });
      
      alert('Feedback submitted successfully!');
      router.push('/hr/employees');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
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

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Give Employee Feedback</h1>
          <p className="text-gray-600">Provide constructive feedback to help employees grow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Select Employee</h2>
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

          {/* Feedback Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Feedback Type</h2>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="performance">Performance Review</option>
              <option value="project">Project Feedback</option>
              <option value="general">General Feedback</option>
              <option value="improvement">Areas for Improvement</option>
            </select>
          </div>

          {/* Ratings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Performance Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className={`w-8 h-8 rounded-full ${
                          rating >= value
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600'
                        } hover:bg-yellow-300 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Content */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Detailed Feedback</h2>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Provide detailed feedback about the employee's performance, achievements, and areas for improvement..."
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Options */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Options</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Submit as anonymous feedback</span>
            </label>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}