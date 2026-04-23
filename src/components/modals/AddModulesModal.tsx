import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label'; 
import { Search, Package, Boxes, Zap, Database, Palette, Code2, Workflow, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface AddModulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: Record<string, any[]>;
  selectedModules: Set<string>;
  onConfirm: (selectedIds: string[], modulesData: any[]) => void;
}

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

export function AddModulesModal({ open, onOpenChange, modules, selectedModules, onConfirm }: AddModulesModalProps) {
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(selectedModules));
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [moduleConfigs, setModuleConfigs] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [moduleDetails, setModuleDetails] = useState<Record<string, any>>({});
  
  // Get all modules as flat array
  const allModules = Object.values(modules).flat();
  
  // Fetch module details from API
  const fetchModuleDetails = async (moduleId: string) => {
    // Find the base module data
    const baseModule = allModules.find((m: any) => m.id === moduleId);
    
    if (moduleDetails[moduleId]) {
      // Merge base module data with cached details
      setSelectedModule({ ...baseModule, ...moduleDetails[moduleId] });
      return;
    }
    
    setLoadingDetails(moduleId);
    try {
      const response = await fetch(`http://localhost:3001/api/module-details/${moduleId}`);
      if (response.ok) {
        const details = await response.json();
        setModuleDetails(prev => ({ ...prev, [moduleId]: details }));
        // Merge base module data with fetched details
        setSelectedModule({ ...baseModule, ...details });
      }
    } catch (error) {
      console.error('Failed to fetch module details:', error);
      // Fallback to base module if fetch fails
      if (baseModule) {
        setSelectedModule(baseModule);
      }
    } finally {
      setLoadingDetails(null);
    }
  };
  
  // Separate selected and available modules
  const selectedModulesList = allModules.filter((mod: any) => tempSelected.has(mod.id));
  const availableModules = Object.entries(modules).reduce((acc, [category, mods]) => {
    const filtered = (mods as any[]).filter((mod) =>
      !tempSelected.has(mod.id) &&
      (mod.name.toLowerCase().includes(search.toLowerCase()) ||
      mod.description.toLowerCase().includes(search.toLowerCase()) ||
      mod.id.toLowerCase().includes(search.toLowerCase()))
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  const handleAdd = async (moduleId: string) => {
    const newSelected = new Set(tempSelected);
    newSelected.add(moduleId);
    setTempSelected(newSelected);
    
    // Fetch module details if not already fetched
    if (!moduleDetails[moduleId]) {
      await fetchModuleDetails(moduleId);
    }
  };

  const handleRemove = (moduleId: string) => {
    const newSelected = new Set(tempSelected);
    newSelected.delete(moduleId);
    setTempSelected(newSelected);
    if (selectedModule?.id === moduleId) {
      setSelectedModule(null);
    }
  };

  const handleConfirm = () => {
    const selectedData = allModules.filter((m: any) => tempSelected.has(m.id)).map((module: any) => {
      // Merge module data with fetched details and user configurations
      const details = moduleDetails[module.id];
      const config = moduleConfigs[module.id];
      
      let mergedModule = { ...module };
      
      // Merge with fetched details (permissions, pluginConfig, etc.)
      if (details) {
        mergedModule = { ...mergedModule, ...details };
      }
      
      // Merge with user configurations
      if (config) {
        mergedModule = {
          ...mergedModule,
          configuredPermissions: config.iosPermissions,
          configuredPluginConfig: config.pluginConfig,
        };
      }
      
      return mergedModule;
    });
    
    onConfirm(Array.from(tempSelected), selectedData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelected(new Set(selectedModules));
    setSelectedModule(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Expo Modules</DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-[2fr_3fr] gap-4 min-h-0">
          {/* Left Side - Module List */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-4 space-y-4">
                {/* Selected Modules Section */}
                {selectedModulesList.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background py-1 z-10">
                      <h3 className="font-medium text-xs text-primary uppercase tracking-wide">
                        Selected
                      </h3>
                      <Badge variant="default" className="text-[10px] h-4 px-1.5">
                        {selectedModulesList.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {selectedModulesList.map((module: any) => {
                        const Icon = getCategoryIcon(module.category || 'Other');
                        const colorClass = getCategoryColor(module.category || 'Other');
                        
                        return (
                          <div
                            key={module.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              selectedModule?.id === module.id
                                ? 'border-primary bg-accent'
                                : 'border-border hover:border-muted'
                            }`}
                          >
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => fetchModuleDetails(module.id)}
                            >
                              <div className={`rounded-lg p-2 ${colorClass} flex-shrink-0`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{module.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{module.id}</p>
                              </div>
                              {loadingDetails === module.id && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(module.id);
                              }}
                              className="h-7 text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {search && Object.keys(availableModules).length === 0 && selectedModulesList.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      No results for "{search}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different search term
                    </p>
                  </div>
                )}

                {/* Available Modules Section */}
                {Object.entries(availableModules).map(([category, categoryModules]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background py-1">
                      <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h3>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {(categoryModules as any[]).length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {(categoryModules as any[]).map((module: any) => {
                        const Icon = getCategoryIcon(category);
                        const colorClass = getCategoryColor(category);
                        
                        return (
                          <div
                            key={module.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              selectedModule?.id === module.id
                                ? 'border-primary bg-accent'
                                : 'border-transparent hover:border-muted'
                            }`}
                          >
                            <div 
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => setSelectedModule(module)}
                            >
                              <div className={`rounded-lg p-2 ${colorClass} flex-shrink-0`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{module.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{module.id}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdd(module.id);
                              }}
                              className="h-7 text-xs"
                            >
                              Add
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Module Details */}
          <div className="border rounded-lg flex flex-col min-h-0">
            {selectedModule ? (
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{selectedModule.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono mb-2">{selectedModule.id}</p>
                    <a
                      href={`https://docs.expo.dev/versions/latest/sdk/${selectedModule.id.replace('expo-', '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Expo Documentation
                    </a>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedModule.description}
                    </p>
                  </div>

                  {selectedModule.permissions?.ios && selectedModule.permissions.ios.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">iOS Permissions</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Customize permission descriptions
                      </p>
                      <div className="space-y-2">
                        {selectedModule.permissions.ios.map((perm: string) => {
                          const currentConfig = moduleConfigs[selectedModule.id] || {};
                          const currentValue = currentConfig.iosPermissions?.[perm] || `This app needs ${perm}`;
                          
                          return (
                            <div key={perm} className="space-y-1">
                              <Label className="text-xs font-mono">{perm}</Label>
                              <Input
                                value={currentValue}
                                onChange={(e) => {
                                  setModuleConfigs((prev:any) => ({
                                    ...prev,
                                    [selectedModule.id]: {
                                      ...prev[selectedModule.id],
                                      iosPermissions: {
                                        ...prev[selectedModule.id]?.iosPermissions,
                                        [perm]: e.target.value
                                      }
                                    }
                                  }));
                                }}
                                placeholder={`Description for ${perm}`}
                                className="text-xs"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedModule.permissions?.android && selectedModule.permissions.android.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Android Permissions</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Required Android permissions (auto-configured)
                      </p>
                      <div className="space-y-1">
                        {selectedModule.permissions.android.map((perm: string) => (
                          <div key={perm} className="text-xs font-mono bg-muted px-2 py-1 rounded flex items-center gap-2">
                            <Checkbox checked disabled className="h-3 w-3" />
                            {perm}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedModule.pluginConfig && Object.keys(selectedModule.pluginConfig).length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Plugin Configuration</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Configure plugin options
                      </p>
                      <div className="space-y-3">
                        {Object.entries(selectedModule.pluginConfig).map(([key, config]: [string, any]) => {
                          const currentConfig = moduleConfigs[selectedModule.id] || {};
                          const currentValue = currentConfig.pluginConfig?.[key] ?? config.default;
                          
                          return (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs font-medium">{key}</Label>
                              <p className="text-xs text-muted-foreground">{config.description}</p>
                              {config.type === 'boolean' ? (
                                <div className="flex items-center gap-2 pt-1">
                                  <Checkbox
                                    checked={currentValue}
                                    onCheckedChange={(checked) => {
                                      setModuleConfigs((prev:any) => ({
                                        ...prev,
                                        [selectedModule.id]: {
                                          ...prev[selectedModule.id],
                                          pluginConfig: {
                                            ...prev[selectedModule.id]?.pluginConfig,
                                            [key]: checked
                                          }
                                        }
                                      }));
                                    }}
                                  />
                                  <span className="text-xs">{currentValue ? 'Enabled' : 'Disabled'}</span>
                                </div>
                              ) : (
                                <Input
                                  value={currentValue}
                                  onChange={(e) => {
                                    const value = config.type === 'number' ? Number(e.target.value) : e.target.value;
                                    setModuleConfigs((prev:any) => ({
                                      ...prev,
                                      [selectedModule.id]: {
                                        ...prev[selectedModule.id],
                                        pluginConfig: {
                                          ...prev[selectedModule.id]?.pluginConfig,
                                          [key]: value
                                        }
                                      }
                                    }));
                                  }}
                                  type={config.type === 'number' ? 'number' : 'text'}
                                  placeholder={`Default: ${JSON.stringify(config.default)}`}
                                  className="text-xs"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">v{selectedModule.version}</Badge>
                      {!tempSelected.has(selectedModule.id) ? (
                        <Button
                          size="sm"
                          onClick={() => handleAdd(selectedModule.id)}
                        >
                          Add Module
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(selectedModule.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div className="space-y-2">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Select a module to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {tempSelected.size} module{tempSelected.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Done
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
