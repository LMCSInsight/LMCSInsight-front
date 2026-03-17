# copilot-instructions.md

## Project: LMCS Supervision Tracking System – Frontend

This document defines the **coding rules, architecture, and development conventions** that GitHub Copilot must follow when generating code for this repository.

The objective is to ensure **consistent, scalable, and maintainable code generation** across the entire project.

Copilot must **strictly follow these rules** when suggesting or generating code.

---

# 1. Project Overview

The **LMCS Supervision Tracking System** is a web application designed to manage academic supervision activities for a research laboratory.

The system allows:

* teachers to record and track their supervisions
* laboratory management to monitor global supervision activity
* administrators to manage users and maintain the system

Core capabilities include:

* authentication and role management
* supervision lifecycle management
* student management
* advanced search and filtering
* dashboards and statistical analysis
* export of reports (PDF, Excel, CSV)

The application must support **multiple user roles**:

* Administrator
* Laboratory Director
* Teacher / Researcher
* Assistant Validator

Each role has different permissions and UI views. 

---

# 2. Technology Stack

Copilot must always assume the following stack:

Frontend framework:

React 18

Build tool:

Vite

Language:

TypeScript (strict mode)

UI Library:

Ant Design

Routing:

React Router

State Management:

Redux Toolkit

Server State:

TanStack Query

HTTP Client:

Axios

Charts:

ECharts

Form Handling:

React Hook Form

Validation:

Yup or Zod

---

# 3. Frontend Architecture

The project uses a **feature-based architecture**.

This architecture groups code by **business domain instead of technical layer**.

Example:

features/auth
features/supervisions
features/students
features/dashboard

Each feature contains:

* api
* components
* pages
* hooks
* store
* types

This ensures high modularity and scalability.

Copilot must **never mix unrelated features together**.

---

# 4. Folder Structure

Copilot must follow this exact structure.

```
src/

app/
store.ts
router.tsx
providers.tsx
index.ts

assets/
images/
icons/
styles/

config/
env.ts
routes.ts
constants.ts

features/
auth/
supervisions/
students/
validation/
dashboard/
admin/

shared/
components/
hooks/
lib/
utils/
context/
types/

layouts/
MainLayout.tsx
DashboardLayout.tsx
AuthLayout.tsx

routes/
ProtectedRoute.tsx
RoleRoute.tsx

App.tsx
main.tsx
```

Copilot must **never change this structure**.

---

# 5. Feature Module Pattern

Every feature module must follow this structure:

```
features/<feature>/

api/
components/
pages/
hooks/
store/
types.ts
```

Example:

```
features/supervisions/

api/supervisionApi.ts
components/SupervisionTable.tsx
components/SupervisionForm.tsx
pages/SupervisionListPage.tsx
pages/SupervisionDetailPage.tsx
hooks/useSupervisions.ts
store/supervisionSlice.ts
types.ts
```

---

# 6. Separation of Responsibilities

Copilot must respect the following architecture rules.

## Pages

Pages represent full screens.

Examples:

LoginPage
DashboardPage
SupervisionListPage

Pages must:

* compose components
* call hooks
* not contain heavy business logic

---

## Components

Components must be reusable UI elements.

Examples:

DataTable
StatsCard
SearchPanel

Components must:

* receive props
* remain presentation-focused

---

## Hooks

Hooks encapsulate business logic.

Examples:

useAuth
useSupervisions
useDashboardStats

Hooks should:

* call APIs
* use React Query
* manage data fetching

---

## API Layer

API files must contain HTTP calls only.

Example:

```
features/supervisions/api/supervisionApi.ts
```

Use the centralized Axios client.

Never call fetch directly.

---

# 7. Global Shared Layer

The `/shared` folder contains reusable modules.

Examples:

shared/components → reusable UI components
shared/hooks → generic hooks
shared/utils → helper functions
shared/lib → libraries configuration
shared/context → React Context providers

Examples of shared utilities:

formatDate
validators
pagination helpers

