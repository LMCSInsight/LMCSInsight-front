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
