'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface Job {
  _id: string;
  title: string;
  companyName?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  [key: string]: unknown;
}

interface JobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function isAxiosLikeError(e: unknown): e is { response?: { data?: { error?: string; message?: string } } } {
  return typeof e === 'object' && e !== null && 'response' in e;
}

export default function JobApplicationModal({ job, isOpen, onClose, onSuccess }: JobApplicationModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolio: '',
    linkedIn: '',
    github: '',
    expectedSalary: '',
    availableStartDate: '',
    whyInterested: '',
    phone: '',
    location: '',
    experience: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('jobId', job._id);

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });

      // Add resume file if provided
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const response = await api.post('/candidate/apply-with-resume', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Application submitted successfully:', response.data);
      alert('Application submitted successfully! You will receive a confirmation email shortly.');

      // Trigger refresh of parent component data
      onSuccess();
      onClose();

      // Refresh the page to update dashboard stats
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err: unknown) {
      console.error('Error applying to job:', err);
      const errorMessage = isAxiosLikeError(err)
        ? err.response?.data?.error || err.response?.data?.message || 'Error submitting application'
        : err instanceof Error
        ? err.message
        : 'Error submitting application';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Job Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.companyName}</p>
          <p className="text-sm text-gray-500">{job.location}</p>
          {typeof job.minSalary === 'number' && typeof job.maxSalary === 'number' && (
            <p className="text-sm text-gray-600 mt-1">
              ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
            </p>
          )}
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit}>
          {/* User Info Preview */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Your Information</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {user?.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user?.email}
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                This information will be used for the application. Update the profile to change these details.
              </p>
            </div>
          </div>

          {/* Contact & Professional Details */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Contact & Professional Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State/Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="8+">8+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                <input
                  type="text"
                  value={formData.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                  placeholder="e.g., $80,000 - $100,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Resume Upload *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
                id="resume-upload"
                required
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="text-gray-400 text-4xl mb-2">📄</div>
                <div className="text-sm text-gray-600">
                  {resumeFile ? (
                    <span className="text-green-600 font-medium">{resumeFile.name}</span>
                  ) : (
                    <>
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                      <br />
                      PDF, DOC, DOCX (max 5MB)
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Application Form Fields */}
          <div className="space-y-4 mb-6">
            {/* Why Interested */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Why are you interested in this position? *</label>
              <textarea
                value={formData.whyInterested}
                onChange={(e) => handleInputChange('whyInterested', e.target.value)}
                rows={3}
                placeholder="What attracts you to this role and company?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                rows={4}
                placeholder="Tell the employer what makes you a great fit for this position..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Portfolio & Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  placeholder="https://your-portfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  value={formData.linkedIn}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                <input
                  type="text"
                  value={formData.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                  placeholder="e.g., $80,000 - $100,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Available Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Start Date</label>
              <input
                type="date"
                value={formData.availableStartDate}
                onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
