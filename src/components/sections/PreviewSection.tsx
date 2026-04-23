import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExpoStore } from '@/store/useExpoStore';
import { Download, FileJson, Package } from 'lucide-react';

export function PreviewSection() {
  const { config, packageJson } = useExpoStore();

  const handleDownload = () => {
    const files = [
      {
        name: 'app.json',
        content: JSON.stringify(config, null, 2),
      },
      {
        name: 'package.json',
        content: JSON.stringify(packageJson, null, 2),
      },
    ];

    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview & Download</CardTitle>
        <CardDescription>Review your configuration and download project files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              <h3 className="font-semibold">app.json</h3>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <h3 className="font-semibold">package.json</h3>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[200px]">
              {JSON.stringify(packageJson, null, 2)}
            </pre>
          </div>
        </div>
        
        <Button onClick={handleDownload} className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download Configuration Files
        </Button>
        
        <div className="text-sm text-muted-foreground text-center">
          <p>Files will be downloaded separately as app.json and package.json</p>
        </div>
      </CardContent>
    </Card>
  );
}
