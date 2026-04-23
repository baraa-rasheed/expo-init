import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExpoStore } from '@/store/useExpoStore';
import { useExpoModules } from '@/hooks/useExpoModules';
import { Package, Check, Loader2, ShieldCheck } from 'lucide-react';

export function ModulesModal() {
  const { selectedModules, toggleModule } = useExpoStore();
  const { modules, loading, error } = useExpoModules();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span className="font-semibold">Expo Modules</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} selected
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Select Expo Modules</DialogTitle>
          <DialogDescription>
            Choose the Expo modules you need. Permissions and configurations will be added automatically.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-destructive mb-2">Failed to load modules</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : Object.keys(modules).length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No modules available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(modules).map(([category, categoryModules]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    {category}
                    <Badge variant="outline" className="text-xs">
                      {categoryModules.length}
                    </Badge>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {categoryModules.map((module: any) => {
                      const isSelected = selectedModules.has(module.id);
                      const hasConfig = module.hasConfig;
                      
                      return (
                        <Card
                          key={module.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => toggleModule(module.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {module.name}
                                  {hasConfig && (
                                    <span title="Auto-configured">
                                      <ShieldCheck className="h-4 w-4 text-green-500" />
                                    </span>
                                  )}
                                </CardTitle>
                              </div>
                              {isSelected && (
                                <div className="rounded-full bg-primary p-1">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <CardDescription className="text-xs line-clamp-2">
                              {module.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1">
                                {module.packages.map((pkg: string) => (
                                  <Badge key={pkg} variant="secondary" className="text-xs">
                                    {pkg}
                                  </Badge>
                                ))}
                              </div>
                              {module.requiredPermissions && (
                                <div className="text-xs text-muted-foreground">
                                  {module.requiredPermissions.ios && (
                                    <div>iOS: {module.requiredPermissions.ios.length} permissions</div>
                                  )}
                                  {module.requiredPermissions.android && (
                                    <div>Android: {module.requiredPermissions.android.length} permissions</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
