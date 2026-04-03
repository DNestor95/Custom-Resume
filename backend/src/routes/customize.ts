import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { jobs } from './jobs';
import { tailorResume, tailorCoverLetter, extractJobDetails } from '../services/openai';
import { fetchPageText } from '../services/scraper';
import { CustomizeRequest, JobApplication } from '../types';

const router = Router();

// POST /api/customize
// Accepts a job listing URL, base resume, and base cover letter.
// Scrapes the job listing, creates a job entry, tailors both documents.
router.post('/', async (req: Request<{}, {}, CustomizeRequest>, res: Response) => {
  const { jobUrl, baseResume, baseCoverLetter } = req.body;

  if (!jobUrl || typeof jobUrl !== 'string') {
    return res.status(400).json({ error: 'jobUrl is required' });
  }
  if (!baseResume || typeof baseResume !== 'string') {
    return res.status(400).json({ error: 'baseResume is required' });
  }
  if (!baseCoverLetter || typeof baseCoverLetter !== 'string') {
    return res.status(400).json({ error: 'baseCoverLetter is required' });
  }

  let parsed: URL;
  try {
    parsed = new URL(jobUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'URL must use http or https protocol' });
  }

  try {
    // Step 1: Scrape the job listing
    const pageText = await fetchPageText(jobUrl);
    if (!pageText || pageText.length < 50) {
      return res.status(422).json({ error: 'Could not extract enough content from the page' });
    }

    const jobDetails = await extractJobDetails(pageText);

    // Step 2: Create a job entry
    const now = new Date().toISOString();
    const job: JobApplication = {
      id: uuidv4(),
      company: jobDetails.company,
      title: jobDetails.title,
      description: jobDetails.description,
      createdAt: now,
      updatedAt: now,
    };

    // Step 3: Tailor both documents in parallel
    const [tailoredResume, tailoredCoverLetter] = await Promise.all([
      tailorResume(baseResume, job.title, job.company, job.description),
      tailorCoverLetter(baseCoverLetter, job.title, job.company, job.description),
    ]);

    // Step 4: Save everything to the job entry
    job.tailoredResume = tailoredResume;
    job.coverLetter = tailoredCoverLetter;
    job.updatedAt = new Date().toISOString();
    jobs.set(job.id, job);

    return res.json({
      job,
      tailoredResume,
      tailoredCoverLetter,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to customize documents';
    return res.status(500).json({ error: message });
  }
});

export { router as customizeRouter };
