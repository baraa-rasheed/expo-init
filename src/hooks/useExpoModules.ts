import { useEffect, useState } from 'react';

import { API_URL } from '@/config/api';

export interface ExpoModule {
  id: string;
  name: string;
  description: string;
  version: string;
  category?: string;
  needsPlugin: boolean;
  permissions?: {
    ios?: string[];
    android?: string[];
  };
  pluginConfig?: Record<string, unknown>;
}

export type ExpoModulesByCategory = Record<string, ExpoModule[]>;

export function useExpoModules() {
  const [modules, setModules] = useState<ExpoModulesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/expo-modules`);
      if (!response.ok) {
        throw new Error(`Failed to fetch modules: ${response.status}`);
      }

      const data = (await response.json()) as ExpoModulesByCategory;
      setModules(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch modules';
      if (import.meta.env.DEV) {
        console.error('[useExpoModules]', err);
      }
      setError(message);
      setModules({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return { modules, loading, error, refetch: fetchModules };
}
