'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Job } from '@/types';
import { useRouter } from 'next/navigation';
import toast from '@/lib/toast';

export default function ApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    resume: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resume) return toast.warning('Please upload your resume');

    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('phone', form.phone);
    data.append('portfolio', form.portfolio);
    data.append('jobId', jobId as string);
    data.append('resume', form.resume);

    setSubmitting(true);
    try {
      await api.post('/applications', data);
      toast.success('Application submitted successfully! You will receive feedback soon.');
      router.push('/jobs');
    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading job...</div>;
  if (!job) return <div className="p-6">Job not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Apply for {job.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="portfolio"
          placeholder="Portfolio (optional)"
          value={form.portfolio}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          name="resume"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full"
          required
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${submitting ? 'opacity-50' : ''}`}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
