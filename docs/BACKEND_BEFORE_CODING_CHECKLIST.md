# Backend Structure Reset Guide

This backend now follows a strict chapter-style structure inspired by chapters 1 to 4 of the referenced book, with only one stack substitution:

- MongoDB and Mongoose are replaced by PostgreSQL and Prisma.

Everything else is intentionally minimal so implementation can be rewritten from scratch.

## Final Backend Source Structure

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

## Strict Rules

- No repository folder
- No domain folder
- No http folder
- No custom architecture folders
- Keep only data-service-route layers plus test setup folders

## Responsibilities by Layer

- db: database client and data access entrypoint
- services: business logic
- routes: HTTP routes and request handling
- test: test lifecycle setup files
- __tests__: test files

## What Was Intentionally Removed

- Any repository abstractions
- Feature-specific service and route implementations
- Extra utility, middleware, validator, type, config, constants layers

## Current Status

- The backend is now a clean baseline.
- You can start writing all features again from zero.

## Next Build-Up Order

1. Define Prisma schema in backend/prisma/schema.prisma
2. Implement first service in backend/src/services
3. Implement first route in backend/src/routes
4. Add tests in backend/src/__tests__ using setup from backend/src/test

## Verification Commands

Run from backend folder:

```bash
npm run build
npm run dev
```
