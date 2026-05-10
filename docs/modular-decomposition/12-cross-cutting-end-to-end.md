# Cross-cutting concerns — backend and frontend

```mermaid
flowchart TB
  subgraph authN [Authentication]
    b1[JWT Authorization header]
    b2[/api/v1/auth login refresh me]
    f1[login stores tokens]
    f2[axios Bearer AuthContext]
  end

  subgraph rbac [RBAC]
    br[requireAuth requireRole]
    fr[RoleRoute portal routes]
  end

  subgraph valWF [Supervision validation workflow]
    bv[validationStatus ValidationLog POST validate reject revise]
    fv[validation feature queue detail history]
  end

  subgraph emailN [Email]
    be[Nodemailer templates]
    fe[Forgot password credential flows via API]
  end

  subgraph auditN [Audit]
    ba[audit_logs admin GET]
    fa[Admin audit log page]
  end

  subgraph notifN [Notifications]
    bn[notifications REST]
    fn[notification hooks shell UI]
  end

  b1 --> br
  b2 --> b1
  f1 --> f2
  bv --> fv
  ba --> fa
  bn --> fn
```
