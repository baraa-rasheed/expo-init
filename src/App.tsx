import { useState } from 'react';
import { useExpoStore } from '@/store/useExpoStore';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfigSection } from '@/components/sections/ConfigSection';
import { useExpoModules } from '@/hooks/useExpoModules';
import { dependenciesByCategory } from '@/config/dependencies';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { AppJsonModal } from '@/components/modals/AppJsonModal';
import { PackageJsonModal } from '@/components/modals/PackageJsonModal';
import { AddModulesModal } from '@/components/modals/AddModulesModal';
import { AddDependenciesModal } from '@/components/modals/AddDependenciesModal';
import { GenerateModal } from '@/components/modals/GenerateModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Download, X, Package, Boxes, Eye } from 'lucide-react';

function App() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAppJsonModal, setShowAppJsonModal] = useState(false);
  const [showPackageJsonModal, setShowPackageJsonModal] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  const { 
    selectedModules, 
    selectedDependencies, 
    setSelectedModules,
    setSelectedDependencies,
    removeModule,
    removeDependency
  } = useExpoStore();
  
  const { modules } = useExpoModules();

  const handleModulesConfirm = (_: string[], modulesData: any[]) => {
    setSelectedModules(modulesData);
  };

  const handleDependenciesConfirm = (_: string[], depsData: any[]) => {
    setSelectedDependencies(depsData);
  };

  const handleGenerate = async () => {
    try {
      const { config, packageJson, iconFile, splashFile, template, selectedModules, selectedDependencies } = useExpoStore.getState();
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('template', template);
      formData.append('appName', config.expo.name || 'My Expo App');
      formData.append('slug', config.expo.slug || 'my-expo-app');
      formData.append('version', config.expo.version || '1.0.0');
      formData.append('appConfig', JSON.stringify(config));
      formData.append('packageConfig', JSON.stringify(packageJson));
      formData.append('selectedModules', JSON.stringify(Array.from(selectedModules.values())));
      formData.append('selectedDependencies', JSON.stringify(Array.from(selectedDependencies.values())));
      
      if (iconFile) {
        formData.append('icon', iconFile);
      }
      if (splashFile) {
        formData.append('splash', splashFile);
      }

      // Call the generate API
      const response = await fetch('https://devserver-main--expoinit.netlify.app/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.expo.slug || 'expo-app'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate project. Please try again.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/5">
      {/* Header */}
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="shadow-lg shadow-primary/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-6 py-8 max-w-[1400px] h-full">
          {/* Two Column Layout - Right side wider */}
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_1px_2fr] gap-6 h-full">
          {/* Left Column - Configuration */}
          <div className="overflow-y-auto">
            <ConfigSection onViewJson={() => setShowAppJsonModal(true)} />
          </div>

          {/* Vertical Separator */}
          <div className="hidden lg:block border-l" />

          {/* Right Column - Selected Items */}
          <div className="overflow-y-auto">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Dependencies</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowModulesModal(true)}>
                      <Boxes className="h-3.5 w-3.5 mr-1" />
                      Add Modules
                    </Button>
                    <Button size="sm" onClick={() => setShowDependenciesModal(true)}>
                      <Package className="h-3.5 w-3.5 mr-1" />
                      Add Deps
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="border-t" />
              <CardContent>
                {selectedModules.size === 0 && selectedDependencies.size === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-sm text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No dependencies selected</p>
                      <p className="text-xs mt-1">Add modules or dependencies to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Expo Modules Section */}
                    {selectedModules.size > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Boxes className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-semibold">Expo Modules</h3>
                          <span className="text-xs text-muted-foreground">({selectedModules.size})</span>
                        </div>
                        <div className="space-y-2">
                          {Array.from(selectedModules.values()).map((module: any) => (
                            <div
                              key={module.id}
                              className="relative flex items-center gap-4 p-4 rounded-xl border hover:border-muted hover:shadow-md transition-all group"
                            >
                              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex-shrink-0">
                                <Boxes className="h-7 w-7 text-purple-700 dark:text-purple-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-foreground">{module.name}</p>
                                <p className="text-xs text-muted-foreground truncate font-mono">
                                  {module.id}
                                </p>
                              </div>
                              <button
                                onClick={() => removeModule(module.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Dependencies Section */}
                    {selectedDependencies.size > 0 && (
                      <div className="space-y-4">
                        {Object.entries(dependenciesByCategory).map(([category, deps]) => {
                          const selectedInCategory = deps.filter((dep: any) => selectedDependencies.has(dep.id));
                          if (selectedInCategory.length === 0) return null;
                          
                          // Color mapping for each category
                          const categoryColors: Record<string, { icon: string; bg: string; text: string; darkBg: string; darkText: string }> = {
                            'State Management': { icon: 'text-blue-500', bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/40', darkText: 'dark:text-blue-300' },
                            'Navigation': { icon: 'text-green-500', bg: 'bg-green-100', text: 'text-green-700', darkBg: 'dark:bg-green-900/40', darkText: 'dark:text-green-300' },
                            'APIs & Networking': { icon: 'text-orange-500', bg: 'bg-orange-100', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/40', darkText: 'dark:text-orange-300' },
                            'Forms & Validation': { icon: 'text-pink-500', bg: 'bg-pink-100', text: 'text-pink-700', darkBg: 'dark:bg-pink-900/40', darkText: 'dark:text-pink-300' },
                            'Animations': { icon: 'text-violet-500', bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'dark:bg-violet-900/40', darkText: 'dark:text-violet-300' },
                            'UI Components': { icon: 'text-cyan-500', bg: 'bg-cyan-100', text: 'text-cyan-700', darkBg: 'dark:bg-cyan-900/40', darkText: 'dark:text-cyan-300' },
                            'Utilities': { icon: 'text-gray-500', bg: 'bg-gray-100', text: 'text-gray-700', darkBg: 'dark:bg-gray-900/40', darkText: 'dark:text-gray-300' },
                          };
                          
                          const colors = categoryColors[category] || categoryColors['Utilities'];
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className={`h-4 w-4 ${colors.icon}`} />
                                <h3 className="text-sm font-semibold">{category}</h3>
                                <span className="text-xs text-muted-foreground">({selectedInCategory.length})</span>
                              </div>
                              <div className="space-y-2">
                                {selectedInCategory.map((dep: any) => (
                      <div
                        key={dep.id}
                        className="relative flex items-center gap-4 p-4 rounded-xl border hover:border-muted hover:shadow-md transition-all group"
                      >
                        <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${colors.bg} ${colors.darkBg} flex-shrink-0`}>
                          <Package className={`h-7 w-7 ${colors.text} ${colors.darkText}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{dep.label}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono">
                            {dep.package}@{dep.version}
                          </p>
                        </div>
                        <button
                          onClick={() => removeDependency(dep.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <GenerateModal 
        open={showGenerateModal} 
        onOpenChange={setShowGenerateModal}
        onComplete={handleGenerate}
      />
      <PreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} />
      <AppJsonModal open={showAppJsonModal} onOpenChange={setShowAppJsonModal} />
      <PackageJsonModal open={showPackageJsonModal} onOpenChange={setShowPackageJsonModal} />
      <AddModulesModal
        open={showModulesModal}
        onOpenChange={setShowModulesModal}
        modules={modules}
        selectedModules={new Set(selectedModules.keys())}
        onConfirm={handleModulesConfirm}
      />
      <AddDependenciesModal
        open={showDependenciesModal}
        onOpenChange={setShowDependenciesModal}
        dependencies={dependenciesByCategory}
        selectedDependencies={new Set(selectedDependencies.keys())}
        onConfirm={handleDependenciesConfirm}
      />
    </div>
  );
}

export default App;
