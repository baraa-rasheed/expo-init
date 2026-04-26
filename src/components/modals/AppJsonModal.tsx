import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useExpoStore } from '@/store/useExpoStore';
import { Save, X, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AppJsonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppJsonModal({ open, onOpenChange }: AppJsonModalProps) {
  const { config, updateConfig } = useExpoStore();
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setJsonString(JSON.stringify(config, null, 2));
      setError(null);
    }
  }, [open, config]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonString);
      updateConfig(parsed);
      setError(null);
      onOpenChange(false);
    } catch (e) {
      setError('Invalid JSON format. Please check your syntax.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[80vw] lg:w-[50vw] max-w-none sm:max-w-none h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit app.json</DialogTitle>
          <DialogDescription>
            Manually edit your app configuration. Changes will be validated before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <Textarea
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            className="font-mono text-xs flex-1 min-h-0 resize-none"
            placeholder="Enter valid JSON..."
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 justify-end flex-shrink-0">
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
