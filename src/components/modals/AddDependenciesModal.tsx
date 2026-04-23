import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface AddDependenciesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependencies: Record<string, any[]>;
  selectedDependencies: Set<string>;
  onConfirm: (selectedIds: string[], depsData: any[]) => void;
}

export function AddDependenciesModal({ open, onOpenChange, dependencies, selectedDependencies, onConfirm }: AddDependenciesModalProps) {
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<Set<string>>(new Set(selectedDependencies));

  const filteredDeps = Object.entries(dependencies).reduce((acc, [category, deps]) => {
    const filtered = deps.filter((dep) =>
      dep.label.toLowerCase().includes(search.toLowerCase()) ||
      dep.description.toLowerCase().includes(search.toLowerCase()) ||
      dep.package.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  const handleToggle = (depId: string) => {
    const newSelected = new Set(tempSelected);
    if (newSelected.has(depId)) {
      newSelected.delete(depId);
    } else {
      newSelected.add(depId);
    }
    setTempSelected(newSelected);
  };

  const handleConfirm = () => {
    const allDeps = Object.values(dependencies).flat();
    const selectedData = allDeps.filter((d: any) => tempSelected.has(d.id));
    onConfirm(Array.from(tempSelected), selectedData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelected(new Set(selectedDependencies));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Dependencies</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Dependencies List */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dependencies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-4 space-y-4">
                {Object.entries(filteredDeps).map(([category, categoryDeps]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background py-1">
                      <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h3>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {categoryDeps.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {categoryDeps.map((dep: any) => {
                        const isSelected = tempSelected.has(dep.id);
                        
                        return (
                          <div
                            key={dep.id}
                            onClick={() => handleToggle(dep.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{dep.label}</p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{dep.description}</p>
                                <p className="text-xs text-muted-foreground truncate font-mono mt-1">
                                  {dep.package}@{dep.version}
                                </p>
                              </div>
                              {isSelected && (
                                <Badge variant="default" className="text-xs">Selected</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {tempSelected.size} dependenc{tempSelected.size !== 1 ? 'ies' : 'y'} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Add Selected
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
