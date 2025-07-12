'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Application, Interview } from '@/types';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [form, setForm] = useState({
    applicationId: '',
    interviewer: '',
    scheduledAt: '',
  });

  const fetchData = async () => {
    const [appsRes, interviewsRes] = await Promise.all([
      api.get('/applications?status=shortlisted'),
      api.get('/interviews'),
    ]);
    setApplications(appsRes.data);
    setInterviews(interviewsRes.data);
  };

  const scheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.interviewer || !form.applicationId || !form.scheduledAt) {
        alert('Please fill in all fields.');
        return;
      }

      await api.post('/interviews', form);
      setForm({ applicationId: '', interviewer: '', scheduledAt: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    }
  };

  const generateQuestions = async (id: string) => {
    try {
      const res = await api.get(`/interviews/${id}/questions`);
      alert('Questions Generated:\n\n' + res.data.questions.join('\n'));
    } catch (err) {
      console.error('Question gen failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Interview Manager</h1>

      <form onSubmit={scheduleInterview} className="space-y-3 bg-gray-100 p-4 rounded">
        <h2 className="font-medium">Schedule Interview</h2>

        <select
          value={form.applicationId}
          onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Shortlisted Candidate</option>
          {applications.map((app) => (
            <option key={app._id} value={app._id}>
              {app.name} — {app.job?.title}
            </option>
          ))}
        </select>

        <input
          type="email"
          placeholder="Interviewer Email"
          value={form.interviewer}
          onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
          Schedule
        </button>
      </form>

      <div>
        <h2 className="font-medium mb-2">Scheduled Interviews</h2>
        {interviews.length === 0 ? (
          <p>No interviews yet.</p>
        ) : (
          <div className="space-y-3">
            {interviews.map((intv) => (
              <div key={intv._id} className="bg-white p-4 rounded shadow">
                <p>
                  <b>Candidate:</b> {intv.application?.name} — {intv.application?.job?.title}
                </p>
                <p>
                  <b>Scheduled:</b> {new Date(intv.scheduledAt).toLocaleString()}
                </p>
                <p>
                  <b>Interviewer:</b> {intv.interviewer}
                </p>
                <button
                  onClick={() => generateQuestions(intv._id)}
                  className="text-sm text-blue-600 underline mt-2"
                >
                  Generate AI Questions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
