'use client';

import { useState } from 'react';
import { coverageColors } from '@/lib/brand';
import { useCoverageStore } from '@/stores/coverageStore';
import { cn } from '@/lib/utils';

interface CoverageLegendProps {
  className?: string;
}

export default function CoverageLegend({ className }: CoverageLegendProps) {
  const { isVisible, source } = useCoverageStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const title = source === 'o2' ? 'O2 Netzabdeckung' : 'BNetzA Netzabdeckung';

  const legendItems = [
    {
      key: '5g' as const,
      color: coverageColors['5g'].hex,
      label: coverageColors['5g'].label,
      description: coverageColors['5g'].description,
    },
    {
      key: '4g' as const,
      color: coverageColors['4g'].hex,
      label: coverageColors['4g'].label,
      description: coverageColors['4g'].description,
    },
    {
      key: '3g' as const,
      color: coverageColors['3g'].hex,
      label: coverageColors['3g'].label,
      description: coverageColors['3g'].description,
    },
    {
      key: 'none' as const,
      color: coverageColors['none'].hex,
      label: coverageColors['none'].label,
      description: coverageColors['none'].description,
    },
  ];

  return (
    <div className={cn('absolute bottom-6 left-4 z-10', className)}>
      {/* Mobile Compact View */}
      <div className="block lg:hidden">
        {isExpanded ? (
          <div
            className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-3 min-w-[200px]"
            onClick={() => setIsExpanded(false)}
          >
            <h3 className="text-xs font-medium text-foreground mb-2">
              {title}
            </h3>
            <div className="space-y-2">
              {legendItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                    data-testid={`coverage-indicator-${item.key}`}
                  />
                  <div>
                    <span className="text-xs font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      – {item.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-2 cursor-pointer hover:bg-white/95 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-1">
              {legendItems.map((item) => (
                <div
                  key={item.key}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">Netz</span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Full View */}
      <div className="hidden lg:block">
        <div className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-3 min-w-[200px]">
          <h3 className="text-xs font-medium text-foreground mb-3">{title}</h3>
          <div className="space-y-2">
            {legendItems.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                  data-testid={`coverage-indicator-${item.key}`}
                />
                <div>
                  <div className="text-xs font-medium text-foreground">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
