import express from 'express';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { moduleConfigs } from '../config/module-configs.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateRouter = express.Router();

generateRouter.post('/', async (req, res) => {
  // Use OS temp directory to avoid Vite watching it
  const tempDir = path.join('/tmp', 'expo-init', `project-${Date.now()}`);
  
  try {
    const {
      template,
      appName,
      slug,
      version,
      appConfig,
      packageConfig,
    } = req.body;

    // Parse JSON strings from form data
    const selectedModules = req.body.selectedModules ? JSON.parse(req.body.selectedModules) : [];
    const selectedDependencies = req.body.selectedDependencies ? JSON.parse(req.body.selectedDependencies) : [];

    // Parse files from multipart form data
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const iconFile = files?.icon?.[0];
    const splashFile = files?.splash?.[0];

    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    console.log(`Creating Expo project: ${appName} with template: ${template}`);

    // Step 1: Create Expo project from template
    // Note: create-expo-app uses template names without 'expo-template-' prefix
    // Use --no-install to skip dependency installation (user will install after download)
    // Special handling for SDK 55: default-sdk-55 -> default@sdk-55
    const templateArg = template === 'default-sdk-55' ? 'default@sdk-55' : template;
    const createCommand = `npx create-expo-app@latest ${slug} --template ${templateArg} --no-install`;
    console.log(`Running: ${createCommand}`);
    
    const { stdout, stderr } = await execAsync(createCommand, {
      cwd: tempDir,
    });
    
    console.log('Create output:', stdout);
    if (stderr) console.log('Create stderr:', stderr);

    const projectDir = path.join(tempDir, slug);

    // Step 2: Read and modify the template's package.json
    const packageJsonPath = path.join(projectDir, 'package.json');
    let packageJson: any = {};
    
    try {
      // Read the package.json created by the template
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageJsonContent);
      console.log('Template package.json dependencies:', Object.keys(packageJson.dependencies || {}));
      console.log('Has expo?', packageJson.dependencies?.expo);
    } catch (err) {
      console.error('Failed to read template package.json:', err);
      throw new Error('Template did not generate a valid package.json');
    }
    
    // Update with user's custom values (preserve all template dependencies)
    packageJson.name = slug;
    packageJson.version = version;
    
    // Ensure dependencies object exists
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // Add selected modules (on top of template dependencies)
    if (selectedModules && Array.isArray(selectedModules)) {
      selectedModules.forEach((module: any) => {
        // Add the module package to dependencies (won't overwrite existing)
        packageJson.dependencies[module.id] = module.version || 'latest';
      });
    }
    
    // Add selected dependencies (on top of template dependencies)
    if (selectedDependencies && Array.isArray(selectedDependencies)) {
      selectedDependencies.forEach((dep: any) => {
        packageJson.dependencies[dep.package] = dep.version;
      });
    }

    // Use provided packageConfig if available (merge, don't replace)
    if (packageConfig) {
      try {
        const customPackageJson = JSON.parse(packageConfig);
        // Deep merge dependencies instead of replacing
        if (customPackageJson.dependencies) {
          packageJson.dependencies = {
            ...packageJson.dependencies,
            ...customPackageJson.dependencies
          };
        }
        if (customPackageJson.devDependencies) {
          packageJson.devDependencies = {
            ...packageJson.devDependencies,
            ...customPackageJson.devDependencies
          };
        }
        // Merge other fields
        packageJson = { ...packageJson, ...customPackageJson };
      } catch (err) {
        console.error('Failed to parse custom package.json:', err);
      }
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Step 3: Create/modify app.json
    const appJsonPath = path.join(projectDir, 'app.json');
    let appJson: any = {};
    
    try {
      appJson = JSON.parse(await fs.readFile(appJsonPath, 'utf-8'));
    } catch {
      appJson = { expo: {} };
    }

    // Update app.json with user config
    appJson.expo.name = appName;
    appJson.expo.slug = slug;
    appJson.expo.version = version;

    // Apply module configurations from the modules data
    if (selectedModules && Array.isArray(selectedModules)) {
      selectedModules.forEach((module: any) => {
        console.log(`Applying config for module: ${module.id}`);
        
        // Add to plugins if needed
        if (module.needsPlugin) {
          if (!appJson.expo.plugins) appJson.expo.plugins = [];
          
          if (module.configuredPluginConfig && Object.keys(module.configuredPluginConfig).length > 0) {
            appJson.expo.plugins.push([module.id, module.configuredPluginConfig]);
          } else {
            appJson.expo.plugins.push(module.id);
          }
        }
        
        // Add iOS permissions
        if (module.permissions?.ios) {
          if (!appJson.expo.ios) appJson.expo.ios = {};
          if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
          
          module.permissions.ios.forEach((perm: string) => {
            const description = module.configuredPermissions?.[perm] || `This app needs ${perm}`;
            appJson.expo.ios.infoPlist[perm] = description;
          });
        }
        
        // Add Android permissions
        if (module.permissions?.android) {
          if (!appJson.expo.android) appJson.expo.android = {};
          if (!appJson.expo.android.permissions) appJson.expo.android.permissions = [];
          
          module.permissions.android.forEach((perm: string) => {
            if (!appJson.expo.android.permissions.includes(perm)) {
              appJson.expo.android.permissions.push(perm);
            }
          });
        }
      });
    }

    // Apply full app config if provided (this overrides everything)
    if (appConfig) {
      try {
        const customConfig = JSON.parse(appConfig);
        // Merge instead of replace to keep module configs
        appJson = {
          ...appJson,
          expo: {
            ...appJson.expo,
            ...customConfig.expo,
          },
        };
      } catch (err) {
        console.error('Failed to parse custom app config:', err);
      }
    }

    await fs.writeFile(appJsonPath, JSON.stringify(appJson, null, 2));

    // Step 4: Handle uploaded files
    const assetsDir = path.join(projectDir, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });

    if (iconFile) {
      const iconPath = path.join(assetsDir, 'icon.png');
      await fs.writeFile(iconPath, iconFile.buffer);
      appJson.expo.icon = './assets/icon.png';
    }

    if (splashFile) {
      const splashPath = path.join(assetsDir, 'splash.png');
      await fs.writeFile(splashPath, splashFile.buffer);
      appJson.expo.splash = appJson.expo.splash || {};
      appJson.expo.splash.image = './assets/splash.png';
    }

    // Update app.json with asset paths
    await fs.writeFile(appJsonPath, JSON.stringify(appJson, null, 2));

    // Step 5: Add README with instructions
    const readmePath = path.join(projectDir, 'README.md');
    const readmeContent = `# ${appName}

Generated with ExpoInit

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npx expo start
   \`\`\`

## Template
- ${template}

## Selected Modules
${selectedModules && selectedModules.length > 0 ? selectedModules.map((m: any) => `- ${m.name} (${m.id})`).join('\n') : '- None'}

## Dependencies
${selectedDependencies && selectedDependencies.length > 0 ? selectedDependencies.map((d: any) => `- ${d.label} (${d.package}@${d.version})`).join('\n') : '- None'}
`;
    await fs.writeFile(readmePath, readmeContent);

    // Step 6: Create ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.directory(projectDir, slug);
    await archive.finalize();

    // Cleanup temp directory after sending
    setTimeout(async () => {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up temp directory:', err);
      }
    }, 5000);

  } catch (error) {
    console.error('Error generating project:', error);
    
    // Cleanup on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
    
    res.status(500).json({ 
      error: 'Failed to generate project',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
