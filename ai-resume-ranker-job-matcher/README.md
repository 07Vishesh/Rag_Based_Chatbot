# AI Resume Ranker & Job Matcher

A beginner-friendly full-stack web app that compares a resume against a job description using OpenAI and returns ATS-style insights such as score, matched skills, missing skills, strengths, weaknesses, suggestions, and a short summary.

## What is included

- React frontend with functional components and hooks
- Clean SaaS-style dashboard UI with responsive cards and score visualization
- Drag-and-drop resume upload for PDF and TXT files
- Express backend with OpenAI integration
- Strict JSON schema handling and safe response normalization
- Graceful loading and error states

## Project structure

```text
ai-resume-ranker-job-matcher/
  frontend/
    src/
      components/
      App.js
      App.css
  backend/
    server.js
  README.md
```

## Frontend highlights

- Two main textareas for job description and resume input
- Resume upload area that extracts text from PDF or TXT files
- Results dashboard with:
  - Score out of 100
  - Matched skills
  - Missing skills
  - Strengths
  - Weaknesses
  - Suggestions
  - Summary

## Backend highlights

- `POST /api/extract-resume` reads resume files and extracts text
- `POST /api/analyze` sends the ATS prompt to OpenAI and returns strict JSON
- `GET /api/health` provides a quick environment check

## Setup instructions

You can either install dependencies from the project root or inside each package folder.

### Option A: install everything from the project root

```bash
npm install
```

Then run:

```bash
npm run dev:backend
npm run dev:frontend
```

### Option B: install frontend and backend separately

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/`:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-mini
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Optional frontend `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Run the backend

```bash
cd backend
npm run dev
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Then open the local URL shown by Vite, usually `http://localhost:5173`.

## How the AI analysis works

1. The app accepts a job description and resume text.
2. The backend sends both documents to OpenAI with an ATS-style prompt.
3. The model returns strict JSON matching the required structure.
4. The backend validates and normalizes the JSON before sending it to the frontend.
5. The frontend renders the score and all supporting insights in dashboard cards.

## Error handling

- Missing text fields are blocked before analysis starts
- Upload errors are shown in the UI
- Invalid AI responses are rejected safely
- Missing OpenAI API key returns a clear backend error

## Screenshots

Add screenshots here after running locally:

- `docs/screenshots/dashboard.png` for the main dashboard
- `docs/screenshots/upload-flow.png` for the upload and extraction flow
- `docs/screenshots/results.png` for the final ATS analysis output

## Notes

- PDF upload support is included through backend text extraction.
- TXT uploads are supported as a lightweight alternative.
- The backend can serve the built frontend automatically when `frontend/dist` exists.
