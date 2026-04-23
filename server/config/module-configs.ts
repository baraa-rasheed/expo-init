// Module configuration database with proper app.json modifications
// Based on official Expo documentation

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  packages: string[];
  category: string;
  applyConfig: (appJson: any) => any;
  requiredPermissions?: {
    ios?: string[];
    android?: string[];
  };
  pluginConfig?: any;
}

export const moduleConfigs: Record<string, ModuleConfig> = {
  'expo-image-picker': {
    id: 'expo-image-picker',
    name: 'Image Picker',
    description: 'Provides access to the system\'s UI for selecting images and videos',
    packages: ['expo-image-picker'],
    category: 'Media & Camera',
    requiredPermissions: {
      ios: ['NSPhotoLibraryUsageDescription', 'NSCameraUsageDescription'],
      android: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      const pluginConfig = [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
          cameraPermission: 'The app accesses your camera to let you take photos.',
        },
      ];
      
      if (!appJson.expo.plugins.some((p: any) => 
        Array.isArray(p) ? p[0] === 'expo-image-picker' : p === 'expo-image-picker'
      )) {
        appJson.expo.plugins.push(pluginConfig);
      }

      // iOS permissions
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSPhotoLibraryUsageDescription = 
        'Allow $(PRODUCT_NAME) to access your photos';
      appJson.expo.ios.infoPlist.NSCameraUsageDescription = 
        'Allow $(PRODUCT_NAME) to access your camera';

      // Android permissions
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      const androidPerms = ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA'];
      androidPerms.forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-camera': {
    id: 'expo-camera',
    name: 'Camera',
    description: 'A React component that renders a preview for the device\'s front or back camera',
    packages: ['expo-camera'],
    category: 'Media & Camera',
    requiredPermissions: {
      ios: ['NSCameraUsageDescription', 'NSMicrophoneUsageDescription'],
      android: ['CAMERA', 'RECORD_AUDIO'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      const pluginConfig = [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
          microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
          recordAudioAndroid: true,
        },
      ];
      
      if (!appJson.expo.plugins.some((p: any) => 
        Array.isArray(p) ? p[0] === 'expo-camera' : p === 'expo-camera'
      )) {
        appJson.expo.plugins.push(pluginConfig);
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSCameraUsageDescription = 
        'Allow $(PRODUCT_NAME) to access camera';
      appJson.expo.ios.infoPlist.NSMicrophoneUsageDescription = 
        'Allow $(PRODUCT_NAME) to access microphone';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      ['CAMERA', 'RECORD_AUDIO'].forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-location': {
    id: 'expo-location',
    name: 'Location',
    description: 'Allows reading geolocation information from the device',
    packages: ['expo-location'],
    category: 'Location & Maps',
    requiredPermissions: {
      ios: ['NSLocationWhenInUseUsageDescription', 'NSLocationAlwaysAndWhenInUseUsageDescription'],
      android: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      const pluginConfig = [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
          locationAlwaysPermission: 'Allow $(PRODUCT_NAME) to use your location.',
          locationWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
        },
      ];
      
      if (!appJson.expo.plugins.some((p: any) => 
        Array.isArray(p) ? p[0] === 'expo-location' : p === 'expo-location'
      )) {
        appJson.expo.plugins.push(pluginConfig);
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSLocationWhenInUseUsageDescription = 
        'Allow $(PRODUCT_NAME) to use your location';
      appJson.expo.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription = 
        'Allow $(PRODUCT_NAME) to use your location';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'].forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-notifications': {
    id: 'expo-notifications',
    name: 'Notifications',
    description: 'Provides an API to fetch push notification tokens and to present, schedule, receive and respond to notifications',
    packages: ['expo-notifications'],
    category: 'Notifications & Push',
    requiredPermissions: {
      android: ['POST_NOTIFICATIONS'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      const pluginConfig = [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          sounds: ['./assets/notification-sound.wav'],
        },
      ];
      
      if (!appJson.expo.plugins.some((p: any) => 
        Array.isArray(p) ? p[0] === 'expo-notifications' : p === 'expo-notifications'
      )) {
        appJson.expo.plugins.push(pluginConfig);
      }

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      if (!appJson.expo.android.permissions.includes('POST_NOTIFICATIONS')) {
        appJson.expo.android.permissions.push('POST_NOTIFICATIONS');
      }

      return appJson;
    },
  },

  'expo-media-library': {
    id: 'expo-media-library',
    name: 'Media Library',
    description: 'Provides access to the user\'s media library',
    packages: ['expo-media-library'],
    category: 'Media & Camera',
    requiredPermissions: {
      ios: ['NSPhotoLibraryUsageDescription', 'NSPhotoLibraryAddUsageDescription'],
      android: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_MEDIA_LOCATION'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      const pluginConfig = [
        'expo-media-library',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
          savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
          isAccessMediaLocationEnabled: true,
        },
      ];
      
      if (!appJson.expo.plugins.some((p: any) => 
        Array.isArray(p) ? p[0] === 'expo-media-library' : p === 'expo-media-library'
      )) {
        appJson.expo.plugins.push(pluginConfig);
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSPhotoLibraryUsageDescription = 
        'Allow $(PRODUCT_NAME) to access your photos';
      appJson.expo.ios.infoPlist.NSPhotoLibraryAddUsageDescription = 
        'Allow $(PRODUCT_NAME) to save photos';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_MEDIA_LOCATION'].forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-contacts': {
    id: 'expo-contacts',
    name: 'Contacts',
    description: 'Provides access to the device\'s system contacts',
    packages: ['expo-contacts'],
    category: 'Other',
    requiredPermissions: {
      ios: ['NSContactsUsageDescription'],
      android: ['READ_CONTACTS', 'WRITE_CONTACTS'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      const pluginConfig = [
        'expo-contacts',
        {
          contactsPermission: 'Allow $(PRODUCT_NAME) to access your contacts.',
        },
      ];
      
      if (!appJson.expo.plugins.some((p: any) => 
        Array.isArray(p) ? p[0] === 'expo-contacts' : p === 'expo-contacts'
      )) {
        appJson.expo.plugins.push(pluginConfig);
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSContactsUsageDescription = 
        'Allow $(PRODUCT_NAME) to access contacts';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      ['READ_CONTACTS', 'WRITE_CONTACTS'].forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-calendar': {
    id: 'expo-calendar',
    name: 'Calendar',
    description: 'Provides an API for interacting with the device\'s system calendars and events',
    packages: ['expo-calendar'],
    category: 'Other',
    requiredPermissions: {
      ios: ['NSCalendarsUsageDescription', 'NSRemindersUsageDescription'],
      android: ['READ_CALENDAR', 'WRITE_CALENDAR'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      if (!appJson.expo.plugins.includes('expo-calendar')) {
        appJson.expo.plugins.push('expo-calendar');
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSCalendarsUsageDescription = 
        'Allow $(PRODUCT_NAME) to access calendar';
      appJson.expo.ios.infoPlist.NSRemindersUsageDescription = 
        'Allow $(PRODUCT_NAME) to access reminders';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      ['READ_CALENDAR', 'WRITE_CALENDAR'].forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-local-authentication': {
    id: 'expo-local-authentication',
    name: 'Local Authentication',
    description: 'Allows you to use FaceID and TouchID (iOS) or the Biometric Prompt (Android) to authenticate the user',
    packages: ['expo-local-authentication'],
    category: 'Authentication & Security',
    requiredPermissions: {
      ios: ['NSFaceIDUsageDescription'],
      android: ['USE_BIOMETRIC', 'USE_FINGERPRINT'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      if (!appJson.expo.plugins.includes('expo-local-authentication')) {
        appJson.expo.plugins.push('expo-local-authentication');
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSFaceIDUsageDescription = 
        'Allow $(PRODUCT_NAME) to use Face ID';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      ['USE_BIOMETRIC', 'USE_FINGERPRINT'].forEach(perm => {
        if (!appJson.expo.android.permissions.includes(perm)) {
          appJson.expo.android.permissions.push(perm);
        }
      });

      return appJson;
    },
  },

  'expo-av': {
    id: 'expo-av',
    name: 'Audio/Video',
    description: 'Provides unified Audio and Video playback and recording API',
    packages: ['expo-av'],
    category: 'Media & Camera',
    requiredPermissions: {
      ios: ['NSMicrophoneUsageDescription'],
      android: ['RECORD_AUDIO'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      if (!appJson.expo.plugins.includes('expo-av')) {
        appJson.expo.plugins.push('expo-av');
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSMicrophoneUsageDescription = 
        'Allow $(PRODUCT_NAME) to access microphone';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      if (!appJson.expo.android.permissions.includes('RECORD_AUDIO')) {
        appJson.expo.android.permissions.push('RECORD_AUDIO');
      }

      return appJson;
    },
  },

  'expo-barcode-scanner': {
    id: 'expo-barcode-scanner',
    name: 'Barcode Scanner',
    description: 'Allows scanning a variety of supported barcodes',
    packages: ['expo-barcode-scanner'],
    category: 'Media & Camera',
    requiredPermissions: {
      ios: ['NSCameraUsageDescription'],
      android: ['CAMERA'],
    },
    applyConfig: (appJson: any) => {
      if (!appJson.expo.plugins) appJson.expo.plugins = [];
      
      if (!appJson.expo.plugins.includes('expo-barcode-scanner')) {
        appJson.expo.plugins.push('expo-barcode-scanner');
      }

      // iOS
      if (!appJson.expo.ios) appJson.expo.ios = {};
      if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
      appJson.expo.ios.infoPlist.NSCameraUsageDescription = 
        'Allow $(PRODUCT_NAME) to access camera for barcode scanning';

      // Android
      if (!appJson.expo.android) appJson.expo.android = {};
      if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
      
      if (!appJson.expo.android.permissions.includes('CAMERA')) {
        appJson.expo.android.permissions.push('CAMERA');
      }

      return appJson;
    },
  },

  // Modules that don't require permissions
  'expo-haptics': {
    id: 'expo-haptics',
    name: 'Haptics',
    description: 'Provides haptic (touch) feedback',
    packages: ['expo-haptics'],
    category: 'Sensors & Hardware',
    applyConfig: (appJson: any) => appJson, // No config needed
  },

  'expo-clipboard': {
    id: 'expo-clipboard',
    name: 'Clipboard',
    description: 'Provides an interface for getting and setting Clipboard content',
    packages: ['expo-clipboard'],
    category: 'Other',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-constants': {
    id: 'expo-constants',
    name: 'Constants',
    description: 'Provides system information that remains constant throughout the lifetime of your app',
    packages: ['expo-constants'],
    category: 'Other',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-device': {
    id: 'expo-device',
    name: 'Device',
    description: 'Provides specific information about the device running the application',
    packages: ['expo-device'],
    category: 'Sensors & Hardware',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-font': {
    id: 'expo-font',
    name: 'Font',
    description: 'Allows loading fonts from the web and using them in React Native components',
    packages: ['expo-font'],
    category: 'UI & Components',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-linking': {
    id: 'expo-linking',
    name: 'Linking',
    description: 'Provides utilities for your app to interact with other installed apps using deep links',
    packages: ['expo-linking'],
    category: 'Other',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-secure-store': {
    id: 'expo-secure-store',
    name: 'Secure Store',
    description: 'Provides a way to encrypt and securely store key–value pairs locally on the device',
    packages: ['expo-secure-store'],
    category: 'Storage & Database',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-file-system': {
    id: 'expo-file-system',
    name: 'File System',
    description: 'Provides access to the local file system on the device',
    packages: ['expo-file-system'],
    category: 'Storage & Database',
    applyConfig: (appJson: any) => appJson,
  },

  'expo-sqlite': {
    id: 'expo-sqlite',
    name: 'SQLite',
    description: 'Provides access to a database that can be queried through a WebSQL-like API',
    packages: ['expo-sqlite'],
    category: 'Storage & Database',
    applyConfig: (appJson: any) => appJson,
  },
};
