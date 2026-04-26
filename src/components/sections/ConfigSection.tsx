import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useExpoStore } from '@/store/useExpoStore';
import type { ExpoTemplate } from '@/types/expo';
import { CheckCircle2, Code2, FileCode, ImageIcon, Layout, Layers, Package2, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const templates: { value: ExpoTemplate; label: string; description: string; icon: any }[] = [
  { value: 'default-sdk-55', label: 'Native Tabs (SDK 55)', description: 'Latest Expo with native tabs', icon: Layout },
  { value: 'blank', label: 'Blank', description: 'A minimal app with a single screen', icon: FileCode },
  { value: 'tabs', label: 'Tabs', description: 'App with tab-based navigation', icon: Layout },
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
    iconFile,
    splashFile,
  } = useExpoStore();

  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [adaptiveIconPreview, setAdaptiveIconPreview] = useState<string | null>(null);
  const [splashPreview, setSplashPreview] = useState<string | null>(null);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const adaptiveIconInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const isPreviewableAsset = (value: unknown) => {
    if (typeof value !== 'string' || value.trim().length === 0) return false;
    return (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:') ||
      value.startsWith('blob:') ||
      value.startsWith('/')
    );
  };

  const templateIconSrc =
    !iconFile && !iconPreview && isPreviewableAsset(config?.expo?.icon) ? (config.expo.icon as string) : null;
  const templateSplashSrc =
    !splashFile && !splashPreview && isPreviewableAsset(config?.expo?.splash?.image)
      ? (config.expo.splash!.image as string)
      : null;

  useEffect(() => {
    if (!iconFile) setIconPreview(null);
    if (!splashFile) setSplashPreview(null);
  }, [template, iconFile, splashFile]);

  const handleIconUpload = (file: File | null) => {
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result as string);
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
      reader.onloadend = () => setAdaptiveIconPreview(reader.result as string);
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
      reader.onloadend = () => setSplashPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setSplashFile(null);
      setSplashPreview(null);
      if (splashInputRef.current) splashInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-transparent">
      <div className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">App Configuration</h2>
            <p className="text-xs text-muted-foreground">
              Set your app name, icons, splash screen, and template options.
            </p>
          </div>
          {onViewJson && (
            <Button variant="outline" size="sm" onClick={onViewJson} className="h-9">
              Customize `app.json`
            </Button>
          )}
        </div>
      </div>

      <div className="border-t" />

      <div className="space-y-6">
        <div className="space-y-3 py-6">
          <div>
            <h3 className="text-sm font-semibold mb-1">Template</h3>
            <p className="text-xs text-muted-foreground">Choose your Expo project template</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((t) => {
              const Icon = t.icon;
              const selected = t.value === template;
              return (
                <motion.button
                  key={t.value}
                  type="button"
                  onClick={() => setTemplate(t.value)}
                  whileHover={{ rotate: selected ? 0 : -1.25, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.7 }}
                  className={[
                    'text-left rounded-xl border p-4 transition-all',
                    'hover:border-primary/40 hover:bg-accent/40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    selected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border bg-card',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        'p-2 rounded-lg border flex-shrink-0',
                        selected ? 'bg-primary/10 border-primary/20' : 'bg-muted border-border',
                      ].join(' ')}
                    >
                      {selected ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{t.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-snug">{t.description}</div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="border-t" />

        <div className="space-y-4">
          {template === 'default-sdk-55' && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hermes-v1" className="text-sm font-medium cursor-pointer">
                    Enable Hermes V1
                  </Label>
                  <p className="text-xs text-muted-foreground">Opt-in to Hermes v1 engine for better performance</p>
                  {useHermesV1 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      ⚠️ Increases build times (builds React Native from source)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {useHermesV1 && (
                    <Select value={packageManager} onValueChange={(value) => setPackageManager(value as any)}>
                      <SelectTrigger
                        id="package-manager"
                        className="h-9 w-[140px] text-xs"
                        aria-label="Package manager"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="npm">npm</SelectItem>
                        <SelectItem value="yarn">yarn</SelectItem>
                        <SelectItem value="pnpm">pnpm</SelectItem>
                        <SelectItem value="bun">bun</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Switch id="hermes-v1" checked={useHermesV1} onCheckedChange={setUseHermesV1} />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {useHermesV1 && (
                  <motion.div
                    key="hermes-details"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 44, mass: 0.75 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-muted-foreground">
                        We add a Hermes compiler pin to your `package.json` (
                        {packageManager === 'yarn' ? (
                          <code className="px-1 py-0.5 rounded bg-muted text-xs">resolutions</code>
                        ) : (
                          <code className="px-1 py-0.5 rounded bg-muted text-xs">overrides</code>
                        )}
                        ).
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 justify-center">
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
                  iconPreview || templateIconSrc ? 'border-primary bg-accent/20' : 'border-muted-foreground/25'
                }`}
              >
                {iconPreview || templateIconSrc ? (
                  <>
                    <img
                      src={iconPreview ?? templateIconSrc ?? ''}
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
              <p className="text-xs text-center text-muted-foreground font-medium">1024×1024</p>
            </div>

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
              <p className="text-xs text-center text-muted-foreground font-medium">1024×1024</p>
            </div>

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
                  splashPreview || templateSplashSrc ? 'border-primary bg-accent/20' : 'border-muted-foreground/25'
                }`}
              >
                {splashPreview || templateSplashSrc ? (
                  <>
                    <img
                      src={splashPreview ?? templateSplashSrc ?? ''}
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
              <p className="text-xs text-center text-muted-foreground font-medium">2048×2048</p>
            </div>
          </div>

          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 44, mass: 0.9, delay: 0.08 }}
          >
            <Input
              id="app-name"
              value={config.expo.name}
              onChange={(e) => updateAppName(e.target.value)}
              placeholder="My Awesome Expo App"
              className="h-14 rounded-2xl border-2 bg-background px-4 text-center text-2xl font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
