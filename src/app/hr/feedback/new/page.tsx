'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
}

export default function NewFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employee');
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeId || '');
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
      showToast.error('Failed to fetch employees');
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
        ...formData,
        employee: selectedEmployee
      });
      
      showToast.success('Feedback submitted successfully!');
      router.push('/hr/employees');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast.error('Error submitting feedback');
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
          <h1 className="text-2xl font-bold text-gray-900">New Employee Feedback</h1>
          <p className="text-gray-600">Provide constructive feedback to help employees grow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Select Employee</h2>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.user?.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Feedback Type</h2>
            <div className="grid grid-cols-3 gap-4">
              {['performance', 'project', 'general'].map((type) => (
                <div
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`p-4 border rounded-lg cursor-pointer text-center transition-colors ${formData.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <div className="font-medium capitalize">{type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Performance Ratings</h2>
            <div className="space-y-4">
              {Object.entries(formData.ratings).map(([category, rating]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</label>
                    <span className="text-blue-600 font-medium">{rating}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => handleRatingChange(category, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Content */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Feedback Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Detailed Feedback</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide specific examples and constructive feedback..."
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="anonymous">Submit anonymously</label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 mr-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}