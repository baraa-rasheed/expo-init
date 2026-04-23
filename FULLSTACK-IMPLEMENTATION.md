# ExpoInit - Full-Stack Implementation Plan

## Overview
This document outlines the complete implementation for transforming ExpoInit into a full-stack application that downloads Expo templates, customizes them based on user preferences, and generates downloadable project ZIPs.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Template Selection                                   │
│  - Configuration Forms                                  │
│  - File Uploads (Icon/Splash)                          │
│  - Module/Dependency Selection                          │
│  - Preview & Download                                   │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────────────┐
│                 Backend (Express/Node)                   │
│  - Fetch Expo Modules from npm                         │
│  - Download Expo Templates                             │
│  - Modify package.json & app.json                      │
│  - Process uploaded images                             │
│  - Generate ZIP files                                   │
└─────────────────────────────────────────────────────────┘
```

## Backend Implementation

### 1. Server Setup ✅ (Created)
- **File**: `server/index.ts`
- **Features**:
  - Express server on port 3001
  - CORS enabled for frontend communication
  - Multer for file uploads (icon, splash)
  - Routes for modules, templates, and generation

### 2. Expo Modules API ✅ (Created)
- **File**: `server/routes/expo-modules.ts`
- **Endpoint**: `GET /api/expo-modules`
- **Features**:
  - Fetches all Expo modules from npm registry
  - Searches for packages with `expo-module` keyword
  - Categorizes modules into:
    - Media & Camera
    - Location & Maps
    - Notifications & Push
    - Authentication & Security
    - Storage & Database
    - Sensors & Hardware
    - UI & Components
    - Analytics & Monitoring
    - Other
  - Returns structured JSON with module metadata

### 3. Templates API ✅ (Created)
- **File**: `server/routes/templates.ts`
- **Endpoint**: `GET /api/templates`
- **Templates**:
  - blank
  - blank-typescript
  - tabs
  - bare-minimum
- Returns template metadata and creation commands

### 4. Project Generation API ✅ (Created)
- **File**: `server/routes/generate.ts`
- **Endpoint**: `POST /api/generate`
- **Process**:
  1. Receive user configuration + uploaded files
  2. Create temp directory
  3. Run `npx create-expo-app` with selected template
  4. Modify `package.json`:
     - Update name, version
     - Add selected dependencies
     - Add module packages
  5. Modify `app.json`:
     - Update app name, slug, version
     - Add plugins from selected modules
     - Configure permissions
  6. Process uploaded images:
     - Save icon.png to assets/
     - Save splash.png to assets/
     - Update app.json paths
  7. Create ZIP archive
  8. Stream ZIP to client
  9. Cleanup temp files

## Frontend Updates Needed

### 1. Update Dependencies Config
**File**: `src/config/dependencies.ts`

Add categorization:

```typescript
export const dependenciesByCategory = {
  'State Management': [
    { id: 'zustand', label: 'Zustand', ... },
    { id: 'redux-toolkit', label: 'Redux Toolkit', ... },
    { id: 'jotai', label: 'Jotai', ... },
  ],
  'Animations': [
    { id: 'reanimated', label: 'React Native Reanimated', package: 'react-native-reanimated', ... },
    { id: 'lottie', label: 'Lottie', package: 'lottie-react-native', ... },
  ],
  'APIs & Networking': [
    { id: 'axios', label: 'Axios', ... },
    { id: 'tanstack-query', label: 'TanStack Query', ... },
  ],
  'UI Components': [
    { id: 'paper', label: 'React Native Paper', package: 'react-native-paper', ... },
    { id: 'elements', label: 'React Native Elements', package: 'react-native-elements', ... },
  ],
  'Navigation': [
    { id: 'react-navigation', label: 'React Navigation', ... },
  ],
  'Forms & Validation': [
    { id: 'react-hook-form', label: 'React Hook Form', ... },
    { id: 'formik', label: 'Formik', package: 'formik', ... },
  ],
};
```

### 2. Update Config Section for File Uploads
**File**: `src/components/sections/ConfigSection.tsx`

Replace URL inputs with file uploads:

```typescript
<div className="grid gap-2">
  <Label htmlFor="icon">App Icon</Label>
  <Input
    id="icon"
    type="file"
    accept="image/png,image/jpg,image/jpeg"
    onChange={(e) => handleIconUpload(e.target.files?.[0])}
  />
  {iconPreview && (
    <img src={iconPreview} alt="Icon preview" className="w-20 h-20 rounded" />
  )}
</div>
```

### 3. Fetch Dynamic Expo Modules
**File**: `src/hooks/useExpoModules.ts` (New)

```typescript
import { useEffect, useState } from 'react';

