# PiiAura Backend

The mobile app connects to **[EduOS-backend](https://github.com/Likhithagandham/EduOS-backend)** — a Django 5 + DRF multi-tenant education platform API.

This folder documents how to run and connect that backend. The API code itself lives in a separate repository (clone it alongside this monorepo).

## Clone and run

```powershell
git clone https://github.com/Likhithagandham/EduOS-backend.git
cd EduOS-backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements-dev.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

API base: `http://localhost:8000/api/v1/`

## Connect the mobile app

```powershell
cd frontend\apps\mobile
copy .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:8000
EXPO_PUBLIC_TENANT_ID=c1bbddb5-0b05-4dd9-9042-65ddb7941ff2
```

Or use subdomain instead of tenant ID:

```env
EXPO_PUBLIC_TENANT_SUBDOMAIN=greenfield
```

Then from the repo root:

```powershell
pnpm mobile
```

## Local seed tenants

| Institution | Subdomain | Tenant ID |
|-------------|-----------|-----------|
| Greenfield Academy | `greenfield` | `c1bbddb5-0b05-4dd9-9042-65ddb7941ff2` |
| Horizon Engineering College | `horizon` | `66a8b903-3349-4335-9d22-414dd5394d5e` |

## API modules used by mobile

| Prefix | Purpose |
|--------|---------|
| `/api/v1/auth/` | Login, JWT, dashboards, profiles |
| `/api/v1/organizations/` | Tenant config (subdomain → tenant ID) |
| `/api/v1/academics/` | Timetable, study materials, syllabus |
| `/api/v1/attendance/` | Attendance, leave |
| `/api/v1/examinations/` | Exams, assignments, marks, invigilation |
| `/api/v1/fees/` | Student fees |
| `/api/v1/hr/` | Faculty leave, payslips |
| `/api/v1/communications/` | Announcements |
| `/api/v1/coursework/` | Homework |
| `/api/v1/grievances/` | Help & support tickets |

Full mapping: `frontend/packages/api/EDUOS.md`
