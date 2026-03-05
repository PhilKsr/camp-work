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
  const {
    isVisible,
    opacity,
    source,
    toggleVisibility,
    setOpacity,
    setSource,
  } = useCoverageStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('', className)}>
      {isExpanded ? (
        <div className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-4 min-w-[240px] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-foreground">
              Netzabdeckung
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

          {/* Data Source Toggle */}
          {isVisible && (
            <div className="space-y-2">
              <label className="text-xs text-foreground block">
                Datenquelle
              </label>
              <div className="flex gap-1">
                <Button
                  variant={source === 'bnetza' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 text-xs h-7"
                  onClick={() => setSource('bnetza')}
                >
                  BNetzA
                </Button>
                <Button
                  variant={source === 'o2' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 text-xs h-7 opacity-50"
                  disabled={true}
                  title="O2 Live-Daten demnächst verfügbar"
                >
                  O2 Live
                  <span className="ml-1 text-[10px] font-normal opacity-70">
                    (bald)
                  </span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {source === 'bnetza'
                  ? 'Bundesnetzagentur Daten'
                  : 'Live O2 Abdeckung'}
              </p>
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
