# DevContext — Developer OS

A personal project-intelligence workspace for software developers. Keep every piece of
project context, work, documentation, AI-agent activity and progress in one place so you
can switch between projects, tasks and AI agents without losing context.

Built with **Next.js 15 · TypeScript · React 19 · Prisma · SQLite · Lucide** and hand-rolled
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

```bash
npm install
cp .env.example .env      # adjust OWNER_EMAIL / OWNER_NAME if you like
npx prisma db push        # create the SQLite database
npm run dev               # http://localhost:3000
```

The workspace starts empty — create your first project and go. Everything you create is
stored relationally in `DATABASE_URL` (SQLite `prisma/dev.db` by default).

### Configuration (`.env`)

| Variable | Purpose | Default |
| --- | --- | --- |
| `OWNER_EMAIL` | Workspace owner identity (created on first launch) | `owner@localhost` |
| `OWNER_NAME` | Display name for the owner | derived from email |
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` |
| `UPLOAD_DIR` | Where uploaded document files are stored | `uploads` |

## Production build

```bash
npm run build
npm start
```

> Note: uploaded files and SQLite live on local disk. For serverless/containers, point
> `DATABASE_URL` at Postgres (schema is Postgres-ready) and back `UPLOAD_DIR` with a
> mounted volume or object storage.

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
