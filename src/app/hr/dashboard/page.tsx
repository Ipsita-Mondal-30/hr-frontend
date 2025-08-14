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
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🔍 Fetching HR dashboard data...");
        console.log("🔍 API base URL:", api.defaults.baseURL);
        
        // First check if we have authentication
        const authRes = await api.get("/auth/me");
        console.log("🔐 Current user:", authRes.data);
        
        // Then fetch dashboard data
        const res = await api.get("/admin/dashboard");
        console.log("✅ Dashboard data received:", res.data);
        setData(res.data);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error fetching HR dashboard data:", err);
        console.error("❌ Error response:", err.response?.data);
        console.error("❌ Error status:", err.response?.status);
        setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        console.log("🔐 Current User:", res.data);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.post('/debug/seed');
      // Refresh dashboard data
      const res = await api.get("/admin/dashboard");
      setData(res.data);
      alert('Sample data created successfully!');
    } catch (err: any) {
      console.error('Error seeding data:', err);
      alert('Failed to seed data: ' + (err.response?.data?.error || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const checkDatabaseData = async () => {
    try {
      const res = await api.get('/debug/data');
      console.log('Database data:', res.data);
      alert(`Database contains: ${res.data.jobsCount} jobs, ${res.data.applicationsCount} applications, ${res.data.usersCount} users`);
    } catch (err: any) {
      console.error('Error checking data:', err);
      alert('Failed to check database data');
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return (
    <div className="p-6">
      <div className="text-red-600 mb-4">Error: {error}</div>
      <div className="space-x-2">
        <button 
          onClick={checkDatabaseData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check Database
        </button>
        <button 
          onClick={handleSeedData}
          disabled={seeding}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {seeding ? 'Creating Sample Data...' : 'Create Sample Data'}
        </button>
      </div>
    </div>
  );
  if (!data) return <div className="p-6 text-red-600">Failed to load dashboard data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <div className="space-x-2">
          <button 
            onClick={checkDatabaseData}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Check DB
          </button>
          <button 
            onClick={handleSeedData}
            disabled={seeding}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={data.totalJobs} />
        <StatCard label="Open Jobs" value={data.openJobs} />
        <StatCard label="Closed Jobs" value={data.closedJobs} />
        <StatCard label="Total Applications" value={data.totalApplications} />
        <StatCard label="Avg Match Score" value={data.avgMatchScore ? data.avgMatchScore.toFixed(2) : '0'} />
      </div>

      {/* Recent Applications */}
      {data.recentApplications && data.recentApplications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {data.recentApplications.map((app) => (
              <div key={app._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{app.name}</div>
                  <div className="text-sm text-gray-600">{app.email}</div>
                  <div className="text-sm text-gray-500">{app.job?.title}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {app.matchScore ? `${app.matchScore}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message if no data */}
      {data.totalJobs === 0 && data.totalApplications === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">No Data Found</h3>
          <p className="text-yellow-700 mb-4">Your database appears to be empty. Would you like to create some sample data?</p>
          <button 
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {seeding ? 'Creating Sample Data...' : 'Create Sample Data'}
          </button>
        </div>
      )}
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
