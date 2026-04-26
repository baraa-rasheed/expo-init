import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { PassThrough, Readable } from 'node:stream';

const execAsync = promisify(exec);

export interface GenerateProjectResult {
  headers: Record<string, string>;
  body: ReadableStream<Uint8Array>;
}

function templateToCreateExpoAppArg(template: string) {
  return template === 'default-sdk-55' ? 'default@sdk-55' : template;
}

async function fileToBuffer(file: File): Promise<Buffer> {
  const ab = await file.arrayBuffer();
  return Buffer.from(ab);
}

export async function generateProjectZipFromFormData(formData: FormData): Promise<GenerateProjectResult> {
  // Use OS temp directory to avoid Vite watching it
  const tempDir = path.join('/tmp', 'expo-init', `project-${Date.now()}`);

  try {
    const template = String(formData.get('template') ?? '');
    const appName = String(formData.get('appName') ?? 'My Expo App');
    const slug = String(formData.get('slug') ?? 'my-expo-app');
    const version = String(formData.get('version') ?? '1.0.0');
    const appConfig = formData.get('appConfig');
    const packageConfig = formData.get('packageConfig');

    const selectedModulesRaw = formData.get('selectedModules');
    const selectedDependenciesRaw = formData.get('selectedDependencies');
    const selectedModules = selectedModulesRaw ? JSON.parse(String(selectedModulesRaw)) : [];
    const selectedDependencies = selectedDependenciesRaw ? JSON.parse(String(selectedDependenciesRaw)) : [];

    const icon = formData.get('icon');
    const splash = formData.get('splash');
    const iconFile = icon instanceof File ? icon : null;
    const splashFile = splash instanceof File ? splash : null;

    await fs.mkdir(tempDir, { recursive: true });

    const templateArg = templateToCreateExpoAppArg(template);
    const createCommand = `npx create-expo-app@latest ${slug} --template ${templateArg} --no-install`;

    await execAsync(createCommand, { cwd: tempDir });

    const projectDir = path.join(tempDir, slug);

    // package.json
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    let packageJson: any = JSON.parse(packageJsonContent);

    packageJson.name = slug;
    packageJson.version = version;
    if (!packageJson.dependencies) packageJson.dependencies = {};

    if (Array.isArray(selectedModules)) {
      selectedModules.forEach((module: any) => {
        packageJson.dependencies[module.id] = module.version || 'latest';
      });
    }

    if (Array.isArray(selectedDependencies)) {
      selectedDependencies.forEach((dep: any) => {
        packageJson.dependencies[dep.package] = dep.version;
      });
    }

    if (packageConfig) {
      try {
        const customPackageJson = JSON.parse(String(packageConfig));
        if (customPackageJson.dependencies) {
          packageJson.dependencies = { ...packageJson.dependencies, ...customPackageJson.dependencies };
        }
        if (customPackageJson.devDependencies) {
          packageJson.devDependencies = { ...packageJson.devDependencies, ...customPackageJson.devDependencies };
        }
        packageJson = { ...packageJson, ...customPackageJson };
      } catch {
        // ignore
      }
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // app.json
    const appJsonPath = path.join(projectDir, 'app.json');
    let appJson: any = {};
    try {
      appJson = JSON.parse(await fs.readFile(appJsonPath, 'utf-8'));
    } catch {
      appJson = { expo: {} };
    }

    appJson.expo = appJson.expo || {};
    appJson.expo.name = appName;
    appJson.expo.slug = slug;
    appJson.expo.version = version;

    if (Array.isArray(selectedModules)) {
      selectedModules.forEach((module: any) => {
        if (module.needsPlugin) {
          if (!appJson.expo.plugins) appJson.expo.plugins = [];
          if (module.configuredPluginConfig && Object.keys(module.configuredPluginConfig).length > 0) {
            appJson.expo.plugins.push([module.id, module.configuredPluginConfig]);
          } else {
            appJson.expo.plugins.push(module.id);
          }
        }

        if (module.permissions?.ios) {
          if (!appJson.expo.ios) appJson.expo.ios = {};
          if (!appJson.expo.ios.infoPlist) appJson.expo.ios.infoPlist = {};
          module.permissions.ios.forEach((perm: string) => {
            const description = module.configuredPermissions?.[perm] || `This app needs ${perm}`;
            appJson.expo.ios.infoPlist[perm] = description;
          });
        }

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

    if (appConfig) {
      try {
        const customConfig = JSON.parse(String(appConfig));
        appJson = {
          ...appJson,
          expo: {
            ...appJson.expo,
            ...customConfig.expo,
          },
        };
      } catch {
        // ignore
      }
    }

    // assets
    const assetsDir = path.join(projectDir, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });

    if (iconFile) {
      await fs.writeFile(path.join(assetsDir, 'icon.png'), await fileToBuffer(iconFile));
      appJson.expo.icon = './assets/icon.png';
    }

    if (splashFile) {
      await fs.writeFile(path.join(assetsDir, 'splash.png'), await fileToBuffer(splashFile));
      appJson.expo.splash = appJson.expo.splash || {};
      appJson.expo.splash.image = './assets/splash.png';
    }

    await fs.writeFile(appJsonPath, JSON.stringify(appJson, null, 2));

    // README
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
`;
    await fs.writeFile(readmePath, readmeContent);

    // ZIP stream
    const pass = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.directory(projectDir, slug);
    archive.on('error', (err: Error) => pass.destroy(err));
    archive.pipe(pass);
    void archive.finalize();

    // Cleanup temp directory later
    setTimeout(() => {
      fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }, 5000);

    const body = Readable.toWeb(pass) as unknown as ReadableStream<Uint8Array>;
    return {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}.zip"`,
      },
      body,
    };
  } catch (err) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw err;
  }
}

