import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

interface ExpoModule {
  id: string;
  name: string;
  description: string;
  version: string;
  packages: string[];
  category?: string;
  hasConfig: boolean;
  requiredPermissions?: {
    ios?: string[];
    android?: string[];
  };
}

export function useExpoModules() {
  const [modules, setModules] = useState<Record<string, ExpoModule[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/expo-modules`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      
      const data = await response.json();
      setModules(data);
    } catch (err) {
      console.error('Error fetching Expo modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch modules');
      // Fallback to empty object on error
      setModules({});
    } finally {
      setLoading(false);
    }
  };

  return { modules, loading, error, refetch: fetchModules };
}
