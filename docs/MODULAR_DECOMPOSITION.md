# LMCS Insight — Modular decomposition

This report explains how the codebase is split into modules and how dependencies flow. Narrative detail lives here in **Mermaid** form; the same diagrams are also extracted as separate files under [`docs/modular-decomposition/`](./modular-decomposition/README.md) for reuse or side-by-side viewing. For prose-only API listings, see [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) and [api-endpoint-guide.md](./api-endpoint-guide.md).

---

## 1. Purpose, scope, and vocabulary

```mermaid
mindmap
  root((LMCS Insight modules))
    Backend domain module
      HTTP cluster in backend/src/routes
      Business logic in backend/src/services
      Persistence in prisma/schema.prisma
    Cross-cutting backend
      Middleware JWT RBAC
      Email Nodemailer templates
      Audit notifications
      Global error handler
      Prisma client bootstrap
    Frontend feature module
      Slice under src/features/name
      Pages hooks API clients
    Frontend infrastructure
      src/shared contexts axios query
      src/layouts shells
      src/components/ui primitives
      src/app/router.tsx routing hub
```

```mermaid
flowchart TB
  subgraph mono [LMCS Insight monorepo]
    subgraph spa [React SPA]
      rootPkg[package.json at repo root]
      src[src/ Vite application]
    end
    subgraph api [REST API]
      backend[backend/ Express]
      prismaSchema[backend/prisma/schema.prisma]
    end
    subgraph db [Persistence]
      pg[(PostgreSQL)]
    end
  end
  src --> backend
  backend --> prismaSchema
  prismaSchema --> pg
```

---

## 2. System architecture

```mermaid
flowchart LR
  subgraph client [Browser]
    Vite[Vite-built SPA]
    Router[react-router client routes]
    Vite --> Router
  end
  subgraph spaLayers [React SPA layers]
    Features[src/features]
    Shared[src/shared]
    Features --> Shared
  end
  subgraph api [Express API]
    Routes[backend/src/routes]
    Services[backend/src/services]
    MW[middleware]
    Routes --> Services
    MW -. wraps .-> Routes
  end
  DB[(PostgreSQL via Prisma)]
  Router --> Features
  Shared -->|HTTPS JWT Bearer| Routes
  Services --> DB
```

```mermaid
flowchart TB
  subgraph roles [RBAC roles]
    ADMIN[ADMIN]
    DIRECTOR[DIRECTOR]
    RESEARCHER[RESEARCHER]
    ASSISTANT[ASSISTANT]
  end
  subgraph enforcement [Where enforced]
    Server[requireAuth requireRole]
    UI[ProtectedRoute RoleRoute portal layouts]
  end
  roles --> Server
  roles --> UI
```

**Runtime boundaries:** one backend process ([`backend/src/server.ts`](../backend/src/server.ts) → [`backend/src/app.ts`](../backend/src/app.ts)); one static SPA bundle with client-side routing ([`src/app/router.tsx`](../src/app/router.tsx)).

---

## 3. Backend modular decomposition

### 3.1 Bootstrap and route registration

```mermaid
flowchart TB
  server[server.ts listens PORT]
  loadEnv[loadEnv.ts root .env then backend .env]
  app[app.ts Express app]
  cors[cors bodyParser.json]
  routes[Mount all starRoutes app]
  err[errorHandler last]
  prismaInit[db/prisma.ts PrismaClient adapter]
  server --> loadEnv
  server --> app
  app --> cors
  app --> routes
  app --> err
  routes --> prismaInit
```

```mermaid
flowchart LR
  appTs[app.ts]
  authR[authRoutes]
  usersR[usersRoutes]
  studentsR[studentsRoutes]
  themesR[themesRoutes]
  teamsR[teamsRoutes]
  chercheursR[chercheursRoutes]
  supervisionsR[supervisionsRoutes]
  validationR[validationRoutes]
  notificationsR[notificationsRoutes]
  adminR[adminRoutes]
  appTs --> authR
  appTs --> usersR
  appTs --> studentsR
  appTs --> themesR
  appTs --> teamsR
  appTs --> chercheursR
  appTs --> supervisionsR
  appTs --> validationR
  appTs --> notificationsR
  appTs --> adminR
```

`routes/index.ts` is a placeholder and is **not** mounted by `app.ts`.

### 3.2 Domain modules — routes, services, access

