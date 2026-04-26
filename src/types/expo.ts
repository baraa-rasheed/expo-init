export interface ExpoConfig {
  expo: {
    name: string;
    slug: string;
    version: string;
    orientation?: string;
    icon?: string;
    userInterfaceStyle?: string;
    splash?: {
      image?: string;
      resizeMode?: string;
      backgroundColor?: string;
    };
    assetBundlePatterns?: string[];
    ios?: {
      supportsTablet?: boolean;
      bundleIdentifier?: string;
      infoPlist?: Record<string, any>;
    };
    android?: {
      adaptiveIcon?: {
        foregroundImage?: string;
        backgroundColor?: string;
      };
      package?: string;
      permissions?: string[];
    };
    web?: {
      favicon?: string;
    };
    plugins?: Array<string | [string, any]>;
    extra?: Record<string, any>;
  };
}

export interface PackageJson {
  name: string;
  version: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  overrides?: Record<string, string>;
  resolutions?: Record<string, string>;
}

export interface ExpoModule {
  id: string;
  label: string;
  description: string;
  packages: string[];
  applyConfig: (config: ExpoConfig) => ExpoConfig;
  revertConfig: (config: ExpoConfig) => ExpoConfig;
}

export interface DependencyOption {
  id: string;
  label: string;
  description: string;
  package: string;
  version: string;
}

export type ExpoTemplate = 'blank' | 'tabs' | 'default-sdk-55' | 'bare-minimum' | 'blank-typescript';
