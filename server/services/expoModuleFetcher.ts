import axios from 'axios';
import * as cheerio from 'cheerio';

interface ExpoModule {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  needsPlugin: boolean;
  permissions?: {
    ios?: string[];
    android?: string[];
  };
  pluginConfig?: Record<string, any>;
}

// Expo SDK modules list from their documentation
const EXPO_DOCS_BASE = 'https://docs.expo.dev/versions/latest/sdk';

// Known Expo SDK modules - we'll fetch their details dynamically
const EXPO_SDK_MODULES = [
  'accelerometer',
  'av',
  'barcode-scanner',
  'battery',
  'brightness',
  'calendar',
  'camera',
  'cellular',
  'clipboard',
  'contacts',
  'crypto',
  'device',
  'document-picker',
  'face-detector',
  'file-system',
  'font',
  'gl',
  'haptics',
  'image-manipulator',
  'image-picker',
  'keep-awake',
  'linear-gradient',
  'local-authentication',
  'localization',
  'location',
  'mail-composer',
  'media-library',
  'network',
  'notifications',
  'print',
  'random',
  'screen-capture',
  'screen-orientation',
  'secure-store',
  'sensors',
  'sharing',
  'sms',
  'speech',
  'sqlite',
  'status-bar',
  'store-review',
  'system-ui',
  'task-manager',
  'tracking-transparency',
  'video-thumbnails',
  'web-browser',
];

// Category mapping
const categoryMap: Record<string, string> = {
  'camera': 'Media & Camera',
  'image-picker': 'Media & Camera',
  'media-library': 'Media & Camera',
  'av': 'Media & Camera',
  'video-thumbnails': 'Media & Camera',
  'location': 'Location & Maps',
  'notifications': 'Notifications & Push',
  'apple-authentication': 'Authentication & Security',
  'local-authentication': 'Authentication & Security',
  'tracking-transparency': 'Authentication & Security',
  'secure-store': 'Storage & Database',
  'file-system': 'Storage & Database',
  'accelerometer': 'Sensors & Hardware',
  'battery': 'Sensors & Hardware',
  'brightness': 'Sensors & Hardware',
  'cellular': 'Sensors & Hardware',
  'device': 'Sensors & Hardware',
  'haptics': 'Sensors & Hardware',
  'sensors': 'Sensors & Hardware',
  'screen-orientation': 'Sensors & Hardware',
  'blur-view': 'UI & Components',
  'linear-gradient': 'UI & Components',
  'status-bar': 'UI & Components',
  'navigation-bar': 'UI & Components',
  'system-ui': 'UI & Components',
};

async function fetchModuleDetails(moduleName: string): Promise<ExpoModule | null> {
  try {
    const url = `${EXPO_DOCS_BASE}/${moduleName}/`;
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);
    
    // Extract module information from the documentation
    const title = $('h1').first().text().trim();
    
    // Get description - skip navigation/search elements
    let description = '';
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();
      // Skip empty, navigation, or UI elements
      if (text && 
          !text.includes('Search or Ask AI') && 
          !text.includes('Navigation') &&
          !text.includes('Skip to') &&
          text.length > 20) {
        description = text;
        return false; // break the loop
      }
    });
    
    if (!description) {
      description = `Expo ${moduleName.replace(/-/g, ' ')} module`;
    }
    
    // Check if it needs a plugin by looking for config plugin documentation
    const pageText = $.text().toLowerCase();
    const needsPlugin = pageText.includes('config plugin') || 
                       pageText.includes('app.json') || 
                       pageText.includes('app config');
    
    // Try to extract permissions from the documentation
    const permissions: { ios?: string[]; android?: string[] } = {};
    
    // Look for iOS permissions (NSxxxUsageDescription)
    const iosPermMatches = response.data.match(/NS\w+UsageDescription/g);
    if (iosPermMatches && Array.isArray(iosPermMatches)) {
      permissions.ios = [...new Set(iosPermMatches)] as string[];
    }
    
    // Look for Android permissions
    const androidPermMatches = response.data.match(/android\.permission\.\w+/g);
    if (androidPermMatches && Array.isArray(androidPermMatches)) {
      permissions.android = [...new Set(androidPermMatches.map((p: string) => p.replace('android.permission.', '')))] as string[];
    }
    
    // Get version from npm
    let version = 'latest';
    try {
      const npmResponse = await axios.get(`https://registry.npmjs.org/expo-${moduleName}`);
      version = npmResponse.data['dist-tags']?.latest || 'latest';
    } catch (e) {
      // Use latest if npm fetch fails
    }
    
    const category = categoryMap[moduleName] || 'Other';
    
    return {
      id: `expo-${moduleName}`,
      name: title || `Expo ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`,
      description,
      version,
      category,
      needsPlugin,
      permissions: Object.keys(permissions).length > 0 ? permissions : undefined,
      pluginConfig: needsPlugin ? extractPluginConfig(response.data, moduleName) : undefined
    };
  } catch (error) {
    console.error(`Failed to fetch module ${moduleName}:`, error);
    return null;
  }
}