```mermaid
flowchart TB
  subgraph auth [Auth]
    ar[routes/auth.ts]
    as[services/auth.ts]
    ar --> as
    ar -.->|public| login[POST login refresh]
    ar -.->|JWT| me[GET me]
  end

  subgraph users [Users admin]
    ur[routes/users.ts]
    us[services/users.ts]
    ur --> us
    ur -.->|ADMIN only| ucrud[CRUD stats reset-password]
  end

  subgraph students [Students]
    sr[routes/students.ts]
    ss[services/students.ts]
    sr --> ss
    sr -.->|authenticated| scrud[CRUD list]
  end

  subgraph themes [Themes]
    tr[routes/themes.ts]
    ts[services/themes.ts]
    tr --> ts
    tr -.->|read auth| tlist[list get]
    tr -.->|write ASSISTANT ADMIN| twrite[create update delete]
  end

  subgraph teams [Teams]
    ter[routes/teams.ts]
    tes[services/teams.ts]
    ter --> tes
    ter -.->|read auth| telist[list get]
    ter -.->|write ADMIN| tecrud[create update delete]
  end

  subgraph chercheurs [Chercheurs directory]
    chr[routes/chercheurs.ts]
    chs[services/chercheurs.ts]
    chr --> chs
    chr -.->|authenticated| chlist[GET list]
  end

  subgraph supervisions [Supervisions]
    sur[routes/supervisions.ts]
    sus[services/supervisions.ts]
    val[services/validation.ts]
    sur --> sus
    sur --> val
    sur -.->|ASSISTANT| scud[create update delete supervisors]
    sur -.->|RESEARCHER| sval[validate reject revise]
    sur -.->|scoped lists| slist[GET list detail]
  end

  subgraph validationViews [Validation aggregated reads]
    vr[routes/validation.ts]
    vs[services/validation.ts]
    vr --> vs
    vr -.->|ASSISTANT DIRECTOR RESEARCHER| vqueue[queue stats history]
  end

  subgraph notifications [Notifications]
    nr[routes/notifications.ts]
    ns[services/notifications.ts]
    nr --> ns
    nr -.->|authenticated| nlist[GET list mark read]
  end

  subgraph admin [Admin dashboard and audit API]
    adr[routes/admin.ts]
    ads[services/admin.ts]
    adr --> ads
    adr -.->|ADMIN| astats[stats audit-logs]
  end
```

### 3.3 Cross-cutting backend modules

```mermaid
flowchart TB
  subgraph cross [Cross-cutting modules]
    jwt[tokenUtils sign verify JWT]
    amw[authMiddleware Bearer to req.user]
    rmw[roleMiddleware allowed roles]
    eh[errorHandler Zod Prisma HTTP]
    email[email.ts Nodemailer]
    tmpl[emailTemplates HTML]
    audit[audit.ts audit_logs]
    notifyW[notifications.ts create rows]
    prisma[db/prisma.ts PrismaClient]
    models[db/models/index.ts delegates]
  end

  subgraph consumers [Used by]
    routes[routes/*]
    services[services/*]
  end

  jwt --> amw
  amw --> routes
  rmw --> routes
  routes --> eh
  services --> prisma
  services --> models
  services --> email
  services --> audit
  services --> notifyW
  email --> tmpl
```

### 3.4 Persistence — Prisma bounded context

```mermaid
erDiagram
  Theme ||--o{ Team : has_teams
  Theme ||--o{ Supervision : optional
  Team }o--o{ Chercheur : members_m2m
  Chercheur ||--o| User : optional_login
  Student ||--o{ Supervision : enrolls
  Supervision ||--o{ SupervisionSupervisor : assignments
  Chercheur ||--o{ SupervisionSupervisor : as_supervisor
  User ||--o{ Supervision : submitted_by
  Supervision ||--o{ ValidationLog : logs
  User ||--o{ ValidationLog : validates
  User ||--o{ AuditLog : acts
  Supervision ||--o{ AuditLog : relates
  User ||--o{ Notification : receives
  Supervision ||--o{ Notification : references
```

```mermaid
flowchart TB
  subgraph org [Organization and research structure]
    Theme
    Team
    Chercheur
  end

  subgraph identity [Identity]
    User
  end

  subgraph academic [Academic operations]
    Student
    Supervision
    SupervisionSupervisor
  end

  subgraph workflow [Workflow and compliance]
    ValidationLog
    AuditLog
    Notification
  end

  Theme --- Team
  Chercheur --- User
  Student --- Supervision
  Supervision --- SupervisionSupervisor
  Supervision --- ValidationLog
  User --- AuditLog
  User --- Notification
```

### 3.5 Operations and quality (non-runtime API surface)

```mermaid
flowchart LR
  subgraph tests [Automated tests]
    jest[Jest __tests__]
    studentsT[students.test]
    superT[supervisions.test]
    themesT[themes.test]
    usersT[users.test]
    jest --> studentsT
    jest --> superT
    jest --> themesT
    jest --> usersT
  end

  subgraph mailscripts [Mail tooling]
    preview[scripts/preview-emails.ts]
    exportT[scripts/export-mail-templates-demo.ts]
  end

  subgraph dbscripts [Database scripts]
    dropV[scripts/drop-views.ts]
    recV[scripts/recreate-views.ts]
    seedE[scripts/seed-demo-extra.ts]
    seedU[scripts/seed-test-users.ts]
    seedP[prisma/seed.ts]
  end

  subgraph runtime [Runtime API]
    api[Express app]
  end

  tests -.->|validates| api
  mailscripts -.->|developer workflow| api
  dbscripts -.->|migrations seeding| api
```

