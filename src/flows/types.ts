import type { ExpoTemplate } from '@/types/expo';

export type FlowVisibility = 'oss' | 'pro';

export interface FlowPatch {
  template?: ExpoTemplate;
  moduleIds?: string[];
  dependencyIds?: string[];
  appJson?: {
    expo?: {
      name?: string;
      slug?: string;
      version?: string;
      plugins?: any[];
      ios?: any;
      android?: any;
    };
  };
}

export interface ExpoInitFlow {
  id: string;
  title: string;
  description: string;
  visibility: FlowVisibility;
  patch: FlowPatch;
}

