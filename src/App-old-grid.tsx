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
import { Input } from '@/components/ui/input';
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

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Media & Camera': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'Location & Maps': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Notifications & Push': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Authentication & Security': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'Storage & Database': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'Sensors & Hardware': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    'UI & Components': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    'Analytics & Monitoring': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'Other': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };
  return colors[category] || colors['Other'];
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Media & Camera': Palette,
    'Location & Maps': Workflow,
    'Notifications & Push': Zap,
    'Authentication & Security': Code2,
    'Storage & Database': Database,
    'Sensors & Hardware': Boxes,
    'UI & Components': Sparkles,
    'Analytics & Monitoring': Package,
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
      toggleModule(module.id);
    } else {
      setSelectedModuleForConfig(module);
      setShowModuleConfigModal(true);
    }
  };

  const handleModuleConfigConfirm = (config: ModuleConfiguration) => {
    toggleModule(config.moduleId, config);
  };

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/5 overflow-hidden">
      {/* Modern Header */}
      <header className="flex-shrink-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg shadow-primary/20">
              <Rocket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ExpoInit</h1>
              <p className="text-xs text-muted-foreground">Professional project generator</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-6 py-6 max-w-[1800px] h-full">
          {/* Clean Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
            {/* Left Column - Config */}
            <div className="xl:col-span-3 overflow-y-auto">
              <div className="space-y-4">
              <TemplateSection />
              <ConfigSection onViewJson={() => setShowAppJsonModal(true)} />
            </div>
          </div>

          {/* Middle Column - Modules */}
          <div className="xl:col-span-5 flex flex-col">
            <Card className="flex-1 flex flex-col border-2 min-h-0">
              <CardHeader className="pb-3 pt-4 px-4 border-b bg-muted/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Expo Modules</CardTitle>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {selectedModules.size}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col gap-3 p-4">
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                  {modulesLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground">Loading modules...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 pr-2">
                      {Object.entries(filteredModules).map(([category, categoryModules]) => (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur py-1.5 -mt-1.5">
                            <h3 className="font-medium text-xs text-muted-foreground">
                              {category}
                            </h3>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {categoryModules.length}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {categoryModules.map((module: any) => {
                              const isSelected = selectedModules.has(module.id);
                              const Icon = getCategoryIcon(category);
                              const colorClass = getCategoryColor(category);
                              return (
                                <Card
                                  key={module.id}
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                                    isSelected 
                                      ? 'border-primary bg-primary/5 shadow-sm' 
                                      : 'border-transparent hover:border-primary/30'
                                  }`}
                                  onClick={() => handleModuleClick(module)}
                                >
                                  <CardHeader className="p-3">
                                    <div className="flex items-start gap-3">
                                      <div className={`rounded-lg p-2 ${colorClass} flex-shrink-0`}>
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <CardTitle className="text-sm font-semibold leading-tight">
                                            {module.name}
                                          </CardTitle>
                                          {isSelected && (
                                            <div className="rounded-full bg-primary p-1 flex-shrink-0">
                                              <Check className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                          )}
                                        </div>
                                        <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                                          {module.description}
                                        </CardDescription>
                                        {module.packages && (
                                          <p className="text-[10px] text-muted-foreground font-mono mt-1.5 opacity-70">
                                            {module.packages[0]}
                                          </p>
                                        )}
                                      </div>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Dependencies */}
          <div className="xl:col-span-4 flex flex-col">
            <Card className="flex-1 flex flex-col border-2 min-h-0">
              <CardHeader className="pb-3 pt-4 px-4 border-b bg-muted/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Dependencies</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {selectedDependencies.size}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPackageJsonModal(true)}
                      className="h-7 w-7"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col gap-3 p-4">
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dependencies..."
                    value={depSearch}
                    onChange={(e) => setDepSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                  <div className="space-y-5 pr-2">
                    {Object.entries(filteredDeps).map(([category, deps]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur py-1.5 -mt-1.5">
                          <h3 className="font-medium text-xs text-muted-foreground">
                            {category}
                          </h3>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            {deps.length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {deps.map((dep) => {
                            const isSelected = selectedDependencies.has(dep.id);
                            const Icon = getCategoryIcon(category);
                            const colorClass = getCategoryColor(category);
                            return (
                              <Card
                                key={dep.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                                  isSelected 
                                    ? 'border-primary bg-primary/5 shadow-sm' 
                                    : 'border-transparent hover:border-primary/30'
                                }`}
                                onClick={() => toggleDependency(dep.id, dep.package, dep.version)}
                              >
                                <CardHeader className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className={`rounded-lg p-2 ${colorClass} flex-shrink-0`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-sm font-semibold leading-tight">
                                          {dep.label}
                                        </CardTitle>
                                        {isSelected && (
                                          <div className="rounded-full bg-primary p-1 flex-shrink-0">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                                        {dep.description}
                                      </CardDescription>
                                      <p className="text-[10px] text-muted-foreground font-mono mt-1.5 opacity-70">
                                        {dep.package}@{dep.version}
                                      </p>
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>

      {/* Floating Generate Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setShowPreviewModal(true)}
          className="h-12 px-6 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-200"
        >
          <Download className="mr-2 h-4 w-4" />
          Generate
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

export default App;
