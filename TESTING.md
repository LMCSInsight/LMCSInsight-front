# Login system – testing guide

## 1. Testing environment setup

### 1.1 Backend

1. **Database:** Ensure PostgreSQL is running and database **LMCSInsight** exists (create in pgAdmin if needed).

2. **Backend .env** (`backend/.env`):
   ```
   DATABASE_URL="postgresql://postgres:ImWalker8!@localhost:5432/LMCSInsight"
   JWT_SECRET="your-super-secret-key-change-in-production"
   JWT_EXPIRES_IN="15m"
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN="http://localhost:5173"
   ```

3. **Apply schema and seed users:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
   **If the database still has the old role `TEACHER`:** run `npx prisma db push` so the `UserRole` enum includes `RESEARCHER`. If you have existing rows with role `TEACHER`, either update them to `RESEARCHER` in SQL (e.g. `UPDATE users SET role = 'RESEARCHER' WHERE role = 'TEACHER'`) before pushing, or run a one-off migration that renames the enum value. Then run `npm run db:seed` to ensure admin, director, researcher, and assistant exist.

4. **Start backend:**
   ```bash
   npm run dev
   ```
   API runs at `http://localhost:5000`.

### 1.2 Frontend

1. **Frontend .env** (project root `.env`):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`.

---

## 2. Seed users (after `npm run db:seed`)

| Role       | Email               | Password   |
|-----------|---------------------|------------|
| ADMIN     | admin@lmcs.dz       | `admin123` |
| DIRECTOR  | director@lmcs.dz    | `admin123` |
| RESEARCHER| researcher@lmcs.dz  | `admin123` |
| ASSISTANT | assistant@lmcs.dz   | `admin123` |

The RESEARCHER user is linked to a **Chercheur** (RES-001) so they can see supervisions where they are supervisor once such data exists.

---

## 3. Tests to run

### 3.1 Backend

- [ ] Backend starts: `cd backend && npm run dev` (no errors, port 5000).
- [ ] Login returns `user.id`: `POST /api/auth/login` with `{"email":"researcher@lmcs.dz","password":"admin123"}` → response has `user.id` and `user.role === "RESEARCHER"`.
- [ ] Researcher supervisions scope: `GET /api/supervisions` with Bearer token of researcher → returns list (empty or only supervisions where this chercheur is supervisor).

### 3.2 Frontend – login and redirect

- [ ] Open app → redirects to login page.
- [ ] Login as **RESEARCHER** (`researcher@lmcs.dz` / `admin123`) → redirect to `/dashboard/researcher/<user id>` (URL contains the researcher’s id).
- [ ] Login as **ADMIN** (`admin@lmcs.dz` / `admin123`) → redirect to `/dashboard/admin`.
- [ ] Login as **DIRECTOR** (`director@lmcs.dz` / `admin123`) → redirect to `/dashboard/director`.
- [ ] Login as **ASSISTANT** (`assistant@lmcs.dz` / `admin123`) → redirect to `/dashboard/assistant`.

### 3.3 Frontend – researcher portal only

- [ ] While logged in as researcher, open “My dashboard” in sidebar → stays on `/dashboard/researcher/<same id>`.
- [ ] Manually go to `/dashboard/researcher` → redirects to `/dashboard/researcher/<current user id>`.
- [ ] Manually go to `/dashboard/researcher/<another-user-uuid>` → redirects to `/dashboard/researcher/<current user id>` (cannot see another researcher’s portal).
- [ ] Header shows user name/email; Logout returns to login.

### 3.4 Frontend – other roles

- [ ] Director/Admin/Assistant: no `researcherId` in URL; sidebar and redirect unchanged.
- [ ] Wrong credentials → error message, no redirect.
- [ ] After logout, visiting a dashboard URL redirects to login.

### 3.5 Build and lint (sanity)

- [ ] Backend: `cd backend && npm run build` (success).
- [ ] Frontend: `npm run build` (success).

---

## 4. Quick smoke checklist

| Step | Expected |
|------|----------|
| Start backend + frontend | No errors |
| Login as researcher@lmcs.dz | → `/dashboard/researcher/<id>`, “Researcher Dashboard” |
| Login as admin@lmcs.dz | → `/dashboard/admin` |
| Researcher opens another’s URL | Redirect to own `/dashboard/researcher/<id>` |
| Logout | → Login page; dashboard URL → login again |

When all items above pass, the login system and researcher-scoped portal are working as intended.
