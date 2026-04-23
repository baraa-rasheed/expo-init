import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { getExpoModules } from './services/expoModuleFetcher.js';
import { getAllTemplates } from './services/templateFetcher.js';
import { generateRouter } from './routes/generate.js';
import { moduleDetailsRouter } from './routes/module-details.js';
import { templatePreviewRouter } from './routes/template-preview.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Templates endpoint
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Template preview endpoint
app.use('/api/template-preview', templatePreviewRouter);

// Module details endpoint - fetch latest config from Expo docs
app.use('/api/module-details', moduleDetailsRouter);

// Module configuration database based on Expo documentation
const moduleConfigs: Record<string, any> = {
  'expo-camera': {
    category: 'Media & Camera',
    needsPlugin: true,
    permissions: {
      ios: ['NSCameraUsageDescription', 'NSMicrophoneUsageDescription'],
      android: ['CAMERA', 'RECORD_AUDIO']
    },
    pluginConfig: {
      cameraPermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to access your camera', description: 'Camera permission message' },
      microphonePermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to access your microphone', description: 'Microphone permission message' },
      recordAudioAndroid: { type: 'boolean', default: true, description: 'Enable audio recording on Android' }
    }
  },
  'expo-image-picker': {
    category: 'Media & Camera',
    needsPlugin: true,
    permissions: {
      ios: ['NSPhotoLibraryUsageDescription', 'NSCameraUsageDescription'],
      android: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA']
    },
    pluginConfig: {
      photosPermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to access your photos', description: 'Photos permission message' },
      cameraPermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to access your camera', description: 'Camera permission message' }
    }
  },
  'expo-media-library': {
    category: 'Media & Camera',
    needsPlugin: true,
    permissions: {
      ios: ['NSPhotoLibraryUsageDescription', 'NSPhotoLibraryAddUsageDescription'],
      android: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_MEDIA_LOCATION']
    },
    pluginConfig: {
      photosPermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to access your photos', description: 'Photos permission message' },
      savePhotosPermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to save photos', description: 'Save photos permission message' },
      isAccessMediaLocationEnabled: { type: 'boolean', default: false, description: 'Enable media location access on Android' }
    }
  },
  'expo-av': {
    category: 'Media & Camera',
    needsPlugin: false,
    permissions: {
      ios: ['NSMicrophoneUsageDescription'],
      android: ['RECORD_AUDIO']
    }
  },
  'expo-location': {
    category: 'Location & Maps',
    needsPlugin: true,
    permissions: {
      ios: ['NSLocationWhenInUseUsageDescription', 'NSLocationAlwaysAndWhenInUseUsageDescription', 'NSLocationAlwaysUsageDescription'],
      android: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION']
    },
    pluginConfig: {
      locationAlwaysAndWhenInUsePermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to use your location', description: 'Location permission message' },
      locationAlwaysPermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to use your location', description: 'Always location permission message' },
      locationWhenInUsePermission: { type: 'string', default: 'Allow $(PRODUCT_NAME) to use your location', description: 'When in use permission message' },
      isAndroidBackgroundLocationEnabled: { type: 'boolean', default: false, description: 'Enable background location on Android' }
    }
  },
  'expo-notifications': {
    category: 'Notifications & Push',
    needsPlugin: true,
    permissions: {
      android: ['POST_NOTIFICATIONS']
    },
    pluginConfig: {
      icon: { type: 'string', default: './assets/notification-icon.png', description: 'Path to notification icon (Android)' },
      color: { type: 'string', default: '#ffffff', description: 'Notification color (Android)' },
      sounds: { type: 'array', default: [], description: 'Custom notification sounds' }
    }
  },
  'expo-local-authentication': {
    category: 'Authentication & Security',
    needsPlugin: false,
    permissions: {
      ios: ['NSFaceIDUsageDescription'],
      android: ['USE_BIOMETRIC', 'USE_FINGERPRINT']
    }
  },
  'expo-contacts': {
    category: 'Other',
    needsPlugin: false,
    permissions: {
      ios: ['NSContactsUsageDescription'],
      android: ['READ_CONTACTS', 'WRITE_CONTACTS']
    }
  },
  'expo-calendar': {
    category: 'Other',
    needsPlugin: false,
    permissions: {
      ios: ['NSCalendarsUsageDescription', 'NSRemindersUsageDescription'],
      android: ['READ_CALENDAR', 'WRITE_CALENDAR']
    }
  },
  'expo-font': {
    category: 'UI & Components',
    needsPlugin: false
  },
  'expo-blur': {
    category: 'UI & Components',
    needsPlugin: false
  },
  'expo-linear-gradient': {
    category: 'UI & Components',
    needsPlugin: false
  },
  'expo-file-system': {
    category: 'Storage & Database',
    needsPlugin: false
  },
  'expo-secure-store': {
    category: 'Authentication & Security',
    needsPlugin: false
  },
  'expo-sqlite': {
    category: 'Storage & Database',
    needsPlugin: false
  },
  'expo-sensors': {
    category: 'Sensors & Hardware',
    needsPlugin: false
  },
  'expo-haptics': {
    category: 'Sensors & Hardware',
    needsPlugin: false
  },
  'expo-constants': {
    category: 'Other',
    needsPlugin: false
  },
  'expo-device': {
    category: 'Other',
    needsPlugin: false
  }
};

