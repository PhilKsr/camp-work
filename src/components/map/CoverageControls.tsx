'use client';

import { useState } from 'react';
import { Layers, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useCoverageStore } from '@/stores/coverageStore';

interface CoverageControlsProps {
  className?: string;
}

export default function CoverageControls({ className }: CoverageControlsProps) {
  const { isVisible, opacity, toggleVisibility, setOpacity } =
    useCoverageStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('', className)}>
      {isExpanded ? (
        <div className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-4 min-w-[240px] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-foreground">
              O2 Netzabdeckung
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(false)}
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>

          {/* Attribution */}
          <p className="text-[10px] text-muted-foreground">
            Quelle: © Bundesnetzagentur
          </p>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-foreground">Layer anzeigen</label>
            <Switch checked={isVisible} onCheckedChange={toggleVisibility} />
          </div>

          {/* Opacity Slider */}
          {isVisible && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-foreground">Deckkraft</label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={([value]) => setOpacity(value)}
                min={0.2}
                max={0.8}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(true)}
          >
            <Layers
              className={cn(
                'h-4 w-4 transition-colors',
                isVisible ? 'text-primary' : 'text-muted-foreground',
              )}
            />
          </Button>
        </div>
      )}
    </div>
  );
}
