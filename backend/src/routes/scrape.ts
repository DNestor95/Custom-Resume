import { Router, Request, Response } from 'express';
import { ScrapeJobRequest } from '../types';
import { fetchPageText } from '../services/scraper';
import { extractJobDetails } from '../services/openai';

const router = Router();

// POST /api/scrape-job
router.post('/', async (req: Request<{}, {}, ScrapeJobRequest>, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'URL must use http or https protocol' });
  }

  try {
    const pageText = await fetchPageText(url);

    if (!pageText || pageText.length < 50) {
      return res.status(422).json({ error: 'Could not extract enough content from the page' });
    }

    const jobDetails = await extractJobDetails(pageText);
    return res.json(jobDetails);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to scrape job posting';
    return res.status(500).json({ error: message });
  }
});

export { router as scrapeRouter };
