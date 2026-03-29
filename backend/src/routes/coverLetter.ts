import { Router, Request, Response } from 'express';
import { jobs } from './jobs';
import { generateCoverLetter } from '../services/openai';
import { GenerateCoverLetterRequest } from '../types';

const router = Router({ mergeParams: true });

// POST /api/jobs/:id/generate-cover-letter
router.post(
  '/',
  async (req: Request<{ id: string }, {}, GenerateCoverLetterRequest>, res: Response) => {
    const job = jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const { baseResume, styleSample } = req.body;
    if (!baseResume || !styleSample) {
      return res.status(400).json({ error: 'baseResume and styleSample are required' });
    }

    try {
      const letter = await generateCoverLetter(
        baseResume,
        job.title,
        job.company,
        job.description,
        styleSample
      );
      job.coverLetter = letter;
      job.updatedAt = new Date().toISOString();
      jobs.set(job.id, job);
      return res.json({ coverLetter: letter });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate cover letter';
      return res.status(500).json({ error: message });
    }
  }
);

export { router as coverLetterRouter };
