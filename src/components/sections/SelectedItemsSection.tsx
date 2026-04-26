import { ExpoIcon } from '@/components/icons/ExpoIcon';
import { Package, Settings, X } from 'lucide-react';
import { dependenciesByCategory } from '@/config/dependencies';
import { AnimatePresence, motion } from 'framer-motion';

interface SelectedItemsSectionProps {
  selectedModules: Map<string, any>;
  selectedDependencies: Map<string, any>;
  onRemoveModule: (id: string) => void;
  onRemoveDependency: (id: string) => void;
  onCustomizeModule?: (id: string) => void;
}

const categoryColors: Record<
  string,
  { icon: string; bg: string; text: string; darkBg: string; darkText: string }
> = {
  'State Management': {
    icon: 'text-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    darkBg: 'dark:bg-blue-900/40',
    darkText: 'dark:text-blue-300',
  },
  Navigation: {
    icon: 'text-green-500',
    bg: 'bg-green-100',
    text: 'text-green-700',
    darkBg: 'dark:bg-green-900/40',
    darkText: 'dark:text-green-300',
  },
  'APIs & Networking': {
    icon: 'text-orange-500',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    darkBg: 'dark:bg-orange-900/40',
    darkText: 'dark:text-orange-300',
  },
  'Forms & Validation': {
    icon: 'text-pink-500',
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    darkBg: 'dark:bg-pink-900/40',
    darkText: 'dark:text-pink-300',
  },
  Animations: {
    icon: 'text-violet-500',
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    darkBg: 'dark:bg-violet-900/40',
    darkText: 'dark:text-violet-300',
  },
  'UI Components': {
    icon: 'text-cyan-500',
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    darkBg: 'dark:bg-cyan-900/40',
    darkText: 'dark:text-cyan-300',
  },
  Utilities: {
    icon: 'text-gray-500',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    darkBg: 'dark:bg-gray-900/40',
    darkText: 'dark:text-gray-300',
  },
};

export function SelectedItemsSection({
  selectedModules,
  selectedDependencies,
  onRemoveModule,
  onRemoveDependency,
  onCustomizeModule,
}: SelectedItemsSectionProps) {
  // Track which dep ids are covered by the known categories so any "ad-hoc" deps
  // (added via the AddPalette and not present in dependenciesByCategory) still show up.
  const knownDepIds = new Set<string>();
  Object.values(dependenciesByCategory).forEach((deps) =>
    deps.forEach((d: any) => knownDepIds.add(d.id))
  );

  const extraDeps = Array.from(selectedDependencies.values()).filter(
    (dep: any) => !knownDepIds.has(dep.id)
  );

  return (
    <div className="space-y-6">
      {/* Expo Modules */}
      {selectedModules.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <ExpoIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Expo Modules</h3>
            <span className="text-xs text-muted-foreground">({selectedModules.size})</span>
          </div>
          <motion.div className="space-y-2" layout>
            <AnimatePresence initial={false}>
              {Array.from(selectedModules.values()).map((module: any) => (
                <motion.div
                  key={module.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
                  className="relative flex items-center gap-4 p-4 rounded-xl border hover:border-muted hover:shadow-md transition-all group"
                >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <ExpoIcon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{module.name ?? module.id}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{module.id}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onCustomizeModule && (
                    <button
                      onClick={() => onCustomizeModule(module.id)}
                      className="p-2 hover:bg-muted rounded-lg"
                      aria-label={`Configure ${module.name ?? module.id}`}
                    >
                      <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveModule(module.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg"
                    aria-label={`Remove ${module.name ?? module.id}`}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Dependencies grouped by category */}
      {selectedDependencies.size > 0 && (
        <div className="space-y-4">
          {Object.entries(dependenciesByCategory).map(([category, deps]) => {
            const selectedInCategory = deps.filter((dep: any) => selectedDependencies.has(dep.id));
            if (selectedInCategory.length === 0) return null;

            const colors = categoryColors[category] || categoryColors['Utilities'];

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Package className={`h-4 w-4 ${colors.icon}`} />
                  <h3 className="text-sm font-semibold">{category}</h3>
                  <span className="text-xs text-muted-foreground">({selectedInCategory.length})</span>
                </div>
                <motion.div className="space-y-2" layout>
                  <AnimatePresence initial={false}>
                    {selectedInCategory.map((dep: any) => (
                      <motion.div
                        key={dep.id}
                        layout
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
                        className="relative flex items-center gap-4 p-4 rounded-xl border hover:border-muted hover:shadow-md transition-all group"
                      >
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-xl ${colors.bg} ${colors.darkBg} flex-shrink-0`}
                      >
                        <Package className={`h-7 w-7 ${colors.text} ${colors.darkText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{dep.label}</p>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          {dep.package}@{dep.version}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveDependency(dep.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })}

          {extraDeps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Package className={`h-4 w-4 ${categoryColors['Utilities'].icon}`} />
                <h3 className="text-sm font-semibold">Other</h3>
                <span className="text-xs text-muted-foreground">({extraDeps.length})</span>
              </div>
              <motion.div className="space-y-2" layout>
                <AnimatePresence initial={false}>
                  {extraDeps.map((dep: any) => {
                    const colors = categoryColors['Utilities'];
                    return (
                      <motion.div
                        key={dep.id}
                        layout
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }}
                        className="relative flex items-center gap-4 p-4 rounded-xl border hover:border-muted hover:shadow-md transition-all group"
                      >
                      <div
                        className={`flex items-center justify-center w-14 h-14 rounded-xl ${colors.bg} ${colors.darkBg} flex-shrink-0`}
                      >
                        <Package className={`h-7 w-7 ${colors.text} ${colors.darkText}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {dep.label ?? dep.package ?? dep.id}
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-mono">
                          {dep.package}
                          {dep.version ? `@${dep.version}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveDependency(dep.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
