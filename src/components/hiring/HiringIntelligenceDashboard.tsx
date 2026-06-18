'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Briefcase,
  Building2,
  TrendingUp,
  DollarSign,
  MapPin,
  RefreshCw,
  Sparkles,
  Upload,
  Loader2,
  Wifi,
  WifiOff,
  Target,
} from 'lucide-react';

interface HiringDashboardData {
  overview: {
    totalJobs: number;
    totalCompanies: number;
    totalSkillsTracked: number;
    avgSalary: number;
    remoteCount: number;
    onsiteCount: number;
  };
  topCompanies: { company: string; count: number }[];
  topSkills: { skill: string; count: number; growthPct: number }[];
  emergingTechnologies: { skill: string; count: number; growthPct: number }[];
  fastestGrowingTechnologies: { skill: string; count: number; growthPct: number }[];
  jobsByLocation: { location: string; count: number }[];
  remoteVsOnsite: { remote: number; onsite: number; remotePct: number };
  skillTrends: { month: string; totalJobs: number; topSkill: string; topSkillCount: number }[];
  hiringTrend: { month: string; jobs: number; companies: number }[];
  salaryTrend: { month: string; avgSalary: number }[];
  salaryByRole: { role: string; avgSalary: number; count: number }[];
  salaryByCity: { city: string; avgSalary: number; count: number }[];
  highestPayingSkills: { skill: string; avgSalary: number; count: number }[];
  needsSync?: boolean;
  lastUpdated?: string;
}

interface HiringInsights {
  summary: string;
  bulletPoints: string[];
  skillHighlights: { skill: string; changePct: number }[];
  locationHighlights: string[];
  recommendations: string[];
  source?: string;
  generatedAt?: string;
}

interface MatchResult {
  candidateSkills: string[];
  overallMatchScore: number;
  recommendedJobs: Array<{
    jobId: string;
    title: string;
    company: string;
    location: string;
    matchScore: number;
    missingSkills: string[];
    matchedSkills: string[];
    avgSalary: number | null;
    isRemote: boolean;
    sourceUrl?: string;
  }>;
  missingSkills: { skill: string; count: number }[];
}

