import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useExpoStore } from '@/store/useExpoStore';
import { Save, X, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PackageJsonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageJsonModal({ open, onOpenChange }: PackageJsonModalProps) {
  const { packageJson, updatePackageJson } = useExpoStore();
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setJsonString(JSON.stringify(packageJson, null, 2));
      setError(null);
    }
  }, [open, packageJson]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonString);
      updatePackageJson(parsed);
      setError(null);
      onOpenChange(false);
    } catch (e) {
      setError('Invalid JSON format. Please check your syntax.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Edit package.json</DialogTitle>
          <DialogDescription>
            Manually edit your package dependencies. Changes will be validated before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            className="font-mono text-xs min-h-[500px] resize-none"
            placeholder="Enter valid JSON..."
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
