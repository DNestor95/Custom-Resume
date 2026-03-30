import { useState } from 'react';
import { api } from '../services/api';
import type { CreateJobRequest } from '../types';

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

export default function JobForm({ onCreated, onCancel }: Props) {
  const [form, setForm] = useState<CreateJobRequest>({ company: '', title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [scraping, setScraping] = useState(false);

  const handleImportFromUrl = async () => {
    if (!jobUrl.trim()) {
      setError('Please enter a job posting URL.');
      return;
    }
    setScraping(true);
    setError('');
    try {
      const result = await api.scrapeJob(jobUrl.trim());
      setForm({ company: result.company, title: result.title, description: result.description });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import job posting');
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.title.trim() || !form.description.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.createJob(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Add New Job Application</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="import-section">
        <label htmlFor="jobUrl">Import from URL</label>
        <span className="label-hint">Paste a job posting URL to auto-fill the fields below</span>
        <div className="import-row">
          <input
            id="jobUrl"
            type="text"
            placeholder="https://example.com/jobs/software-engineer"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleImportFromUrl}
            disabled={scraping || loading}
          >
            {scraping ? 'Importing…' : '🔗 Import'}
          </button>
        </div>
      </div>

      <hr className="divider" />

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="company">Company Name</label>
          <input
            id="company"
            type="text"
            placeholder="e.g. Acme Corp"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Senior Software Engineer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            rows={8}
            placeholder="Paste the full job description here..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Job Application'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
