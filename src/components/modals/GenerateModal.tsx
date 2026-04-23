import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Circle, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

export function GenerateModal({ open, onOpenChange, onComplete }: GenerateModalProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: 'init', label: 'Initializing project', status: 'pending' },
    { id: 'template', label: 'Creating from template', status: 'pending' },
    { id: 'config', label: 'Updating app.json', status: 'pending' },
    { id: 'package', label: 'Updating package.json', status: 'pending' },
    { id: 'icons', label: 'Adding custom icons', status: 'pending' },
    { id: 'modules', label: 'Configuring Expo modules', status: 'pending' },
    { id: 'deps', label: 'Adding dependencies', status: 'pending' },
    { id: 'finalize', label: 'Finalizing project', status: 'pending' },
  ]);

  const [_, setCurrentStepIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setSteps(steps.map(s => ({ ...s, status: 'pending' })));
      setCurrentStepIndex(-1);
      setIsComplete(false);
      setError(null);
      return;
    }

    // Start the generation process
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStepIndex(stepIndex);
        
        setSteps(prev => prev.map((step, idx) => {
          if (idx < stepIndex) return { ...step, status: 'completed' };
          if (idx === stepIndex) return { ...step, status: 'in-progress' };
          return step;
        }));

        stepIndex++;
      } else {
        // All steps completed
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        setIsComplete(true);
        clearInterval(interval);
        
        // Trigger download after a brief delay
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 800); // Each step takes 800ms

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Project Generated Successfully!
              </>
            ) : error ? (
              <>
                <Circle className="h-5 w-5 text-destructive" />
                Generation Failed
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Generating Your Project
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                step.status === 'in-progress'
                  ? 'bg-primary/10 border border-primary/20'
                  : step.status === 'completed'
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : step.status === 'in-progress' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.status === 'in-progress'
                      ? 'text-primary'
                      : step.status === 'completed'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Project Generated Successfully!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your Expo project has been created and is ready to download.
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                    <Download className="h-4 w-4" />
                    <span>Download starting...</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)} variant="default">
                Close
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
