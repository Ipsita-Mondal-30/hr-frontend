import type { Application } from '@/types';
import type { ResumeAnalysisData } from '@/components/applications/ResumeAnalysisPanel';

function hasNumericScore(value?: number) {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

export function hasAtsScores(
  a?: {
    overallScore?: number;
    atsScore?: number;
    skillMatchScore?: number;
    experienceScore?: number;
  } | null
) {
  return Boolean(
    a &&
      (hasNumericScore(a.overallScore) ||
        hasNumericScore(a.atsScore) ||
        hasNumericScore(a.skillMatchScore) ||
        hasNumericScore(a.experienceScore))
  );
}

export function hasApplicationAnalysis(app: Application): boolean {
  const a = app.atsAnalysis;
  const m = app.matchInsights;
  return Boolean(
    hasAtsScores(a) ||
      a?.strengths?.length ||
      a?.weaknesses?.length ||
      a?.recommendations?.length ||
      a?.bulletImprovements?.length ||
      a?.wordingSuggestions?.length ||
      a?.projectEnhancements?.length ||
      m?.strengths?.length ||
      m?.improvements?.length ||
      m?.actionPlan?.length ||
      m?.resumeTips?.length ||
      m?.interviewTips?.length ||
      (m?.explanation && m.explanation.length > 40)
  );
}

export function toResumeAnalysisData(app: Application): ResumeAnalysisData {
  const a = app.atsAnalysis;
  const m = app.matchInsights;
  const useAts = hasAtsScores(a);

  return {
    atsAnalysis: useAts ? a : undefined,
    scores: useAts
      ? {
          overallScore: a?.overallScore,
          atsScore: a?.atsScore,
          skillMatchScore: a?.skillMatchScore,
          experienceScore: a?.experienceScore,
          keywordCoverage: a?.keywordCoverage,
        }
      : m?.matchScore != null
        ? { overallScore: m.matchScore }
        : app.matchScore != null
          ? { overallScore: app.matchScore }
          : undefined,
    parsedResume: app.parsedResume,
    missingSkills: a?.missingSkills?.length ? a.missingSkills : m?.missingSkills,
    strengths: a?.strengths?.length ? a.strengths : m?.strengths,
    weaknesses: a?.weaknesses?.length ? a.weaknesses : m?.improvements,
    recommendations: a?.recommendations?.length ? a.recommendations : m?.actionPlan,
    bulletImprovements: a?.bulletImprovements?.length ? a.bulletImprovements : m?.resumeTips,
    wordingSuggestions: a?.wordingSuggestions?.length ? a.wordingSuggestions : m?.interviewTips,
    projectEnhancements: a?.projectEnhancements?.length ? a.projectEnhancements : m?.projectEnhancements,
  };
}
