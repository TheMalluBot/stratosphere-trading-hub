
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';

interface ProgressiveLoaderProps {
  onComplete?: () => void;
  duration?: number;
  steps?: string[];
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  onComplete,
  duration = 2000,
  steps = [
    'Initializing educational platform...',
    'Loading market simulation data...',
    'Preparing learning modules...',
    'Setting up paper trading environment...',
    'Ready to start learning!'
  ]
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 50));
        
        // Update step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        if (stepIndex !== currentStep && stepIndex < steps.length) {
          setCurrentStep(stepIndex);
        }
        
        if (newProgress >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, steps.length, currentStep, onComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <TrendingUp className="w-12 h-12 text-primary animate-pulse" />
              <Loader2 className="w-6 h-6 absolute -bottom-1 -right-1 animate-spin text-primary" />
            </div>
            
            <div className="w-full space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">TradingHub Learn</h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep] || 'Loading...'}
                </p>
              </div>
              
              <Progress value={progress} className="w-full" />
              
              <div className="text-center text-xs text-muted-foreground">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
