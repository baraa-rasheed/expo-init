import { useState } from 'react';
import { useExpoStore } from '@/store/useExpoStore';
import { ThemeToggle } from '@/components/theme-toggle';
import { useExpoModules } from '@/hooks/useExpoModules';
import { dependenciesByCategory } from '@/config/dependencies';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rocket, Download, Search, X, Plus } from 'lucide-react';
import type { ExpoTemplate } from '@/types/expo';

const templates: { value: ExpoTemplate; label: string }[] = [
  { value: 'blank', label: 'Blank' },
  { value: 'tabs', label: 'Tabs' },
  { value: 'bare-minimum', label: 'Bare Minimum' },
  { value: 'blank-typescript', label: 'Blank TypeScript' },
];

function App() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const [depSearch, setDepSearch] = useState('');
  
  const { 
    template,
    setTemplate,
    config,
    updateAppName,
    updateAppSlug,
    updateAppVersion,
    selectedModules, 
    selectedDependencies,
    removeModule,
    removeDependency,
    toggleModule,
    toggleDependency
  } = useExpoStore();
  
  const { modules } = useExpoModules();

  // Filter modules
  const filteredModules = Object.entries(modules).reduce((acc, [category, mods]) => {
    const filtered = (mods as any[]).filter((mod) =>
      mod.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      mod.id.toLowerCase().includes(moduleSearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  // Filter dependencies
  const filteredDeps = Object.entries(dependenciesByCategory).reduce((acc, [category, deps]) => {
    const filtered = deps.filter((dep) =>
      dep.label.toLowerCase().includes(depSearch.toLowerCase()) ||
      dep.package.toLowerCase().includes(depSearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">ExpoInit</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Spring Initializr Style */}
      <main className="container mx-auto px-6 py-6 max-w-[1600px]">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Side - Configuration Form */}
          <div className="col-span-4 space-y-6">
            {/* Project Metadata */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Project Metadata</h2>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium">Template</Label>
                  <Select value={template} onValueChange={(value) => setTemplate(value as ExpoTemplate)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">App Name</Label>
                  <Input
                    value={config.expo.name}
                    onChange={(e) => updateAppName(e.target.value)}
                    placeholder="My Expo App"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Slug</Label>
                  <Input
                    value={config.expo.slug}
                    onChange={(e) => updateAppSlug(e.target.value)}
                    placeholder="my-expo-app"
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Version</Label>
                  <Input
                    value={config.expo.version}
                    onChange={(e) => updateAppVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={() => setShowPreviewModal(true)} 
              className="w-full h-12"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Generate Project
            </Button>
          </div>

          {/* Right Side - Dependencies Selection */}
          <div className="col-span-8 space-y-6">
            {/* Expo Modules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Expo Modules</h2>
                <Badge variant="secondary">{selectedModules.size} selected</Badge>
              </div>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-4">
                  {Object.entries(filteredModules).map(([category, categoryModules]) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryModules.map((module: any) => {
                          const isSelected = selectedModules.has(module.id);
                          return (
                            <button
                              key={module.id}
                              onClick={() => toggleModule(module.id, module)}
                              className={`text-left p-2 rounded border-2 transition-all text-sm ${
                                isSelected
                                  ? 'border-primary bg-primary/5 font-medium'
                                  : 'border-border hover:border-primary/50 hover:bg-accent'
                              }`}
                            >
                              {module.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Selected Modules */}
              {selectedModules.size > 0 && (
                <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                  <p className="text-xs font-medium mb-2">Selected:</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedModules.values()).map((module: any) => (
                      <Badge
                        key={module.id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1"
                      >
                        {module.name}
                        <button
                          onClick={() => removeModule(module.id)}
                          className="ml-1 hover:bg-muted rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dependencies */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Dependencies</h2>
                <Badge variant="secondary">{selectedDependencies.size} selected</Badge>
              </div>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dependencies..."
                  value={depSearch}
                  onChange={(e) => setDepSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-4">
                  {Object.entries(filteredDeps).map(([category, categoryDeps]) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryDeps.map((dep: any) => {
                          const isSelected = selectedDependencies.has(dep.id);
                          return (
                            <button
                              key={dep.id}
                              onClick={() => toggleDependency(dep.id, dep.package, dep.version)}
                              className={`text-left p-2 rounded border-2 transition-all text-sm ${
                                isSelected
                                  ? 'border-primary bg-primary/5 font-medium'
                                  : 'border-border hover:border-primary/50 hover:bg-accent'
                              }`}
                            >
                              <div className="font-medium truncate">{dep.label}</div>
                              <div className="text-xs text-muted-foreground truncate font-mono">
                                {dep.package}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Selected Dependencies */}
              {selectedDependencies.size > 0 && (
                <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                  <p className="text-xs font-medium mb-2">Selected:</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedDependencies.values()).map((dep: any) => (
                      <Badge
                        key={dep.id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1"
                      >
                        {dep.label}
                        <button
                          onClick={() => removeDependency(dep.id)}
                          className="ml-1 hover:bg-muted rounded-sm p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} />
    </div>
  );
}

export default App;
