import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExpoStore } from '@/store/useExpoStore';
import { Download, Copy, Check, Loader2, AlertCircle, ChevronDown, Braces, Package } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { API_URL } from '@/config/api';

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewModal({ open, onOpenChange }: PreviewModalProps) {
  const { 
    template,
    config, 
    packageJson,
    selectedModules, 
    selectedDependencies,
    iconFile,
    splashFile,
  } = useExpoStore();
  
  const [expanded, setExpanded] = useState<'app' | 'package' | null>(null);
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templatePackageJson, setTemplatePackageJson] = useState<any | null>(null);

  const appJsonString = JSON.stringify(config, null, 2);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/template-preview/${template}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setTemplatePackageJson(data?.packageJson ?? null);
      } catch {
        // If this fails, we'll fall back to the store packageJson.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, template]);

  const previewPackageJson = useMemo(() => {
    const base = (templatePackageJson ?? packageJson) || {};
    const merged = JSON.parse(JSON.stringify(base));

    merged.name = config.expo.slug || merged.name;
    merged.version = config.expo.version || merged.version;
    merged.dependencies = merged.dependencies || {};
    merged.devDependencies = merged.devDependencies || {};

    // Add selected Expo modules (package name = module id).
    for (const mod of Array.from(selectedModules.values()) as any[]) {
      if (!mod?.id) continue;
      merged.dependencies[mod.id] = mod.version || merged.dependencies[mod.id] || 'latest';
    }

    // Add selected dependencies (package name = dep.package).
    for (const dep of Array.from(selectedDependencies.values()) as any[]) {
      const pkg = dep.package || dep.pkg;
      const ver = dep.version;
      if (!pkg) continue;
      merged.dependencies[pkg] = ver || merged.dependencies[pkg] || 'latest';
    }

    // Preserve non-dependency fields that we manage in the store (e.g. Hermes V1 pin).
    // When templatePackageJson is present, it becomes the "base", so we explicitly merge these in.
    if (packageJson?.overrides) {
      merged.overrides = { ...(merged.overrides || {}), ...packageJson.overrides };
    }
    if (packageJson?.resolutions) {
      merged.resolutions = { ...(merged.resolutions || {}), ...packageJson.resolutions };
    }

    return merged;
  }, [templatePackageJson, packageJson, config.expo.slug, config.expo.version, selectedModules, selectedDependencies]);

  const packageJsonString = JSON.stringify(previewPackageJson, null, 2);

  const handleCopy = (text: string, type: 'app' | 'package') => {
    navigator.clipboard.writeText(text);
    if (type === 'app') {
      setCopiedApp(true);
      setTimeout(() => setCopiedApp(false), 2000);
    } else {
      setCopiedPackage(true);
      setTimeout(() => setCopiedPackage(false), 2000);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('template', template);
      formData.append('appName', config.expo.name);
      formData.append('slug', config.expo.slug);
      formData.append('version', config.expo.version);
      
      // Send full module objects with all their data
      const modulesArray = Array.from(selectedModules.values());
      formData.append('selectedModules', JSON.stringify(modulesArray));
      
      // Send full dependency objects
      const depsArray = Array.from(selectedDependencies.values());
      formData.append('selectedDependencies', JSON.stringify(depsArray));
      
      formData.append('appConfig', appJsonString);
      // Send merged package.json so generator includes fields like overrides/resolutions (Hermes V1).
      formData.append('packageConfig', packageJsonString);

      if (iconFile) formData.append('icon', iconFile);
      if (splashFile) formData.append('splash', splashFile);

      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate project' }));
        throw new Error(errorData.error || errorData.message || 'Failed to generate project');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.expo.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate project');
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] pt-10">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Preview</DialogTitle>
            <Button onClick={handleGenerate} size="sm" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <DialogDescription>
            Review `app.json` and `package.json` before generating.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-lg border bg-card">
            <div className="p-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold leading-none truncate">{config.expo.name}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">{config.expo.slug}</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border bg-muted/10 p-3">
                  <div className="text-xs font-medium text-muted-foreground">Project</div>
                  <div className="mt-2 grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Version</span>
                      <Badge variant="secondary" className="text-xs">
                        v{config.expo.version}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Template</span>
                      <Badge variant="outline" className="text-xs">
                        {template}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Plugins</span>
                      <span className="font-medium">{config.expo.plugins?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border bg-muted/10 p-3">
                  <div className="text-xs font-medium text-muted-foreground">Packages</div>
                  <div className="mt-2 grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Expo modules</span>
                      <span className="font-medium">{selectedModules.size}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Dependencies</span>
                      <span className="font-medium">{selectedDependencies.size}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">
                        {Object.keys(previewPackageJson.dependencies || {}).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {/* app.json card */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded((v) => (v === 'app' ? null : 'app'))}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Braces className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">app.json</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {config.expo.plugins?.length || 0} plugins • iOS/Android permissions included
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopy(appJsonString, 'app');
                      }}
                      className="h-8 w-8"
                      aria-label="Copy app.json"
                      title="Copy"
                    >
                      {copiedApp ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadFile('app.json', appJsonString);
                      }}
                      disabled={generating}
                      className="h-8 w-8"
                      aria-label="Download app.json"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <ChevronDown className={`ml-1 h-4 w-4 text-muted-foreground transition-transform ${expanded === 'app' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {expanded === 'app' && (
                <div className="border-t bg-muted/10">
                  <ScrollArea className="h-[45vh] w-full">
                    <pre className="p-4 text-xs font-mono whitespace-pre">
                      <code className="language-json">{appJsonString}</code>
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* package.json card */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded((v) => (v === 'package' ? null : 'package'))}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">package.json</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {Object.keys(previewPackageJson.dependencies || {}).length} dependencies • includes overrides/resolutions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopy(packageJsonString, 'package');
                      }}
                      className="h-8 w-8"
                      aria-label="Copy package.json"
                      title="Copy"
                    >
                      {copiedPackage ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadFile('package.json', packageJsonString);
                      }}
                      disabled={generating}
                      className="h-8 w-8"
                      aria-label="Download package.json"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <ChevronDown className={`ml-1 h-4 w-4 text-muted-foreground transition-transform ${expanded === 'package' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {expanded === 'package' && (
                <div className="border-t bg-muted/10">
                  <ScrollArea className="h-[45vh] w-full">
                    <pre className="p-4 text-xs font-mono whitespace-pre">
                      <code className="language-json">{packageJsonString}</code>
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="pt-1" />
      </DialogContent>
    </Dialog>
  );
}
