import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 5000;
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100
    },
    matched_skills: {
      type: "array",
      items: { type: "string" }
    },
    missing_skills: {
      type: "array",
      items: { type: "string" }
    },
    strengths: {
      type: "array",
      items: { type: "string" }
    },
    weaknesses: {
      type: "array",
      items: { type: "string" }
    },
    suggestions: {
      type: "array",
      items: { type: "string" }
    },
    summary: {
      type: "string"
    }
  },
  required: [
    "score",
    "matched_skills",
    "missing_skills",
    "strengths",
    "weaknesses",
    "suggestions",
    "summary"
  ]
};

const ATS_SYSTEM_PROMPT = `
You are an advanced AI Resume Screening Agent designed to simulate a real-world Applicant Tracking System used by recruiters.

Evaluate how well a candidate's resume matches a job description.

Rules:
- Be objective and realistic. Do not inflate scores.
- Give more weight to required technical skills, relevant experience, tools, frameworks, and role alignment.
- Penalize missing core skills, vague experience, irrelevant experience, and unclear resume wording.
- Keep suggestions actionable and specific.
- Return valid JSON only with the exact schema provided.
`;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
      : "*"
  })
);
app.use(express.json({ limit: "2mb" }));

function sanitizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAnalysisResult(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("AI output was empty or invalid.");
  }

  const score = Number(payload.score);

  if (!Number.isInteger(score)) {
    throw new Error("AI output did not include a valid numeric score.");
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    matched_skills: sanitizeStringArray(payload.matched_skills),
    missing_skills: sanitizeStringArray(payload.missing_skills),
    strengths: sanitizeStringArray(payload.strengths),
    weaknesses: sanitizeStringArray(payload.weaknesses),
    suggestions: sanitizeStringArray(payload.suggestions),
    summary: typeof payload.summary === "string" ? payload.summary.trim() : ""
  };
}

function getResponseText(response) {
  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const message = response?.output?.find((item) => item.type === "message");
  const text = message?.content
    ?.map((contentItem) => {
      if (typeof contentItem?.text === "string") {
        return contentItem.text;
      }

      if (typeof contentItem?.content?.[0]?.text === "string") {
        return contentItem.content[0].text;
      }

      return "";
    })
    .join("")
    .trim();

  if (!text) {
    throw new Error("The model did not return any text output.");
  }

  return text;
}

async function extractResumeText(file) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension === ".pdf" || file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return parsed.text?.trim() || "";
  }

  if (extension === ".txt" || file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8").trim();
  }

  throw new Error("Unsupported file type. Please upload a PDF or TXT resume.");
}

async function analyzeResume(jobDescription, resume) {
  if (!client) {
    throw new Error("OpenAI API key is missing. Add OPENAI_API_KEY to backend/.env before running analysis.");
  }

  const prompt = `Job Description:\n${jobDescription}\n\nResume:\n${resume}`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    instructions: ATS_SYSTEM_PROMPT,
    input: prompt,
    max_output_tokens: 1200,
    text: {
      format: {
        type: "json_schema",
        name: "ats_resume_analysis",
        strict: true,
        schema: ANALYSIS_SCHEMA
      }
    }
  });

  if (response?.error?.message) {
    throw new Error(response.error.message);
  }

  if (response.status && response.status !== "completed") {
    throw new Error(response.incomplete_details?.reason || "The AI response did not complete successfully.");
  }

  const parsed = JSON.parse(getResponseText(response));
  return normalizeAnalysisResult(parsed);
}

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    model: process.env.OPENAI_MODEL || "gpt-5-mini"
  });
});

app.post("/api/extract-resume", upload.single("resume"), async (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).json({
        error: "Please upload a PDF or TXT resume file."
      });
    }

    const text = await extractResumeText(request.file);

    if (!text) {
      return response.status(400).json({
        error: "The uploaded file did not contain readable text."
      });
    }

    return response.json({
      text
    });
  } catch (error) {
    return response.status(400).json({
      error: error.message || "The uploaded file could not be processed."
    });
  }
});

app.post("/api/analyze", async (request, response) => {
  try {
    const jobDescription = request.body?.jobDescription?.trim();
    const resume = request.body?.resume?.trim();

    if (!jobDescription || !resume) {
      return response.status(400).json({
        error: "Job description and resume are both required."
      });
    }

    const analysis = await analyzeResume(jobDescription, resume);
    return response.json(analysis);
  } catch (error) {
    const statusCode = error?.status && Number.isInteger(error.status) ? error.status : 500;
    return response.status(statusCode).json({
      error: error.message || "The resume analysis failed."
    });
  }
});

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api")) {
      return next();
    }

    return response.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`AI Resume Ranker backend listening on http://localhost:${port}`);
});