function formatSalary(amount: number) {
  if (!amount) return 'N/A';
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function BarChart({
  data,
  labelKey,
  valueKey,
  color = 'bg-indigo-500',
  maxItems = 10,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
  maxItems?: number;
}) {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const label = String(item[labelKey] || '');
        return (
          <div key={i}>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span className="truncate max-w-[70%]">{label}</span>
              <span className="font-medium">{val.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(val / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function HiringIntelligenceDashboard({
  role,
  title = 'AI Hiring Intelligence',
  subtitle = 'Real-time market trends powered by Adzuna & Gemini AI',
}: {
  role: 'admin' | 'hr' | 'candidate';
  title?: string;
  subtitle?: string;
}) {
  const [data, setData] = useState<HiringDashboardData | null>(null);
  const [insights, setInsights] = useState<HiringInsights | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<HiringDashboardData>('/hiring/dashboard?autoSync=true');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load hiring intelligence data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async (refresh = false) => {
    setInsightsLoading(true);
    try {
      const res = await api.get<HiringInsights>(`/hiring/insights${refresh ? '?refresh=true' : ''}`);
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchInsights();
  }, [fetchDashboard, fetchInsights]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/hiring/sync', { maxPages: 2 });
      await fetchDashboard();
      await fetchInsights(true);
    } catch (err) {
      console.error(err);
      alert('Sync failed. Check Adzuna API credentials and backend logs.');
    } finally {
      setSyncing(false);
    }
  };

  const handleResumeMatch = async (file: File) => {
    setMatching(true);
    setMatchResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post<MatchResult>('/hiring/match', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMatchResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Resume matching failed. Upload a valid PDF.');
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{subtitle}</p>
          {data?.lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last synced: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { fetchDashboard(); fetchInsights(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {role === 'admin' && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              {syncing ? 'Syncing Adzuna…' : 'Sync Market Jobs'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>
      )}

      {data?.needsSync && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          No market jobs in database yet.
          {role === 'admin'
            ? ' Click "Sync Market Jobs" to fetch live listings from Adzuna.'
            : ' Ask an admin to sync market data, or check back shortly.'}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={overview?.totalJobs?.toLocaleString() || 0} icon={Briefcase} color="bg-blue-500" />
        <StatCard label="Total Companies" value={overview?.totalCompanies?.toLocaleString() || 0} icon={Building2} color="bg-purple-500" />
        <StatCard label="Skills Tracked" value={overview?.totalSkillsTracked?.toLocaleString() || 0} icon={Target} color="bg-emerald-500" />
        <StatCard label="Avg Salary" value={formatSalary(overview?.avgSalary || 0)} icon={DollarSign} color="bg-orange-500" />
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Market Insights</h2>
            {insights?.source && (
              <span className="text-xs bg-white px-2 py-0.5 rounded-full text-indigo-600 border border-indigo-200">
                {insights.source === 'gemini' ? 'Gemini AI' : 'Analytics'}
              </span>
            )}
          </div>
          {insightsLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
        </div>
        {insights ? (
          <div className="space-y-4">
            <p className="text-gray-800 leading-relaxed">{insights.summary}</p>
            <ul className="space-y-2">
              {insights.bulletPoints?.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 font-bold">→</span>
                  {point}
                </li>
              ))}
            </ul>
            {insights.recommendations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-indigo-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Recruiter Recommendations</h3>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-600">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Generating AI insights…</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 20 In-Demand Skills</h2>
          <BarChart data={data?.topSkills || []} labelKey="skill" valueKey="count" color="bg-indigo-500" maxItems={20} />
        </div>

        {/* Fastest Growing */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fastest Growing Technologies</h2>
          <div className="space-y-2">
            {(data?.fastestGrowingTechnologies || []).slice(0, 10).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-900">{item.skill}</span>
                <span className={`text-sm font-semibold ${item.growthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.growthPct >= 0 ? '+' : ''}{item.growthPct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Hiring Companies</h2>
          <BarChart data={data?.topCompanies || []} labelKey="company" valueKey="count" color="bg-purple-500" />
        </div>

        {/* Location Heatmap */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Jobs by Location</h2>
          </div>
          <BarChart data={data?.jobsByLocation || []} labelKey="location" valueKey="count" color="bg-red-400" />
        </div>

        {/* Remote vs Onsite */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Remote vs Onsite</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <Wifi className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{data?.remoteVsOnsite?.remote || 0}</p>
              <p className="text-sm text-green-600">Remote / Hybrid</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <WifiOff className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{data?.remoteVsOnsite?.onsite || 0}</p>
              <p className="text-sm text-blue-600">Onsite</p>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${data?.remoteVsOnsite?.remotePct || 0}%` }}
            />
            <div className="bg-blue-500 h-full flex-1" />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {data?.remoteVsOnsite?.remotePct || 0}% remote/hybrid
          </p>
        </div>

        {/* Salary by Role */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Salary by Role</h2>
          <div className="space-y-2">
            {(data?.salaryByRole || []).slice(0, 8).map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-700 truncate max-w-[60%]">{item.role}</span>
                <span className="font-semibold text-gray-900">{formatSalary(item.avgSalary)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary by City */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Salary by City</h2>
          <div className="space-y-2">
            {(data?.salaryByCity || []).slice(0, 8).map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-700">{item.city}</span>
                <span className="font-semibold text-gray-900">{formatSalary(item.avgSalary)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Paying Skills */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Highest Paying Skills</h2>
          <BarChart
            data={(data?.highestPayingSkills || []).map((s) => ({ skill: s.skill, avgSalary: s.avgSalary }))}
            labelKey="skill"
            valueKey="avgSalary"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trend</h2>
          <BarChart data={data?.hiringTrend || []} labelKey="month" valueKey="jobs" color="bg-blue-500" maxItems={12} />
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skill Demand Trend</h2>
          <BarChart data={data?.skillTrends || []} labelKey="month" valueKey="topSkillCount" color="bg-indigo-500" maxItems={12} />
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Trend</h2>
          <BarChart data={data?.salaryTrend || []} labelKey="month" valueKey="avgSalary" color="bg-emerald-500" maxItems={12} />
        </div>
      </div>

      {/* Candidate Matching */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {role === 'candidate' ? 'Match Your Resume to Market Jobs' : 'Candidate–Job Matching'}
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Upload a resume PDF to extract skills and find the best matching jobs from live market data.
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm cursor-pointer hover:bg-indigo-700">
          {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {matching ? 'Analyzing…' : 'Upload Resume PDF'}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={matching}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleResumeMatch(file);
            }}
          />
        </label>

        {matchResult && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="bg-indigo-50 rounded-lg px-4 py-3 border border-indigo-100">
                <p className="text-xs text-indigo-600">Overall Match</p>
                <p className="text-2xl font-bold text-indigo-700">{matchResult.overallMatchScore}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border flex-1 min-w-[200px]">
                <p className="text-xs text-gray-500 mb-1">Your Skills</p>
                <div className="flex flex-wrap gap-1">
                  {matchResult.candidateSkills.slice(0, 12).map((s) => (
                    <span key={s} className="text-xs bg-white border px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {matchResult.missingSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-2">Top Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missingSkills.map((s) => (
                    <span key={s.skill} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded">
                      {s.skill} ({s.count} jobs)
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Jobs</h3>
              <div className="space-y-3">
                {matchResult.recommendedJobs.map((job) => (
                  <div key={job.jobId} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-600">{job.company} · {job.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm font-bold rounded">
                          {job.matchScore}% match
                        </span>
                        {job.avgSalary && (
                          <p className="text-xs text-gray-500 mt-1">{formatSalary(job.avgSalary)}</p>
                        )}
                      </div>
                    </div>
                    {job.missingSkills.length > 0 && (
                      <p className="text-xs text-red-600 mt-2">
                        Missing: {job.missingSkills.slice(0, 5).join(', ')}
                      </p>
                    )}
                    {job.sourceUrl && (
                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                      >
                        View job posting →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
