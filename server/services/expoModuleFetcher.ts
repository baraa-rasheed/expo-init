import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ExpoModule {
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
  pluginConfig?: Record<string, unknown>;
}

const EXPO_DOCS_BASE = 'https://docs.expo.dev/versions/latest/sdk';

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

const categoryMap: Record<string, string> = {
  camera: 'Media & Camera',
  'image-picker': 'Media & Camera',
  'media-library': 'Media & Camera',
  av: 'Media & Camera',
  'video-thumbnails': 'Media & Camera',
  location: 'Location & Maps',
  notifications: 'Notifications & Push',
  'apple-authentication': 'Authentication & Security',
  'local-authentication': 'Authentication & Security',
  'tracking-transparency': 'Authentication & Security',
  'secure-store': 'Storage & Database',
  'file-system': 'Storage & Database',
  accelerometer: 'Sensors & Hardware',
  battery: 'Sensors & Hardware',
  brightness: 'Sensors & Hardware',
  cellular: 'Sensors & Hardware',
  device: 'Sensors & Hardware',
  haptics: 'Sensors & Hardware',
  sensors: 'Sensors & Hardware',
  'screen-orientation': 'Sensors & Hardware',
  'blur-view': 'UI & Components',
  'linear-gradient': 'UI & Components',
  'status-bar': 'UI & Components',
  'navigation-bar': 'UI & Components',
  'system-ui': 'UI & Components',
};

function defaultPluginConfigFor(moduleName: string): Record<string, unknown> | undefined {
  switch (moduleName) {
    case 'camera':
      return {
        cameraPermission: {
          type: 'string',
          default: 'Allow $(PRODUCT_NAME) to access your camera',
          description: 'Camera permission message',
        },
        microphonePermission: {
          type: 'string',
          default: 'Allow $(PRODUCT_NAME) to access your microphone',
          description: 'Microphone permission message',
        },
      };
    case 'location':
      return {
        locationAlwaysAndWhenInUsePermission: {
          type: 'string',
          default: 'Allow $(PRODUCT_NAME) to use your location',
          description: 'Location permission message',
        },
      };
    case 'contacts':
      return {
        contactsPermission: {
          type: 'string',
          default: 'Allow $(PRODUCT_NAME) to access your contacts',
          description: 'Contacts permission message',
        },
      };
    default:
      return undefined;
  }
}

async function fetchModuleVersion(moduleName: string): Promise<string> {
  try {
    const res = await axios.get(`https://registry.npmjs.org/expo-${moduleName}`, { timeout: 5000 });
    return (res.data as { 'dist-tags'?: { latest?: string } })['dist-tags']?.latest ?? 'latest';
  } catch {
    return 'latest';
  }
}

async function fetchModuleDetails(moduleName: string): Promise<ExpoModule | null> {
  try {
    const url = `${EXPO_DOCS_BASE}/${moduleName}/`;
    const response = await axios.get<string>(url, { timeout: 5000 });
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();

    let description = '';
    $('p').each((_, elem) => {
      const text = $(elem).text().trim();
      if (
        text &&
        !text.includes('Search or Ask AI') &&
        !text.includes('Navigation') &&
        !text.includes('Skip to') &&
        text.length > 20
      ) {
        description = text;
        return false;
      }
    });
    if (!description) {
      description = `Expo ${moduleName.replace(/-/g, ' ')} module`;
    }

    const pageText = $.text().toLowerCase();
    const needsPlugin =
      pageText.includes('config plugin') || pageText.includes('app.json') || pageText.includes('app config');

    const permissions: { ios?: string[]; android?: string[] } = {};

    const iosMatches = html.match(/NS\w+UsageDescription/g);
    if (iosMatches) {
      permissions.ios = [...new Set(iosMatches)];
    }

    const androidMatches = html.match(/android\.permission\.\w+/g);
    if (androidMatches) {
      permissions.android = [...new Set(androidMatches.map((p) => p.replace('android.permission.', '')))];
    }

    const version = await fetchModuleVersion(moduleName);

    return {
      id: `expo-${moduleName}`,
      name: title || `Expo ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`,
      description,
      version,
      category: categoryMap[moduleName] ?? 'Other',
      needsPlugin,
      permissions: Object.keys(permissions).length > 0 ? permissions : undefined,
      pluginConfig: needsPlugin ? defaultPluginConfigFor(moduleName) : undefined,
    };
  } catch (error) {
    console.error(`[expoModuleFetcher] failed for "${moduleName}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function fetchModuleDetailsWithConfig(moduleId: string): Promise<ExpoModule | null> {
  const moduleName = moduleId.replace(/^expo-/, '');
  return fetchModuleDetails(moduleName);
}

async function fetchAllExpoModules(): Promise<Record<string, ExpoModule[]>> {
  // Avoid huge concurrent HTML parses (can OOM on small Fly machines).
  const CONCURRENCY = 4;
  const valid: ExpoModule[] = [];

  for (let i = 0; i < EXPO_SDK_MODULES.length; i += CONCURRENCY) {
    const batch = EXPO_SDK_MODULES.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((m) => fetchModuleDetails(m)));
    for (const m of results) {
      if (m) valid.push(m);
    }
  }

  return valid.reduce<Record<string, ExpoModule[]>>((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {});
}

let cachedModules: Record<string, ExpoModule[]> | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getExpoModules(): Promise<Record<string, ExpoModule[]>> {
  if (cachedModules && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedModules;
  }
  cachedModules = await fetchAllExpoModules();
  cacheTime = Date.now();
  return cachedModules;
}
