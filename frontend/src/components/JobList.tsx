import type { JobApplication } from '../types';
import { api } from '../services/api';

interface Props {
  jobs: JobApplication[];
  onSelect: (job: JobApplication) => void;
  onDeleted: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function JobList({ jobs, onSelect, onDeleted }: Props) {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this job application?')) return;
    try {
      await api.deleteJob(id);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <p>No job applications yet. Click "Add New Job" to get started!</p>
      </div>
    );
  }

  return (
    <div className="job-grid">
      {jobs.map((job) => (
        <div key={job.id} className="job-card">
          <div className="job-card-header">
            <h3 className="job-card-title">{job.title}</h3>
            <span className="job-card-company">{job.company}</span>
          </div>
          <div className="job-card-meta">
            <span className="badge">Added {formatDate(job.createdAt)}</span>
            {job.tailoredResume && <span className="badge badge-success">Resume ✓</span>}
            {job.coverLetter && <span className="badge badge-success">Cover Letter ✓</span>}
          </div>
          <div className="job-card-actions">
            <button className="btn btn-primary btn-sm" onClick={() => onSelect(job)}>
              View / Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => handleDelete(e, job.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
