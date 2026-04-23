import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExpoStore } from '@/store/useExpoStore';
import { dependenciesByCategory } from '@/config/dependencies';
import { PackagePlus, Check } from 'lucide-react';

export function DependenciesModal() {
  const { selectedDependencies, toggleDependency } = useExpoStore();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            <span className="font-semibold">Dependencies</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedDependencies.size} package{selectedDependencies.size !== 1 ? 's' : ''} selected
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Add Dependencies</DialogTitle>
          <DialogDescription>
            Select popular packages to add to your project. They'll be automatically added to package.json.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {Object.entries(dependenciesByCategory).map(([category, deps]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  {category}
                  <Badge variant="outline" className="text-xs">
                    {deps.length}
                  </Badge>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {deps.map((dep) => {
                    const isSelected = selectedDependencies.has(dep.id);
                    return (
                      <Card
                        key={dep.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => toggleDependency(dep.id, dep.package, dep.version)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{dep.label}</CardTitle>
                            {isSelected && (
                              <div className="rounded-full bg-primary p-1">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <CardDescription className="text-xs">{dep.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="secondary" className="text-xs font-mono">
                            {dep.package}@{dep.version}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
