'use client';

export interface EmployeeAIInsights {
  summary?: string;
  aiSource?: 'gemini' | 'cohere' | 'fallback' | 'ai';
  promotionReadiness?: {
    score?: number;
    reasons?: string[];
    nextSteps?: string[];
  };
  attritionRisk?: {
    score?: number;
    factors?: string[];
    mitigation?: string[];
  };
  strengths?: string[];
  improvementAreas?: string[];
  recommendations?: string[];
  lastAnalyzed?: string;
}

function sourceLabel(source?: string) {
  switch (source) {
    case 'gemini':
      return 'Powered by Gemini';
    case 'cohere':
      return 'Powered by Cohere';
    case 'fallback':
      return 'Rule-based fallback (AI unavailable)';
    default:
      return 'AI analysis';
  }
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function EmployeeAIInsightsPanel({
  insights,
  compact = false,
}: {
  insights: EmployeeAIInsights;
  compact?: boolean;
}) {
  const promo = insights.promotionReadiness?.score ?? 0;
  const risk = insights.attritionRisk?.score ?? 0;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
          Promo {promo}%
        </span>
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
          Risk {risk}%
        </span>
        {insights.lastAnalyzed && (
          <span className="text-gray-400 self-center">
            {new Date(insights.lastAnalyzed).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">AI Performance Analysis</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
          {sourceLabel(insights.aiSource)}
        </span>
      </div>

      {insights.summary && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-900 leading-relaxed">{insights.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium text-green-900">Promotion Readiness</h4>
            <span className="text-lg font-bold text-green-700">{promo}%</span>
          </div>
          <ScoreBar score={promo} color="bg-green-600" />
          {insights.promotionReadiness?.reasons?.length ? (
            <ul className="mt-3 text-sm text-green-800 space-y-1">
              {insights.promotionReadiness.reasons.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          ) : null}
          {insights.promotionReadiness?.nextSteps?.length ? (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-1">Next steps</p>
              <ul className="text-sm text-green-800 space-y-1">
                {insights.promotionReadiness.nextSteps.map((s, i) => (
                  <li key={i}>→ {s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium text-red-900">Attrition Risk</h4>
            <span className="text-lg font-bold text-red-700">{risk}%</span>
          </div>
          <ScoreBar score={risk} color="bg-red-500" />
          {insights.attritionRisk?.factors?.length ? (
            <ul className="mt-3 text-sm text-red-800 space-y-1">
              {insights.attritionRisk.factors.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          ) : null}
          {insights.attritionRisk?.mitigation?.length ? (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs font-semibold text-red-900 mb-1">Mitigation</p>
              <ul className="text-sm text-red-800 space-y-1">
                {insights.attritionRisk.mitigation.map((m, i) => (
                  <li key={i}>→ {m}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Strengths</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {(insights.strengths || []).map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Improvement Areas</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            {(insights.improvementAreas || []).map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>
      </div>

      {insights.recommendations?.length ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">HR Recommendations</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {insights.recommendations.map((r, i) => (
              <li key={i}>→ {r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {insights.lastAnalyzed && (
        <p className="text-xs text-gray-500">
          Last analyzed: {new Date(insights.lastAnalyzed).toLocaleString()}
        </p>
      )}
    </div>
  );
}
