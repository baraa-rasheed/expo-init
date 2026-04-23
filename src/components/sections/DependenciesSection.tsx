import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useExpoStore } from '@/store/useExpoStore';
import { dependencyOptions } from '@/config/dependencies';

export function DependenciesSection() {
  const { selectedDependencies, toggleDependency } = useExpoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependencies</CardTitle>
        <CardDescription>Add popular packages to your project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {dependencyOptions.map((dep) => (
            <div key={dep.id} className="flex items-start space-x-3">
              <Checkbox
                id={dep.id}
                checked={selectedDependencies.has(dep.id)}
                onCheckedChange={() => toggleDependency(dep.id, dep.package, dep.version)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={dep.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {dep.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {dep.description}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {dep.package}@{dep.version}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
