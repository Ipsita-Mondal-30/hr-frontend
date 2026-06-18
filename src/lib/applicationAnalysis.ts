import type { Application } from '@/types';
import type { ResumeAnalysisData } from '@/components/applications/ResumeAnalysisPanel';

export function hasApplicationAnalysis(app: Application): boolean {
  const a = app.atsAnalysis;
  const m = app.matchInsights;
  return Boolean(
    a?.overallScore ||
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

  return {
    atsAnalysis: a,
    scores: a
      ? {
          overallScore: a.overallScore,
          atsScore: a.atsScore,
          skillMatchScore: a.skillMatchScore,
          experienceScore: a.experienceScore,
          keywordCoverage: a.keywordCoverage,
        }
      : m?.matchScore != null
      ? { overallScore: m.matchScore }
      : app.matchScore != null
      ? { overallScore: app.matchScore }
      : undefined,
    parsedResume: app.parsedResume,
    missingSkills: a?.missingSkills || m?.missingSkills,
    strengths: a?.strengths || m?.strengths,
    weaknesses: a?.weaknesses || m?.improvements,
    recommendations: a?.recommendations || m?.actionPlan,
    bulletImprovements: a?.bulletImprovements || m?.resumeTips,
    wordingSuggestions: a?.wordingSuggestions || m?.interviewTips,
    projectEnhancements: a?.projectEnhancements || m?.projectEnhancements,
  };
}
