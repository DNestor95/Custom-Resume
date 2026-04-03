import { useState } from 'react';
import { api } from '../services/api';
import type { JobApplication } from '../types';

interface Props {
  onComplete: (job: JobApplication) => void;
  onCancel: () => void;
}

export default function QuickCustomize({ onComplete, onCancel }: Props) {
  const [jobUrl, setJobUrl] = useState('');
  const [baseResume, setBaseResume] = useState('');
  const [baseCoverLetter, setBaseCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tailoredResume, setTailoredResume] = useState('');
  const [tailoredCoverLetter, setTailoredCoverLetter] = useState('');
  const [jobInfo, setJobInfo] = useState<{ title: string; company: string } | null>(null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const handleCustomize = async () => {
    if (!jobUrl.trim()) {
      setError('Please enter a job listing URL.');
      return;
    }
    if (!baseResume.trim()) {
      setError('Please paste your resume.');
      return;
    }
    if (!baseCoverLetter.trim()) {
      setError('Please paste your cover letter.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.customizeDocuments(
        jobUrl.trim(),
        baseResume,
        baseCoverLetter
      );
      setTailoredResume(result.tailoredResume);
      setTailoredCoverLetter(result.tailoredCoverLetter);
      setJobInfo({ title: result.job.title, company: result.job.company });
      onComplete(result.job);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to customize documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResume = async () => {
    await navigator.clipboard.writeText(tailoredResume);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleCopyCoverLetter = async () => {
    await navigator.clipboard.writeText(tailoredCoverLetter);
    setCopiedCoverLetter(true);
    setTimeout(() => setCopiedCoverLetter(false), 2000);
  };

  const hasResults = tailoredResume && tailoredCoverLetter;

  return (
    <div className="customize-page">
      <div className="card">
        <h2>🚀 Quick Customize</h2>
        <p className="customize-subtitle">
          Paste a job listing URL along with your resume and cover letter. We'll tailor both documents for that specific role.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form">
          <div className="form-group">
            <label htmlFor="customize-url">Job Listing URL</label>
            <span className="label-hint">Paste the web address of the job posting</span>
            <input
              id="customize-url"
              type="text"
              placeholder="https://example.com/jobs/software-engineer"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="customize-inputs">
            <div className="form-group">
              <label htmlFor="customize-resume">Your Resume</label>
              <textarea
                id="customize-resume"
                rows={12}
                placeholder="Paste your full resume here..."
                value={baseResume}
                onChange={(e) => setBaseResume(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customize-cover-letter">Your Cover Letter</label>
              <textarea
                id="customize-cover-letter"
                rows={12}
                placeholder="Paste your cover letter here..."
                value={baseCoverLetter}
                onChange={(e) => setBaseCoverLetter(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleCustomize}
              disabled={loading}
            >
              {loading ? 'Customizing…' : '✨ Customize Both for This Job'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {hasResults && jobInfo && (
        <div className="customize-results">
          <div className="customize-results-header">
            <h2>Results for {jobInfo.title} at {jobInfo.company}</h2>
          </div>

          <div className="customize-results-grid">
            <section className="editor-section">
              <div className="result-header">
                <h3>Tailored Resume</h3>
                <button className="btn btn-secondary btn-sm" onClick={handleCopyResume}>
                  {copiedResume ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <pre className="result-pre">{tailoredResume}</pre>
            </section>

            <section className="editor-section">
              <div className="result-header">
                <h3>Tailored Cover Letter</h3>
                <button className="btn btn-secondary btn-sm" onClick={handleCopyCoverLetter}>
                  {copiedCoverLetter ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <pre className="result-pre">{tailoredCoverLetter}</pre>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
