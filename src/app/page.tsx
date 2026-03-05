import { Logo } from '@/components/ui/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <Logo variant="full" size="xl" />
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-muted-foreground">
              Camp Work wird geladen...
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Die Kartenansicht und Campingplatz-Suche sind in Entwicklung.
              Schaue dir das{' '}
              <a href="/brand" className="text-primary hover:underline">
                Brand System
              </a>{' '}
              an, während wir an Sprint 1 arbeiten.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
