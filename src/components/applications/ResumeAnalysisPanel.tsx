'use client';

import { useMemo } from 'react';

export interface AtsScores {
  overallScore?: number;
  atsScore?: number;
  skillMatchScore?: number;
  experienceScore?: number;
  keywordCoverage?: number;
}

export interface ResumeAnalysisData {
  scores?: AtsScores;
  atsAnalysis?: AtsScores & {
    missingSkills?: string[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
    bulletImprovements?: string[];
    wordingSuggestions?: string[];
    projectEnhancements?: string[];
    improvedBullets?: string;
    analyzedAt?: string;
  };
  parsedResume?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    education?: string[];
    projects?: string[];
    experience?: string[];
  };
  missingSkills?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  bulletImprovements?: string[];
  wordingSuggestions?: string[];
  projectEnhancements?: string[];
  improvedBullets?: string;
  coverLetter?: string;
}

export interface AnalysisHistoryItem {
  _id: string;
  createdAt: string;
  scores: AtsScores;
  jobTitle?: string;
  companyName?: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function CircularScore({ label, score }: { label: string; score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getScoreColor(score)}
          strokeLinecap="round"
        />
      </svg>
      <div className="-mt-14 text-center">
        <div className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</div>
      </div>
      <p className="mt-4 text-sm text-gray-600 text-center">{label}</p>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${getBarColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ListSection({ title, items, tone }: { title: string; items?: string[]; tone: 'red' | 'green' | 'blue' | 'amber' }) {
  if (!items?.length) return null;
  const styles = {
    red: 'bg-red-50 text-red-800 border-red-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={`text-sm px-3 py-2 rounded border ${styles[tone]}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumeAnalysisPanel({
  data,
  history = [],
}: {
  data: ResumeAnalysisData;
  history?: AnalysisHistoryItem[];
}) {
  const analysis = data.atsAnalysis;
  const scores: AtsScores = {
    overallScore: analysis?.overallScore ?? data.scores?.overallScore ?? 0,
    atsScore: analysis?.atsScore ?? data.scores?.atsScore ?? 0,
    skillMatchScore: analysis?.skillMatchScore ?? data.scores?.skillMatchScore ?? 0,
    experienceScore: analysis?.experienceScore ?? data.scores?.experienceScore ?? 0,
    keywordCoverage: analysis?.keywordCoverage ?? data.scores?.keywordCoverage ?? 0,
  };

  const overall = scores.overallScore ?? 0;
  const ats = scores.atsScore ?? 0;

  const missingSkills = analysis?.missingSkills || data.missingSkills || [];
  const trend = useMemo(
    () =>
      [...history]
        .reverse()
        .map((h) => ({
          date: new Date(h.createdAt).toLocaleDateString(),
          score: h.scores?.overallScore ?? 0,
        })),
    [history]
  );

  if (!overall && !ats) {
    return (
      <div className="bg-gray-50 border border-dashed rounded-lg p-6 text-center text-gray-500">
        No ATS analysis available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">📊 ATS Resume Analysis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <CircularScore label="Overall Score" score={overall} />
          <CircularScore label="ATS Score" score={ats} />
          <CircularScore label="Skill Match" score={scores.skillMatchScore ?? 0} />
          <CircularScore label="Experience" score={scores.experienceScore ?? 0} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreBar label="Overall Score" score={overall} />
          <ScoreBar label="ATS Score" score={ats} />
          <ScoreBar label="Skill Match Score" score={scores.skillMatchScore ?? 0} />
          <ScoreBar label="Experience Score" score={scores.experienceScore ?? 0} />
          {typeof scores.keywordCoverage === 'number' && scores.keywordCoverage > 0 && (
            <ScoreBar label="Keyword Coverage" score={scores.keywordCoverage} />
          )}
        </div>
      </div>

      {data.parsedResume && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Parsed Resume Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {data.parsedResume.name && <p><strong>Name:</strong> {data.parsedResume.name}</p>}
            {data.parsedResume.email && <p><strong>Email:</strong> {data.parsedResume.email}</p>}
            {data.parsedResume.phone && <p><strong>Phone:</strong> {data.parsedResume.phone}</p>}
          </div>
          {data.parsedResume.skills?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {data.parsedResume.skills.map((s) => (
                <span key={s} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{s}</span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <ListSection title="❌ Missing Skills" items={missingSkills} tone="red" />
      <ListSection title="✅ Strengths" items={analysis?.strengths || data.strengths} tone="green" />
      <ListSection title="⚠️ Weaknesses" items={analysis?.weaknesses || data.weaknesses} tone="amber" />
      <ListSection title="💡 Recommendations" items={analysis?.recommendations || data.recommendations} tone="blue" />
      <ListSection title="📝 Bullet Improvements" items={analysis?.bulletImprovements || data.bulletImprovements} tone="blue" />
      <ListSection title="✍️ Wording Suggestions" items={analysis?.wordingSuggestions || data.wordingSuggestions} tone="amber" />
      <ListSection title="🚀 Project Enhancements" items={analysis?.projectEnhancements || data.projectEnhancements} tone="green" />

      {(analysis?.improvedBullets || data.improvedBullets) && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">AI Improved Resume Bullets</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-3 rounded">
            {analysis?.improvedBullets || data.improvedBullets}
          </pre>
        </div>
      )}

      {history.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📈 Score Trend Over Time</h3>
          <div className="flex items-end gap-2 h-32">
            {trend.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${getBarColor(point.score)}`}
                  style={{ height: `${Math.max(point.score, 8)}%` }}
                  title={`${point.date}: ${point.score}%`}
                />
                <span className="text-[10px] text-gray-500 rotate-45 origin-left">{point.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🕘 Analysis History</h3>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="flex justify-between items-center border rounded p-3 text-sm">
                <div>
                  <p className="font-medium">{item.jobTitle || 'Analysis'}</p>
                  <p className="text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className={`font-bold ${getScoreColor(item.scores?.overallScore ?? 0)}`}>
                  {item.scores?.overallScore ?? 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