function extractPluginConfig(html: string, moduleName: string): Record<string, any> | undefined {
  // Try to extract plugin configuration from code blocks
  const pluginConfig: Record<string, any> = {};
  
  // Common plugin configurations based on module type
  if (moduleName === 'camera') {
    pluginConfig.cameraPermission = {
      type: 'string',
      default: 'Allow $(PRODUCT_NAME) to access your camera',
      description: 'Camera permission message'
    };
    pluginConfig.microphonePermission = {
      type: 'string',
      default: 'Allow $(PRODUCT_NAME) to access your microphone',
      description: 'Microphone permission message'
    };
  } else if (moduleName === 'location') {
    pluginConfig.locationAlwaysAndWhenInUsePermission = {
      type: 'string',
      default: 'Allow $(PRODUCT_NAME) to use your location',
      description: 'Location permission message'
    };
  } else if (moduleName === 'contacts') {
    pluginConfig.contactsPermission = {
      type: 'string',
      default: 'Allow $(PRODUCT_NAME) to access your contacts',
      description: 'Contacts permission message'
    };
  }
  
  return Object.keys(pluginConfig).length > 0 ? pluginConfig : undefined;
}

// Fetch detailed module information including plugin config
export async function fetchModuleDetailsWithConfig(moduleId: string): Promise<any> {
  try {
    const response = await fetch(`https://docs.expo.dev/versions/latest/sdk/${moduleId.replace('expo-', '')}/`);
    const html = await response.text();
    
    // Parse the HTML to extract plugin configuration and permissions
    const pluginConfigMatch = html.match(/```json\s*({[\s\S]*?})\s*```/);
    const permissionsMatch = html.match(/permissions[:\s]+\[([^\]]+)\]/gi);
    
    let pluginConfig = null;
    let permissions: { ios: string[], android: string[] } = { ios: [], android: [] };
    
    if (pluginConfigMatch) {
      try {
        pluginConfig = JSON.parse(pluginConfigMatch[1]);
      } catch (e) {
        console.error('Failed to parse plugin config:', e);
      }
    }
    
    // Extract iOS permissions
    const iosPermMatch = html.match(/NSCameraUsageDescription|NSLocationWhenInUseUsageDescription|NSPhotoLibraryUsageDescription|NSMicrophoneUsageDescription|NSLocationAlwaysUsageDescription/g);
    if (iosPermMatch) {
      permissions.ios = [...new Set(iosPermMatch)];
    }
    
    // Extract Android permissions
    const androidPermMatch = html.match(/android\.permission\.[A-Z_]+/g);
    if (androidPermMatch) {
      permissions.android = [...new Set(androidPermMatch)];
    }
    
    return {
      id: moduleId,
      pluginConfig,
      permissions,
      needsPlugin: pluginConfig !== null || html.includes('plugin'),
      fetchedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${moduleId}:`, error);
    return null;
  }
}

export async function fetchAllExpoModules(): Promise<Record<string, ExpoModule[]>> {
  console.log('Fetching Expo modules from documentation...');
  
  const modules = await Promise.all(
    EXPO_SDK_MODULES.map(moduleName => fetchModuleDetails(moduleName))
  );
  
  // Filter out nulls and group by category
  const validModules = modules.filter((m): m is ExpoModule => m !== null);
  
  const grouped = validModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ExpoModule[]>);
  
  console.log(`Fetched ${validModules.length} Expo modules`);
  return grouped;
}

// Cache the modules for 1 hour
let cachedModules: Record<string, ExpoModule[]> | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getExpoModules(): Promise<Record<string, ExpoModule[]>> {
  const now = Date.now();
  
  if (cachedModules && (now - cacheTime) < CACHE_DURATION) {
    console.log('Using cached Expo modules');
    return cachedModules;
  }
  
  cachedModules = await fetchAllExpoModules();
  cacheTime = now;
  return cachedModules;
}
