# PiiAura

ERP mobile application monorepo, connected to **[EduOS-backend](https://github.com/Likhithagandham/EduOS-backend)**.

## Structure

```
PiiAura_App/
  frontend/          Mobile app + shared packages (API client → EduOS)
  backend/           Setup docs for EduOS-backend
  apps/              EduOS web portals (institution, platform)
```

## Quick start

### 1. Start EduOS-backend

```bash
git clone https://github.com/Likhithagandham/EduOS-backend.git
cd EduOS-backend
python -m venv .venv
# activate venv
pip install -r requirements-dev.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

API runs at `http://localhost:8000` with routes under `/api/v1/`.

### 2. Configure the mobile app

```bash
cd frontend/apps/mobile
copy .env.example .env   # Windows
# edit .env — set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_TENANT_ID
```

| Variable | Example |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | `http://192.168.x.x:8000` (phone) or `http://localhost:8000` (emulator) |
| `EXPO_PUBLIC_TENANT_ID` | `c1bbddb5-0b05-4dd9-9042-65ddb7941ff2` (Greenfield Academy) |
| `EXPO_PUBLIC_TENANT_SUBDOMAIN` | `greenfield` (alternative to tenant ID) |

### 3. Run the mobile app

```bash
pnpm install
pnpm mobile
```

## How it connects

- **No mock data** — all screens fetch from EduOS via `frontend/packages/api`
- **Auth** — JWT login at `/api/v1/auth/login/`
- **Data** — React Query hooks in `frontend/packages/hooks` call the API client
- **Response format** — EduOS `{ success, data, message }` envelope is unwrapped automatically

See `frontend/packages/api/EDUOS.md` for the full endpoint map.
