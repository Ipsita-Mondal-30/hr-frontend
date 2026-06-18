'use client';

import { useState } from 'react';
import api from '@/lib/api';
import ResumeAnalysisPanel, {
  type AnalysisHistoryItem,
  type ResumeAnalysisData,
} from '@/components/applications/ResumeAnalysisPanel';

const MAX_SIZE = 10 * 1024 * 1024;

export default function ResumeAnalysisPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdPdfFile, setJdPdfFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jdMode, setJdMode] = useState<'paste' | 'pdf'>('paste');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  const validatePdf = (file: File | null, label: string) => {
    if (!file) return `${label} is required`;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return `${label} must be a PDF`;
    }
    if (file.size > MAX_SIZE) {
      return `${label} must be 10 MB or smaller`;
    }
    return '';
  };

  const handleAnalyze = async () => {
    setError('');
    const resumeErr = validatePdf(resumeFile, 'Resume');
    if (resumeErr) {
      if (!resumeFile && jdMode === 'pdf' && jdPdfFile) {
        setError(
          'Resume is required. Your PDF looks attached under Job Description — please upload the same file in the Resume field at the top.'
        );
      } else {
        setError(resumeErr);
      }
      return;
    }
    if (jdMode === 'pdf') {
      const jdErr = validatePdf(jdPdfFile, 'Job description PDF');
      if (jdErr) {
        setError(jdErr);
        return;
      }
    } else if (!jobDescriptionText.trim()) {
      setError('Please paste a job description');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile!);
      if (jdMode === 'pdf' && jdPdfFile) {
        formData.append('jobDescriptionPdf', jdPdfFile);
      } else {
        formData.append('jobDescriptionText', jobDescriptionText);
      }
      if (jobTitle) formData.append('jobTitle', jobTitle);
      if (companyName) formData.append('companyName', companyName);

      const res = await api.post('/resume-analysis/analyze', formData);

      const result = res.data;
      setAnalysis({
        scores: result.scores || result.history?.scores,
        atsAnalysis: result.analysis,
        parsedResume: result.parsedResume || result.history?.parsedResume,
        missingSkills: result.analysis?.missingSkills,
        strengths: result.analysis?.strengths,
        weaknesses: result.analysis?.weaknesses,
        recommendations: result.analysis?.recommendations,
        bulletImprovements: result.analysis?.bulletImprovements,
        wordingSuggestions: result.analysis?.wordingSuggestions,
        projectEnhancements: result.analysis?.projectEnhancements,
      });

      if (result.history?._id) {
        setHistory((prev) => [result.history, ...prev]);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Analysis failed';
      setError(msg || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume ATS Analysis</h1>
        <p className="text-gray-600 mt-1">
          Upload your PDF resume and job description to get Groq-powered ATS scoring and improvement tips.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Step 1 — Your Resume (PDF, max 10 MB) *
          </label>
          <p className="text-xs text-gray-500 mb-2">Upload your CV/resume here (not the job description).</p>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              setResumeFile(e.target.files?.[0] || null);
              setError('');
            }}
            className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white file:text-sm file:font-medium hover:file:bg-indigo-700"
          />
          {resumeFile ? (
            <p className="mt-2 text-sm text-green-700 font-medium">
              ✓ Resume selected: {resumeFile.name}
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-400">No resume file chosen</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title (optional)</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Acme Inc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Step 2 — Job Description *
          </label>
          <div className="flex gap-4 mb-3">
            <button
              type="button"
              onClick={() => setJdMode('paste')}
              className={`px-3 py-1 rounded text-sm ${jdMode === 'paste' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Paste JD
            </button>
            <button
              type="button"
              onClick={() => setJdMode('pdf')}
              className={`px-3 py-1 rounded text-sm ${jdMode === 'pdf' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              Upload JD PDF
            </button>
          </div>
          {jdMode === 'paste' ? (
            <textarea
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              rows={8}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Paste the full job description here..."
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-2">Upload the job posting PDF (separate from your resume).</p>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setJdPdfFile(e.target.files?.[0] || null);
                  setError('');
                }}
                className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-600 file:text-white file:text-sm"
              />
              {jdPdfFile ? (
                <p className="mt-2 text-sm text-green-700 font-medium">✓ JD selected: {jdPdfFile.name}</p>
              ) : (
                <p className="mt-2 text-sm text-gray-400">No job description PDF chosen</p>
              )}
              {jdPdfFile && !resumeFile && (
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(jdPdfFile);
                    setError('');
                  }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Uploaded your resume here by mistake? Use &quot;{jdPdfFile.name}&quot; as resume
                </button>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !resumeFile}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {analysis && <ResumeAnalysisPanel data={analysis} history={history} />}
    </div>
  );
}
