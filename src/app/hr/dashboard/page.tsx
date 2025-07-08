"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function HRDashboardPage() {
  interface DashboardData {
    totalJobs: number;
    totalApplications: number;
    avgMatchScore: number;
    openJobs: number;
    closedJobs: number;
    recentApplications: {
      _id: string;
      name: string;
      email: string;
      job?: { title: string };
      matchScore?: number;
    }[];
  }

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching HR dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await api.get('/auth/me');
      console.log("🔐 Current User:", res.data);
    };
    fetchUser();
  }, []);
  


if (loading) return <div className="p-6">Loading dashboard...</div>;
if (!data) return <div className="p-6 text-red-600">Failed to load dashboard data</div>;

return (
  <div className="p-6 space-y-6">
    <h1 className="text-2xl font-bold">HR Dashboard</h1>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <StatCard label="Total Jobs" value={data.totalJobs} />
      <StatCard label="Open Jobs" value={data.openJobs} />
      <StatCard label="Closed Jobs" value={data.closedJobs} />
      <StatCard label="Total Applications" value={data.totalApplications} />
      <StatCard label="Avg Match Score" value={data.avgMatchScore.toFixed(2)} />
    </div>

    {/* 🔜 Add Job Listings or Application Cards Below */}
  </div>
);
}

function StatCard({ label, value }: { label: string; value: string | number }) {
return (
  <div className="p-4 bg-white rounded-xl shadow-md text-center">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="text-xl font-semibold text-blue-700">{value}</div>
  </div>
);
}
