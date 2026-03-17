# LMCS Supervision Tracking System — Implementation Plan

**Project:** Suivi des encadrements des chercheurs du laboratoire LMCS - ESI (Phase II 2025-2026)  
**Document:** Master plan to be followed for frontend and backend development.  
**Source:** implementation_plan (1).docx + CDC (Cahier des Charges).

---

## 1. Project Overview

### 1.1 Purpose

Full-stack web application to manage **academic supervisions** (PFE, Master, PhD, Internships, Research Projects) for the LMCS laboratory. It implements a **validation workflow** and **four user roles**: Director, Teacher/Researcher, Assistant (validator), Admin.

### 1.2 Technology Stack

| Component      | Technologies |
|----------------|--------------|
| **Frontend**  | React 18+, Ant Design 5+, Redux Toolkit, TanStack Query, Axios, ECharts, Vite, TypeScript |
| **Backend**   | Node.js 20+ LTS, Express.js 4+, Prisma ORM |
| **Database**  | PostgreSQL 15+ |
| **Auth**      | JWT (jsonwebtoken) + bcrypt |
| **Architecture** | MVC (backend), Feature-based (frontend), RESTful API, 3-tier |

**Database (v3):** The backend uses a Chercheur-centric schema (v3). The database is created by `backend/create_complete_database.sql` and documented in `backend/COMPLETE_DATABASE_DOCUMENTATION.md`. Prisma schema is in `backend/prisma/schema.prisma`.

### 1.3 Success Criteria

- All four roles can log in and access role-appropriate features.
- Teachers can create, update, and delete their supervisions.
- Assistants can validate supervisions with feedback.
- Directors can view global statistics and export reports (PDF/Excel).
- System is responsive (desktop/tablet/mobile).
- Test coverage above 70% for critical features.

---

## 2. Backend Implementation (Node.js + Express + Prisma)

