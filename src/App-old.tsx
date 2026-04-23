import { useState } from 'react';
import { useExpoStore } from '@/store/useExpoStore';
import { ThemeToggle } from '@/components/theme-toggle';
import { TemplateSection } from '@/components/sections/TemplateSection';
import { ConfigSection } from '@/components/sections/ConfigSection';
import { useExpoModules } from '@/hooks/useExpoModules';
import { dependenciesByCategory } from '@/config/dependencies';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { AppJsonModal } from '@/components/modals/AppJsonModal';
import { PackageJsonModal } from '@/components/modals/PackageJsonModal';
import { ModuleConfigModal, type ModuleConfiguration } from '@/components/modals/ModuleConfigModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Rocket, 
  Sparkles, 
  Check, 
  Download, 
  Package, 
  Boxes,
  Zap,
  Database,
  Palette,
  Code2,
  Workflow,
  Eye,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Category color mappings
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'State Management': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Navigation': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'APIs & Networking': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Forms & Validation': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'Animations': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    'UI Components': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    'Utilities': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'Media & Camera': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'Location & Maps': 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    'Notifications & Push': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    'Authentication & Security': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'Storage & Database': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    'Sensors & Hardware': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'Other': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };
  return colors[category] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'State Management': Database,
    'Navigation': Workflow,
    'APIs & Networking': Zap,
    'Forms & Validation': Code2,
    'Animations': Sparkles,
    'UI Components': Palette,
    'Utilities': Boxes,
    'Media & Camera': Package,
    'Location & Maps': Package,
    'Notifications & Push': Package,
    'Authentication & Security': Package,
    'Storage & Database': Database,
    'Sensors & Hardware': Package,
    'Other': Package,
  };
  return icons[category] || Package;
};

