import { useState } from 'react';
import { useExpoStore } from '@/store/useExpoStore';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfigSection } from '@/components/sections/ConfigSection';
import { SelectedItemsSection } from '@/components/sections/SelectedItemsSection';
import { useExpoModules } from '@/hooks/useExpoModules';
import { dependenciesByCategory } from '@/config/dependencies';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { AppJsonModal } from '@/components/modals/AppJsonModal';
import { PackageJsonModal } from '@/components/modals/PackageJsonModal';
import { AddModulesModal } from '@/components/modals/AddModulesModal';
import { AddDependenciesModal } from '@/components/modals/AddDependenciesModal';
import { Button } from '@/components/ui/button';
import { Rocket, Download } from 'lucide-react';

function App() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAppJsonModal, setShowAppJsonModal] = useState(false);
  const [showPackageJsonModal, setShowPackageJsonModal] = useState(false);
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
      <main className="container mx-auto px-6 py-8 max-w-[1400px]">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div>
            <ConfigSection onViewJson={() => setShowAppJsonModal(true)} />
          </div>

          {/* Right Column - Selected Items */}
          <div>
            <SelectedItemsSection
              selectedModules={selectedModules}
              selectedDependencies={selectedDependencies}
              onAddModules={() => setShowModulesModal(true)}
              onAddDependencies={() => setShowDependenciesModal(true)}
              onRemoveModule={removeModule}
              onRemoveDependency={removeDependency}
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => setShowPreviewModal(true)}
            className="h-12 px-8 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-200"
          >
            <Download className="mr-2 h-5 w-5" />
            Generate Project
          </Button>
        </div>
      </main>

      {/* Modals */}
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
