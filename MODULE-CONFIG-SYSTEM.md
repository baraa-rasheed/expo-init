# Expo Module Configuration System

## Overview
The module configuration system ensures that each Expo module is properly configured in `app.json` according to official Expo documentation, including plugins, permissions, and platform-specific settings.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│          Module Configuration Database                   │
│         (server/config/module-configs.ts)               │
│                                                          │
│  Each module has:                                       │
│  - id, name, description                                │
│  - packages (npm packages to install)                   │
│  - category                                             │
│  - applyConfig() function                              │
│  - requiredPermissions (iOS & Android)                 │
│  - pluginConfig (if needed)                            │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│           Expo Modules API Route                        │
│        (server/routes/expo-modules.ts)                  │
│                                                          │
│  1. Fetches modules from npm registry                  │
│  2. Merges with configuration database                 │
│  3. Returns categorized modules with config info       │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│          Project Generation Route                       │
│         (server/routes/generate.ts)                     │
│                                                          │
│  For each selected module:                             │
│  1. Looks up module config                             │
│  2. Calls applyConfig(appJson)                         │
│  3. Modifies app.json with proper settings             │
└─────────────────────────────────────────────────────────┘
```

## Module Configuration Structure

Each module configuration follows this interface:

```typescript
interface ModuleConfig {
  id: string;                    // npm package name
  name: string;                  // Friendly display name
  description: string;           // User-facing description
  packages: string[];            // npm packages to install
  category: string;              // Category for grouping
  applyConfig: (appJson: any) => any;  // Function to modify app.json
  requiredPermissions?: {
    ios?: string[];              // iOS permission keys
    android?: string[];          // Android permission strings
  };
  pluginConfig?: any;            // Plugin configuration object
}
```

## Configured Modules

### Media & Camera
1. **expo-image-picker**
   - Adds plugin with permission messages
   - iOS: NSPhotoLibraryUsageDescription, NSCameraUsageDescription
   - Android: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, CAMERA

2. **expo-camera**
   - Adds plugin with camera/microphone permissions
   - iOS: NSCameraUsageDescription, NSMicrophoneUsageDescription
   - Android: CAMERA, RECORD_AUDIO

3. **expo-media-library**
   - Adds plugin with photo access permissions
   - iOS: NSPhotoLibraryUsageDescription, NSPhotoLibraryAddUsageDescription
   - Android: READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, ACCESS_MEDIA_LOCATION

4. **expo-av**
   - Adds plugin for audio/video
   - iOS: NSMicrophoneUsageDescription
   - Android: RECORD_AUDIO

5. **expo-barcode-scanner**
   - Adds plugin for barcode scanning
   - iOS: NSCameraUsageDescription
   - Android: CAMERA

### Location & Maps
1. **expo-location**
   - Adds plugin with location permission messages
   - iOS: NSLocationWhenInUseUsageDescription, NSLocationAlwaysAndWhenInUseUsageDescription
   - Android: ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION

### Notifications & Push
1. **expo-notifications**
   - Adds plugin with notification icon and color config
   - Android: POST_NOTIFICATIONS

### Authentication & Security
1. **expo-local-authentication**
   - Adds plugin for biometric authentication
   - iOS: NSFaceIDUsageDescription
   - Android: USE_BIOMETRIC, USE_FINGERPRINT

### Storage & Database
1. **expo-secure-store** - No permissions needed
2. **expo-file-system** - No permissions needed
3. **expo-sqlite** - No permissions needed

### Other
1. **expo-contacts**
   - Adds plugin with contacts permission
   - iOS: NSContactsUsageDescription
   - Android: READ_CONTACTS, WRITE_CONTACTS

2. **expo-calendar**
   - Adds plugin for calendar access
   - iOS: NSCalendarsUsageDescription, NSRemindersUsageDescription
   - Android: READ_CALENDAR, WRITE_CALENDAR

3. **expo-haptics** - No permissions needed
4. **expo-clipboard** - No permissions needed
5. **expo-constants** - No permissions needed
6. **expo-device** - No permissions needed
7. **expo-font** - No permissions needed
8. **expo-linking** - No permissions needed

## How It Works

### 1. Module Fetching
When the frontend requests modules (`GET /api/expo-modules`):

```typescript
// Fetch from npm
const npmModules = await fetchFromNpm();