---

# 8. Axios Configuration

A centralized Axios instance must exist in:

```
shared/lib/axios.ts
```

It must:

* use base URL from `VITE_API_URL`
* automatically attach JWT token
* include request and response interceptors
* handle API errors globally

Copilot must always import this client instead of creating new Axios instances.

---

# 9. Authentication System

Authentication is based on **JWT tokens**.

Tokens are stored in **localStorage**.

The authentication state is managed by:

```
shared/context/AuthContext.tsx
```

The AuthContext must expose:

```
user
isAuthenticated
login()
logout()
```

Copilot must use the `useAuth()` hook to access authentication state.

---

# 10. Role-Based Access Control

The system uses **role-based authorization**.

Roles:

Admin
Director
Teacher
Assistant

Route protection is implemented using:

```
routes/ProtectedRoute.tsx
routes/RoleRoute.tsx
```

Copilot must enforce role-based UI rendering.

Example:

```
if (user.role === "admin") {
  return <AdminDashboard />
}
```

---

# 11. Routing Conventions

Routing must be centralized in:

```
app/router.tsx
```

Routes must be grouped by feature.

Example:

```
/login
/dashboard
/supervisions
/students
/validation
/admin
```

Protected routes must use `ProtectedRoute`.

---

# 12. Global Providers

All global providers must be defined in:

```
app/providers.tsx
```

Providers include:

Redux Provider
React Query Provider
AuthContext Provider

---

# 13. Redux State Management

Redux must be used for **global client state only**.

Examples:

authentication state
UI preferences
layout state

Server data must **not** be stored in Redux.

Instead use **TanStack Query**.

---

# 14. TanStack Query Usage

TanStack Query must be used for:

* API fetching
* caching
* background updates
* pagination
* mutations

Example:

```
useQuery()
useMutation()
```

Query keys must follow a structured pattern.

Example:

```
["supervisions"]
["supervisions", supervisionId]
```

---

# 15. UI Design Rules

The UI must use **Ant Design components**.

Examples:

Layout
Menu
Table
Form
Modal
Card

Dashboard charts must use **ECharts**.

---

# 16. Coding Conventions

Copilot must follow these rules.

Language:

TypeScript only.

Components:

Functional components only.

Imports:

Use absolute imports.

Example:

```
import { useAuth } from "@/shared/context/AuthContext"
```

Naming:

Pages → PascalCase
Components → PascalCase
Hooks → camelCase starting with `use`
Files → same as exported component

---

# 17. Performance Guidelines

The application must remain performant.

Use:

React lazy loading for pages
React Query caching
memoization when needed

Large tables must use **server-side pagination**.

---

# 18. Security Guidelines

Copilot must generate secure code.

Rules:

Never expose secrets
Validate user inputs
Handle API errors
Protect protected routes

---

# 19. Accessibility and UX

The UI must remain accessible.

Rules:

* clear navigation
* responsive design
* proper labels in forms
* loading states
* error messages

---

# 20. Non-Functional Requirements

The system must satisfy the following requirements: 

Performance:

* API response < 2 seconds
* dashboard load < 5 seconds

Security:

* encrypted passwords
* SQL injection protection
* audit logging

Usability:

* intuitive UI
* responsive design

Compatibility:

* Chrome
* Firefox
* Edge

---

# 21. Placeholder Implementation Policy

When generating new pages, Copilot must first generate **minimal placeholder implementations**.

Example:

```
export default function SupervisionListPage() {
  return <div>Supervision List Page</div>
}
```

Business logic will be added later.

---

# 22. Copilot Behavior Rules

Copilot must:

* respect the architecture
* not create new patterns
* not duplicate code
* reuse shared modules
* keep code clean and modular

Copilot must **never modify the folder structure**.

---

# 23. Future Features

The architecture must remain extensible for:

notifications
email alerts
AI analysis tools
advanced reporting
research project tracking

These must be implemented as **new features under `/features`**.

---

# End of Copilot Instructions
