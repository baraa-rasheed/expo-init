import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useExpoStore } from '@/store/useExpoStore';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function JsonEditorSection() {
  const { config, packageJson, updateConfigFromJson, updatePackageJsonFromJson } = useExpoStore();
  
  const [appJsonText, setAppJsonText] = useState('');
  const [packageJsonText, setPackageJsonText] = useState('');
  const [appJsonError, setAppJsonError] = useState<string | null>(null);
  const [packageJsonError, setPackageJsonError] = useState<string | null>(null);

  useEffect(() => {
    setAppJsonText(JSON.stringify(config, null, 2));
  }, [config]);

  useEffect(() => {
    setPackageJsonText(JSON.stringify(packageJson, null, 2));
  }, [packageJson]);

  const handleAppJsonChange = (value: string) => {
    setAppJsonText(value);
    try {
      JSON.parse(value);
      setAppJsonError(null);
      updateConfigFromJson(value);
    } catch (error) {
      setAppJsonError((error as Error).message);
    }
  };

  const handlePackageJsonChange = (value: string) => {
    setPackageJsonText(value);
    try {
      JSON.parse(value);
      setPackageJsonError(null);
      updatePackageJsonFromJson(value);
    } catch (error) {
      setPackageJsonError((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live JSON Editor</CardTitle>
        <CardDescription>Edit your configuration files directly</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="app-json" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app-json">app.json</TabsTrigger>
            <TabsTrigger value="package-json">package.json</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app-json" className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {appJsonError ? (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">{appJsonError}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Valid JSON</span>
                </>
              )}
            </div>
            <Textarea
              value={appJsonText}
              onChange={(e) => handleAppJsonChange(e.target.value)}
              className="font-mono text-xs min-h-[400px]"
              placeholder="app.json content"
            />
          </TabsContent>
          
          <TabsContent value="package-json" className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {packageJsonError ? (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">{packageJsonError}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Valid JSON</span>
                </>
              )}
            </div>
            <Textarea
              value={packageJsonText}
              onChange={(e) => handlePackageJsonChange(e.target.value)}
              className="font-mono text-xs min-h-[400px]"
              placeholder="package.json content"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
