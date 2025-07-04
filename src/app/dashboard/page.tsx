'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchStats();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">HR Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Jobs" value={data.totalJobs} />
        <StatCard label="Total Applications" value={data.totalApplications} />
        <StatCard label="Avg Match Score" value={data.avgMatchScore} />
        <StatCard label="Open Jobs" value={data.openJobs} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
