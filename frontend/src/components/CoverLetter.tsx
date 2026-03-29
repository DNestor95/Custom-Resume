import { useState } from 'react';
import type { JobApplication } from '../types';
import { api } from '../services/api';

interface Props {
  job: JobApplication;
  onUpdated: (job: JobApplication) => void;
}

export default function CoverLetter({ job, onUpdated }: Props) {
  const [baseResume, setBaseResume] = useState('');
  const [styleSample, setStyleSample] = useState('');
  const [coverLetter, setCoverLetter] = useState(job.coverLetter ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!baseResume.trim()) {
      setError('Please paste your base resume first.');
      return;
    }
    if (!styleSample.trim()) {
      setError('Please paste a style sample cover letter first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.generateCoverLetter(job.id, baseResume, styleSample);
      setCoverLetter(result.coverLetter);
      onUpdated({ ...job, coverLetter: result.coverLetter });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="editor-section">
      <h2>Cover Letter Generator</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="cl-base-resume">Your Base Resume</label>
        <textarea
          id="cl-base-resume"
          rows={8}
          placeholder="Paste your full resume here..."
          value={baseResume}
          onChange={(e) => setBaseResume(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="style-sample">
          Cover Letter Style Sample{' '}
          <span className="label-hint">(paste a cover letter whose tone/style you want to match)</span>
        </label>
        <textarea
          id="style-sample"
          rows={10}
          placeholder="Paste a sample cover letter here to define the tone, style, and length you want..."
          value={styleSample}
          onChange={(e) => setStyleSample(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating Cover Letter…' : '✨ Generate Cover Letter'}
        </button>
      </div>

      {coverLetter && (
        <div className="result-section">
          <div className="result-header">
            <h3>Generated Cover Letter</h3>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="result-pre">{coverLetter}</pre>
        </div>
      )}
    </section>
  );
}
