'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface TeamMemberPerformance {
  employee?: { user?: { name?: string }; position?: string };
  role?: string;
  contributionPercentage: number;
  hoursWorked: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  milestonesOverdue: number;
  submissionsApproved: number;
  submissionsPending: number;
  onTimeRate: number;
  performanceRating: string;
  performanceSummary: string;
}

interface PerformanceOverviewData {
  project: { name: string; completionPercentage: number; status: string };
  teamPerformance: TeamMemberPerformance[];
  milestonesSummary: { total: number; completed: number; inProgress: number; overdue: number };
  submissionsSummary: { total: number; pending: number; approved: number; rejected: number };
}

const ratingStyles: Record<string, string> = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  'needs-improvement': 'bg-orange-100 text-orange-800',
  'at-risk': 'bg-red-100 text-red-800',
};

export default function ProjectPerformanceOverview({
  projectId,
  compact = false,
  employeeOnly = false,
  employeeName,
}: {
  projectId: string;
  compact?: boolean;
  employeeOnly?: boolean;
  employeeName?: string;
}) {
  const [data, setData] = useState<PerformanceOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/projects/${projectId}/performance-overview`, { skipAuthRedirect: true })
      .then((res) => setData(res.data))
      .catch((e) => console.error('Performance overview failed:', e))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <p className="text-sm text-gray-500">Loading performance overview…</p>;
  if (!data) return null;

  let team = data.teamPerformance;
  if (employeeOnly && employeeName) {
    team = team.filter(
      (m) => m.employee?.user?.name?.toLowerCase() === employeeName.toLowerCase()
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-3">Performance Overview</h3>

      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-purple-50 rounded p-3 text-center">
            <div className="text-xl font-bold text-purple-600">{data.project.completionPercentage}%</div>
            <div className="text-xs text-purple-700">Project complete</div>
          </div>
          <div className="bg-green-50 rounded p-3 text-center">
            <div className="text-xl font-bold text-green-600">{data.milestonesSummary.completed}/{data.milestonesSummary.total}</div>
            <div className="text-xs text-green-700">Milestones done</div>
          </div>
          <div className="bg-orange-50 rounded p-3 text-center">
            <div className="text-xl font-bold text-orange-600">{data.submissionsSummary.pending}</div>
            <div className="text-xs text-orange-700">Pending reviews</div>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <div className="text-xl font-bold text-red-600">{data.milestonesSummary.overdue}</div>
            <div className="text-xs text-red-700">Overdue</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {team.map((member, i) => (
          <div key={i} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-medium text-gray-900">
                  {member.employee?.user?.name || 'Team member'}
                  <span className="ml-2 text-xs text-gray-500 capitalize">
                    {(member.role || 'member').replace('-', ' ')}
                  </span>
                </p>
                <p className="text-xs text-gray-500">{member.performanceSummary}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${ratingStyles[member.performanceRating] || ratingStyles.good}`}>
                {member.performanceRating.replace('-', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Contribution</span>
                <div className="font-semibold text-blue-600">{member.contributionPercentage}%</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Hours</span>
                <div className="font-semibold text-green-600">{member.hoursWorked}h</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Milestones</span>
                <div className="font-semibold">{member.milestonesCompleted}/{member.milestonesTotal}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">On-time</span>
                <div className="font-semibold">{member.onTimeRate}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