// Helper function to categorize modules
function categorizeModule(packageName: string, keywords: string[] = []): string {
  const config = moduleConfigs[packageName];
  if (config?.category) return config.category;

  const name = packageName.toLowerCase();
  const keywordStr = keywords.join(' ').toLowerCase();

  if (name.includes('camera') || name.includes('image') || name.includes('video') || name.includes('media') || name.includes('av')) {
    return 'Media & Camera';
  } else if (name.includes('location') || name.includes('map')) {
    return 'Location & Maps';
  } else if (name.includes('notification') || name.includes('push')) {
    return 'Notifications & Push';
  } else if (name.includes('auth') || name.includes('biometric') || name.includes('secure')) {
    return 'Authentication & Security';
  } else if (name.includes('storage') || name.includes('sqlite') || name.includes('file')) {
    return 'Storage & Database';
  } else if (name.includes('sensor') || name.includes('haptic') || name.includes('battery') || name.includes('device')) {
    return 'Sensors & Hardware';
  } else if (name.includes('blur') || name.includes('gradient') || name.includes('font') || name.includes('gl')) {
    return 'UI & Components';
  } else if (name.includes('analytics') || name.includes('tracking')) {
    return 'Analytics & Monitoring';
  }
  
  return 'Other';
}

// Expo modules route - Fetch dynamically from Expo docs
app.get('/api/expo-modules', async (req, res) => {
  try {
    // Fetch modules dynamically from Expo documentation
    const modules = await getExpoModules();
    res.json(modules);
  } catch (error) {
    console.error('Error fetching Expo modules:', error);
    
    // Comprehensive fallback list of official Expo modules
    const fallbackModules = {
      'Media & Camera': [
        { 
          id: 'expo-camera', 
          name: 'Camera', 
          description: 'A React component that renders a preview for the device camera', 
          version: 'latest', 
          packages: ['expo-camera'], 
          needsPlugin: true,
          permissions: moduleConfigs['expo-camera'].permissions,
          pluginConfig: moduleConfigs['expo-camera'].pluginConfig
        },
        { 
          id: 'expo-image-picker', 
          name: 'Image Picker', 
          description: 'Provides access to the system UI for selecting images and videos', 
          version: 'latest', 
          packages: ['expo-image-picker'], 
          needsPlugin: true,
          permissions: moduleConfigs['expo-image-picker'].permissions,
          pluginConfig: moduleConfigs['expo-image-picker'].pluginConfig
        },
        { 
          id: 'expo-media-library', 
          name: 'Media Library', 
          description: 'Provides access to the device media library', 
          version: 'latest', 
          packages: ['expo-media-library'], 
          needsPlugin: true,
          permissions: moduleConfigs['expo-media-library'].permissions,
          pluginConfig: moduleConfigs['expo-media-library'].pluginConfig
        },
        { 
          id: 'expo-av', 
          name: 'Audio Video', 
          description: 'Provides audio and video playback and recording', 
          version: 'latest', 
          packages: ['expo-av'], 
          needsPlugin: false,
          permissions: moduleConfigs['expo-av'].permissions
        },
        { id: 'expo-video', name: 'Video', description: 'A cross-platform video component', version: 'latest', packages: ['expo-video'], needsPlugin: false },
      ],
      'Location & Maps': [
        { id: 'expo-location', name: 'Location', description: 'Provides access to device location', version: 'latest', packages: ['expo-location'], hasConfig: true },
      ],
      'Notifications & Push': [
        { id: 'expo-notifications', name: 'Notifications', description: 'Provides an API to fetch push notification tokens and present notifications', version: 'latest', packages: ['expo-notifications'], hasConfig: true },
      ],
      'Authentication & Security': [
        { id: 'expo-local-authentication', name: 'Local Authentication', description: 'Provides access to device biometric authentication', version: 'latest', packages: ['expo-local-authentication'], hasConfig: true },
        { id: 'expo-secure-store', name: 'Secure Store', description: 'Provides a way to encrypt and securely store key-value pairs', version: 'latest', packages: ['expo-secure-store'], hasConfig: false },
      ],
      'Storage & Database': [
        { id: 'expo-file-system', name: 'File System', description: 'Provides access to the device file system', version: 'latest', packages: ['expo-file-system'], hasConfig: false },
        { id: 'expo-sqlite', name: 'SQLite', description: 'Provides access to a database that can be queried through a SQLite API', version: 'latest', packages: ['expo-sqlite'], hasConfig: false },
      ],
      'Sensors & Hardware': [
        { id: 'expo-sensors', name: 'Sensors', description: 'Provides access to device sensors like accelerometer, gyroscope, and magnetometer', version: 'latest', packages: ['expo-sensors'], hasConfig: false },
        { id: 'expo-haptics', name: 'Haptics', description: 'Provides access to the device haptic feedback engine', version: 'latest', packages: ['expo-haptics'], hasConfig: false },
        { id: 'expo-battery', name: 'Battery', description: 'Provides battery information for the device', version: 'latest', packages: ['expo-battery'], hasConfig: false },
        { id: 'expo-brightness', name: 'Brightness', description: 'Provides access to device screen brightness', version: 'latest', packages: ['expo-brightness'], hasConfig: false },
      ],
      'UI & Components': [
        { id: 'expo-blur', name: 'Blur', description: 'A component that renders a native blur view', version: 'latest', packages: ['expo-blur'], hasConfig: false },
        { id: 'expo-linear-gradient', name: 'Linear Gradient', description: 'Provides a native gradient view', version: 'latest', packages: ['expo-linear-gradient'], hasConfig: false },
        { id: 'expo-font', name: 'Font', description: 'Load fonts at runtime and use them in React Native components', version: 'latest', packages: ['expo-font'], hasConfig: false },
        { id: 'expo-gl', name: 'GL', description: 'Provides a View that acts as an OpenGL ES render target', version: 'latest', packages: ['expo-gl'], hasConfig: false },
      ],
      'Other': [
        { id: 'expo-constants', name: 'Constants', description: 'Provides system information', version: 'latest', packages: ['expo-constants'], hasConfig: false },
        { id: 'expo-device', name: 'Device', description: 'Provides device information', version: 'latest', packages: ['expo-device'], hasConfig: false },
        { id: 'expo-linking', name: 'Linking', description: 'Provides utilities for handling URLs', version: 'latest', packages: ['expo-linking'], hasConfig: false },
        { id: 'expo-clipboard', name: 'Clipboard', description: 'Provides access to the system clipboard', version: 'latest', packages: ['expo-clipboard'], hasConfig: false },
        { id: 'expo-sharing', name: 'Sharing', description: 'Provides access to the system sharing UI', version: 'latest', packages: ['expo-sharing'], hasConfig: false },
        { id: 'expo-web-browser', name: 'Web Browser', description: 'Provides access to the system web browser', version: 'latest', packages: ['expo-web-browser'], hasConfig: false },
        { id: 'expo-contacts', name: 'Contacts', description: 'Provides access to the device contacts', version: 'latest', packages: ['expo-contacts'], hasConfig: true },
        { id: 'expo-calendar', name: 'Calendar', description: 'Provides access to the device calendar', version: 'latest', packages: ['expo-calendar'], hasConfig: true },
      ]
    };
    
    res.json(fallbackModules);
  }
});


// Templates route
app.get('/api/templates', (req, res) => {
  res.json([
    {
      id: 'blank',
      name: 'Blank',
      description: 'A minimal app with a single screen',
      command: 'npx create-expo-app --template blank',
    },
    {
      id: 'blank-typescript',
      name: 'Blank (TypeScript)',
      description: 'A minimal TypeScript app',
      command: 'npx create-expo-app --template blank-typescript',
    },
    {
      id: 'tabs',
      name: 'Tabs',
      description: 'Several example screens and tabs using React Navigation',
      command: 'npx create-expo-app --template tabs',
    },
    {
      id: 'bare-minimum',
      name: 'Bare Minimum',
      description: 'Bare and minimal, just the essentials',
      command: 'npx create-expo-app --template bare-minimum',
    },
  ]);
});

// Generate route - use the full router with file upload support
app.use('/api/generate', upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'splash', maxCount: 1 }
]), generateRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
