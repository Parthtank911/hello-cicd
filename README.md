# Hello CI/CD

[![CI Pipeline](https://github.com/Parthtank911/hello-cicd/actions/workflows/ci.yml/badge.svg)](https://github.com/Parthtank911/hello-cicd/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Deployed on Render](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=white)](https://hello-cicd-wbgt.onrender.com)

A minimal Express.js REST API with a complete, working CI/CD pipeline: automated testing on every push, and deployment that is gated behind those tests passing.

**Live app:** https://hello-cicd-wbgt.onrender.com

---

## Table of contents

- [Overview](#overview)
- [API endpoints](#api-endpoints)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [Testing](#testing)
- [CI/CD pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [Design decisions](#design-decisions)

---

## Overview

This project has two goals:

1. Serve a small, working REST API (add two numbers, check health, return a welcome message)
2. Demonstrate a real CI/CD pipeline where **broken code cannot reach production** — enforced automatically, not manually

Every push to `main` triggers the pipeline: install dependencies → run tests → if (and only if) tests pass, trigger a deployment to the live server.

## API endpoints

| Method | Route | Description | Example |
|---|---|---|---|
| `GET` | `/` | Returns a welcome message | [Try it](https://hello-cicd-wbgt.onrender.com/) |
| `GET` | `/health` | Health check, returns `{ status: "ok" }` | [Try it](https://hello-cicd-wbgt.onrender.com/health) |
| `GET` | `/add?a=5&b=7` | Adds two numbers, returns `{ result: 12 }` | [Try it](https://hello-cicd-wbgt.onrender.com/add?a=5&b=7) |

**Error handling:** `/add` returns `400` with an error message if `a` or `b` is missing or not a valid number.

> Note: this runs on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–60 seconds to respond while the instance wakes up.

## Tech stack

| Category | Tools |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Testing | Jest, Supertest |
| CI/CD | GitHub Actions |
| Hosting | Render (free tier) |

## Project structure

```
hello-cicd/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI + CD pipeline definition
├── tests/
│   └── app.test.js         # Test suite (4 cases covering all routes)
├── app.js                  # Express app instance & route definitions
├── server.js               # Entry point — starts the HTTP server
├── package.json
├── .gitignore
└── README.md
```

`app.js` and `server.js` are split deliberately: `app.js` exports the Express app without starting a listener, which lets test files import it directly (via Supertest) without binding to a real port.

## Running locally

```bash
git clone https://github.com/Parthtank911/hello-cicd.git
cd hello-cicd
npm install
npm start
```

Server starts at `http://localhost:3000` (or the port set in the `PORT` environment variable).

## Testing

```bash
npm test
```

**Coverage:**
- `GET /` returns 200 and the expected welcome message
- `GET /health` returns 200 and `{ status: "ok" }`
- `GET /add` returns the correct sum for valid numeric input
- `GET /add` returns 400 with an error message for invalid input

All tests use Supertest to make real HTTP-style requests against the Express app in memory, without needing a running server.

## CI/CD pipeline

Defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Two sequential jobs:

```
push to main
     │
     ▼
┌─────────────────────────┐
│ Job: test                │
│  • checkout code         │
│  • setup Node.js 20      │
│  • npm install            │
│  • npm test                │
└───────────┬───────────────┘
            │ passes
            ▼
┌─────────────────────────┐
│ Job: deploy                │
│  • runs only if test passed │
│  • runs only on main branch │
│  • POSTs to Render deploy    │
│    hook via curl             │
└───────────┬───────────────┘
            ▼
      Render pulls latest
      commit and redeploys
```

**Key mechanism — the deployment gate:**
```yaml
deploy:
  needs: test
  if: github.ref == 'refs/heads/main'
```
`needs: test` means the `deploy` job will not start unless the `test` job completed successfully. If a test fails, the pipeline stops at that point — `deploy` is skipped entirely, and the live app is left untouched.

**Secrets:** the Render deploy hook URL is stored as a GitHub Actions repository secret (`RENDER_DEPLOY_HOOK`), not hardcoded anywhere in the codebase.

## Deployment

Hosted on Render, connected to this repository. Render's own auto-deploy-on-push is disabled; deployment is triggered exclusively by the GitHub Actions `deploy` job's `curl` request to the deploy hook, once tests pass. This keeps a single source of truth for "is it safe to deploy" — the test suite.

## Design decisions

- **Split `app.js` / `server.js`** — allows the Express app to be tested in isolation without opening a real network port during test runs.
- **`/health` endpoint** — a standard convention so deployment platforms (and future monitoring tools) have a lightweight endpoint to check liveness without hitting business logic.
- **Deployment gated on tests, not on push** — pushing broken code should never be able to affect the live app; the pipeline enforces this rather than relying on manual discipline.
- **Free-tier hosting** — chosen deliberately for a project at this scale; the tradeoff (cold starts after inactivity) is documented above rather than hidden.