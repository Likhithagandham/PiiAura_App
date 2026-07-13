# PiiAura Backend

The API lives in a separate repo on this machine:

**`C:\Users\likhi\PiiAura\EduOS-backend`**

The mobile app talks to it over HTTP at `/api/v1/`.

## Start the backend

```powershell
cd C:\Users\likhi\PiiAura\EduOS-backend
.\.venv\Scripts\activate
python manage.py runserver
```

API: `http://localhost:8000`  
Health: `http://localhost:8000/health/`

## Connect the mobile app

1. Copy env file:

```powershell
cd frontend\apps\mobile
copy .env.example .env
```

2. Edit `.env`:
   - **Emulator on same PC:** `EXPO_PUBLIC_API_URL=http://localhost:8000`
   - **Physical phone:** use your PC LAN IP, e.g. `http://192.168.1.5:8000`
   - **Tenant ID:** UUID from EduOS (local seed: Greenfield Academy `c1bbddb5-0b05-4dd9-9042-65ddb7941ff2`)

3. Start mobile:

```powershell
cd C:\Users\likhi\PiiAura_App
pnpm mobile
```

## Sample login (local seed data)

| Field | Value |
|-------|-------|
| Identifier | `STU-001` |
| Role | student |
| Tenant | Greenfield Academy (`c1bbddb5-0b05-4dd9-9042-65ddb7941ff2`) |

Use the password set in your EduOS seed data.

## API overview

| Prefix | App |
|--------|-----|
| `/api/v1/auth/` | login, me, dashboards, profiles |
| `/api/v1/academics/` | timetable, study materials, syllabus |
| `/api/v1/attendance/` | attendance, leave |
| `/api/v1/examinations/` | exams, assignments, marks |
| `/api/v1/fees/` | student fees |
| `/api/v1/hr/` | leave, payslips |
| `/api/v1/communications/` | announcements |
| `/api/v1/coursework/` | homework |

See [EduOS-backend](https://github.com/Likhithagandham/EduOS-backend) for migrations and full setup.
