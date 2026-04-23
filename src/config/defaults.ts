import type { ExpoConfig, PackageJson } from '@/types/expo';

export const defaultExpoConfig: ExpoConfig = {
  expo: {
    name: 'MyExpoApp',
    slug: 'my-expo-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.myexpoapp',
      infoPlist: {},
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.myexpoapp',
      permissions: [],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [],
    extra: {},
  },
};

export const defaultPackageJson: PackageJson = {
  name: 'my-expo-app',
  version: '1.0.0',
  main: 'expo-router/entry',
  scripts: {
    start: 'expo start',
    android: 'expo start --android',
    ios: 'expo start --ios',
    web: 'expo start --web',
  },
  dependencies: {
    expo: '^52.0.0',
    'expo-status-bar': '~2.0.0',
    react: '18.3.1',
    'react-native': '0.76.5',
  },
  devDependencies: {
    '@babel/core': '^7.25.2',
    '@types/react': '~18.3.12',
    typescript: '~5.3.3',
  },
};
