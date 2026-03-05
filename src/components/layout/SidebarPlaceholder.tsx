import { Skeleton } from '@/components/ui/skeleton';

export default function SidebarPlaceholder() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Campingplätze</h2>

      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            {/* Thumbnail skeleton */}
            <Skeleton className="h-[200px] rounded-2xl" />

            {/* Name skeleton */}
            <Skeleton className="h-4 w-3/4" />

            {/* Location skeleton */}
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
