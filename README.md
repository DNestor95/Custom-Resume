# Custom Resume

A full-stack web app to help you tailor resumes and generate cover letters for specific job applications using OpenAI.

## Features

- 📝 **Track Job Applications** — Save company name, job title, and job description for each role you're targeting
- ✨ **AI Resume Tailoring** — Generate a version of your resume optimized for each job's requirements
- 💌 **Cover Letter Generator** — Paste a style sample and get a cover letter that matches its tone and structure
- 📋 **Copy to Clipboard** — One-click copy for tailored resumes and cover letters
- ✏️ **Inline Editing** — Edit any job detail directly from the detail view

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| AI | OpenAI API (`gpt-4o-mini`) |
| Storage | In-memory (no database required) |

## Setup

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone and install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key
```

`.env`:
```
OPENAI_API_KEY=sk-...your-key-here...
PORT=3001
```

### 3. Run in development

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/jobs` | List all job applications |
| POST | `/api/jobs` | Create a new job application |
| GET | `/api/jobs/:id` | Get a single job application |
| PUT | `/api/jobs/:id` | Update a job application |
| DELETE | `/api/jobs/:id` | Delete a job application |
| POST | `/api/jobs/:id/tailor-resume` | Generate tailored resume |
| POST | `/api/jobs/:id/generate-cover-letter` | Generate cover letter |

### Request bodies

**POST /api/jobs**
```json
{ "company": "Acme Corp", "title": "Software Engineer", "description": "..." }
```

**POST /api/jobs/:id/tailor-resume**
```json
{ "baseResume": "Your full resume text..." }
```

**POST /api/jobs/:id/generate-cover-letter**
```json
{ "baseResume": "Your full resume text...", "styleSample": "A cover letter whose style you want to match..." }
```

## Production Build

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

## Notes

- All job data is stored **in memory** — it resets when the backend restarts. For persistence, swap the in-memory Map for a database.
- The OpenAI API key is required only for the AI features (resume tailoring and cover letter generation). You can still add/manage job applications without it.
