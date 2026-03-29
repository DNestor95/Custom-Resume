import { Router, Request, Response } from 'express';
import { jobs } from './jobs';
import { tailorResume } from '../services/openai';
import { TailorResumeRequest } from '../types';

const router = Router({ mergeParams: true });

// POST /api/jobs/:id/tailor-resume
router.post('/', async (req: Request<{ id: string }, {}, TailorResumeRequest>, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const { baseResume } = req.body;
  if (!baseResume) {
    return res.status(400).json({ error: 'baseResume is required' });
  }

  try {
    const tailored = await tailorResume(baseResume, job.title, job.company, job.description);
    job.tailoredResume = tailored;
    job.updatedAt = new Date().toISOString();
    jobs.set(job.id, job);
    return res.json({ tailoredResume: tailored });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to tailor resume';
    return res.status(500).json({ error: message });
  }
});

export { router as resumeRouter };
