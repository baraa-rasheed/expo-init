import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpoStore } from '@/store/useExpoStore';
import type { ExpoTemplate } from '@/types/expo';

const templates: { value: ExpoTemplate; label: string; description: string }[] = [
  { value: 'blank', label: 'Blank', description: 'A minimal app with a single screen' },
  { value: 'tabs', label: 'Tabs', description: 'App with tab-based navigation' },
  { value: 'bare-minimum', label: 'Bare Minimum', description: 'Bare minimum setup' },
  { value: 'blank-typescript', label: 'Blank (TypeScript)', description: 'Blank template with TypeScript' },
];

export function TemplateSection() {
  const { template, setTemplate } = useExpoStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Selection</CardTitle>
        <CardDescription>Choose your Expo project template</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="template">Template</Label>
          <Select value={template} onValueChange={(value) => setTemplate(value as ExpoTemplate)}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
