# PiiAura Frontend

Mobile app and shared frontend packages for the PiiAura ERP.

## Structure

```
frontend/
  apps/mobile/       Expo React Native app
  packages/
    api/             HTTP client + API calls (connects to backend/)
    constants/       Routes, app config
    hooks/           React Query hooks + auth
    types/           Shared TypeScript types
    ui/              Shared UI components
    utils/           Frontend utilities (calendar helpers, etc.)
```

## Development

From the repository root:

```bash
pnpm install
pnpm mobile
```

Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_TENANT_ID` to connect to [EduOS-backend](https://github.com/Likhithagandham/EduOS-backend). See `packages/api/EDUOS.md` for endpoint mapping.
