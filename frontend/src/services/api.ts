import type { JobApplication, CreateJobRequest, UpdateJobRequest, ScrapeJobResponse } from '../types';

const BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CustomizeResult {
  job: JobApplication;
  tailoredResume: string;
  tailoredCoverLetter: string;
}

export const api = {
  getJobs(): Promise<JobApplication[]> {
    return fetch(`${BASE}/jobs`).then(handleResponse<JobApplication[]>);
  },

  getJob(id: string): Promise<JobApplication> {
    return fetch(`${BASE}/jobs/${id}`).then(handleResponse<JobApplication>);
  },

  createJob(data: CreateJobRequest): Promise<JobApplication> {
    return fetch(`${BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<JobApplication>);
  },

  updateJob(id: string, data: UpdateJobRequest): Promise<JobApplication> {
    return fetch(`${BASE}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<JobApplication>);
  },

  deleteJob(id: string): Promise<void> {
    return fetch(`${BASE}/jobs/${id}`, { method: 'DELETE' }).then(handleResponse<void>);
  },

  tailorResume(id: string, baseResume: string): Promise<{ tailoredResume: string }> {
    return fetch(`${BASE}/jobs/${id}/tailor-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseResume }),
    }).then(handleResponse<{ tailoredResume: string }>);
  },

  generateCoverLetter(
    id: string,
    baseResume: string,
    styleSample: string
  ): Promise<{ coverLetter: string }> {
    return fetch(`${BASE}/jobs/${id}/generate-cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseResume, styleSample }),
    }).then(handleResponse<{ coverLetter: string }>);
  },

  scrapeJob(url: string): Promise<ScrapeJobResponse> {
    return fetch(`${BASE}/scrape-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).then(handleResponse<ScrapeJobResponse>);
  },

  customizeDocuments(
    jobUrl: string,
    baseResume: string,
    baseCoverLetter: string
  ): Promise<CustomizeResult> {
    return fetch(`${BASE}/customize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobUrl, baseResume, baseCoverLetter }),
    }).then(handleResponse<CustomizeResult>);
  },
};
