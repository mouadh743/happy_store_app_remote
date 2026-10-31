# Orders Admin

Mobile admin app for the Happy Store `orders` table in Supabase.
Expo (SDK 58, TypeScript, Expo Router), supabase-js, TanStack Query.

## Run it

```bash
npm install
cp .env.example .env      # then fill in your Supabase URL and anon key
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS), or press
`i` / `a` for the iOS simulator / Android emulator. This app targets iOS and
Android; web is not supported (SecureStore is mobile-only).

After changing `.env`, restart with `npx expo start --clear` so the new values
are picked up.

## Checks

```bash
npm run typecheck
npm run lint
```

## Where things live

- `src/app/` — screens (Expo Router). `(tabs)/` holds the tab bar screens.
- `src/theme.ts` — colours, sizes and type from the mockup.
- `src/strings.ts` — all UI text (add Arabic here later).
- `src/format.ts` — money (`86.500 TND`) and date (`Today, 10:42`) formatting.
- `src/features/orders/` — order statuses, colours, data access and hooks.
- `src/lib/` — Supabase client, secure session storage, query client.
- `supabase/migrations/` — SQL for Row Level Security. **Not applied automatically**: run it yourself.
# happy_store_app_remote
