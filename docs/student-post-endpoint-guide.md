# Team Guide: Student Endpoints Sprint Workflow

This guide documents the exact workflow currently used in the repository for student endpoints, starting with student creation.

Primary objective for this sprint:

- Implement and validate `POST /api/v1/students` end to end.

Additional objective for team alignment:

- Prepare clean implementation hints for the remaining student endpoints:
  - `GET /api/v1/students`
  - `GET /api/v1/students/:id`
  - `PUT /api/v1/students/:id`
  - `DELETE /api/v1/students/:id`

---

## 1) Exact Sequence Used In This Sprint

Follow this order exactly:

1. Check data layer (`Student` model in Prisma).
2. Build service layer (`createStudent` + Zod validation).
3. Confirm testing environment is ready.
4. Write and run unit tests until passing.
5. Implement route layer and wire endpoint.
6. Run manual HTTP validation in Postman.

This sequence is intentional: it keeps implementation controlled and easier to debug.

---

## 2) Files Involved (Current Repository State)

Open these files while following the guide:

- `backend/prisma/schema.prisma`
- `backend/src/db/models/index.ts`
- `backend/src/services/students.ts`
- `backend/src/__tests__/students.test.ts`
- `backend/src/routes/students.ts`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/jest.config.json`
- `backend/src/test/setupFileAfterEnv.ts`
- `backend/src/test/mocks/studentModelMock.ts`

---

## 3) Step 1 - Data Layer Validation

### Goal

Confirm exactly what can be created in the database before writing service logic.

### Action

1. Open `backend/prisma/schema.prisma`.
2. Locate `model Student`.
3. Confirm field contract:
   - required: `firstName`, `lastName`, `email`, `institution`, `level`
   - optional: `specialty`
4. Confirm `email` uniqueness.
5. Open `backend/src/db/models/index.ts`.
6. Confirm model delegate export exists:

```ts
export const StudentModel = prisma.student
```

### Expected Outcome

You have one source of truth for creation fields and constraints.

---

## 4) Step 2 - Service Layer (createStudent + Zod)

### Goal

Keep validation and persistence logic in one place.

### Action

1. Open `backend/src/services/students.ts`.
2. Confirm `createStudentSchema` uses Zod.
3. Confirm service function:

```ts
export async function createStudent(input: CreateStudentInput)
```

4. Confirm flow inside service:
   - parse and validate input via Zod
   - call `StudentModel.create({ data: validated })`

### Why This Matters

Route stays lightweight. Business rules stay centralized in service.

### Expected Outcome

Service rejects invalid payloads early and persists only validated data.

---

## 5) Step 3 - Testing Environment (In-Memory)

### Goal

Understand how tests are executed in this project.

### Important Team Note

Testing environment is already configured. Do not change it for this sprint.

### How it currently works

1. Jest configuration is in `backend/jest.config.json`.
2. `setupFilesAfterEnv` points to `backend/src/test/setupFileAfterEnv.ts`.
3. The setup file uses `pg-mem` to run tests against an in-memory PostgreSQL-like database.
4. Schema SQL is loaded from generated Prisma SQL.
5. A test model mapping is configured to avoid direct Prisma runtime coupling during unit tests.

### Why this is important

- Tests are isolated.
- No dependency on a live external DB for unit test execution.
- Faster and deterministic feedback.

### Action for teammates now

- Run tests.
- Do not reconfigure the in-memory test setup unless the team explicitly decides to redesign it.

### Command

From `backend/`:

```bash
npm test
```

### Expected Outcome

Jest runs successfully with current setup.

---

## 6) Step 4 - Unit Tests For createStudent

### Goal

Validate behavior before exposing more HTTP surface.

### Action

1. Open `backend/src/__tests__/students.test.ts`.
2. Confirm tests cover:
   - success with all fields
   - success without optional `specialty`
   - invalid email rejection
   - empty `firstName` rejection
   - empty `institution` rejection
   - empty `level` rejection
3. Run:

```bash
npm test
```

### Expected Outcome

All tests pass and confirm service contract.

---

## 7) Step 5 - Route Layer For Create

### Goal

Expose the tested service through HTTP.

### Action

1. Open `backend/src/routes/students.ts`.
2. Confirm endpoint:
   - method: `POST`
   - path: `/api/v1/students`
   - handler calls `createStudent(req.body)`
3. Open `backend/src/app.ts`.
4. Confirm route registration:

```ts
studentsRoutes(app)
```

### Request flow

HTTP request -> route handler -> service validation -> Prisma model create -> response.

### Expected Outcome

Create route is reachable and returns created data.

---

## 8) Step 6 - Runtime Validation (Postman)

### Goal

Confirm endpoint works from a real HTTP client.

### Action

1. Start server from `backend/`:

```bash
npm run dev
```

2. In Postman, create request:

   - method: `POST`
   - URL: `http://localhost:5000/api/v1/students`
   - header: `Content-Type: application/json`

