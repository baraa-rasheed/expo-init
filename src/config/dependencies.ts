import type { DependencyOption } from '@/types/expo';

export const dependenciesByCategory: Record<string, DependencyOption[]> = {
  'React Native Essentials': [
    {
      id: 'safe-area-context',
      label: 'Safe Area Context',
      description: 'Safe area insets (required by many RN libs)',
      package: 'react-native-safe-area-context',
      version: '^5.6.1',
    },
    {
      id: 'react-native-screens',
      label: 'React Native Screens',
      description: 'Native navigation primitives (commonly used across stacks)',
      package: 'react-native-screens',
      version: '^4.13.1',
    },
    {
      id: 'react-native-svg',
      label: 'React Native SVG',
      description: 'SVG support for React Native',
      package: 'react-native-svg',
      version: '^15.13.0',
    },
    {
      id: 'async-storage',
      label: 'Async Storage',
      description: 'Key-value storage for React Native',
      package: '@react-native-async-storage/async-storage',
      version: '^2.2.0',
    },
    {
      id: 'expo-constants',
      label: 'Expo Constants',
      description: 'App constants + manifest access (Expo)',
      package: 'expo-constants',
      version: '~18.0.8',
    },
  ],
  'State Management': [
    {
      id: 'zustand',
      label: 'Zustand',
      description: 'Lightweight state management',
      package: 'zustand',
      version: '^5.0.3',
    },
    {
      id: 'redux-toolkit',
      label: 'Redux Toolkit',
      description: 'Official Redux toolset',
      package: '@reduxjs/toolkit',
      version: '^2.5.0',
    },
    {
      id: 'react-redux',
      label: 'React Redux',
      description: 'React bindings for Redux',
      package: 'react-redux',
      version: '^9.2.0',
    },
    {
      id: 'jotai',
      label: 'Jotai',
      description: 'Primitive and flexible state management',
      package: 'jotai',
      version: '^2.10.3',
    },
  ],
  'Navigation': [
    {
      id: 'expo-router',
      label: 'Expo Router',
      description: 'File-based routing for Expo',
      package: 'expo-router',
      version: '^4.0.0',
    },
  ],
  'APIs & Networking': [
    {
      id: 'axios',
      label: 'Axios',
      description: 'Promise-based HTTP client',
      package: 'axios',
      version: '^1.7.9',
    },
    {
      id: 'react-query',
      label: 'TanStack Query',
      description: 'Data fetching and caching',
      package: '@tanstack/react-query',
      version: '^5.62.11',
    },
    {
      id: 'swr',
      label: 'SWR',
      description: 'React Hooks for data fetching',
      package: 'swr',
      version: '^2.2.5',
    },
  ],
  'Forms & Validation': [
    {
      id: 'react-hook-form',
      label: 'React Hook Form',
      description: 'Performant form validation',
      package: 'react-hook-form',
      version: '^7.54.2',
    },
    {
      id: 'hookform-resolvers',
      label: 'RHF Resolvers',
      description: 'Use Zod/Yup with React Hook Form',
      package: '@hookform/resolvers',
      version: '^4.1.0',
    },
    {
      id: 'formik',
      label: 'Formik',
      description: 'Build forms in React',
      package: 'formik',
      version: '^2.4.6',
    },
    {
      id: 'yup',
      label: 'Yup',
      description: 'Schema validation',
      package: 'yup',
      version: '^1.4.0',
    },
    {
      id: 'zod',
      label: 'Zod',
      description: 'TypeScript-first schema validation',
      package: 'zod',
      version: '^3.24.1',
    },
  ],
  'Animations': [
    {
      id: 'reanimated',
      label: 'React Native Reanimated',
      description: 'Powerful animation library',
      package: 'react-native-reanimated',
      version: '^3.16.4',
    },
    {
      id: 'lottie',
      label: 'Lottie',
      description: 'Render After Effects animations',
      package: 'lottie-react-native',
      version: '^7.2.0',
    },
    {
      id: 'moti',
      label: 'Moti',
      description: 'Universal animation library',
      package: 'moti',
      version: '^0.29.0',
    },
  ],
  'UI Components': [
    {
      id: 'react-native-paper',
      label: 'React Native Paper',
      description: 'Material Design components',
      package: 'react-native-paper',
      version: '^5.12.5',
    },
    {
      id: 'react-native-elements',
      label: 'React Native Elements',
      description: 'Cross-platform UI toolkit',
      package: 'react-native-elements',
      version: '^3.4.3',
    },
    {
      id: 'nativebase',
      label: 'NativeBase',
      description: 'Accessible component library',
      package: 'native-base',
      version: '^3.4.28',
    },
  ],
  'Utilities': [
    {
      id: 'dotenv',
      label: 'Dotenv',
      description: 'Load environment variables from .env (Node tooling)',
      package: 'dotenv',
      version: '^16.6.1',
    },
    {
      id: 'dayjs',
      label: 'Day.js',
      description: 'Lightweight date library',
      package: 'dayjs',
      version: '^1.11.13',
    },
    {
      id: 'lodash',
      label: 'Lodash',
      description: 'Utility library',
      package: 'lodash',
      version: '^4.17.21',
    },
    {
      id: 'uuid',
      label: 'UUID',
      description: 'Generate unique IDs',
      package: 'uuid',
      version: '^11.0.3',
    },
  ],
};

// Flatten for backward compatibility
export const dependencyOptions: DependencyOption[] = Object.values(dependenciesByCategory).flat();