export function useExpoModules() {
  const [modules, setModules] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://devserver-main--expoinit.netlify.app/api/expo-modules')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch modules:', err);
        setLoading(false);
      });
  }, []);

  return { modules, loading };
}
```

### 4. Update Modules Modal
**File**: `src/components/modals/ModulesModal.tsx`

Update to use dynamic modules with categories:

```typescript
export function ModulesModal() {
  const { modules, loading } = useExpoModules();
  const { selectedModules, toggleModule } = useExpoStore();

  return (
    <Dialog>
      {/* ... */}
      <ScrollArea className="h-[60vh] pr-4">
        {loading ? (
          <div>Loading modules...</div>
        ) : (
          Object.entries(modules).map(([category, mods]) => (
            <div key={category} className="mb-6">
              <h3 className="font-semibold mb-3">{category}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {mods.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </Dialog>
  );
}
```

### 5. Update Dependencies Modal
**File**: `src/components/modals/DependenciesModal.tsx`

Add category sections:

```typescript
export function DependenciesModal() {
  return (
    <Dialog>
      {/* ... */}
      <ScrollArea className="h-[60vh] pr-4">
        {Object.entries(dependenciesByCategory).map(([category, deps]) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold text-lg mb-3">{category}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {deps.map((dep) => (
                <DependencyCard key={dep.id} dependency={dep} />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </Dialog>
  );
}
```

### 6. Update Preview Modal with Generation
**File**: `src/components/modals/PreviewModal.tsx`

Add actual project generation:

```typescript
const handleGenerate = async () => {
  setGenerating(true);
  
  const formData = new FormData();
  formData.append('template', template);
  formData.append('appName', config.expo.name);
  formData.append('slug', config.expo.slug);
  formData.append('version', config.expo.version);
  formData.append('selectedModules', JSON.stringify(Array.from(selectedModules)));
  formData.append('selectedDependencies', JSON.stringify(Array.from(selectedDependencies)));
  formData.append('appConfig', JSON.stringify(config));
  formData.append('packageConfig', JSON.stringify(packageJson));
  
  if (iconFile) formData.append('icon', iconFile);
  if (splashFile) formData.append('splash', splashFile);

  try {
    const response = await fetch('https://devserver-main--expoinit.netlify.app/api/generate', {
      method: 'POST',
      body: formData,
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.expo.slug}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Generation failed:', error);
  } finally {
    setGenerating(false);
  }
};
```

### 7. Update Zustand Store
**File**: `src/store/useExpoStore.ts`

Add file upload state:

```typescript
interface ExpoStore {
  // ... existing
  iconFile: File | null;
  splashFile: File | null;
  setIconFile: (file: File | null) => void;
  setSplashFile: (file: File | null) => void;
}
```

## Additional Features to Implement

### 1. Progress Indicator
Show progress during project generation:
- Downloading template...
- Installing dependencies...
- Configuring files...
- Generating ZIP...

### 2. Error Handling
- Template download failures
- Invalid file uploads
- Network errors
- Disk space issues

### 3. Validation
- File size limits (5MB for images)
- File type validation (PNG/JPG only)
- App name validation (no special chars)
- Slug validation (lowercase, hyphens only)

### 4. Caching
- Cache fetched Expo modules (1 hour TTL)
- Cache template metadata

### 5. Analytics
- Track popular modules
- Track popular dependencies
- Track template usage

## Environment Setup

### Required Environment Variables
```env
# .env
PORT=3001
TEMP_DIR=./temp
MAX_FILE_SIZE=5242880
CACHE_TTL=3600
```

### Development Commands
```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server

# Build for production
npm run build
npm run build:server
```

## Deployment Considerations

### Frontend
- Deploy to Vercel/Netlify
- Environment variable for API URL

### Backend
- Deploy to Railway/Render/Heroku
- Ensure sufficient disk space for temp files
- Set up cleanup cron job
- Configure CORS for production domain

### Full-Stack
- Deploy both on same platform (e.g., Railway)
- Use monorepo structure
- Shared environment variables

## Testing Strategy

### Backend Tests
- Unit tests for module categorization
- Integration tests for project generation
- E2E tests for full flow

### Frontend Tests
- Component tests for modals
- Integration tests for file uploads
- E2E tests with Playwright

## Security Considerations

1. **File Upload Security**
   - Validate file types
   - Scan for malware
   - Limit file sizes
   - Sanitize filenames

2. **Command Injection**
   - Sanitize all user inputs
   - Use parameterized commands
   - Validate template names

3. **Rate Limiting**
   - Limit API requests per IP
   - Prevent abuse of generation endpoint

4. **Temp File Cleanup**
   - Auto-cleanup after 5 minutes
   - Cron job for orphaned files
   - Disk space monitoring

## Performance Optimizations

1. **Caching**
   - Cache npm registry responses
   - Cache template metadata
   - Use Redis for distributed caching

2. **Async Processing**
   - Queue system for project generation
   - Background workers
   - Progress webhooks

3. **CDN**
   - Serve static assets via CDN
   - Cache common templates

## Next Steps

1. ✅ Create backend server structure
2. ✅ Implement Expo modules API
3. ✅ Implement templates API
4. ✅ Implement generation API
5. ⏳ Update frontend to use file uploads
6. ⏳ Integrate dynamic module fetching
7. ⏳ Add categorized dependencies
8. ⏳ Test full generation flow
9. ⏳ Add error handling
10. ⏳ Deploy to production

## Current Status

**Backend**: ✅ Core structure created
- Server setup complete
- Routes defined
- Module fetching implemented
- Template API ready
- Generation logic implemented

**Frontend**: ⏳ Needs updates
- Need to add file upload inputs
- Need to fetch dynamic modules
- Need to categorize dependencies
- Need to integrate with backend API

**Next Immediate Steps**:
1. Test backend server
2. Update ConfigSection for file uploads
3. Create useExpoModules hook
4. Update modals to use backend data
5. Test full flow end-to-end
