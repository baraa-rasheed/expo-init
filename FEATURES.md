# ExpoInit - Feature Documentation

## Overview
ExpoInit is a Spring Initializr-inspired web application for generating Expo project configurations. It provides a modern, developer-focused UI for configuring Expo apps with modules, dependencies, and custom settings.

## Core Features

### 1. Template Selection
- **Templates Available:**
  - Blank - Minimal app with a single screen
  - Tabs - App with tab-based navigation
  - Bare Minimum - Bare minimum setup
  - Blank (TypeScript) - Blank template with TypeScript

### 2. App Configuration
Real-time configuration of essential app properties:
- **App Name** - Display name of your application
- **Slug** - URL-friendly identifier
- **Version** - Semantic version (e.g., 1.0.0)
- **Icon URL** - Path to app icon
- **Splash Image URL** - Path to splash screen image

All changes automatically sync to both UI and JSON.

### 3. Expo Modules Modal
Beautiful card-based modal for selecting Expo modules with intelligent automatic configuration:

#### Image Picker
- Packages: `expo-image-picker`
- iOS Permissions: NSPhotoLibraryUsageDescription, NSCameraUsageDescription
- Android Permissions: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, CAMERA

#### Location
- Packages: `expo-location`
- iOS Permissions: NSLocationWhenInUseUsageDescription, NSLocationAlwaysAndWhenInUseUsageDescription
- Android Permissions: ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION

#### Notifications
- Packages: `expo-notifications`
- Configuration: Notification icon and color
- Android Permissions: POST_NOTIFICATIONS

#### Camera
- Packages: `expo-camera`
- iOS Permissions: NSCameraUsageDescription, NSMicrophoneUsageDescription
- Android Permissions: CAMERA, RECORD_AUDIO

#### Haptics
- Packages: `expo-haptics`
- No additional permissions required

**Modal Features:**
- Grid layout with 2 columns
- Visual selection with checkmarks and ring highlights
- Package badges showing npm package names
- Scrollable content for easy browsing
- Click anywhere on card to toggle selection

**Module Behavior:**
- Selecting a module automatically adds required packages to package.json
- Adds necessary plugins to app.json
- Configures iOS infoPlist entries
- Adds Android permissions
- Deselecting a module cleanly reverts all changes

### 4. Dependencies Modal
Card-based modal for selecting popular packages:

- **Zustand** (^5.0.3) - Lightweight state management
- **Redux Toolkit** (^2.5.0) - Official Redux toolset
- **React Redux** (^9.2.0) - React bindings for Redux
- **React Navigation** (^7.0.0) - Routing and navigation
- **React Hook Form** (^7.54.2) - Performant form validation
- **Axios** (^1.7.9) - HTTP client
- **TanStack Query** (^5.62.11) - Data fetching and caching

### 5. Preview Modal
Full-screen modal for reviewing and exporting configuration:

- **Tabbed Interface:**
  - app.json tab with full JSON display
  - package.json tab with full JSON display
  - Easy switching between files

- **Copy to Clipboard:**
  - Individual copy buttons for each file
  - Visual confirmation with checkmark
  - 2-second feedback animation

- **Download Functionality:**
  - One-click download of both files
  - Files downloaded separately as app.json and package.json
  - Ready to use in your Expo project

**Modal Features:**
- Large, readable display (max-width: 4xl)
- Scrollable content area for long files
- Syntax-highlighted monospace font
- Clean, distraction-free interface

### 6. Project Summary
Real-time statistics panel showing:
- Current app name
- App version
- Number of selected modules
- Total dependencies count
- Number of configured plugins

Updates instantly as you make changes.

### 7. Dark/Light Mode
Seamless theme switching:
- Toggle button in header
- System preference detection
- Persistent theme selection (localStorage)
- Smooth transitions between themes
- All components fully themed

## Technical Implementation

### State Management (Zustand)
Global state includes:
- Selected template
- App configuration object
- Package.json object
- Set of selected modules
- Set of selected dependencies

### Module Registry Pattern
Each module implements:
```typescript
{
  id: string
  label: string
  description: string
  packages: string[]
  applyConfig: (config) => updatedConfig
  revertConfig: (config) => updatedConfig
}
```

### Reversible Configuration
- All module changes are reversible
- Clean state management prevents orphaned config
- Deep cloning ensures immutability

### Live Synchronization
- UI changes → JSON updates
- JSON edits → UI updates (when valid)
- Bidirectional data flow
- No manual refresh needed

## User Experience

### Layout
- **Fixed Header:** Logo, title, and theme toggle always visible
- **Three-Column Grid (Non-Scrollable):**
  - Left: Template selection and app configuration (scrollable)
  - Center: Modal triggers for modules, dependencies, and preview
  - Right: Project summary and quick tips (scrollable)
- **Viewport-Contained:** No page scrolling, strategic overflow only
- **Modal-Based Interactions:** Clean, focused experiences for complex selections
- **Responsive Design:** Adapts to mobile and desktop
- **Card-based UI:** Clean, organized sections

### Interactions
- Instant feedback on all actions
- Visual validation states
- Smooth animations
- Keyboard accessible
- Screen reader friendly

### Developer-Focused
- Monospace fonts for code
- Syntax-aware displays
- Copy-paste friendly
- Production-ready output

## Use Cases

1. **Quick Prototyping:** Generate Expo config in seconds
2. **Learning:** Understand Expo configuration structure
3. **Team Onboarding:** Standardize project setup
4. **Module Discovery:** Explore available Expo modules
5. **Configuration Management:** Visual config editing

## Future Enhancements (Potential)
- Export as complete project ZIP
- Custom module definitions
- Configuration templates/presets
- Import existing configurations
- More Expo modules
- Plugin marketplace integration
