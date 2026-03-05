import { Logo } from '@/components/ui/Logo';

export default function MapLoadingSkeleton() {
  return (
    <div className="h-full w-full bg-[#F9F8E6] flex flex-col items-center justify-center">
      <div className="animate-pulse">
        <Logo variant="icon" size="xl" />
      </div>
      <p className="mt-4 text-[#5C5650] text-sm">Karte wird geladen...</p>
    </div>
  );
}
