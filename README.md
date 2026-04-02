# LMCS Insight – Frontend

Web app for the **LMCS Supervision Tracking System** (Suivi des encadrements des chercheurs du laboratoire LMCS - ESI, Phase II 2025-2026). Role-based dashboards for Director, Teacher/Researcher, Assistant, and Admin.

## Stack

- **React** 19, **TypeScript**
- **Vite** 5
- **Ant Design** 6, **Tailwind CSS** 4, **shadcn** (Base UI)
- **Redux Toolkit**, **TanStack Query**
- **React Router** 7, **Axios**

## Setup

```bash
npm install
cp .env.example .env   # Optional: set VITE_API_URL (default http://localhost:5000/api)
npm run dev            # Start dev server (default http://localhost:5173)
```

## Temporary Dev Auth (Frontend Collaboration)

Use this mode to let frontend teammates access all role portals before backend auth is fully integrated.

Required env vars in `.env`:

```env
VITE_AUTH_BYPASS=true
VITE_DEV_AUTH_ROLE=RESEARCHER
```

How it works:

- With `VITE_AUTH_BYPASS=true`, the app auto-signs in using a local mock account.
- On `/auth/login`, use one-click buttons to switch between `RESEARCHER`, `DIRECTOR`, `ASSISTANT`, and `ADMIN`.
- Optional role override through URL query:
	- `/auth/login?devRole=RESEARCHER`
	- `/auth/login?devRole=DIRECTOR`
	- `/auth/login?devRole=ASSISTANT`
	- `/auth/login?devRole=ADMIN`

Disable this mode when real auth is ready by setting:

```env
VITE_AUTH_BYPASS=false
```

## Scripts

| Script           | Description          |
|------------------|----------------------|
| `npm run dev`    | Start dev server     |
| `npm run build`  | TypeScript + Vite build |
| `npm run preview` | Preview production build |
| `npm run lint`   | Run ESLint          |

## Project structure

- **`src/app/`** – Router, providers
- **`src/features/`** – Auth, dashboard, supervisions, students, validation, admin
- **`src/layouts/`** – Auth, dashboard, main
- **`src/routes/`** – Protected routes, role-based routing
- **`src/shared/`** – Context (auth, theme, notifications), shared components, lib

## Backend

The API runs separately. See **`backend/README.md`** for setup (Node.js, Express, Prisma, PostgreSQL). Default API base: `http://localhost:5000/api`.

## Roles

- **Director** – Statistics and reports
- **Teacher** – Own supervisions CRUD
- **Assistant** – Validation queue (pending, validate/reject)
- **Admin** – User management and full access
