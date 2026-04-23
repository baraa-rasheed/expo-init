import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExpoStore } from '@/store/useExpoStore';
import { Download, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const API_URL = 'http://localhost:3001';

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
  
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedPackage, setCopiedPackage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appJsonString = JSON.stringify(config, null, 2);
  const packageJsonString = JSON.stringify(packageJson, null, 2);

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
      // Don't send packageConfig - let backend use template's package.json and add our selections on top

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

  const handleDownloadConfigs = () => {
    const files = [
      { name: 'app.json', content: appJsonString },
      { name: 'package.json', content: packageJsonString },
    ];

    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Project Summary & Configuration</DialogTitle>
          <DialogDescription>
            Review your project details and download the configuration
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="app-json">app.json</TabsTrigger>
            <TabsTrigger value="package-json">package.json</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">App Information</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{config.expo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slug:</span>
                      <span className="font-medium font-mono text-xs">{config.expo.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-medium">{config.expo.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span className="font-medium">{template}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Project Stats</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expo Modules:</span>
                      <span className="font-medium">{selectedModules.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dependencies:</span>
                      <span className="font-medium">{selectedDependencies.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Packages:</span>
                      <span className="font-medium">{Object.keys(packageJson.dependencies).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plugins:</span>
                      <span className="font-medium">{config.expo.plugins?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedModules.size > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Selected Modules</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedModules.values()).map((module) => (
                      <Badge key={module.id} variant="secondary">
                        {module.name || module.id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDependencies.size > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Selected Dependencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedDependencies.values()).map((dep) => (
                      <Badge key={dep.id} variant="outline">
                        {dep.label || dep.package}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="app-json" className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(appJsonString, 'app')}
                className="flex-1"
              >
                {copiedApp ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[50vh] w-full rounded-md border">
              <pre className="p-4 text-xs font-mono whitespace-pre">
                <code className="language-json">{appJsonString}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="package-json" className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(packageJsonString, 'package')}
                className="flex-1"
              >
                {copiedPackage ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[50vh] w-full rounded-md border">
              <pre className="p-4 text-xs font-mono whitespace-pre">
                <code className="language-json">{packageJsonString}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleDownloadConfigs} 
            variant="outline"
            className="flex-1" 
            size="lg"
            disabled={generating}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Configs Only
          </Button>
          <Button 
            onClick={handleGenerate} 
            className="flex-1" 
            size="lg"
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Project...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Generate Full Project
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
