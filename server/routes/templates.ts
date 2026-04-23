import express from 'express';

export const templatesRouter = express.Router();

// Available Expo templates
const EXPO_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'A minimal app with a single screen',
    command: 'npx create-expo-app --template blank',
  },
  {
    id: 'blank-typescript',
    name: 'Blank (TypeScript)',
    description: 'A minimal TypeScript app',
    command: 'npx create-expo-app --template blank-typescript',
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Several example screens and tabs using React Navigation',
    command: 'npx create-expo-app --template tabs',
  },
  {
    id: 'bare-minimum',
    name: 'Bare Minimum',
    description: 'Bare and minimal, just the essentials',
    command: 'npx create-expo-app --template bare-minimum',
  },
];

// Get all available templates
templatesRouter.get('/', (req, res) => {
  res.json(EXPO_TEMPLATES);
});

// Get specific template info
templatesRouter.get('/:id', (req, res) => {
  const template = EXPO_TEMPLATES.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  res.json(template);
});
