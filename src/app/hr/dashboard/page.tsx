"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function HRDashboardPage() {
  interface DashboardData {
    totalJobs: number;
    totalApplications: number;
    avgMatchScore: number;
    openJobs: number;
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

  if (loading) return <div className="p-6">Loading HR Dashboard...</div>;
  if (!data) return <div className="p-6">No data available</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">HR Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={data.totalJobs} />
        <StatCard label="Applications Received" value={data.totalApplications} />
        <StatCard label="Avg Match Score" value={data.avgMatchScore?.toFixed(2) || "0.00"} />
        <StatCard label="Open Jobs" value={data.openJobs} />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Recent Applications</h2>
        <ul className="space-y-2">
          {data.recentApplications?.map((app: any) => (
            <li key={app._id} className="p-3 border rounded-lg">
              <p className="font-semibold">{app.name}</p>
              <p className="text-sm text-gray-500">{app.email}</p>
              <p className="text-sm">Job: {app.job?.title || "-"}</p>
              <p className="text-sm">Match Score: {app.matchScore ?? "—"}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
