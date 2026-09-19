# DevContext — Developer OS

A personal project-intelligence workspace for software developers. Keep every piece of
project context, work, documentation, AI-agent activity and progress in one place so you
can switch between projects, tasks and AI agents without losing context.

Built with **Next.js 15 · TypeScript · React 19 · Prisma · PostgreSQL · Lucide** and hand-rolled
CSS (no UI framework).

## Features

- **Dashboard** — greeting, workspace stats, flagship project hero with progress ring,
  next actions, current work, recent AI activity, activity timeline
- **Projects** — project workspace with Overview / Tasks / Documents / AI Sessions /
  Prompts / Decisions / Handoffs / Activity / Settings tabs
- **Tasks** — statuses (Todo, In Progress, Blocked, In Review, Done), priorities, due
  dates, related documents/sessions/decisions
- **Documents** — upload files, save external links or write markdown inline; versions;
  attach to tasks, sessions and decisions
- **AI Sessions** — structured records of agent work (Claude, ChatGPT, Cursor,
  Antigravity, Gemini, Other): goal, prompt, summary, actions, files changed, result,
  next step
- **Prompt Library** — reusable prompts with categories, tags and usage counters
- **Decision Log** — ADR-style records (context, decision, reason, alternatives,
  consequences, status)
- **Handoffs** — one-click structured snapshot per project; copy, export Markdown/JSON
- **Context Packs** — select exactly what another agent needs (project context, current
  task, documents, sessions, decisions, handoff…) and copy an AI-ready package
- **Global search** — ⌘K palette plus a full search page across all entities

## Getting started

You need a PostgreSQL database (local, Neon, Supabase, or Vercel Postgres).

```bash
npm install
cp .env.example .env
# set DATABASE_URL=postgresql://… in .env
npx prisma db push        # create the schema
npm run dev               # http://localhost:3000
```

The workspace starts empty — create your first project and go. Everything you create is
stored relationally in Postgres via `DATABASE_URL`.

### Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `OWNER_EMAIL` | Workspace owner identity (created on first launch) | `owner@localhost` |
| `OWNER_NAME` | Display name for the owner | derived from email |
| `DATABASE_URL` | PostgreSQL connection string | — (required) |
| `UPLOAD_DIR` | Upload directory; on Vercel leave unset (uses `/tmp/uploads`) | `uploads` |

## Deploying to Vercel

1. **Create a Postgres database** — the fastest options:
   - [Neon](https://neon.tech) (free tier): create a project, copy the pooled
     connection string (`postgresql://…?sslmode=require`)
   - Vercel Marketplace → **Vercel Postgres** or **Neon** integration (creates and
     links `DATABASE_URL` for you)
2. **Import the repo on Vercel** (or connect it if already imported).
3. **Set environment variables** in Project → Settings → Environment Variables:
   - `DATABASE_URL` — your Postgres connection string
   - `OWNER_EMAIL` — your email (becomes the workspace owner on first visit)
   - `OWNER_NAME` — your display name (optional)
4. **Create the schema once** from your machine:
   ```bash
   DATABASE_URL="<your-prod-url>" npx prisma db push
   ```
5. Deploy. The first page visit creates the owner user automatically.

> Uploads on serverless go to `/tmp/uploads`, which is ephemeral per invocation —
> fine for trying it out. For durable file storage, wire up Vercel Blob or S3.

## Project structure

```
src/
  app/                 # App Router pages + API routes
    projects/[id]/tabs # Project workspace tabs
    api/               # search, context packs, handoff export, file serving
  components/          # Shell, palette, shared UI, forms
  lib/                 # db client, server actions, data helpers, search,
                       # handoff + context-pack builders, design constants
prisma/schema.prisma   # relational schema (User, Project, Task, Document, AiSession,
                       # Prompt, Decision, Handoff, Activity + join tables)
```
