'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stats {
  jobsCount: number;
  applicationsCount: number;
  hrCount: number;
  candidateCount: number;
  departmentsCount: number;
  rolesCount: number;
  avgMatchScore: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Jobs" value={stats?.jobsCount} />
        <StatCard label="Applications Received" value={stats?.applicationsCount} />
        <StatCard label="Average Match Score" value={stats?.avgMatchScore} />

        <StatCard label="HRs" value={stats?.hrCount} />
        <StatCard label="Candidates" value={stats?.candidateCount} />
        <StatCard label="Departments" value={stats?.departmentsCount} />
        <StatCard label="Roles" value={stats?.rolesCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: number | string | undefined }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow text-center">
      <div className="text-lg font-medium text-gray-700">{label}</div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
    </div>
  );
}
