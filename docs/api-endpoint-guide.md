# API Endpoint Workflow Guide

This guide is intentionally reset to match a strict chapter-style backend workflow.

Only stack substitution applied:

- PostgreSQL and Prisma instead of MongoDB and Mongoose

## Workflow

```text
Route -> Service -> Data (Prisma)
```

## Backend Folder Structure

```text
backend/src/
+-- app.ts
+-- server.ts
+-- db/
¦   +-- prisma.ts
+-- services/
+-- routes/
¦   +-- index.ts
+-- test/
¦   +-- globalSetup.js
¦   +-- globalTeardown.js
¦   +-- setupFileAfterEnv.js
+-- __tests__/
```

## Implementation Policy

- Start from blank service files
- Add one route at a time
- Keep logic in services
- Keep routes thin
- Use Prisma directly from services for now

## Not Allowed In This Reset Phase

- repositories folder
- domain folder
- http folder
- extra cross-cutting folders outside the strict baseline

## First Endpoint Build Sequence

1. Add a service module in backend/src/services
2. Add a route module in backend/src/routes
3. Register route in backend/src/routes/index.ts
4. Add tests under backend/src/__tests__
5. Run build and dev checks

## Commands

From backend folder:

```bash
npm run build
npm run dev
```
