'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Application } from '@/types';

const ITEMS_PER_PAGE = 5;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter + Sort Logic
  const filteredApplications = applications
    .filter((app) => {
      const term = searchTerm.toLowerCase();
      return (
        app.candidate?.name.toLowerCase().includes(term) ||
        app.candidate?.email.toLowerCase().includes(term) ||
        app.job?.title.toLowerCase().includes(term)
      );
    })
    .filter((app) =>
      selectedDept ? app.job?.department.name === selectedDept : true
    )
    .filter((app) =>
      selectedStatus ? app.status === selectedStatus : true
    )
    .sort((a, b) =>
      sortOrder === 'desc'
        ? (b.matchScore ?? 0) - (a.matchScore ?? 0)
        : (a.matchScore ?? 0) - (b.matchScore ?? 0)
    );

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginated = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">All Applications</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by candidate/job"
          className="border px-3 py-2 rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="border px-3 py-2 rounded"
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Departments</option>
          {[...new Set(applications.map(app => app.job?.department?.name))].map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 rounded"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {[...new Set(applications.map(app => app.status))].map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={() =>
            setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
          }
        >
          Sort Score: {sortOrder === 'desc' ? '⬇️' : '⬆️'}
        </button>
      </div>

      {/* Application Cards */}
      {loading ? (
        <p>Loading...</p>
      ) : paginated.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {paginated.map((app) => (
            <div
              key={app._id}
              className="p-4 bg-white rounded shadow space-y-2 border"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{app.candidate?.name}</p>
                  <p className="text-sm text-gray-600">{app.candidate?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">{app.job?.title}</p>
                  <p className="text-sm text-gray-500 italic">
                    {app.job?.department?.name}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-2 text-sm">
                <p className="text-gray-600">
                  Status: <span className="font-medium">{app.status}</span>
                </p>
                <p className="text-gray-600">
                  Match Score:{' '}
                  <span className="font-bold text-blue-600">{app.matchScore}%</span>
                </p>
              </div>

              <div className="text-right">
                <button
                  onClick={() => router.push(`/admin/applications/${app._id}`)}
                  className="text-blue-600 text-sm underline"
                >
                  View Full Application →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-full ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