// Merge with configurations
const enrichedModules = npmModules.map(module => {
  const config = moduleConfigs[module.id];
  if (config) {
    return {
      ...module,
      name: config.name,           // Better name
      description: config.description,  // Better description
      hasConfig: true,             // Indicates proper config exists
      requiredPermissions: config.requiredPermissions,
      category: config.category,
    };
  }
  return { ...module, hasConfig: false };
});
```

### 2. Configuration Application
When generating a project:

```typescript
// For each selected module
selectedModules.forEach(moduleId => {
  const moduleConfig = moduleConfigs[moduleId];
  if (moduleConfig) {
    // Apply the module's configuration
    appJson = moduleConfig.applyConfig(appJson);
  }
});
```

### 3. Example: expo-camera Configuration

```typescript
applyConfig: (appJson: any) => {
  // 1. Add plugin with config
  if (!appJson.expo.plugins) appJson.expo.plugins = [];
  appJson.expo.plugins.push([
    'expo-camera',
    {
      cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
      microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
      recordAudioAndroid: true,
    },
  ]);

  // 2. Add iOS permissions
  if (!appJson.expo.ios) appJson.expo.ios = {};
  if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
  appJson.expo.ios.infoPlist.NSCameraUsageDescription = 
    'Allow $(PRODUCT_NAME) to access camera';
  appJson.expo.ios.infoPlist.NSMicrophoneUsageDescription = 
    'Allow $(PRODUCT_NAME) to access microphone';

  // 3. Add Android permissions
  if (!appJson.expo.android) appJson.expo.android = {};
  if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
  ['CAMERA', 'RECORD_AUDIO'].forEach(perm => {
    if (!appJson.expo.android.permissions.includes(perm)) {
      appJson.expo.android.permissions.push(perm);
    }
  });

  return appJson;
}
```

## Benefits

### 1. Accuracy
- Configurations based on official Expo documentation
- Proper plugin setup for each module
- Correct permission strings

### 2. Completeness
- Handles both iOS and Android
- Includes all required permissions
- Adds necessary plugin configurations

### 3. Maintainability
- Centralized configuration database
- Easy to add new modules
- Easy to update existing configs

### 4. User Experience
- Users don't need to know configuration details
- Automatic permission setup
- No manual app.json editing needed

## Adding New Modules

To add a new module configuration:

```typescript
// In server/config/module-configs.ts
export const moduleConfigs: Record<string, ModuleConfig> = {
  // ... existing modules

  'expo-new-module': {
    id: 'expo-new-module',
    name: 'New Module',
    description: 'Description of what it does',
    packages: ['expo-new-module'],
    category: 'Appropriate Category',
    requiredPermissions: {
      ios: ['NSNewPermission'],
      android: ['NEW_PERMISSION'],
    },
    applyConfig: (appJson: any) => {
      // Add plugin
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      appJson.expo.plugins.push([
        'expo-new-module',
        {
          // Plugin configuration
        },
      ]);

      // Add iOS permissions
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSNewPermission = 'Permission message';

      // Add Android permissions
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      if (!appJson.expo.android.permissions.includes('NEW_PERMISSION')) {
        appJson.expo.android.permissions.push('NEW_PERMISSION');
      }

      return appJson;
    },
  },
};
```

## Testing

To verify module configurations:

1. **Select module in UI**
2. **Generate project**
3. **Check app.json** for:
   - Plugin added to `expo.plugins`
   - iOS permissions in `expo.ios.infoPlist`
   - Android permissions in `expo.android.permissions`
4. **Verify package.json** has module package

## Future Enhancements

1. **Auto-sync with Expo docs**
   - Scrape official documentation
   - Auto-generate configurations
   - Keep configs up-to-date

2. **Validation**
   - Validate generated app.json
   - Check for conflicts
   - Warn about incompatibilities

3. **Custom configurations**
   - Allow users to customize permission messages
   - Configure plugin options
   - Override default settings

4. **Documentation links**
   - Link to official docs for each module
   - Show configuration examples
   - Provide troubleshooting tips

## References

- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
- [Expo Modules](https://docs.expo.dev/modules/overview/)
- [iOS Info.plist Keys](https://developer.apple.com/documentation/bundleresources/information_property_list)
- [Android Permissions](https://developer.android.com/reference/android/Manifest.permission)
