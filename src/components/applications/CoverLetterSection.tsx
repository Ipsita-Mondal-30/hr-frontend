'use client';

import { notify } from '@/lib/notify';
import { useState } from 'react';
import { FileText, Copy, Check, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface CoverLetterSectionProps {
  applicationId: string;
  jobTitle?: string;
  companyName?: string;
  coverLetter?: string;
  onGenerated: (coverLetter: string) => void;
}

export default function CoverLetterSection({
  applicationId,
  jobTitle,
  companyName,
  coverLetter,
  onGenerated,
}: CoverLetterSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCoverLetter = async () => {
    setGenerating(true);
    try {
      const res = await api.post<{ generatedCoverLetter: string; coverLetter: string }>(
        `/resume-analysis/application/${applicationId}/cover-letter`,
        {}
      );
      const letter = res.data.generatedCoverLetter || res.data.coverLetter;
      onGenerated(letter);
    } catch (err) {
      console.error('Cover letter generation failed:', err);
      notify('Could not generate cover letter. Make sure your resume is on file and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('Could not copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <div>
            <h4 className="font-semibold text-gray-900">Cover Letter</h4>
            {(jobTitle || companyName) && (
              <p className="text-xs text-gray-500">
                {jobTitle}
                {companyName ? ` at ${companyName}` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {coverLetter && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-white"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button
            type="button"
            onClick={generateCoverLetter}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : coverLetter ? (
              'Regenerate'
            ) : (
              'Generate Cover Letter'
            )}
          </button>
        </div>
      </div>

      {coverLetter ? (
        <div className="p-5">
          <div className="text-gray-700 text-sm bg-gray-50 border border-gray-100 rounded-lg p-4 whitespace-pre-wrap leading-relaxed">
            {coverLetter}
          </div>
        </div>
      ) : (
        <div className="p-5 text-center text-sm text-gray-500">
          Generate a tailored cover letter for this role using your resume and the job description.
        </div>
      )}
    </div>
  );
}