---

## 4. Frontend modular decomposition

Path helpers: [`src/config/routes.ts`](../src/config/routes.ts). Router: [`src/app/router.tsx`](../src/app/router.tsx).

### 4.1 Feature folders and portals

```mermaid
flowchart TB
  subgraph public [Public]
    Landing[Landing /]
  end

  subgraph authBlock [Auth]
    AuthF[auth]
    AuthF --> pathsAuth["/auth/login forgot-password"]
  end

  subgraph researcher [Researcher /researcher/:userId]
    dashR[dashboard supervisions reviews history statistics profile]
  end

  subgraph director [Director /director]
    dashD[dashboard chercheurs search reports profile supervision detail read-only]
  end

  subgraph assistant [Assistant /assistant]
    dashA[dashboard activity supervisions students themes history profile]
  end

  subgraph adminP [Admin /admin]
    adm[users teams themes audit dashboard]
  end

  subgraph reuse [Features reused across portals]
    SupFeat[supervisions]
    StuFeat[students]
    ThFeat[themes]
    ValFeat[validation]
    ChrFeat[chercheurs hook api]
  end

  researcher --> SupFeat
  researcher --> ValFeat
  director --> ChrFeat
  assistant --> SupFeat
  assistant --> StuFeat
  assistant --> ThFeat
  assistant --> ValFeat
  adminP --> adm
```

```mermaid
flowchart LR
  subgraph features [src/features]
    f1[Landing]
    f2[auth]
    f3[dashboard]
    f4[supervisions]
    f5[students]
    f6[themes]
    f7[validation]
    f8[direction]
    f9[admin]
    f10[assistant-portal]
    f11[chercheurs]
    f12[profile]
    f13[statistics]
    f14[notifications]
  end
```

### 4.2 Frontend infrastructure

```mermaid
flowchart TB
  subgraph infra [Infrastructure]
    shared[src/shared contexts axios query]
    guards[src/routes ProtectedRoute RoleRoute]
    layouts[src/layouts shells]
    ui[src/components/ui]
    router[src/app/router.tsx]
    routesCfg[src/config/routes.ts]
  end

  subgraph features [src/features]
    screens[Feature screens hooks]
  end

  router --> layouts
  router --> guards
  router --> screens
  routesCfg --> router
  screens --> shared
  screens --> layouts
  screens --> ui
```

### 4.3 Frontend dependency direction

```mermaid
flowchart TB
  subgraph features [src/features]
    F[Feature screens hooks api modules]
  end

  subgraph infra [Infrastructure]
    Shared[src/shared]
    Layouts[src/layouts]
    UI[src/components/ui]
  end

  F --> Shared
  F --> Layouts
  F --> UI
```

Prefer explicit APIs between features (for example `chercheurs` hooks consumed by `direction` and `admin`) instead of importing another feature’s internals.

---

## 5. Cross-cutting concerns — end to end

```mermaid
flowchart TB
  subgraph authN [Authentication]
    b1[JWT Authorization header]
    b2[/api/v1/auth]
    f1[login stores tokens]
    f2[axios Bearer AuthContext]
  end

  subgraph rbac [RBAC]
    br[requireAuth requireRole]
    fr[RoleRoute portal routes]
  end

  subgraph valWF [Supervision validation]
    bv[validationStatus ValidationLog validate reject revise]
    fv[validation UI queue detail history]
  end

  subgraph emailN [Email]
    be[Nodemailer templates]
    fe[Forgot password flows via API]
  end

  subgraph auditN [Audit]
    ba[audit_logs admin API]
    fa[Admin audit page]
  end

  subgraph notifN [Notifications]
    bn[notifications REST]
    fn[hooks shell UI]
  end

  b1 --> br
  bv --> fv
  ba --> fa
  bn --> fn
```

---

## 6. Layered dependency summary

```mermaid
flowchart TB
  HTTP[HTTP request]
  M[middleware auth role]
  R[routes]
  S[services]
  X[cross-cutting email audit notifications]
  P[(Prisma PostgreSQL)]
  E[errorHandler]

  HTTP --> M
  M --> R
  R --> S
  S --> X
  S --> P
  R --> E
  S --> E
```

```mermaid
flowchart LR
  subgraph spaFlow [Frontend]
    routesUi[router layouts]
    feat[src/features]
    shared[src/shared]
    routesUi --> feat --> shared -->|REST JWT| apiEntry[Express routes]
  end
```

```mermaid
flowchart LR
  thisDoc[This modular decomposition doc]
  impl[IMPLEMENTATION_PLAN.md]
  apiGuide[api-endpoint-guide.md]
  rulesConv[backend-conventions rule]
  rulesDb[backend-database rule]

  thisDoc -.->|complements| impl
  thisDoc -.->|complements| apiGuide
  thisDoc -.->|layers match| rulesConv
  thisDoc -.->|domain terms match| rulesDb
```

---

*Diagram sources: [`docs/modular-decomposition/`](./modular-decomposition/README.md).*
