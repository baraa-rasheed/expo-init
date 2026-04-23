import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const templatePreviewRouter = express.Router();

// Cache for template configs
const templateCache: Record<string, { appJson: any; packageJson: any; timestamp: number }> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

templatePreviewRouter.get('/:template', async (req, res) => {
  const { template } = req.params;
  
  try {
    // Check cache
    const cached = templateCache[template];
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`Using cached template config for: ${template}`);
      return res.json(cached);
    }

    console.log(`Fetching template config for: ${template}`);
    
    // Create temp directory
    const tempDir = path.join('/tmp', 'expo-init-preview', `template-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    const projectName = 'preview-project';
    
    // Create project with template (no install)
    // Special handling for SDK 55: default-sdk-55 -> default@sdk-55
    const templateArg = template === 'default-sdk-55' ? 'default@sdk-55' : template;
    await execAsync(`npx create-expo-app@latest ${projectName} --template ${templateArg} --no-install`, {
      cwd: tempDir,
      timeout: 60000 // 60 second timeout
    });
    
    const projectDir = path.join(tempDir, projectName);
    
    // Read app.json
    let appJson: any = {};
    try {
      const appJsonContent = await fs.readFile(path.join(projectDir, 'app.json'), 'utf-8');
      appJson = JSON.parse(appJsonContent);
    } catch (err) {
      console.error('Failed to read app.json:', err);
    }
    
    // Read package.json
    let packageJson: any = {};
    try {
      const packageJsonContent = await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8');
      packageJson = JSON.parse(packageJsonContent);
    } catch (err) {
      console.error('Failed to read package.json:', err);
    }
    
    // Cleanup
    setTimeout(async () => {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Error cleaning up temp directory:', err);
      }
    }, 5000);
    
    // Cache the result
    const result = { appJson, packageJson, timestamp: Date.now() };
    templateCache[template] = result;
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching template preview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch template preview',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