3. Use this exact body:

```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice@test.com",
  "institution": "ESI Algiers",
  "level": "L2",
  "specialty": "Computer Science"
}
```

### Expected Outcome

- Request succeeds.
- Response includes created student object.
- Workflow is validated end to end.

---

## 9) Detailed Hints For Remaining Student Endpoints

Use the same architecture pattern: Route -> Service -> Data.

### A) `GET /api/v1/students`

#### Goal

Return a list of students.

#### Route layer action

- Add handler in `backend/src/routes/students.ts` for `GET /api/v1/students`.
- Route should call service function like `listStudents()`.

#### Service layer hint

- Add `listStudents` in `backend/src/services/students.ts`.
- Use `StudentModel.findMany`.
- Start simple with default ordering, then add filters/pagination later.

#### Validation and response hint

- Query params can be optional initially.
- Return array and status `200`.

#### Test hints

- Unit test with mocked model returning:
  - multiple students
  - empty array

#### Postman check

- Call `GET http://localhost:5000/api/v1/students`.
- Confirm JSON array is returned.

---

### B) `GET /api/v1/students/:id`

#### Goal

Fetch one student by identifier.

#### Route layer action

- Add handler for `GET /api/v1/students/:id`.
- Extract `id` from `req.params.id`.
- Call service function like `getStudentById(id)`.

#### Service layer hint

- Use `StudentModel.findUnique({ where: { id } })`.
- If not found, return `null` and let route answer `404`.

#### Validation hint

- Validate `id` shape before querying (UUID format if required by schema).

#### Response hint

- Found: `200` + student object.
- Not found: `404` + clear message.

#### Test hints

- exists -> returns object
- missing -> returns null / not found behavior

#### Postman check

- Use existing id from create response.
- Verify found and not-found scenarios.

---

### C) `PUT /api/v1/students/:id`

#### Goal

Update an existing student safely.

#### Route layer action

- Add `PUT /api/v1/students/:id` handler.
- Pass `id` and payload to service function like `updateStudent(id, input)`.

#### Service layer hint

- Create update Zod schema (allow partial fields if needed).
- Use `StudentModel.update`.
- Handle not found and unique email conflicts.

#### Validation hint

- Validate payload keys and formats.
- Decide if empty payload is rejected.

#### Response hint

- Success: `200` with updated object.
- Not found: `404`.
- Validation issue: `400`.
- Unique conflict: `409`.

#### Test hints

- successful update
- partial update
- invalid email
- duplicate email
- id not found

#### Postman check

- Update one created student and re-fetch to confirm changes persisted.

---

### D) `DELETE /api/v1/students/:id`

#### Goal

Delete a student by id.

#### Route layer action

- Add `DELETE /api/v1/students/:id` handler.
- Call service function like `deleteStudent(id)`.

#### Service layer hint

- Use `StudentModel.delete({ where: { id } })`.
- Decide if response returns deleted object or empty body.

#### Response hint

- Success: `200` or `204`.
- Not found: `404`.

#### Test hints

- delete existing
- delete missing id
- ensure deleted record is not retrievable afterward

#### Postman check

- Delete then call GET by id to confirm not found.

---

## 10) Suggested Implementation Order For Remaining Endpoints

Execute one endpoint at a time using this mini-loop:

1. Define service function and validation.
2. Add unit tests for service behavior.
3. Implement route handler.
4. Run `npm test`.
5. Validate with Postman.
6. Move to next endpoint.

This reduces regressions and keeps work reviewable.

---

## 11) Troubleshooting Notes

### Prisma startup error on `npm run dev`

- Verify `DATABASE_URL` in `backend/.env`.
- Confirm backend dependencies are installed.

### Route not found

- Check exact path prefix: `/api/v1/students`.
- Confirm `studentsRoutes(app)` still exists in `backend/src/app.ts`.

### Unexpected 500 on create

- Check service validation and model create path in `backend/src/services/students.ts`.
- Check terminal output for Prisma or validation traces.

### Duplicate email failure

- This is expected when `email` already exists.
- Use a new email for create tests.

### Unit test failures after endpoint expansion

- Re-run with focused assertions.
- Keep tests deterministic and isolated.
- Avoid introducing external DB dependency into unit tests.

---

## 12) Sprint Completion Checklist

- `POST /api/v1/students` works in Postman with the exact payload.
- Unit tests for create behavior pass.
- Team understands in-memory testing setup and leaves it unchanged for this sprint.
- Remaining endpoint plan is clear and ready for implementation.

---

## 13) Quick Copy Template For Teammates

Use this exact action list when implementing each new endpoint:

1. Read schema and confirm field contract.
2. Write service function + validation.
3. Write service unit tests.
4. Run tests and fix failures.
5. Add route handler.
6. Validate manually with Postman.
7. Commit only when tests pass.
