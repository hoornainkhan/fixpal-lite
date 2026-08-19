<div align="center">

# FixPal Lite

### AI-Powered Debugging Assistant

Analyze project code, identify likely root causes, and generate focused code fixes with AI-assisted analysis.

<br />

[![React](https://img.shields.io/badge/React-2026-blue?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-black?logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![NVIDIA](https://img.shields.io/badge/NVIDIA%20API-76B900?logo=nvidia&logoColor=white)](https://developer.nvidia.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

<br />

[Live Demo](https://fixpal-lite.vercel.app/) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API](#api)

</div>

## Live Demo

**[fixpal-lite.vercel.app](https://fixpal-lite.vercel.app/)**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API](#api)
- [NVIDIA Configuration](#nvidia-configuration)
- [Error Handling](#error-handling)
- [Docker](#docker)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Development Commands](#development-commands)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)

---

## Overview

**FixPal Lite** is an AI-powered debugging assistant that helps developers move from an error message to a focused explanation and code fix — fast.

Instead of sending an entire project to an LLM, FixPal Lite processes the project, identifies the files most relevant to the reported error, extracts the surrounding code context, and sends only that focused context for AI analysis.

Each generated analysis includes:

- **Suspected file**
- **Root cause**
- **Problematic code**
- **Suggested fix**
- **Explanation**
- **Confidence level**

---

## Features

| Feature | Description |
| --- | --- |
| **Multi-language Error Parsing** | Extracts useful information from errors across JavaScript, Python, Java, C++, and other common languages. |
| **Screenshot OCR** | Extracts error text from screenshots using Tesseract.js. |
| **Flexible Project Input** | Accepts ZIP archives, individual project files, or public GitHub repositories. |
| **Smart File Ranking** | Ranks project files according to their relevance to the reported error. |
| **Context Extraction** | Extracts focused code surrounding the suspected issue instead of sending the entire project to the LLM. |
| **AI-Assisted Debugging** | Uses the NVIDIA API to analyze the relevant error and code context. |
| **Buggy vs. Fixed Code** | Displays the problematic code alongside the proposed correction. |
| **Confidence Scoring** | Provides a confidence level for the generated analysis. |

---

## How It Works

```text
Project Source + Error
          │
          ▼
   Project Processing
          │
          ├── ZIP Extraction
          ├── File Collection
          └── GitHub Repository Cloning
          │
          ▼
      Error Parsing
          │
          ▼
    Smart File Ranking
          │
          ▼
    Context Extraction
          │
          ▼
      NVIDIA LLM
          │
          ▼
   Structured Analysis
          │
          ▼
 Root Cause + Code Fix
```

### Analysis Pipeline

**1. Project Input**

Provide one of the following:

- ZIP archive
- Individual project files
- Public GitHub repository

**2. Error Input**

Provide either:

- Error message or stack trace
- Screenshot of the error (processed using OCR)

**3. Error Parsing**

FixPal Lite extracts useful information such as:

- Error type
- Programming language
- File name
- Line number, when available

**4. Smart File Ranking**

Project files are ranked according to their relationship to the reported error.

**5. Context Extraction**

Instead of sending the entire project to the model, FixPal Lite extracts the relevant section of the highest-ranked file. This keeps the AI context focused and reduces unnecessary token usage.

**6. AI Analysis**

The focused error and relevant code context are sent to the NVIDIA-hosted LLM for analysis.

**7. Result Generation**

The final analysis contains:

- Identified file
- Line number
- Root cause
- Buggy code
- Fixed code
- Explanation
- Confidence level

---

## Architecture

### Local Development

```text
┌─────────────────┐
│   React / Vite  │
└────────┬────────┘
         │  /api proxy
         ▼
┌─────────────────┐
│ Express Backend │
├─────────────────┤
│ File Processing │
│ OCR             │
│ Error Parsing   │
│ Smart Scanner   │
│ Code Extraction │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   NVIDIA API    │
└─────────────────┘
```

### Production

```text
┌──────────────┐
│    Vercel    │
│   Frontend   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Render    │
│   Backend    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  NVIDIA API  │
│      LLM     │
└──────────────┘
```

The frontend uses `VITE_API_URL` to determine the backend origin in production, while the Vite development proxy handles local API requests.

---

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- React Syntax Highlighter

**Backend**
- Node.js
- Express
- Multer
- Sharp
- Tesseract.js
- Adm-Zip
- Simple-Git
- dotenv

**AI**
- NVIDIA API
- NVIDIA-hosted LLM

**Infrastructure**
- Docker
- Vercel
- Render

---

## Project Structure

```text
fixpal-lite/
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── routes/
│       │   └── api.js
│       └── services/
│           ├── codeExtractor.js
│           ├── errorParser.js
│           ├── fileHandler.js
│           ├── nvidiaService.js
│           ├── ocrService.js
│           └── smartScanner.js
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
│
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### Requirements

- Node.js 18+
- npm 10+
- Git
- Docker (optional)
- NVIDIA API key

### 1. Clone the Repository

```bash
git clone https://github.com/hoornainkhan/fixpal-lite.git
cd fixpal-lite
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure the Backend

Create `backend/.env`:

```env
NVIDIA_API_KEY=nvapi-your-key
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
NVIDIA_TIMEOUT_MS=150000
PORT=8080
```

> **Keep `NVIDIA_API_KEY` on the backend.** Never expose it through a `VITE_*` environment variable.

### 4. Configure the Frontend

For local development, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

Alternatively, the Vite development proxy can handle `/api` requests.

### 5. Start the Application

From the repository root:

```bash
npm run dev
```

The application will be available at:

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |

---

## Environment Configuration

### Frontend

The frontend reads the backend URL from `VITE_API_URL`.

**Local development**

```env
VITE_API_URL=http://localhost:8080
```

**Production**

Configure the variable in your Vercel project:

```env
VITE_API_URL=<your-backend-service-url>
```

> Vite embeds `VITE_*` variables during the build process, so the frontend must be rebuilt after changing the value. Never place secrets such as `NVIDIA_API_KEY` in frontend environment variables.

---

## API

### Health Checks

```http
GET /api/health
GET /api/debug/health
```

Successful response:

```json
{
  "status": "ok"
}
```

### Analyze Project

```http
POST /api/debug/analyze
Content-Type: multipart/form-data
```

The request must include at least one project source and one error source.

| Field | Type | Description |
| --- | --- | --- |
| `projectZip` | File | ZIP archive containing the project |
| `projectFiles` | File[] | Individual project files |
| `githubUrl` | String | Public GitHub repository URL |
| `errorText` | String | Error message or stack trace |
| `errorImage` | File | Screenshot processed with OCR |

Example response:

```json
{
  "identifiedFile": "src/app.js",
  "lineNumber": 45,
  "language": "javascript",
  "errorSummary": "Attempting to parse undefined as JSON",
  "confidence": "high",
  "buggyCode": "const obj = JSON.parse(response);",
  "fixedCode": "const obj = JSON.parse(response || '{}');",
  "explanation": "Response may be undefined, causing JSON.parse() to fail."
}
```

---

## NVIDIA Configuration

FixPal Lite sends analysis requests to the NVIDIA API.

The configured model is specified through:

```env
NVIDIA_MODEL=<model-provisioned-for-your-account>
```

The selected model must be available to the NVIDIA API key being used.

> If an unavailable model is configured, the request may remain pending until the configured timeout is reached. Before deploying, verify model availability through [NVIDIA Build](https://build.nvidia.com/).

---

## Error Handling

The backend distinguishes common NVIDIA API failures, including:

- Authentication failures
- Model availability issues
- Rate limits
- Network errors
- Request timeouts

Sensitive values such as API keys and uploaded project contents are not logged.

---

## Docker

### Build

From the repository root:

```bash
docker build -t fixpal-api ./backend
```

### Run

```bash
docker run --rm \
  --env-file backend/.env \
  -e PORT=10000 \
  -p 8080:10000 \
  fixpal-api
```

Verify the backend:

```
http://localhost:8080/api/health
```

---

## Deployment

FixPal Lite uses a split deployment architecture:

```text
Frontend  → Vercel
Backend   → Render
AI        → NVIDIA API
```

### Frontend

The Vite frontend is deployed to Vercel.

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| `VITE_API_URL` | Backend service URL |

### Backend

The Express backend is containerized and deployed as a persistent service.

Required environment variables:

```env
NVIDIA_API_KEY=...
NVIDIA_MODEL=...
NVIDIA_TIMEOUT_MS=150000
```

The backend reads the `PORT` value supplied by the hosting platform.

---

## Troubleshooting

<details>
<summary><strong>Frontend cannot reach the backend</strong></summary>

Check that:

- The local backend is running on port 8080.
- The Vite development proxy is configured correctly.
- Production has `VITE_API_URL` configured.
- The frontend was rebuilt after changing `VITE_API_URL`.
- Backend CORS allows the frontend origin.

</details>

<details>
<summary><strong>NVIDIA requests time out</strong></summary>

Check that:

- `NVIDIA_MODEL` is provisioned for the current account.
- `NVIDIA_API_KEY` is available to the running backend.
- The backend can reach the NVIDIA API.
- The account has not reached its rate limit.
- Local, Docker, and production environments use the intended model and key.

> Do not increase the timeout as the first troubleshooting step.

</details>

<details>
<summary><strong>OCR does not detect text</strong></summary>

Use a clear, high-resolution screenshot containing printed or terminal text. When possible, provide the error as text — it's faster and generally more reliable than OCR.

</details>

<details>
<summary><strong>Backend does not start</strong></summary>

Verify:

- Node.js 18+
- Dependencies are installed
- The configured port is available
- `NVIDIA_API_KEY` is present
- Docker/container configuration exposes the expected port

Use the health endpoints to verify that the Express server has started independently of the NVIDIA API.

</details>

---

## Development Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend locally |
| `npm run install:all` | Install all project dependencies |
| `npm run build:ui` | Build the production frontend |
| `cd backend && npm start` | Start the backend |
| `cd frontend && npm run dev` | Start the frontend |
| `cd frontend && npm run build` | Build the frontend |
| `cd frontend && npm run preview` | Preview the production frontend |
| `docker build -t fixpal-api ./backend` | Build the backend Docker image |

---

## Contributing

Contributions are welcome.

1. Create a feature branch.
2. Keep changes focused.
3. Preserve the existing backend API contract.
4. Test frontend and backend changes independently.
5. Verify the production frontend build.
6. Open a pull request with a clear description.

---

## License

This project is distributed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## Resources

- [NVIDIA NIM Documentation](https://docs.nvidia.com/nim/)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Tesseract.js Documentation](https://github.com/naptha/tesseract.js)

<div align="center">

**FixPal Lite** — AI-assisted debugging for faster root-cause analysis.

</div>