import { useState } from 'react';
import { useExpoStore } from '@/store/useExpoStore';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfigSection } from '@/components/sections/ConfigSection';
import { SelectedItemsSection } from '@/components/sections/SelectedItemsSection';
import { useExpoModules } from '@/hooks/useExpoModules';
import { PreviewModal } from '@/components/modals/PreviewModal';
import { AppJsonModal } from '@/components/modals/AppJsonModal';
import { ModuleConfigModal, type ModuleConfiguration } from '@/components/modals/ModuleConfigModal';
import { AddPalette } from '@/components/AddPalette';
import { API_URL } from '@/config/api';
import { Button } from '@/components/ui/button';
import { ExpoIcon } from '@/components/icons/ExpoIcon';
import { Download, Package, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAppJsonModal, setShowAppJsonModal] = useState(false);
  const [showAddPalette, setShowAddPalette] = useState(false);
  const [showModuleConfig, setShowModuleConfig] = useState(false);
  const [activeModuleForConfig, setActiveModuleForConfig] = useState<any | null>(null);

  const {
    selectedModules,
    selectedDependencies,
    setSelectedModules,
    removeModule,
    removeDependency,
    toggleDependency,
  } = useExpoStore();

  const { modules } = useExpoModules();

  const fetchModuleDetails = async (moduleId: string) => {
    const allModulesFlat = Object.values(modules).flat();
    const base = allModulesFlat.find((m: any) => m.id === moduleId) ?? { id: moduleId, name: moduleId };
    try {
      const res = await fetch(`${API_URL}/api/module-details/${moduleId}`);
      if (!res.ok) return base;
      const details = await res.json();
      return { ...base, ...details };
    } catch {
      return base;
    }
  };

  const handleAddSelect = async (item: any) => {
    if (item.kind === 'dep') {
      if (!selectedDependencies.has(item.id)) {
        toggleDependency(item.id, item.pkg, item.version);
      }
      setShowAddPalette(false);
      return;
    }

    if (item.kind === 'module') {
      if (selectedModules.has(item.id)) {
        setShowAddPalette(false);
        return;
      }
      const fullModule = await fetchModuleDetails(item.id);
      const merged = new Map(selectedModules);
      merged.set(item.id, fullModule);
      setSelectedModules(Array.from(merged.values()));
      setShowAddPalette(false);
    }
  };

  const openModuleCustomize = async (moduleId: string) => {
    const current = selectedModules.get(moduleId);
    const full = current?.permissions ? current : await fetchModuleDetails(moduleId);
    setActiveModuleForConfig(full);
    setShowModuleConfig(true);
  };

  const handleModuleConfigConfirm = (cfg: ModuleConfiguration) => {
    if (!activeModuleForConfig) return;

    const updatedModule = {
      ...activeModuleForConfig,
      configuredPermissions: cfg.permissions?.ios?.reduce((acc, perm) => {
        acc[perm] =
          cfg.permissionDescriptions?.ios?.[perm] ??
          activeModuleForConfig.configuredPermissions?.[perm] ??
          `This app needs ${perm}`;
        return acc;
      }, {} as Record<string, string>),
      configuredPluginConfig: cfg.plugins?.[0]?.config ?? {},
      needsPlugin: cfg.plugins?.length > 0,
      permissions: cfg.permissions,
    };

    const merged = new Map(selectedModules);
    merged.set(updatedModule.id, updatedModule);
    setSelectedModules(Array.from(merged.values()));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 w-full border-b bg-background">
        <div className="mx-auto max-w-[1400px] px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExpoIcon className="h-5 w-5 text-primary" />
            <div className="font-semibold tracking-tight">ExpoInit</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowPreviewModal(true)}>
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="mx-auto max-w-[1400px] h-full px-6">
          <div className="h-full flex flex-col lg:flex-row gap-6 py-6">
            <motion.section
              className="flex-1 lg:flex-[2.8] min-w-0 overflow-y-auto"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 44, mass: 0.9 }}
            >
              <ConfigSection onViewJson={() => setShowAppJsonModal(true)} />
            </motion.section>

            <div className="hidden lg:block w-px bg-border self-stretch" aria-hidden="true" />

            <motion.aside
              className="lg:w-[360px] xl:w-[400px] overflow-y-auto"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 44, mass: 0.9, delay: 0.06 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Dependencies</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {selectedModules.size + selectedDependencies.size} selected
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => setShowAddPalette(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                  <div className="text-[11px] text-muted-foreground/70">
                    Shortcut: <span className="font-mono">⌘K / Ctrl K</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t" />

              <div className="pt-4">
                {selectedModules.size === 0 && selectedDependencies.size === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                    <div className="font-medium text-foreground">No dependencies selected</div>
                    <div className="text-xs mt-1">Add modules or dependencies to get started</div>
                  </div>
                ) : (
                  <SelectedItemsSection
                    selectedModules={selectedModules}
                    selectedDependencies={selectedDependencies}
                    onRemoveModule={removeModule}
                    onRemoveDependency={removeDependency}
                    onCustomizeModule={openModuleCustomize}
                  />
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <PreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} />
      <AppJsonModal open={showAppJsonModal} onOpenChange={setShowAppJsonModal} />
      <AddPalette
        open={showAddPalette}
        onOpenChange={setShowAddPalette}
        onSelectItem={handleAddSelect}
        modulesByCategory={modules}
        selectedModuleIds={new Set(Array.from(selectedModules.keys()))}
        selectedDependencyIds={new Set(Array.from(selectedDependencies.keys()))}
      />
      <ModuleConfigModal
        open={showModuleConfig}
        onOpenChange={setShowModuleConfig}
        module={activeModuleForConfig}
        onConfirm={handleModuleConfigConfirm}
      />
    </div>
  );
}

export default App;
