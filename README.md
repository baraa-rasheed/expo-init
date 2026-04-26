# ExpoInit

A web UI for scaffolding [Expo](https://expo.dev) projects with a curated set
of modules, dependencies, and `app.json` configuration. Pick a template,
toggle the modules you need, customize their permissions, and download a
ready-to-run zip.

Built with [React Router (framework mode)](https://reactrouter.com/), Tailwind
CSS v4, and shadcn/ui.

**Live**: [expoinit.app](https://expoinit.app)

## Features

- **Templates** – Choose from Expo's official templates (Blank, Tabs, Bare,
  TypeScript) or the latest SDK starter.
- **Modules** – Browse all `expo-*` modules grouped by category, with up-to-date
  data fetched from the Expo docs and npm registry.
- **Dependencies** – Curated list of common React Native dependencies grouped
  by category (state management, navigation, networking, forms, animations,
  UI, utilities).
- **Permission & plugin config** – Configure each module's `app.json` plugin
  block and iOS/Android permission strings.
- **`app.json` editor** – Edit the generated `app.json` directly before
  downloading.
- **One-click generate** – Download the project as a zip with everything
  wired up: dependencies installed in `package.json`, plugins and permissions
  in `app.json`, optional icon and splash assets included.
- **⌘K command palette** – Quick search across modules and dependencies.

## Quick start

```bash
git clone https://github.com/baraa-rasheed/expo-init.git
cd expo-init
npm install
cp .env.example .env
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the React Router dev server with HMR.         |
| `npm run build`     | Build the production bundle.                        |
| `npm run start`     | Run the production server (serves `./build`).       |
| `npm run typecheck` | Generate route types and run `tsc`.                 |
| `npm run format`    | Run Prettier on the project.                        |

## Environment variables

| Variable       | Description                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `PORT`         | Port the production server listens on. Defaults to `3000`.                                                 |
| `VITE_API_URL` | Optional. Override the API base URL when the web UI is hosted on a different origin from the API routes. |

Copy `.env.example` to `.env` and fill in any overrides you need. Only
variables prefixed with `VITE_` are exposed to the browser.

## Project structure

```
.
├── app/                    # React Router framework entry
│   ├── app.css             # Global styles + Tailwind v4 theme
│   ├── root.tsx            # Document layout + ErrorBoundary
│   ├── routes.ts           # Route registry (UI + API)
│   └── routes/             # UI + API routes (framework mode)
│       ├── home.tsx        # Renders the main app
│       └── api.*.ts        # API endpoints (modules/templates/generate/etc.)
├── public/                 # Static assets (favicon, icons)
├── server/services/        # Server-side services used by API routes
│   ├── expoModuleFetcher.ts
│   ├── projectGenerator.ts
│   └── templateFetcher.ts
└── src/
    ├── App.tsx             # Top-level UI shell
    ├── components/         # UI components (sections, modals, shadcn ui)
    ├── config/             # Static configuration (modules, deps, defaults)
    ├── flows/              # Flow registry (open-source flows)
    ├── hooks/              # React hooks (data fetching, etc.)
    ├── store/              # Zustand store
    └── types/              # Shared TypeScript types
```

API routes live under `/api/*` and are colocated with the UI in the same
React Router server. See `app/routes.ts` for the full list.

## Hosting

ExpoInit is hosted at **[expoinit.app](https://expoinit.app)**.

This repo is primarily intended to be run locally for development (see **Quick start** above).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues and PRs are welcome.

## License

[MIT](./LICENSE)
