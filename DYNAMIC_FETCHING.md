# Dynamic Expo Module & Template Fetching

## Overview
The system now fetches Expo modules and templates dynamically instead of using hardcoded configurations.

## Expo Modules - Dynamic Fetching

### Source
Modules are fetched from **Expo's official documentation** at `https://docs.expo.dev/versions/latest/sdk/`

### Implementation
**File:** `server/services/expoModuleFetcher.ts`

**Features:**
- Scrapes Expo documentation for each SDK module
- Extracts:
  - Module name and description
  - Whether it needs a config plugin
  - iOS permissions (NSxxxUsageDescription)
  - Android permissions (android.permission.xxx)
  - Plugin configuration options
  - Latest version from npm
- **Caching:** Results cached for 1 hour to avoid excessive requests
- **Fallback:** If fetching fails, returns cached data

### Modules Fetched
All official Expo SDK modules including:
- expo-camera
- expo-contacts ✅ (now correctly shows plugin requirement)
- expo-location
- expo-notifications
- expo-media-library
- And 40+ more...

### Auto-Detection
The system automatically detects:
- **Plugin requirement:** Searches docs for "config plugin", "app.json", "app config"
- **iOS permissions:** Regex match for `NSxxxUsageDescription`
- **Android permissions:** Regex match for `android.permission.xxx`
- **Plugin config:** Smart extraction based on module type

### Example: expo-contacts
```typescript
{
  id: 'expo-contacts',
  name: 'Expo Contacts',
  needsPlugin: true, // ✅ Now correctly detected
  permissions: {
    ios: ['NSContactsUsageDescription'],
    android: ['READ_CONTACTS', 'WRITE_CONTACTS']
  },
  pluginConfig: {
    contactsPermission: {
      type: 'string',
      default: 'Allow $(PRODUCT_NAME) to access your contacts',
      description: 'Contacts permission message'
    }
  }
}
```

## Templates - GitHub Integration

### Source
Templates reference **official Expo GitHub repositories**

### Implementation
**File:** `server/services/templateFetcher.ts`

**Templates:**
- `blank` - Minimal app
- `tabs` - Tab navigation
- `bare-minimum` - Bare workflow
- `blank-typescript` - TypeScript blank

**Each template includes:**
- GitHub URL: `https://github.com/expo/expo`
- Branch: `main`
- Template ID for `create-expo-app`

### Generation
When generating a project, the system uses:
```bash
npx create-expo-app --template expo-template-{templateId}
```

This ensures you always get the **latest template** from Expo's official repository.

## API Endpoints

### GET /api/expo-modules
Returns dynamically fetched Expo modules grouped by category.

**Response:**
```json
{
  "Media & Camera": [
    {
      "id": "expo-camera",
      "name": "Expo Camera",
      "description": "...",
      "version": "14.0.0",
      "needsPlugin": true,
      "permissions": {...},
      "pluginConfig": {...}
    }
  ],
  ...
}
```

### GET /api/templates
Returns available Expo templates with GitHub URLs.

**Response:**
```json
[
  {
    "id": "blank",
    "name": "Blank",
    "description": "A minimal app with a single screen",
    "githubUrl": "https://github.com/expo/expo",
    "branch": "main"
  }
]
```

## Benefits

✅ **Always Up-to-Date:** Fetches latest module info from Expo docs
✅ **Accurate Plugin Detection:** No more manual configuration needed
✅ **Latest Templates:** Always uses current Expo templates
✅ **Auto-Discovery:** New modules automatically appear
✅ **Correct Permissions:** Extracted directly from documentation
✅ **Smart Caching:** Reduces load on Expo servers

## Cache Management

- **Duration:** 1 hour
- **Refresh:** Automatic on cache expiry
- **Manual Refresh:** Restart server to force refresh

## Future Enhancements

- Parse plugin config from actual Expo source code
- Support for community modules
- Template version selection
- Custom template repositories
