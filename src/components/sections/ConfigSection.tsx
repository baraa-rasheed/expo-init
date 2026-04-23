import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpoStore } from '@/store/useExpoStore';
import {  X, ImageIcon, Sparkles, Layers, Eye, FileCode, Layout, Package2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExpoTemplate } from '@/types/expo'; 

const templates: { value: ExpoTemplate; label: string; description: string; icon: any }[] = [
  { value: 'blank', label: 'Blank', description: 'A minimal app with a single screen', icon: FileCode },
  { value: 'tabs', label: 'Tabs', description: 'App with tab-based navigation', icon: Layout },
  { value: 'default-sdk-55', label: 'Native Tabs (SDK 55)', description: 'Latest Expo with native tabs', icon: Layout },
  { value: 'bare-minimum', label: 'Bare Minimum', description: 'Bare minimum setup', icon: Package2 },
  { value: 'blank-typescript', label: 'Blank (TypeScript)', description: 'Blank template with TypeScript', icon: Code2 },
];

interface ConfigSectionProps {
  onViewJson?: () => void;
}

export function ConfigSection({ onViewJson }: ConfigSectionProps = {}) {
  const {
    template,
    setTemplate,
    config,
    updateAppName, 
    useHermesV1,
    packageManager,
    setUseHermesV1,
    setPackageManager,
    setIconFile,
    setSplashFile,
  } = useExpoStore();

  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [adaptiveIconPreview, setAdaptiveIconPreview] = useState<string | null>(null);
  const [splashPreview, setSplashPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const adaptiveIconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (file: File | null) => {
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setIconFile(null);
      setIconPreview(null);
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  const handleAdaptiveIconUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdaptiveIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAdaptiveIconPreview(null);
      if (adaptiveIconInputRef.current) adaptiveIconInputRef.current.value = '';
    }
  };

  const handleSplashUpload = (file: File | null) => {
    if (file) {
      setSplashFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSplashPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSplashFile(null);
      setSplashPreview(null);
      if (splashInputRef.current) splashInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">App Configuration</CardTitle>
          {onViewJson && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onViewJson}
              className="h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <div className="border-t" />
      <CardContent>

          {/* Template Selection */}
          <div className="space-y-3 py-6">
            <div>
              <h3 className="text-sm font-semibold mb-1">Template</h3>
              <p className="text-xs text-muted-foreground">Choose your Expo project template</p>
            </div>
            <Select value={template} onValueChange={(value) => setTemplate(value as ExpoTemplate)}>
              <SelectTrigger className="h-auto">
                <SelectValue>
                  {(() => {
                    const selected = templates.find(t => t.value === template);
                    if (!selected) return 'Select a template';
                    const Icon = selected.icon;
                    return (
                      <div className="flex items-center gap-3 py-3">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{selected.label}</div>
                          <div className="text-xs text-muted-foreground">{selected.description}</div>
                        </div>
                      </div>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                      <div className="flex items-center gap-3 py-2">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
          </div>
        <div className="space-y-6">
          {/* Asset Icons and App Name - At Top */}
          <div className="space-y-6">
            <div className="flex gap-4 justify-center">
            {/* App Icon */}
            <div className="space-y-2">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                onChange={(e) => handleIconUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="icon-upload"
              />
              <div
                onClick={() => iconInputRef.current?.click()}
                className={`relative w-24 h-24 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-primary hover:bg-accent/50 hover:scale-105 ${
                  iconPreview ? 'border-primary bg-accent/20' : 'border-muted-foreground/25'
                }`}
              >
                {iconPreview ? (
                  <>
                    <img
                      src={iconPreview}
                      alt="App icon"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconUpload(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Icon</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground font-medium">
                1024×1024
              </p>
            </div>

            {/* Adaptive Icon */}
            <div className="space-y-2">
              <input
                ref={adaptiveIconInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                onChange={(e) => handleAdaptiveIconUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="adaptive-icon-upload"
              />
              <div
                onClick={() => adaptiveIconInputRef.current?.click()}
                className={`relative w-24 h-24 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-primary hover:bg-accent/50 hover:scale-105 ${
                  adaptiveIconPreview ? 'border-primary bg-accent/20' : 'border-muted-foreground/25'
                }`}
              >
                {adaptiveIconPreview ? (
                  <>
                    <img
                      src={adaptiveIconPreview}
                      alt="Adaptive icon"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdaptiveIconUpload(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Adaptive</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground font-medium">
                1024×1024
              </p>
            </div>

            {/* Splash Screen */}
            <div className="space-y-2">
              <input
                ref={splashInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                onChange={(e) => handleSplashUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="splash-upload"
              />
              <div
                onClick={() => splashInputRef.current?.click()}
                className={`relative w-24 h-24 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-primary hover:bg-accent/50 hover:scale-105 ${
                  splashPreview ? 'border-primary bg-accent/20' : 'border-muted-foreground/25'
                }`}
              >
                {splashPreview ? (
                  <>
                    <img
                      src={splashPreview}
                      alt="Splash"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSplashUpload(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Splash</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground font-medium">
                2048×2048
              </p>
            </div>
            </div>

            {/* App Name Input - Centered below icons */}
            <div className="max-w-md mx-auto">
              <Input
                id="app-name"
                value={config.expo.name}
                onChange={(e) => updateAppName(e.target.value)}
                placeholder="My Awesome Expo App"
                className="text-center text-2xl font-bold h-14 px-4 border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
              <p className="text-sm text-center text-muted-foreground mt-2">
                {config.expo.slug || 'my-awesome-expo-app'}
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t" />


          {/* Hermes V1 and Package Manager */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1">Advanced Options</h3>
                <p className="text-xs text-muted-foreground">Configure Hermes V1 engine</p>
              </div>

              {/* Hermes V1 Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <Label htmlFor="hermes-v1" className="text-sm font-medium cursor-pointer">
                    Enable Hermes V1
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Opt-in to Hermes v1 engine for better performance
                  </p>
                  {useHermesV1 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      ⚠️ Increases build times (builds React Native from source)
                    </p>
                  )}
                </div>
                <Switch
                  id="hermes-v1"
                  checked={useHermesV1}
                  onCheckedChange={setUseHermesV1}
                />
              </div>
              
              {/* Package Manager Selection - Only shown when Hermes V1 is enabled */}
              {useHermesV1 && (
                <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <Label htmlFor="package-manager" className="text-sm font-medium">Package Manager</Label>
                  <Select value={packageManager} onValueChange={(value) => setPackageManager(value as any)}>
                    <SelectTrigger id="package-manager">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="npm">npm</SelectItem>
                      <SelectItem value="yarn">yarn</SelectItem>
                      <SelectItem value="pnpm">pnpm</SelectItem>
                      <SelectItem value="bun">bun</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    We need to add an override for the Hermes compiler version in your package.json. 
                    {packageManager === 'yarn' ? (
                      <> Yarn uses the <code className="px-1 py-0.5 rounded bg-muted text-xs">resolutions</code> field.</>
                    ) : (
                      <> {packageManager.charAt(0).toUpperCase() + packageManager.slice(1)} uses the <code className="px-1 py-0.5 rounded bg-muted text-xs">overrides</code> field.</>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
