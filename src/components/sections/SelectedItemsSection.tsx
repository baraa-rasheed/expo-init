import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Package, Boxes } from 'lucide-react';

interface SelectedItemsSectionProps {
  selectedModules: Map<string, any>;
  selectedDependencies: Map<string, any>;
  onAddModules: () => void;
  onAddDependencies: () => void;
  onRemoveModule: (id: string) => void;
  onRemoveDependency: (id: string) => void;
}

export function SelectedItemsSection({
  selectedModules,
  selectedDependencies,
  onAddModules,
  onAddDependencies,
  onRemoveModule,
  onRemoveDependency,
}: SelectedItemsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Expo Modules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Boxes className="h-4 w-4" />
                Expo Modules
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {selectedModules.size} selected
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onAddModules}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedModules.size === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No modules selected. Click "Add" to browse modules.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedModules.values()).map((module: any) => (
                <Badge
                  key={module.id}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 text-xs flex items-center gap-1"
                >
                  <span className="truncate max-w-[150px]">{module.name}</span>
                  <button
                    onClick={() => onRemoveModule(module.id)}
                    className="ml-1 hover:bg-muted rounded-sm p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dependencies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Dependencies
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {selectedDependencies.size} selected
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={onAddDependencies}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedDependencies.size === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No dependencies selected. Click "Add" to browse packages.
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(selectedDependencies.values()).map((dep: any) => (
                <div
                  key={dep.id}
                  className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dep.label}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {dep.package}@{dep.version}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveDependency(dep.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-sm"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
