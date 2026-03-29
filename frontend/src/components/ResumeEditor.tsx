import { useState } from 'react';
import type { JobApplication } from '../types';
import { api } from '../services/api';

interface Props {
  job: JobApplication;
  onUpdated: (job: JobApplication) => void;
}

export default function ResumeEditor({ job, onUpdated }: Props) {
  const [baseResume, setBaseResume] = useState('');
  const [tailored, setTailored] = useState(job.tailoredResume ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTailor = async () => {
    if (!baseResume.trim()) {
      setError('Please paste your base resume first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.tailorResume(job.id, baseResume);
      setTailored(result.tailoredResume);
      onUpdated({ ...job, tailoredResume: result.tailoredResume });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to tailor resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tailored);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="editor-section">
      <h2>Resume Tailoring</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="base-resume">Your Base Resume</label>
        <textarea
          id="base-resume"
          rows={14}
          placeholder="Paste your full resume here..."
          value={baseResume}
          onChange={(e) => setBaseResume(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleTailor}
          disabled={loading}
        >
          {loading ? 'Tailoring Resume…' : '✨ Tailor Resume for This Job'}
        </button>
      </div>

      {tailored && (
        <div className="result-section">
          <div className="result-header">
            <h3>Tailored Resume</h3>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="result-pre">{tailored}</pre>
        </div>
      )}
    </section>
  );
}