### 2.1 Target Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── supervisionController.ts
│   │   ├── studentController.ts
│   │   ├── statisticsController.ts
│   │   ├── validationController.ts
│   │   └── adminController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── supervisionRoutes.ts
│   │   ├── studentRoutes.ts
│   │   ├── statisticsRoutes.ts
│   │   ├── validationRoutes.ts
│   │   └── adminRoutes.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts    # JWT verification
│   │   ├── roleMiddleware.ts   # RBAC
│   │   ├── validationMiddleware.ts
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── emailService.ts
│   │   ├── exportService.ts     # PDF/Excel
│   │   └── auditService.ts
│   ├── utils/
│   │   ├── tokenUtils.ts
│   │   ├── validatorUtils.ts
│   │   └── dateUtils.ts
│   ├── config/
│   │   └── database.ts
│   └── server.ts
├── .env
├── .env.example
└── package.json
```

### 2.2 Backend Modules to Implement

#### 2.2.1 Authentication & Authorization

| Feature           | Endpoint / Detail |
|-------------------|-------------------|
| User registration | `POST /api/auth/register` — bcrypt (12 rounds), email uniqueness, assign role |
| Login             | `POST /api/auth/login` — verify credentials, JWT (access 15min, refresh 7d), return user |
| Token refresh     | `POST /api/auth/refresh` — validate refresh token, issue new access token |
| Logout            | `POST /api/auth/logout` — invalidate refresh token |
| Password reset    | `POST /api/auth/forgot-password` — reset token, send email |
| RBAC              | Middleware: `requireAdmin`, `requireDirector`, `requireTeacher`, `requireAssistant` |

#### 2.2.2 Supervision Management

| Feature            | Endpoint / Detail |
|--------------------|-------------------|
| Create             | `POST /api/supervisions` — validationStatus=PENDING, link student, add supervisors |
| List               | `GET /api/supervisions` — filter by role, pagination, sort, filters |
| Get by ID          | `GET /api/supervisions/:id` — full details (student, supervisors, theme, validation logs) |
| Update             | `PUT /api/supervisions/:id` — ownership check; if validated → REVISED; audit log |
| Delete             | `DELETE /api/supervisions/:id` — teachers: own only; admins: all; audit |
| Search             | `GET /api/supervisions/search` — keywords, type, year, status, theme, supervisor |
| Add co-supervisor  | `POST /api/supervisions/:id/supervisors` — contribution %; validate total = 100% |

#### 2.2.3 Other Backend Domains

- **Students:** CRUD, link to supervisions.
- **Teams / Themes:** CRUD for lab axes and research themes.
- **Validation:** Assistant endpoints, status transitions, validation logs, notifications.
- **Statistics:** Aggregated stats, dashboard data.
- **Export:** PDF (e.g. PDFKit), Excel (e.g. ExcelJS), CSV.

### 2.3 Backend Development Phases

| Phase | Focus | Deliverables |
|-------|--------|--------------|
| **B1** | Project setup & database | Node project, Prisma, DB, migrations |
| **B2** | Authentication | Register, login, JWT, refresh, password reset, RBAC middleware |
| **B3** | Core CRUD | Supervisions, Students, Teams, Themes — CRUD + validation + auth |
| **B4** | Validation workflow | Assistant validation, status transitions, logs, notifications |
| **B5** | Search & statistics | Multi-criteria search, aggregated stats, dashboard APIs |
| **B6** | Export & reports | PDF, Excel, CSV generation |

---

## 3. Frontend Implementation (React + Vite + TypeScript)

### 3.1 Alignment with Existing Architecture

The frontend **already uses feature-based architecture** under `src/` (project root):

- **src/features/** — auth, supervisions, students, validation, dashboard, admin  
- **src/shared/** — components, hooks, lib (axios, queryClient), utils, context, types  
- **src/app/** — store, router, providers  
- **src/layouts/** — MainLayout, DashboardLayout, AuthLayout  
- **src/routes/** — ProtectedRoute, RoleRoute  
- **src/config/** — env, routes, constants  

New work must **follow this structure** (see `.cursor/rules/frontend.mdc`). The implementation plan’s “components/pages” map onto **features** and **shared** as below.

### 3.2 Feature-to-Plan Mapping

| Plan area           | Location in repo | Notes |
|--------------------|-------------------|--------|
| Layout             | `src/layouts/`, `src/shared/components` | Header, Sidebar, Footer, MainLayout |
| Auth pages         | `src/features/auth/pages/` | Login, ForgotPassword; add Register if needed |
| Dashboard (role)    | `src/features/dashboard/pages/` | TeacherDashboard, DirectorDashboard, AssistantDashboard; add AdminDashboard |
| Supervisions       | `src/features/supervisions/` | List, Form, Detail, Search (api, components, pages, hooks, store) |
| Students           | `src/features/students/` | List, Form (api, components, pages, store) |
| Validation         | `src/features/validation/` | ValidationQueue, ValidationDetail (api, components, pages, hooks) |
| Statistics         | `src/features/dashboard/` or dedicated | GlobalStatistics, PersonalStatistics, charts |
| Admin              | `src/features/admin/` | UserManagement, TeamManagement, ThemeManagement |

### 3.3 Core Frontend Features to Implement

#### 3.3.1 Authentication

- **Login:** Email/password, validation, “Remember me”, JWT in localStorage/cookies, role-based redirect.
- **Profile:** View/edit profile, change password, display role/team, optional avatar.
- **Password reset:** Forgot password form, reset token validation, new password + confirmation.

#### 3.3.2 Dashboards (by role)

| Role      | Content |
|-----------|--------|
| Teacher   | My supervisions (in progress, defended, etc.), quick stats (total, by type, by year), recent activity, pending validation alerts |
| Director  | Global stats, charts (type, year, status, theme), top supervisors, validation queue overview, export (PDF/Excel) |
| Assistant | Pending validations count, rejected items to review, personal validation stats, recently validated |
| Admin     | User stats, system health, recent audit logs, quick links (users, backup) |

#### 3.3.3 Supervision UI

- List/table with pagination, sorting, filters.
- Create/Edit form (student, type, theme, dates, supervisors, keywords).
- Detail view (full supervision + validation history).
- Multi-criteria search (keywords, type, year, status, theme, supervisor).

#### 3.3.4 Validation UI (Assistant)

- Validation queue (pending list).
- Validation detail page (validate / reject with feedback).
- Validation history timeline.

#### 3.3.5 Admin UI

- User management (CRUD).
- Team and theme management.
- Audit log viewer, system settings if required.

### 3.4 Frontend Development Phases

| Phase | Focus | Deliverables |
|-------|--------|--------------|
| **F1** | Project setup | Vite, Ant Design, Redux, TanStack Query, Axios, Router, env (already largely done) |
| **F2** | Layout & routing | Main layout (header, sidebar, content), protected & role-based routes and nav |
| **F3** | Auth UI | Login, register (if needed), password reset, JWT handling, auth slice, API |
| **F4** | Supervision management | List, create/edit form, detail, search/filter, status |
| **F5** | Validation interface | Assistant queue, validation detail, validate/reject, history |
| **F6** | Dashboards & statistics | Role-based dashboards, ECharts, stats panels, export buttons |
| **F7** | Admin | User CRUD, team/theme management, audit log, settings |

---

## 4. Implementation Guidelines

### 4.1 Backend

- **Validation:** Joi or Zod for request body.
- **Errors:** Centralized error middleware, consistent response shape.
- **Security:** bcrypt 12 rounds, JWT on protected routes, consider CSRF.
- **DB:** Type-safe Prisma, pagination, transactions for related writes.
- **API:** Swagger/OpenAPI for endpoints and examples.
- **Tests:** Jest (unit), Supertest (integration), target 70%+ coverage.

### 4.2 Frontend

- **Components:** Reusable, consistent with feature-based structure; TypeScript.
- **State:** Redux for global (auth/user); local state for UI.
- **API:** Centralized in feature `api/` and shared lib; loading/error handling; cancellation where useful.
- **Forms:** React Hook Form; validation (e.g. Zod/Yup).
- **UI:** Ant Design responsive grid; test mobile/tablet/desktop.
- **Performance:** Lazy routes, memoization, avoid unnecessary re-renders.

### 4.3 Testing

| Type        | Tools              | Scope |
|------------|--------------------|--------|
| Backend unit | Jest             | Controllers, services, utils, middleware |
| Backend API  | Jest + Supertest | Endpoints, DB operations |
| Frontend unit | Jest + RTL      | Components, hooks, utils, slices |
| E2E         | Playwright or Cypress | Login, create supervision, validate |

---

## 5. Environment & Deployment

### 5.1 Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lmcs_supervisions"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 5.2 Frontend (.env)

```env
VITE_API_URL="http://localhost:5000/api"
VITE_APP_NAME="LMCS Supervision Tracker"
```

### 5.3 Docker (optional)

- `docker-compose.yml` for PostgreSQL, backend, and this app (project root).
- Volumes for DB persistence; env-based configuration.

---

## 6. Development Timeline (Sprints)

| Sprint | Backend | Frontend | Deliverable |
|--------|---------|----------|-------------|
| **Sprint 1** | Setup + DB + Auth | Setup + Layout + Auth UI | Working login (all roles) |
| **Sprint 2** | CRUD Supervisions & Students | Supervision management UI | Create/view supervisions |
| **Sprint 3** | Validation workflow APIs | Validation interface | Assistant can validate |
| **Sprint 4** | Search & statistics APIs | Dashboards & charts | Full analytics |
| **Sprint 5** | Export & admin APIs | Admin panel & polish | Complete system |

---

## 7. Immediate Next Steps

1. Set up dev environment (Node.js 20+, PostgreSQL 15+, editor).
2. Create/confirm Git repo and branching strategy.
3. Initialize **backend** (Express, Prisma, structure above).
4. Confirm the app base (existing Vite/React app at project root) and align with this plan.
5. Create DB and run Prisma migrations.
6. **Sprint 1:** Implement auth (backend + frontend).
7. Daily standups and weekly plan reviews.

---

## 8. Document References

- **CDC (Cahier des Charges):** `.cursor/rules/lmcs-cdc-context.mdc` — domain, roles, security, UI, glossary.
- **Frontend architecture:** `.cursor/rules/frontend.mdc` — feature-based structure, tech stack, conventions.
- **This plan:** `docs/IMPLEMENTATION_PLAN.md` — master implementation roadmap.

All development must stay consistent with the CDC and the existing frontend architecture while following this implementation plan.
