# ExpoInit

A modern, developer-focused web application for generating Expo project configurations. Built with React, TypeScript, and shadcn/ui, ExpoInit provides a Spring Initializr-like experience for Expo projects.

## Features

- **Template Selection**: Choose from various Expo project templates (blank, tabs, bare-minimum, blank-typescript)
- **App Configuration**: Configure app name, slug, version, icon, and splash screen with instant updates
- **Expo Modules Modal**: Beautiful card-based selection of Expo modules with automatic permission handling
  - Image Picker
  - Location
  - Notifications
  - Camera
  - Haptics
  - Visual selection indicators and package badges
- **Dependencies Modal**: Card-based interface for adding popular packages
  - Zustand, Redux Toolkit, React Navigation
  - React Hook Form, Axios, TanStack Query
  - One-click selection with version display
- **Preview Modal**: Full-screen preview with tabs for `app.json` and `package.json`
  - Copy to clipboard functionality
  - Download both files with one click
  - Syntax-highlighted display
- **Project Summary**: Real-time stats showing modules, dependencies, and plugins
- **Non-Scrollable Layout**: Clean, viewport-contained design with strategic overflow
- **Dark/Light Mode**: Toggle between themes with system preference support

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── sections/          # UI sections
│   │   ├── TemplateSection.tsx
│   │   ├── ConfigSection.tsx
│   │   ├── ModulesSection.tsx
│   │   ├── DependenciesSection.tsx
│   │   ├── JsonEditorSection.tsx
│   │   └── PreviewSection.tsx
│   ├── ui/                # shadcn/ui components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── config/
│   ├── defaults.ts        # Default configurations
│   ├── modules.ts         # Expo modules registry
│   └── dependencies.ts    # Available dependencies
├── store/
│   └── useExpoStore.ts    # Zustand store
├── types/
│   └── expo.ts            # TypeScript types
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx
└── main.tsx
```

## How It Works

### Module System

Each Expo module follows a registry pattern with:
- **id**: Unique identifier
- **label**: Display name
- **description**: Module description
- **packages**: NPM packages to install
- **applyConfig**: Function to modify app.json (adds plugins, permissions, etc.)
- **revertConfig**: Function to revert changes when module is deselected

### State Management

The app uses Zustand for global state management with the following features:
- Template selection
- App configuration (name, slug, version, etc.)
- Selected modules and dependencies
- Live JSON editing with validation
- Automatic synchronization between UI and JSON

### Configuration Generation

The app generates two files:
1. **app.json**: Expo configuration with plugins, permissions, and settings
2. **package.json**: NPM dependencies and scripts

## License

MIT
