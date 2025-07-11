'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Application } from '@/types';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        setApplication(res.data);
      } catch (err) {
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchApplication();
  }, [id]);

  // Ensure applicationId is defined or remove this line if not needed
  const applicationId = ''; // Replace with actual application ID
  useEffect(() => {
    const updateApplicationStatus = async () => {
      try {
        await api.put(`/applications/${applicationId}/status`, {
          status: '', // Replace with the desired status value
        });
      } catch (err) {
        console.error('Error updating application status:', err);
      }
    };

    if (applicationId) updateApplicationStatus();
  }, [applicationId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!application) return <div className="p-6">Application not found.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Application Details</h1>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold text-lg mb-2">Candidate Info</h2>
        <p><strong>Name:</strong> {application.candidate?.name}</p>
        <p><strong>Email:</strong> {application.candidate?.email}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold text-lg mb-2">Job Info</h2>
        <p><strong>Title:</strong> {application.job?.title}</p>
        <p><strong>Department:</strong> {application.job?.department.name}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold text-lg mb-2">Application Details</h2>
        <p><strong>Status:</strong> {application.status}</p>
        <p><strong>Match Score:</strong> {application.matchScore}%</p>
        <p><strong>Resume:</strong></p>
        <pre className="bg-gray-100 p-2 mt-2 whitespace-pre-wrap rounded text-sm">
          {application.resume}
        </pre>
      </div>
    </div>
  );
}
