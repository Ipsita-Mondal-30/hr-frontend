export interface InterviewReport {
  sessionId?: string;
  jobRole: string;
  prepScore: number;
  status: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  summary?: string;
  resources?: { title?: string; url?: string; type?: string }[];
  courses?: { title?: string; url?: string; platform?: string }[];
  questions?: { number: number; question: string; answer: string; evaluation?: string }[];
  completedAt?: string;
  emailSent?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listItems(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

export function generateReportHtml(
  report: InterviewReport,
  candidateName?: string,
  companyName?: string
): string {
  const date = report.completedAt
    ? new Date(report.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const statusColor =
    report.status === 'READY' ? '#059669' : report.status === 'NEEDS PRACTICE' ? '#f59e0b' : '#dc2626';

  const qaSection =
    report.questions && report.questions.length > 0
      ? `
    <div style="margin: 25px 0;">
      <h3 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Interview Q&amp;A</h3>
      ${report.questions
        .map(
          (q) => `
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #374151;">Q${q.number}: ${escapeHtml(q.question)}</p>
          <p style="margin: 0; color: #6b7280;"><strong>Your answer:</strong> ${escapeHtml(q.answer || 'No answer recorded')}</p>
          ${q.evaluation ? `<p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">Evaluation: ${escapeHtml(q.evaluation)}</p>` : ''}
        </div>`
        )
        .join('')}
    </div>`
      : '';

  const resourcesSection =
    report.resources && report.resources.length > 0
      ? `
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0284c7;">
      <h3 style="color: #0369a1; margin-top: 0;">Recommended Resources</h3>
      <ul style="line-height: 1.8;">${report.resources.map((r) => `<li><a href="${escapeHtml(r.url || '#')}">${escapeHtml(r.title || 'Resource')}</a>${r.type ? ` (${escapeHtml(r.type)})` : ''}</li>`).join('')}</ul>
    </div>`
      : '';

  const coursesSection =
    report.courses && report.courses.length > 0
      ? `
    <div style="background: #fdf4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea;">
      <h3 style="color: #7e22ce; margin-top: 0;">Recommended Courses</h3>
      <ul style="line-height: 1.8;">${report.courses.map((c) => `<li><a href="${escapeHtml(c.url || '#')}">${escapeHtml(c.title || 'Course')}</a>${c.platform ? ` — ${escapeHtml(c.platform)}` : ''}</li>`).join('')}</ul>
    </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Interview Prep Report — ${escapeHtml(report.jobRole)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #374151; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0 0 8px;">Interview Prep Report</h1>
    <p style="margin: 0; opacity: 0.9;">${escapeHtml(report.jobRole)}${companyName ? ` — ${escapeHtml(companyName)}` : ''}</p>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; color: #6b7280;">
    ${candidateName ? `<span><strong>Candidate:</strong> ${escapeHtml(candidateName)}</span>` : '<span></span>'}
    <span><strong>Date:</strong> ${date}</span>
  </div>

  <div style="text-align: center; background: #f8fafc; padding: 30px; border-radius: 12px; border: 2px solid ${statusColor}; margin-bottom: 30px;">
    <div style="font-size: 56px; font-weight: bold; color: #667eea;">${report.prepScore}</div>
    <div style="color: #6b7280; margin-bottom: 12px;">out of 100</div>
    <div style="display: inline-block; background: ${statusColor}; color: white; padding: 10px 28px; border-radius: 50px; font-weight: bold;">${escapeHtml(report.status)}</div>
  </div>

  ${report.summary ? `<div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #3b82f6;"><strong>Summary:</strong> ${escapeHtml(report.summary)}</div>` : ''}

  <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
    <h3 style="color: #059669; margin-top: 0;">Strengths</h3>
    <ul style="line-height: 1.8;">${listItems(report.strengths)}</ul>
  </div>

  <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
    <h3 style="color: #d97706; margin-top: 0;">Areas to Improve</h3>
    <ul style="line-height: 1.8;">${listItems(report.weaknesses)}</ul>
  </div>

  <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
    <h3 style="color: #2563eb; margin-top: 0;">Actionable Tips</h3>
    <ul style="line-height: 1.8;">${listItems(report.improvementTips)}</ul>
  </div>

  ${qaSection}
  ${resourcesSection}
  ${coursesSection}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 13px;">
    Generated by Talora Interview Prep &bull; ${date}
  </div>
</body>
</html>`;
}

export function downloadInterviewReport(
  report: InterviewReport,
  candidateName?: string,
  companyName?: string
): void {
  const html = generateReportHtml(report, candidateName, companyName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeRole = report.jobRole.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.href = url;
  link.download = `interview-prep-report-${safeRole}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
