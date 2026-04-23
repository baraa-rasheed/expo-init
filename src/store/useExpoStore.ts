import { create } from 'zustand';
import type { ExpoConfig, PackageJson, ExpoTemplate } from '@/types/expo';
import { defaultExpoConfig } from '@/config/defaults';

interface ExpoStore {
  template: ExpoTemplate;
  config: ExpoConfig;
  packageJson: PackageJson;
  selectedModules: Map<string, any>;
  selectedDependencies: Map<string, any>;
  iconFile: File | null;
  splashFile: File | null;
  useHermesV1: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  
  setTemplate: (template: ExpoTemplate) => void;
  setUseHermesV1: (enabled: boolean) => void;
  setPackageManager: (manager: 'npm' | 'yarn' | 'pnpm' | 'bun') => void;
  updateConfig: (config: ExpoConfig) => void;
  updateConfigFromJson: (jsonString: string) => void;
  updatePackageJson: (packageJson: PackageJson) => void;
  updatePackageJsonFromJson: (jsonString: string) => void;
  
  updateAppName: (name: string) => void;
  updateAppSlug: (slug: string) => void;
  updateAppVersion: (version: string) => void;
  updateIconUrl: (url: string) => void;
  updateSplashUrl: (url: string) => void;
  setIconFile: (file: File | null) => void;
  setSplashFile: (file: File | null) => void;
  
  toggleModule: (moduleId: string, moduleConfig?: any) => void;
  toggleDependency: (depId: string, packageName: string, version: string) => void;
  setSelectedModules: (modules: any[]) => void;
  setSelectedDependencies: (deps: any[]) => void;
  removeModule: (moduleId: string) => void;
  removeDependency: (depId: string) => void;
  
  reset: () => void;
}

// Pre-selected popular Expo modules
const defaultSelectedModules = new Map<string, any>([
  ['expo-camera', {
    id: 'expo-camera',
    name: 'Camera',
    description: 'Access device camera',
    version: '~16.0.0',
    needsPlugin: true,
    permissions: {
      ios: ['NSCameraUsageDescription', 'NSMicrophoneUsageDescription'],
      android: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO']
    }
  }],
  ['expo-location', {
    id: 'expo-location',
    name: 'Location',
    description: 'Access device location',
    version: '~18.0.0',
    needsPlugin: true,
    permissions: {
      ios: ['NSLocationWhenInUseUsageDescription', 'NSLocationAlwaysUsageDescription'],
      android: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION']
    }
  }],
  ['expo-image-picker', {
    id: 'expo-image-picker',
    name: 'Image Picker',
    description: 'Pick images from device',
    version: '~16.0.0',
    needsPlugin: true,
    permissions: {
      ios: ['NSPhotoLibraryUsageDescription', 'NSCameraUsageDescription'],
      android: ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.CAMERA']
    }
  }],
]);

// Pre-selected popular dependencies
const defaultSelectedDependencies = new Map<string, any>([
  ['reanimated', {
    id: 'reanimated',
    label: 'React Native Reanimated',
    description: 'Powerful animations library',
    package: 'react-native-reanimated',
    version: '~3.16.1',
    category: 'ui'
  }],
  ['gesture-handler', {
    id: 'gesture-handler',
    label: 'React Native Gesture Handler',
    description: 'Touch and gesture handling',
    package: 'react-native-gesture-handler',
    version: '~2.20.2',
    category: 'ui'
  }],
  ['tanstack-query', {
    id: 'tanstack-query',
    label: 'TanStack Query',
    description: 'Powerful data fetching and caching',
    package: '@tanstack/react-query',
    version: '^5.62.8',
    category: 'state'
  }],
  ['zustand', {
    id: 'zustand',
    label: 'Zustand',
    description: 'Lightweight state management',
    package: 'zustand',
    version: '^5.0.2',
    category: 'state'
  }],
  ['zod', {
    id: 'zod',
    label: 'Zod',
    description: 'TypeScript-first schema validation',
    package: 'zod',
    version: '^3.24.1',
    category: 'utilities'
  }],
  ['axios', {
    id: 'axios',
    label: 'Axios',
    description: 'Promise-based HTTP client',
    package: 'axios',
    version: '^1.7.9',
    category: 'networking'
  }],
]);

