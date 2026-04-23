import axios from 'axios';

export interface ExpoTemplate {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  branch: string;
}

// Official Expo templates from GitHub
export const EXPO_TEMPLATES: ExpoTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'A minimal app with a single screen',
    githubUrl: 'https://github.com/expo/expo',
    branch: 'main'
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'App with tab-based navigation using React Navigation',
    githubUrl: 'https://github.com/expo/expo',
    branch: 'main'
  },
  {
    id: 'bare-minimum',
    name: 'Bare Minimum',
    description: 'Bare minimum setup with native code access',
    githubUrl: 'https://github.com/expo/expo',
    branch: 'main'
  },
  {
    id: 'blank-typescript',
    name: 'Blank (TypeScript)',
    description: 'Blank template with TypeScript configured',
    githubUrl: 'https://github.com/expo/expo',
    branch: 'main'
  }
];

// Fetch latest template info from GitHub
export async function getTemplateInfo(templateId: string): Promise<ExpoTemplate | null> {
  const template = EXPO_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;
  
  try {
    // Verify the template exists on GitHub
    const response = await axios.head(template.githubUrl, { timeout: 5000 });
    if (response.status === 200) {
      return template;
    }
  } catch (error) {
    console.error(`Failed to verify template ${templateId}:`, error);
  }
  
  return template; // Return anyway, let generation handle errors
}

export async function getAllTemplates(): Promise<ExpoTemplate[]> {
  return EXPO_TEMPLATES;
}

// Get the download URL for a template
export function getTemplateDownloadUrl(templateId: string): string {
  // Use create-expo-app which pulls from the latest templates
  return `expo-template-${templateId}`;
}
