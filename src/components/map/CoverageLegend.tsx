'use client';

import { useState } from 'react';
import { useCoverageStore } from '@/stores/coverageStore';
import { cn } from '@/lib/utils';

interface CoverageLegendProps {
  className?: string;
}

export default function CoverageLegend({ className }: CoverageLegendProps) {
  const { isVisible } = useCoverageStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  // BNetzA WMS-Karte zeigt tatsächlich:
  // Blau für Indoor-Versorgung (Gebäude)
  // Dunkel-Orange/Rot-Orange für Outdoor-Versorgung
  // Weiß/Transparent für keine Versorgung
  const legendItems = [
    {
      key: 'indoor' as const,
      color: '#2563EB', // Blau - wie im echten WMS
      label: 'Versorgung in Gebäuden',
      description: 'Exzellent für Arbeiten',
    },
    {
      key: 'outdoor' as const,
      color: '#D97706', // Dunkel-Orange/Rot-Orange - angepasst an echte WMS-Farben
      label: 'Versorgung im Freien',
      description: 'Gut für draußen',
    },
    {
      key: 'none' as const,
      color: '#E5E7EB',
      label: 'Keine Versorgung',
      description: 'Kein Mobilfunk',
    },
  ];

  return (
    <div className={cn('', className)}>
      {/* Mobile Compact View */}
      <div className="block lg:hidden">
        {isExpanded ? (
          <div
            className="bg-white/90 backdrop-blur-md rounded-brand-md shadow-brand-card p-3 min-w-[200px]"
            onClick={() => setIsExpanded(false)}
          >
            <h3 className="text-xs font-medium text-foreground mb-2">
              O2 Netzabdeckung
            </h3>
            <p className="text-[10px] text-muted-foreground mb-2">
              © Bundesnetzagentur, Stand: Okt. 2025
            </p>
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
          <h3 className="text-xs font-medium text-foreground mb-2">
            O2 Netzabdeckung
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            © Bundesnetzagentur, Stand: Okt. 2025
          </p>
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
