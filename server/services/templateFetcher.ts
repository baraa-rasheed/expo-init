export interface ExpoTemplate {
  id: string;
  name: string;
  description: string;
}

export const EXPO_TEMPLATES: ExpoTemplate[] = [
  {
    id: 'default-sdk-55',
    name: 'Native Tabs (SDK 55)',
    description: 'Latest Expo with native tabs',
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'A minimal app with a single screen',
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'App with tab-based navigation using React Navigation',
  },
  {
    id: 'bare-minimum',
    name: 'Bare Minimum',
    description: 'Bare minimum setup with native code access',
  },
  {
    id: 'blank-typescript',
    name: 'Blank (TypeScript)',
    description: 'Blank template with TypeScript configured',
  },
];

export async function getAllTemplates(): Promise<ExpoTemplate[]> {
  return EXPO_TEMPLATES;
}
