import type { ExpoModule, ExpoConfig } from '@/types/expo';

export const expoModules: ExpoModule[] = [
  {
    id: 'image-picker',
    label: 'Image Picker',
    description: 'Access the device camera and photo library',
    packages: ['expo-image-picker'],
    applyConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (!newConfig.expo.plugins) {
        newConfig.expo.plugins = [];
      }
      
      if (!newConfig.expo.plugins.includes('expo-image-picker')) {
        newConfig.expo.plugins.push('expo-image-picker');
      }
      
      if (!newConfig.expo.ios) {
        newConfig.expo.ios = {};
      }
      if (!newConfig.expo.ios.infoPlist) {
        newConfig.expo.ios.infoPlist = {};
      }
      
      newConfig.expo.ios.infoPlist.NSPhotoLibraryUsageDescription =
        'This app needs access to your photo library to select images.';
      newConfig.expo.ios.infoPlist.NSCameraUsageDescription =
        'This app needs access to your camera to take photos.';
      
      if (!newConfig.expo.android) {
        newConfig.expo.android = {};
      }
      if (!newConfig.expo.android.permissions) {
        newConfig.expo.android.permissions = [];
      }
      
      const androidPermissions = [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.CAMERA',
      ];
      
      androidPermissions.forEach((perm) => {
        if (!newConfig.expo.android!.permissions!.includes(perm)) {
          newConfig.expo.android!.permissions!.push(perm);
        }
      });
      
      return newConfig;
    },
    revertConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (newConfig.expo.plugins) {
        newConfig.expo.plugins = newConfig.expo.plugins.filter(
          (p: string | [string, any]) => p !== 'expo-image-picker'
        );
      }
      
      if (newConfig.expo.ios?.infoPlist) {
        delete newConfig.expo.ios.infoPlist.NSPhotoLibraryUsageDescription;
        delete newConfig.expo.ios.infoPlist.NSCameraUsageDescription;
      }
      
      if (newConfig.expo.android?.permissions) {
        newConfig.expo.android.permissions = newConfig.expo.android.permissions.filter(
          (p: string) =>
            ![
              'android.permission.READ_EXTERNAL_STORAGE',
              'android.permission.WRITE_EXTERNAL_STORAGE',
              'android.permission.CAMERA',
            ].includes(p)
        );
      }
      
      return newConfig;
    },
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Access device location services',
    packages: ['expo-location'],
    applyConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (!newConfig.expo.plugins) {
        newConfig.expo.plugins = [];
      }
      
      if (!newConfig.expo.plugins.includes('expo-location')) {
        newConfig.expo.plugins.push('expo-location');
      }
      
      if (!newConfig.expo.ios) {
        newConfig.expo.ios = {};
      }
      if (!newConfig.expo.ios.infoPlist) {
        newConfig.expo.ios.infoPlist = {};
      }
      
      newConfig.expo.ios.infoPlist.NSLocationWhenInUseUsageDescription =
        'This app needs access to your location.';
      newConfig.expo.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription =
        'This app needs access to your location.';
      
      if (!newConfig.expo.android) {
        newConfig.expo.android = {};
      }
      if (!newConfig.expo.android.permissions) {
        newConfig.expo.android.permissions = [];
      }
      
      const androidPermissions = [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
      ];
      
      androidPermissions.forEach((perm) => {
        if (!newConfig.expo.android!.permissions!.includes(perm)) {
          newConfig.expo.android!.permissions!.push(perm);
        }
      });
      
      return newConfig;
    },
    revertConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (newConfig.expo.plugins) {
        newConfig.expo.plugins = newConfig.expo.plugins.filter(
          (p: string | [string, any]) => p !== 'expo-location'
        );
      }
      
      if (newConfig.expo.ios?.infoPlist) {
        delete newConfig.expo.ios.infoPlist.NSLocationWhenInUseUsageDescription;
        delete newConfig.expo.ios.infoPlist.NSLocationAlwaysAndWhenInUseUsageDescription;
      }
      
      if (newConfig.expo.android?.permissions) {
        newConfig.expo.android.permissions = newConfig.expo.android.permissions.filter(
          (p: string) =>
            ![
              'android.permission.ACCESS_FINE_LOCATION',
              'android.permission.ACCESS_COARSE_LOCATION',
            ].includes(p)
        );
      }
      
      return newConfig;
    },
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Send and receive push notifications',
    packages: ['expo-notifications'],
    applyConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (!newConfig.expo.plugins) {
        newConfig.expo.plugins = [];
      }
      
      const notificationPlugin = [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
        },
      ];
      
      const hasPlugin = newConfig.expo.plugins.some((p: string | [string, any]) =>
        Array.isArray(p) ? p[0] === 'expo-notifications' : p === 'expo-notifications'
      );
      
      if (!hasPlugin) {
        newConfig.expo.plugins.push(notificationPlugin);
      }
      
      if (!newConfig.expo.android) {
        newConfig.expo.android = {};
      }
      if (!newConfig.expo.android.permissions) {
        newConfig.expo.android.permissions = [];
      }
      
      const androidPermissions = ['android.permission.POST_NOTIFICATIONS'];
      
      androidPermissions.forEach((perm) => {
        if (!newConfig.expo.android!.permissions!.includes(perm)) {
          newConfig.expo.android!.permissions!.push(perm);
        }
      });
      
      return newConfig;
    },
    revertConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (newConfig.expo.plugins) {
        newConfig.expo.plugins = newConfig.expo.plugins.filter(
          (p: string | [string, any]) =>
            !(Array.isArray(p) ? p[0] === 'expo-notifications' : p === 'expo-notifications')
        );
      }
      
      if (newConfig.expo.android?.permissions) {
        newConfig.expo.android.permissions = newConfig.expo.android.permissions.filter(
          (p: string) => p !== 'android.permission.POST_NOTIFICATIONS'
        );
      }
      
      return newConfig;
    },
  },
  {
    id: 'camera',
    label: 'Camera',
    description: 'Access device camera for photos and videos',
    packages: ['expo-camera'],
    applyConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (!newConfig.expo.plugins) {
        newConfig.expo.plugins = [];
      }
      
      if (!newConfig.expo.plugins.includes('expo-camera')) {
        newConfig.expo.plugins.push('expo-camera');
      }
      
      if (!newConfig.expo.ios) {
        newConfig.expo.ios = {};
      }
      if (!newConfig.expo.ios.infoPlist) {
        newConfig.expo.ios.infoPlist = {};
      }
      
      newConfig.expo.ios.infoPlist.NSCameraUsageDescription =
        'This app needs access to your camera.';
      newConfig.expo.ios.infoPlist.NSMicrophoneUsageDescription =
        'This app needs access to your microphone for video recording.';
      
      if (!newConfig.expo.android) {
        newConfig.expo.android = {};
      }
      if (!newConfig.expo.android.permissions) {
        newConfig.expo.android.permissions = [];
      }
      
      const androidPermissions = [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
      ];
      
      androidPermissions.forEach((perm) => {
        if (!newConfig.expo.android!.permissions!.includes(perm)) {
          newConfig.expo.android!.permissions!.push(perm);
        }
      });
      
      return newConfig;
    },
    revertConfig: (config: ExpoConfig): ExpoConfig => {
      const newConfig = JSON.parse(JSON.stringify(config));
      
      if (newConfig.expo.plugins) {
        newConfig.expo.plugins = newConfig.expo.plugins.filter(
          (p: string | [string, any]) => p !== 'expo-camera'
        );
      }
      
      if (newConfig.expo.ios?.infoPlist) {
        delete newConfig.expo.ios.infoPlist.NSCameraUsageDescription;
        delete newConfig.expo.ios.infoPlist.NSMicrophoneUsageDescription;
      }
      
      if (newConfig.expo.android?.permissions) {
        newConfig.expo.android.permissions = newConfig.expo.android.permissions.filter(
          (p: string) =>
            !['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'].includes(p)
        );
      }
      
      return newConfig;
    },
  },
  {
    id: 'haptics',
    label: 'Haptics',
    description: 'Provide haptic feedback',
    packages: ['expo-haptics'],
    applyConfig: (config: ExpoConfig): ExpoConfig => {
      return config;
    },
    revertConfig: (config: ExpoConfig): ExpoConfig => {
      return config;
    },
  },
];
