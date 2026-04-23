import express from 'express';
import { fetchModuleDetailsWithConfig } from '../services/expoModuleFetcher.js';

export const moduleDetailsRouter = express.Router();

// GET /api/module-details/:moduleId
// Fetch detailed configuration for a specific Expo module
moduleDetailsRouter.get('/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    console.log(`Fetching details for module: ${moduleId}`);
    
    const details = await fetchModuleDetailsWithConfig(moduleId);
    
    if (!details) {
      return res.status(404).json({ error: 'Module not found or failed to fetch' });
    }
    
    res.json(details);
  } catch (error) {
    console.error('Error fetching module details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch module details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
