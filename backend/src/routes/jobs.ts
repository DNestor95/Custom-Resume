import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JobApplication, CreateJobRequest, UpdateJobRequest } from '../types';

const router = Router();

// In-memory store
const jobs: Map<string, JobApplication> = new Map();

// GET /api/jobs
router.get('/', (_req: Request, res: Response) => {
  const jobList = Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(jobList);
});

// POST /api/jobs
router.post('/', (req: Request<{}, {}, CreateJobRequest>, res: Response) => {
  const { company, title, description } = req.body;

  if (!company || !title || !description) {
    return res.status(400).json({ error: 'company, title, and description are required' });
  }

  const now = new Date().toISOString();
  const job: JobApplication = {
    id: uuidv4(),
    company,
    title,
    description,
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(job.id, job);
  return res.status(201).json(job);
});

// GET /api/jobs/:id
router.get('/:id', (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(job);
});

// PUT /api/jobs/:id
router.put('/:id', (req: Request<{ id: string }, {}, UpdateJobRequest>, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const { company, title, description } = req.body;
  const updated: JobApplication = {
    ...job,
    company: company ?? job.company,
    title: title ?? job.title,
    description: description ?? job.description,
    updatedAt: new Date().toISOString(),
  };

  jobs.set(updated.id, updated);
  return res.json(updated);
});

// DELETE /api/jobs/:id
router.delete('/:id', (req: Request, res: Response) => {
  if (!jobs.has(req.params.id)) {
    return res.status(404).json({ error: 'Job not found' });
  }
  jobs.delete(req.params.id);
  return res.status(204).send();
});

export { router as jobsRouter, jobs };
