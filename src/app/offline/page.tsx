'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <Logo variant="icon" size="xl" className="mx-auto mb-6" />
        <h1 className="text-xl font-semibold mb-2">Du bist offline</h1>
        <p className="text-muted-foreground mb-6">
          Keine Internetverbindung. Zuletzt geladene Campingplätze sind
          weiterhin verfügbar.
        </p>
        <Button onClick={() => (window.location.href = '/')}>Zur Karte</Button>
      </div>
    </div>
  );
}
