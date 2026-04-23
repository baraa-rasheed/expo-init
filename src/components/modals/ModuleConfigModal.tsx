import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

interface ModuleConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: any | null;
  onConfirm: (config: ModuleConfiguration) => void;
}

export interface ModuleConfiguration {
  moduleId: string;
  permissions: {
    ios: string[];
    android: string[];
  };
  plugins: Array<{
    name: string;
    config?: Record<string, any>;
  }>;
  customConfig?: Record<string, any>;
}

export function ModuleConfigModal({ open, onOpenChange, module, onConfirm }: ModuleConfigModalProps) {
  const [iosPermissions, setIosPermissions] = useState<string[]>([]);
  const [androidPermissions, setAndroidPermissions] = useState<string[]>([]);
  const [pluginConfig, setPluginConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (module && open) {
      // Reset state when module changes
      setIosPermissions(module.permissions?.ios || []);
      setAndroidPermissions(module.permissions?.android || []);
      
      // Initialize plugin config with defaults
      const initialPluginConfig: Record<string, any> = {};
      if (module.pluginConfig) {
        Object.entries(module.pluginConfig).forEach(([key, config]: [string, any]) => {
          initialPluginConfig[key] = config.default;
        });
      }
      setPluginConfig(initialPluginConfig);
    }
  }, [module, open]);

  const handleConfirm = () => {
    if (!module) return;

    const config: ModuleConfiguration = {
      moduleId: module.id,
      permissions: {
        ios: iosPermissions,
        android: androidPermissions,
      },
      plugins: module.needsPlugin ? [
        {
          name: module.id,
          config: Object.keys(pluginConfig).length > 0 ? pluginConfig : undefined,
        },
      ] : [],
    };

    onConfirm(config);
    onOpenChange(false);
  };

  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <DialogTitle>Configure {module.name}</DialogTitle>
          </div>
          <DialogDescription>
            Customize permissions, plugins, and app.json configuration for this module
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Simple install message for modules without config */}
            {!module.needsPlugin && !module.permissions && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>{module.name}</strong> will be installed with no additional configuration needed.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This module works out of the box and doesn't require any permissions or plugin setup.
                </p>
              </div>
            )}

            {/* Plugin Configuration Fields */}
            {module.pluginConfig && Object.keys(module.pluginConfig).length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Plugin Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  Configure plugin settings for {module.name}
                </p>
                <div className="space-y-3">
                  {Object.entries(module.pluginConfig).map(([key, configDef]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-xs text-muted-foreground">{configDef.description}</p>
                      {configDef.type === 'boolean' ? (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={pluginConfig[key] || false}
                            onCheckedChange={(checked) => {
                              setPluginConfig({ ...pluginConfig, [key]: checked });
                            }}
                          />
                          <label htmlFor={key} className="text-sm cursor-pointer">
                            Enable
                          </label>
                        </div>
                      ) : (
                        <Input
                          id={key}
                          value={pluginConfig[key] || ''}
                          onChange={(e) => {
                            setPluginConfig({ ...pluginConfig, [key]: e.target.value });
                          }}
                          placeholder={configDef.default}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* iOS Permissions */}
            {module.permissions?.ios && module.permissions.ios.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">iOS Permissions</Label>
                <div className="space-y-2">
                  {module.permissions.ios.map((permission: string) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ios-${permission}`}
                        checked={iosPermissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setIosPermissions([...iosPermissions, permission]);
                          } else {
                            setIosPermissions(iosPermissions.filter((p) => p !== permission));
                          }
                        }}
                      />
                      <label
                        htmlFor={`ios-${permission}`}
                        className="text-sm font-mono cursor-pointer"
                      >
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Android Permissions */}
            {module.permissions?.android && module.permissions.android.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Android Permissions</Label>
                <div className="space-y-2">
                  {module.permissions.android.map((permission: string) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`android-${permission}`}
                        checked={androidPermissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAndroidPermissions([...androidPermissions, permission]);
                          } else {
                            setAndroidPermissions(androidPermissions.filter((p) => p !== permission));
                          }
                        }}
                      />
                      <label
                        htmlFor={`android-${permission}`}
                        className="text-sm font-mono cursor-pointer"
                      >
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Info */}
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-semibold mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Selected permissions will be added to app.json</li>
                <li>Plugin will be configured in the plugins array</li>
                <li>Package will be added to dependencies</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Add Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