function App() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAppJsonModal, setShowAppJsonModal] = useState(false);
  const [showPackageJsonModal, setShowPackageJsonModal] = useState(false);
  const [showModuleConfigModal, setShowModuleConfigModal] = useState(false);
  const [selectedModuleForConfig, setSelectedModuleForConfig] = useState<any>(null);
  const [moduleSearch, setModuleSearch] = useState('');
  const [depSearch, setDepSearch] = useState('');
  const { selectedModules, toggleModule, selectedDependencies, toggleDependency } = useExpoStore();
  const { modules, loading: modulesLoading } = useExpoModules();

  const handleModuleClick = (module: any) => {
    const isSelected = selectedModules.has(module.id);
    
    if (isSelected) {
      // If already selected, just deselect
      toggleModule(module.id);
    } else {
      // If not selected, show config modal
      setSelectedModuleForConfig(module);
      setShowModuleConfigModal(true);
    }
  };

  const handleModuleConfigConfirm = (config: ModuleConfiguration) => {
    toggleModule(config.moduleId, config);
  };

  // Filter modules based on search
  const filteredModules = Object.entries(modules).reduce((acc, [category, mods]) => {
    const filtered = (mods as any[]).filter((mod) =>
      mod.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      mod.description.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      mod.id.toLowerCase().includes(moduleSearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  // Filter dependencies based on search
  const filteredDeps = Object.entries(dependenciesByCategory).reduce((acc, [category, deps]) => {
    const filtered = deps.filter((dep) =>
      dep.label.toLowerCase().includes(depSearch.toLowerCase()) ||
      dep.description.toLowerCase().includes(depSearch.toLowerCase()) ||
      dep.package.toLowerCase().includes(depSearch.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Generate Your Expo Project
          </h2>
          <p className="text-muted-foreground">
            Configure your Expo app in seconds with a beautiful, intuitive interface
          </p>
        </div>
            <Card className="flex flex-col overflow-hidden">
              <CardHeader>
                <CardTitle>Expo Modules</CardTitle>
                <CardDescription>
                  Select modules to add to your project
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="flex-1">
                  {modulesLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">Loading modules...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-4 pb-2">
                      {Object.entries(filteredModules).map(([category, categoryModules]) => (
                        <div key={category}>
                          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            {category}
                            <Badge variant="outline" className="text-xs">
                              {categoryModules.length}
                            </Badge>
                          </h3>
                          <div className="space-y-3 px-1">
                            {categoryModules.map((module: any) => {
                              const isSelected = selectedModules.has(module.id);
                              const Icon = getCategoryIcon(category);
                              const colorClass = getCategoryColor(category);
                              return (
                                <Card
                                  key={module.id}
                                  className={`cursor-pointer transition-all hover:shadow-lg ${
                                    isSelected ? 'ring-2 ring-primary bg-accent/50 shadow-md' : 'hover:border-primary/50'
                                  }`}
                                  onClick={() => handleModuleClick(module)}
                                >
                                  <CardHeader className="p-4">
                                    <div className="flex items-start gap-4">
                                      <div className={`rounded-xl p-3 ${colorClass} flex-shrink-0`}>
                                        <Icon className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1 min-w-0 space-y-1">
                                        <CardTitle className="text-base font-semibold">{module.name}</CardTitle>
                                        <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                                          {module.description}
                                        </CardDescription>
                                        {module.packages && (
                                          <p className="text-xs text-muted-foreground font-mono pt-1">
                                            {module.packages[0]}
                                          </p>
                                        )}
                                      </div>
                                      {isSelected && (
                                        <div className="rounded-full bg-primary p-1.5 flex-shrink-0">
                                          <Check className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                      )}
                                    </div>
                                  </CardHeader>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Section 3: Dependencies */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Dependencies</CardTitle>
                    <CardDescription>
                      Add popular packages to your project
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPackageJsonModal(true)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dependencies..."
                    value={depSearch}
                    onChange={(e) => setDepSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4 pb-2">
                    {Object.entries(filteredDeps).map(([category, deps]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          {category}
                          <Badge variant="outline" className="text-xs">
                            {deps.length}
                          </Badge>
                        </h3>
                        <div className="space-y-3 px-1">
                          {deps.map((dep) => {
                            const isSelected = selectedDependencies.has(dep.id);
                            const Icon = getCategoryIcon(category);
                            const colorClass = getCategoryColor(category);
                            return (
                              <Card
                                key={dep.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${
                                  isSelected ? 'ring-2 ring-primary bg-accent/50 shadow-md' : 'hover:border-primary/50'
                                }`}
                                onClick={() => toggleDependency(dep.id, dep.package, dep.version)}
                              >
                                <CardHeader className="p-4">
                                  <div className="flex items-start gap-4">
                                    <div className={`rounded-xl p-3 ${colorClass} flex-shrink-0`}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-semibold">{dep.label}</CardTitle>
                                        <Badge variant="secondary" className="text-xs font-mono">
                                          {dep.version}
                                        </Badge>
                                      </div>
                                      <CardDescription className="text-sm line-clamp-2 leading-relaxed">
                                        {dep.description}
                                      </CardDescription>
                                      <p className="text-xs text-muted-foreground font-mono pt-1">
                                        {dep.package}
                                      </p>
                                    </div>
                                    {isSelected && (
                                      <div className="rounded-full bg-primary p-1.5 flex-shrink-0">
                                        <Check className="h-4 w-4 text-primary-foreground" />
                                      </div>
                                    )}
                                  </div>
                                </CardHeader>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript, and shadcn/ui</p>
        </div>
      </footer>

      {/* Floating Generate Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={() => setShowPreviewModal(true)} 
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow h-14 px-8 text-base"
        >
          <Download className="mr-2 h-5 w-5" />
          Generate Project
        </Button>
      </div>

      {/* Modals */}
      <PreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} />
      <AppJsonModal open={showAppJsonModal} onOpenChange={setShowAppJsonModal} />
      <PackageJsonModal open={showPackageJsonModal} onOpenChange={setShowPackageJsonModal} />
      <ModuleConfigModal 
        open={showModuleConfigModal} 
        onOpenChange={setShowModuleConfigModal}
        module={selectedModuleForConfig}
        onConfirm={handleModuleConfigConfirm}
      />
    </div>
  );
}

function ProjectStats() {
  const { config, packageJson, selectedModules } = useExpoStore();
  
  const totalDeps = Object.keys(packageJson.dependencies).length;
  const totalPlugins = config.expo.plugins?.length || 0;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">App Name</span>
        <span className="text-sm font-medium">{config.expo.name}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Version</span>
        <span className="text-sm font-medium">{config.expo.version}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Modules</span>
        <span className="text-sm font-medium">{selectedModules.size}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Dependencies</span>
        <span className="text-sm font-medium">{totalDeps}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Plugins</span>
        <span className="text-sm font-medium">{totalPlugins}</span>
      </div>
    </div>
  );
}

export default App;
