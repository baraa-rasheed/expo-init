import express from 'express';
import axios from 'axios';
import { moduleConfigs } from '../config/module-configs.js';

export const expoModulesRouter = express.Router();

interface NpmPackage {
  package: {
    name: string;
    description: string;
    keywords: string[];
    version: string;
  };
}

// Fetch all Expo modules from npm registry
expoModulesRouter.get('/', async (req, res) => {
  try {
    // Search for packages with expo-module keyword
    const response = await axios.get<{ objects: NpmPackage[] }>(
      'https://registry.npmjs.org/-/v1/search?text=keywords:expo-module&size=250'
    );

    const modules = response.data.objects
      .filter(obj => obj.package.name.startsWith('expo-'))
      .map(obj => {
        const npmData = {
          id: obj.package.name,
          name: obj.package.name,
          description: obj.package.description || 'No description available',
          version: obj.package.version,
          keywords: obj.package.keywords || [],
        };

        // Merge with our configuration if it exists
        const config = moduleConfigs[obj.package.name];
        if (config) {
          return {
            ...npmData,
            name: config.name, // Use friendly name
            description: config.description, // Use better description
            packages: config.packages,
            category: config.category,
            hasConfig: true,
            requiredPermissions: config.requiredPermissions,
            pluginConfig: config.pluginConfig,
          };
        }

        // Return npm data for modules without config
        return {
          ...npmData,
          packages: [obj.package.name],
          hasConfig: false,
        };
      });

    // Categorize modules
    const categorized = categorizeModules(modules);

    res.json(categorized);
  } catch (error) {
    console.error('Error fetching Expo modules:', error);
    res.status(500).json({ error: 'Failed to fetch Expo modules' });
  }
});

function categorizeModules(modules: any[]) {
  const categories: Record<string, any[]> = {
    'Media & Camera': [],
    'Location & Maps': [],
    'Notifications & Push': [],
    'Authentication & Security': [],
    'Storage & Database': [],
    'Sensors & Hardware': [],
    'UI & Components': [],
    'Analytics & Monitoring': [],
    'Other': [],
  };

  modules.forEach(module => {
    const name = module.name.toLowerCase();
    const desc = module.description.toLowerCase();
    const keywords = module.keywords.map((k: string) => k.toLowerCase());

    if (name.includes('camera') || name.includes('image') || name.includes('video') || name.includes('media') || name.includes('av')) {
      categories['Media & Camera'].push(module);
    } else if (name.includes('location') || name.includes('map') || keywords.includes('location')) {
      categories['Location & Maps'].push(module);
    } else if (name.includes('notification') || name.includes('push') || keywords.includes('notifications')) {
      categories['Notifications & Push'].push(module);
    } else if (name.includes('auth') || name.includes('biometric') || name.includes('secure') || name.includes('crypto')) {
      categories['Authentication & Security'].push(module);
    } else if (name.includes('storage') || name.includes('sqlite') || name.includes('file') || name.includes('async-storage')) {
      categories['Storage & Database'].push(module);
    } else if (name.includes('sensor') || name.includes('accelerometer') || name.includes('gyroscope') || name.includes('haptic') || name.includes('battery') || name.includes('device')) {
      categories['Sensors & Hardware'].push(module);
    } else if (name.includes('blur') || name.includes('linear-gradient') || name.includes('gl') || name.includes('svg') || name.includes('web-browser')) {
      categories['UI & Components'].push(module);
    } else if (name.includes('analytics') || name.includes('tracking') || name.includes('firebase') || name.includes('amplitude')) {
      categories['Analytics & Monitoring'].push(module);
    } else {
      categories['Other'].push(module);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
}
