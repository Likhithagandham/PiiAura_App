# PiiAura Backend

This folder is reserved for backend-specific code in the PiiAura monorepo.

## Reference implementation

The mobile app integrates with **[EduOS-backend](https://github.com/Likhithagandham/EduOS-backend)** — a multi-tenant Education Management Platform API built with **Django 5 + DRF**.

Use that repository as the source of truth for:

- API routes (`/api/v1/...`)
- Auth (JWT access + refresh)
- Request/response shapes
- Business rules and permissions

## API base URL

Configure the frontend with:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_TENANT_ID=<your-tenant-uuid>
```

## EduOS API overview

| Prefix | App |
|--------|-----|
| `/api/v1/auth/` | accounts (login, me, dashboards, profiles) |
| `/api/v1/academics/` | timetable, study materials, syllabus |
| `/api/v1/attendance/` | attendance, leave |
| `/api/v1/examinations/` | exams, assignments, marks, invigilation |
| `/api/v1/fees/` | student fees & dues |
| `/api/v1/hr/` | leave, payslips |
| `/api/v1/communications/` | announcements |
| `/api/v1/coursework/` | homework |

See [EduOS-backend README](https://github.com/Likhithagandham/EduOS-backend) for setup (`make dev`, migrations, seed data).

## Local development

1. Clone and run EduOS-backend separately (or add it here later).
2. Point `EXPO_PUBLIC_API_URL` at the running API.
3. Run the mobile app: `pnpm mobile` from the repo root.
