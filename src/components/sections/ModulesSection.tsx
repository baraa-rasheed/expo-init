import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useExpoStore } from '@/store/useExpoStore';
import { expoModules } from '@/config/modules';

export function ModulesSection() {
  const { selectedModules, toggleModule } = useExpoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expo Modules</CardTitle>
        <CardDescription>Select the Expo modules you need for your app</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {expoModules.map((module) => (
            <div key={module.id} className="flex items-start space-x-3">
              <Checkbox
                id={module.id}
                checked={selectedModules.has(module.id)}
                onCheckedChange={() => toggleModule(module.id)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={module.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {module.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {module.packages.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
