# Contributing to ExpoInit

Thanks for considering a contribution! This is a small project — drive-by
fixes, new dependency definitions, and improved module metadata are all very
welcome.

## Development setup

```bash
git clone https://github.com/<your-org>/expo-init.git
cd expo-init
npm install
cp .env.example .env
npm run dev
```

The app runs on [http://localhost:5173](http://localhost:5173). API routes
are served from the same origin under `/api/*`.

## Before opening a pull request

1. Run `npm run typecheck` and make sure it passes.
2. Run `npm run format` so the diff stays consistent with Prettier.
3. Keep PRs focused. If you're refactoring _and_ adding a feature, split it
   into two PRs when reasonable.
4. Update [README.md](./README.md) if you change behaviour, scripts, or
   environment variables.

## Adding a dependency to the curated list

Dependency definitions live in
[`src/config/dependencies.ts`](./src/config/dependencies.ts). Add a new entry
to the appropriate category, including:

- a stable `id`,
- a short user-facing `label` and `description`,
- the npm `package` name,
- a pinned `version` known to work with current Expo SDK.

## Adding or updating an Expo module

Module metadata is fetched live from the Expo docs and npm. To add a new
module to the catalog, append its short name to `EXPO_SDK_MODULES` in
[`server/services/expoModuleFetcher.ts`](./server/services/expoModuleFetcher.ts)
and (optionally) map it to a category in `categoryMap`.

## Project conventions

- TypeScript strict mode, no `any` in new code unless unavoidable.
- Prefer functional React components and hooks.
- Tailwind utility classes for styling; reach for `cn()` (in `src/lib/utils.ts`)
  when composing.
- shadcn/ui components are added with `npx shadcn add <name>` and end up in
  `src/components/ui/`.

## Reporting bugs

Open an issue with:

- what you expected to happen,
- what actually happened,
- a minimal reproduction (or your `app.json` selections, if generation broke).