export const useExpoStore = create<ExpoStore>((set, get) => ({
  template: 'default-sdk-55',
  config: JSON.parse(JSON.stringify(defaultExpoConfig)),
  // Initialize with minimal package.json - template will provide the real one
  packageJson: {
    name: 'my-expo-app',
    version: '1.0.0',
    dependencies: {},
    devDependencies: {}
  },
  selectedModules: new Map(defaultSelectedModules),
  selectedDependencies: new Map(defaultSelectedDependencies),
  iconFile: null,
  splashFile: null,
  useHermesV1: false,
  packageManager: 'npm',
  
  setTemplate: async (template) => {
    set({ template });
    
    // Fetch template's default configs
    try {
      const response = await fetch(`http://localhost:3001/api/template-preview/${template}`);
      if (response.ok) {
        const { appJson, packageJson } = await response.json();
        
        // Update config with template's app.json (merge with user's app name/slug/version)
        const currentConfig = get().config;
        const mergedConfig = {
          ...appJson,
          expo: {
            ...appJson.expo,
            name: currentConfig.expo.name,
            slug: currentConfig.expo.slug,
            version: currentConfig.expo.version,
          }
        };
        
        // Update packageJson with template's package.json
        const mergedPackageJson = {
          ...packageJson,
          name: currentConfig.expo.slug,
          version: currentConfig.expo.version,
        };
        
        set({ 
          config: mergedConfig,
          packageJson: mergedPackageJson
        });
      }
    } catch (error) {
      console.error('Failed to fetch template preview:', error);
    }
  },
  
  setIconFile: (file) => set({ iconFile: file }),
  
  setSplashFile: (file) => set({ splashFile: file }),
  
  setUseHermesV1: (enabled) => {
    set({ useHermesV1: enabled });
    
    // Update package.json with Hermes V1 compiler override if enabled
    if (enabled) {
      const { packageJson, packageManager } = get();
      const newPackageJson = JSON.parse(JSON.stringify(packageJson));
      
      // Add hermes-compiler override based on package manager
      const hermesVersion = '1.0.0-rc.1';
      if (packageManager === 'yarn') {
        newPackageJson.resolutions = newPackageJson.resolutions || {};
        newPackageJson.resolutions['hermes-compiler'] = hermesVersion;
      } else {
        // npm, pnpm, bun use 'overrides'
        newPackageJson.overrides = newPackageJson.overrides || {};
        newPackageJson.overrides['hermes-compiler'] = hermesVersion;
      }
      
      set({ packageJson: newPackageJson });
    } else {
      // Remove hermes-compiler override
      const { packageJson, packageManager } = get();
      const newPackageJson = JSON.parse(JSON.stringify(packageJson));
      
      if (packageManager === 'yarn') {
        delete newPackageJson.resolutions?.['hermes-compiler'];
      } else {
        delete newPackageJson.overrides?.['hermes-compiler'];
      }
      
      set({ packageJson: newPackageJson });
    }
  },
  
  setPackageManager: (manager) => {
    const { useHermesV1, packageJson } = get();
    set({ packageManager: manager });
    
    // If Hermes V1 is enabled, migrate the override field
    if (useHermesV1) {
      const newPackageJson = JSON.parse(JSON.stringify(packageJson));
      const hermesVersion = '1.0.0-rc.1';
      
      // Remove old override field
      delete newPackageJson.resolutions;
      delete newPackageJson.overrides;
      
      // Add new override field based on manager
      if (manager === 'yarn') {
        newPackageJson.resolutions = { 'hermes-compiler': hermesVersion };
      } else {
        newPackageJson.overrides = { 'hermes-compiler': hermesVersion };
      }
      
      set({ packageJson: newPackageJson });
    }
  },
  
  updateConfig: (config) => set({ config }),
  
  updateConfigFromJson: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      set({ config: parsed });
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  },
  
  updatePackageJson: (packageJson) => set({ packageJson }),
  
  updatePackageJsonFromJson: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      set({ packageJson: parsed });
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  },
  
  updateAppName: (name) => {
    const { config, packageJson } = get();
    const newConfig = JSON.parse(JSON.stringify(config));
    const newPackageJson = JSON.parse(JSON.stringify(packageJson));
    
    // Auto-generate slug from name (lowercase, dash-separated)
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    newConfig.expo.name = name;
    newConfig.expo.slug = slug;
    newPackageJson.name = slug;
    
    set({ config: newConfig, packageJson: newPackageJson });
  },
  
  updateAppSlug: (slug) => {
    const { config } = get();
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.expo.slug = slug;
    set({ config: newConfig });
  },
  
  updateAppVersion: (version) => {
    const { config, packageJson } = get();
    const newConfig = JSON.parse(JSON.stringify(config));
    const newPackageJson = JSON.parse(JSON.stringify(packageJson));
    
    newConfig.expo.version = version;
    newPackageJson.version = version;
    
    set({ config: newConfig, packageJson: newPackageJson });
  },
  
  updateIconUrl: (url) => {
    const { config } = get();
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.expo.icon = url;
    set({ config: newConfig });
  },
  
  updateSplashUrl: (url) => {
    const { config } = get();
    const newConfig = JSON.parse(JSON.stringify(config));
    if (!newConfig.expo.splash) {
      newConfig.expo.splash = {};
    }
    newConfig.expo.splash.image = url;
    set({ config: newConfig });
  },
  
  toggleModule: (moduleId, moduleConfig?: any) => {
    const { selectedModules, packageJson, config } = get();
    const newSelectedModules = new Map(selectedModules);
    const newPackageJson = JSON.parse(JSON.stringify(packageJson));
    const newConfig = JSON.parse(JSON.stringify(config));
    
    if (selectedModules.has(moduleId)) {
      // Remove module
      newSelectedModules.delete(moduleId);
      delete newPackageJson.dependencies[moduleId];
      
      // Remove from plugins array
      if (newConfig.expo.plugins) {
        newConfig.expo.plugins = newConfig.expo.plugins.filter((p: any) => {
          const pluginName = typeof p === 'string' ? p : p[0];
          return pluginName !== moduleId;
        });
      }
    } else {
      // Add module
      const moduleData = moduleConfig || { id: moduleId };
      newSelectedModules.set(moduleId, moduleData);
      newPackageJson.dependencies[moduleId] = 'latest';
      
      // Add to plugins array if config provided
      if (moduleConfig) {
        if (!newConfig.expo.plugins) {
          newConfig.expo.plugins = [];
        }
        
        // Add plugin with config
        if (moduleConfig.plugins && moduleConfig.plugins.length > 0) {
          moduleConfig.plugins.forEach((plugin: any) => {
            if (plugin.config && Object.keys(plugin.config).length > 0) {
              newConfig.expo.plugins.push([plugin.name, plugin.config]);
            } else {
              newConfig.expo.plugins.push(plugin.name);
            }
          });
        }
        
        // Add iOS permissions
        if (moduleConfig.permissions?.ios && moduleConfig.permissions.ios.length > 0) {
          if (!newConfig.expo.ios) newConfig.expo.ios = {};
          if (!newConfig.expo.ios.infoPlist) newConfig.expo.ios.infoPlist = {};
          
          moduleConfig.permissions.ios.forEach((permission: string) => {
            newConfig.expo.ios.infoPlist[permission] = `This app needs ${permission}`;
          });
        }
        
        // Add Android permissions
        if (moduleConfig.permissions?.android && moduleConfig.permissions.android.length > 0) {
          if (!newConfig.expo.android) newConfig.expo.android = {};
          if (!newConfig.expo.android.permissions) newConfig.expo.android.permissions = [];
          
          moduleConfig.permissions.android.forEach((permission: string) => {
            if (!newConfig.expo.android.permissions.includes(permission)) {
              newConfig.expo.android.permissions.push(permission);
            }
          });
        }
        
        // Add custom config
        if (moduleConfig.customConfig) {
          Object.assign(newConfig.expo, moduleConfig.customConfig);
        }
      }
    }
    
    set({
      selectedModules: newSelectedModules,
      packageJson: newPackageJson,
      config: newConfig,
    });
  },
  
  toggleDependency: (depId, packageName, version) => {
    const { selectedDependencies, packageJson } = get();
    const newSelectedDependencies = new Map(selectedDependencies);
    const newPackageJson = JSON.parse(JSON.stringify(packageJson));
    
    if (selectedDependencies.has(depId)) {
      newSelectedDependencies.delete(depId);
      delete newPackageJson.dependencies[packageName];
    } else {
      newSelectedDependencies.set(depId, { id: depId, package: packageName, version });
      newPackageJson.dependencies[packageName] = version;
    }
    
    set({
      selectedDependencies: newSelectedDependencies,
      packageJson: newPackageJson,
    });
  },
  
  setSelectedModules: (modules) => {
    const newSelectedModules = new Map<string, any>();
    const newPackageJson = JSON.parse(JSON.stringify(get().packageJson));
    const newConfig = JSON.parse(JSON.stringify(get().config));
    
    // Initialize config structures
    if (!newConfig.expo.plugins) newConfig.expo.plugins = [];
    if (!newConfig.expo.ios) newConfig.expo.ios = {};
    if (!newConfig.expo.ios.infoPlist) newConfig.expo.ios.infoPlist = {};
    if (!newConfig.expo.android) newConfig.expo.android = {};
    if (!newConfig.expo.android.permissions) newConfig.expo.android.permissions = [];
    
    modules.forEach(module => {
      newSelectedModules.set(module.id, module);
      newPackageJson.dependencies[module.id] = module.version || 'latest';
      
      // Add iOS permissions
      if (module.permissions?.ios) {
        module.permissions.ios.forEach((perm: string) => {
          const description = module.configuredPermissions?.[perm] || `This app needs ${perm}`;
          newConfig.expo.ios.infoPlist[perm] = description;
        });
      }
      
      // Add Android permissions
      if (module.permissions?.android) {
        module.permissions.android.forEach((perm: string) => {
          if (!newConfig.expo.android.permissions.includes(perm)) {
            newConfig.expo.android.permissions.push(perm);
          }
        });
      }
      
      // Add plugin configuration
      if (module.needsPlugin) {
        const pluginConfig = module.configuredPluginConfig || {};
        if (Object.keys(pluginConfig).length > 0) {
          newConfig.expo.plugins.push([module.id, pluginConfig]);
        } else {
          newConfig.expo.plugins.push(module.id);
        }
      }
    });
    
    set({ 
      selectedModules: newSelectedModules, 
      packageJson: newPackageJson,
      config: newConfig
    });
  },
  
  setSelectedDependencies: (deps) => {
    const newSelectedDependencies = new Map<string, any>();
    const newPackageJson = JSON.parse(JSON.stringify(get().packageJson));
    
    deps.forEach(dep => {
      newSelectedDependencies.set(dep.id, dep);
      newPackageJson.dependencies[dep.package] = dep.version;
    });
    
    set({ selectedDependencies: newSelectedDependencies, packageJson: newPackageJson });
  },
  
  removeModule: (moduleId) => {
    const { selectedModules, packageJson } = get();
    const newSelectedModules = new Map(selectedModules);
    const newPackageJson = JSON.parse(JSON.stringify(packageJson));
    
    newSelectedModules.delete(moduleId);
    delete newPackageJson.dependencies[moduleId];
    
    set({ selectedModules: newSelectedModules, packageJson: newPackageJson });
  },
  
  removeDependency: (depId) => {
    const { selectedDependencies, packageJson } = get();
    const dep = selectedDependencies.get(depId);
    if (!dep) return;
    
    const newSelectedDependencies = new Map(selectedDependencies);
    const newPackageJson = JSON.parse(JSON.stringify(packageJson));
    
    newSelectedDependencies.delete(depId);
    delete newPackageJson.dependencies[dep.package];
    
    set({ selectedDependencies: newSelectedDependencies, packageJson: newPackageJson });
  },
  
  reset: () => {
    set({
      template: 'blank',
      config: JSON.parse(JSON.stringify(defaultExpoConfig)),
      packageJson: {
        name: 'my-expo-app',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {}
      },
      selectedModules: new Map<string, any>(),
      selectedDependencies: new Map<string, any>(),
    });
  },
}));
