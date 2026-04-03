# Students Endpoints Implementation Checklist

Use this checklist during implementation and review.

Working rule:

- Move one endpoint at a time.
- Complete service tests before final route validation.
- Mark each box only after command output and manual verification are done.

---

## 1) Sprint Scope

Endpoints in scope:

- [ ] POST /api/v1/students
- [ ] GET /api/v1/students
- [ ] GET /api/v1/students/:id
- [ ] PUT /api/v1/students/:id
- [ ] DELETE /api/v1/students/:id

Files involved:

- backend/prisma/schema.prisma
- backend/src/db/models/index.ts
- backend/src/services/students.ts
- backend/src/routes/students.ts
- backend/src/**tests**/students.test.ts
- backend/src/app.ts
- backend/src/server.ts

Testing setup note:

- In-memory test setup is already configured in backend/src/test/setupFileAfterEnv.ts and backend/jest.config.json.
- Do not modify testing infrastructure for this sprint unless explicitly requested by the team.

---

## 2) Global Pre-Flight Checks

Run from backend directory:

- [ ] npm install
- [ ] npm run build
- [ ] npm test
- [ ] npm run dev

Environment checks:

- [ ] DATABASE_URL is present in backend/.env
- [ ] Server starts and prints listening log
- [ ] Base app is reachable at http://localhost:5000

---

## 3) Endpoint Board: POST /api/v1/students

### 3.1 Data Layer

- [ ] Student model fields validated in schema.prisma
- [ ] Unique email constraint confirmed
- [ ] StudentModel delegate confirmed in db/models/index.ts

### 3.2 Service Layer

- [ ] createStudentSchema exists and validates required fields
- [ ] createStudent service uses parsed data from schema
- [ ] Service writes with StudentModel.create({ data })
- [ ] Service errors are not silently swallowed

### 3.3 Unit Tests

- [ ] Success case: all fields
- [ ] Success case: optional specialty omitted
- [ ] Failure case: invalid email
- [ ] Failure case: empty firstName
- [ ] Failure case: empty institution
- [ ] Failure case: empty level
- [ ] npm test passes

### 3.4 Route Layer

- [ ] Route handler exists in routes/students.ts
- [ ] Method/path is POST /api/v1/students
- [ ] Route calls createStudent(req.body)
- [ ] Route is registered through app.ts

### 3.5 Manual Validation

- [ ] Server running with npm run dev
- [ ] Postman request sent to http://localhost:5000/api/v1/students
- [ ] Header Content-Type: application/json set
- [ ] Payload tested:

{
"firstName": "Alice",
"lastName": "Johnson",
"email": "alice@test.com",
"institution": "ESI Algiers",
"level": "L2",
"specialty": "Computer Science"
}

- [ ] Response body contains created student data

### 3.6 Sign-Off

- [ ] Endpoint tested by implementer
- [ ] Endpoint reviewed by teammate
- [ ] Tests and build pass before commit

---

## 4) Endpoint Board: GET /api/v1/students

### 4.1 Service Layer

- [ ] listStudents service added in services/students.ts
- [ ] Service uses StudentModel.findMany
- [ ] Default ordering strategy defined
- [ ] Optional query support decision documented (for now yes/no)

### 4.2 Unit Tests

- [ ] Returns multiple students
- [ ] Returns empty list
- [ ] Handles model error path
- [ ] npm test passes

### 4.3 Route Layer

- [ ] GET /api/v1/students route added
- [ ] Route calls listStudents
- [ ] Route returns 200 with array payload

### 4.4 Manual Validation

- [ ] Postman GET call returns list
- [ ] Empty-list behavior checked

### 4.5 Sign-Off

- [ ] Endpoint reviewed and merged only after passing checks

---

## 5) Endpoint Board: GET /api/v1/students/:id

### 5.1 Service Layer

- [ ] getStudentById service added
- [ ] Service uses StudentModel.findUnique({ where: { id } })
- [ ] Not-found behavior defined and implemented
- [ ] ID validation decision documented

### 5.2 Unit Tests

- [ ] Existing ID returns student
- [ ] Missing ID returns null/not found path
- [ ] Invalid ID format path tested (if validation enabled)
- [ ] npm test passes

### 5.3 Route Layer

- [ ] GET /api/v1/students/:id route added
- [ ] Route reads req.params.id
- [ ] Returns 200 for found, 404 for not found

### 5.4 Manual Validation

- [ ] Valid ID checked in Postman
- [ ] Non-existent ID checked in Postman

### 5.5 Sign-Off

- [ ] Endpoint reviewed and merged only after passing checks

---

## 6) Endpoint Board: PUT /api/v1/students/:id

### 6.1 Service Layer

- [ ] updateStudent service added
- [ ] Update schema added (full or partial contract chosen)
- [ ] Service uses StudentModel.update
- [ ] Not-found handling defined
- [ ] Unique email conflict handling defined

### 6.2 Unit Tests

- [ ] Full update succeeds
- [ ] Partial update succeeds (if supported)
- [ ] Invalid email rejected
- [ ] Duplicate email conflict path tested
- [ ] Unknown ID path tested
- [ ] npm test passes

### 6.3 Route Layer

- [ ] PUT /api/v1/students/:id route added
- [ ] Route passes id and payload to service
- [ ] Response codes mapped consistently

### 6.4 Manual Validation

- [ ] Update request verified in Postman
- [ ] Follow-up GET confirms changes persisted

### 6.5 Sign-Off

- [ ] Endpoint reviewed and merged only after passing checks

---

## 7) Endpoint Board: DELETE /api/v1/students/:id

### 7.1 Service Layer

- [ ] deleteStudent service added
- [ ] Service uses StudentModel.delete
- [ ] Missing ID behavior defined

### 7.2 Unit Tests

- [ ] Existing ID delete succeeds
- [ ] Missing ID delete path tested
- [ ] Post-delete retrieval behavior tested
- [ ] npm test passes

### 7.3 Route Layer

- [ ] DELETE /api/v1/students/:id route added
- [ ] Response contract chosen and implemented (200 or 204)
- [ ] Not-found mapped to 404

### 7.4 Manual Validation

- [ ] Delete request works in Postman
- [ ] GET by deleted ID confirms not found

### 7.5 Sign-Off

- [ ] Endpoint reviewed and merged only after passing checks

---

## 8) Final Integration Gate

Before closing sprint:

- [ ] npm run build passes
- [ ] npm test passes
- [ ] All endpoint manual checks completed
- [ ] Route file remains readable and organized
- [ ] Service file remains readable and organized
- [ ] No test infrastructure changes were introduced accidentally
- [ ] Commit messages are clear and scoped by endpoint

---

## 9) Daily Reporting Template

Use this at stand-up or end-of-day:

- Today completed:
- Endpoint currently in progress:
- Current blocker:
- Tests status:
- Manual validation status:
- Next action:
