import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { jobsRouter } from './routes/jobs';
import { resumeRouter } from './routes/resume';
import { coverLetterRouter } from './routes/coverLetter';
import { scrapeRouter } from './routes/scrape';
import { customizeRouter } from './routes/customize';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/jobs', jobsRouter);
app.use('/api/jobs/:id/tailor-resume', resumeRouter);
app.use('/api/jobs/:id/generate-cover-letter', coverLetterRouter);
app.use('/api/scrape-job', scrapeRouter);
app.use('/api/customize', customizeRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not set. AI features will not work.');
  }
});
