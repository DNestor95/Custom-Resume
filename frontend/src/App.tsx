import { useState, useEffect, useCallback } from 'react';
import type { JobApplication, UpdateJobRequest } from './types';
import { api } from './services/api';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import ResumeEditor from './components/ResumeEditor';
import CoverLetter from './components/CoverLetter';
import QuickCustomize from './components/QuickCustomize';
import './App.css';

type View = 'list' | 'add' | 'detail' | 'customize';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [editingField, setEditingField] = useState<keyof UpdateJobRequest | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saveError, setSaveError] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch {
      // swallow – UI shows empty state
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobCreated = async () => {
    await fetchJobs();
    setView('list');
  };

  const handleSelectJob = (job: JobApplication) => {
    setSelectedJob(job);
    setView('detail');
    setEditingField(null);
  };

  const handleBack = () => {
    setView('list');
    setSelectedJob(null);
    setEditingField(null);
    setSaveError('');
  };

  const startEdit = (field: keyof UpdateJobRequest, current: string) => {
    setEditingField(field);
    setEditValue(current);
    setSaveError('');
  };

  const saveEdit = async () => {
    if (!selectedJob || !editingField) return;
    setSaveError('');
    try {
      const updated = await api.updateJob(selectedJob.id, { [editingField]: editValue });
      setSelectedJob(updated);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      setEditingField(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleJobUpdated = (updated: JobApplication) => {
    setSelectedJob(updated);
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-logo" onClick={handleBack} style={{ cursor: 'pointer' }}>
            📄 Custom Resume
          </h1>
          <nav className="app-nav">
            {view !== 'list' && (
              <button className="btn btn-ghost" onClick={handleBack}>
                ← Back to Jobs
              </button>
            )}
            {view === 'list' && (
              <>
                <button className="btn btn-primary" onClick={() => setView('customize')}>
                  🚀 Quick Customize
                </button>
                <button className="btn btn-secondary" onClick={() => setView('add')}>
                  + Add New Job
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <>
            <div className="page-title">
              <h2>Job Applications</h2>
              <span className="count">{jobs.length} total</span>
            </div>
            {loadingJobs ? (
              <div className="loading">Loading…</div>
            ) : (
              <JobList
                jobs={jobs}
                onSelect={handleSelectJob}
                onDeleted={fetchJobs}
              />
            )}
          </>
        )}

        {view === 'add' && (
          <JobForm onCreated={handleJobCreated} onCancel={() => setView('list')} />
        )}

        {view === 'customize' && (
          <QuickCustomize
            onComplete={(job) => {
              setJobs((prev) => [job, ...prev]);
            }}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'detail' && selectedJob && (
          <div className="detail-view">
            <div className="detail-card card">
              <div className="detail-header">
                {editingField === 'title' ? (
                  <div className="inline-edit">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                ) : (
                  <h2 className="detail-title">
                    {selectedJob.title}
                    <button className="btn-icon" title="Edit" onClick={() => startEdit('title', selectedJob.title)}>✏️</button>
                  </h2>
                )}

                {editingField === 'company' ? (
                  <div className="inline-edit">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                ) : (
                  <p className="detail-company">
                    {selectedJob.company}
                    <button className="btn-icon" title="Edit" onClick={() => startEdit('company', selectedJob.company)}>✏️</button>
                  </p>
                )}
              </div>

              {saveError && <div className="alert alert-error">{saveError}</div>}

              <div className="form-group">
                <div className="label-row">
                  <label>Job Description</label>
                  {editingField !== 'description' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit('description', selectedJob.description)}>
                      Edit
                    </button>
                  )}
                </div>
                {editingField === 'description' ? (
                  <>
                    <textarea
                      autoFocus
                      rows={8}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <div className="form-actions">
                      <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingField(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <pre className="description-pre">{selectedJob.description}</pre>
                )}
              </div>
            </div>

            <ResumeEditor job={selectedJob} onUpdated={handleJobUpdated} />
            <CoverLetter job={selectedJob} onUpdated={handleJobUpdated} />
          </div>
        )}
      </main>
    </div>
  );
}
