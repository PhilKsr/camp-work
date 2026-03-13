'use client';

import { motion, PanInfo } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { cn } from '@/lib/utils';
import { CampingList } from '@/components/cards/CampingList';
import { CampingCardCompact } from '@/components/cards/CampingCardCompact';
import { DetailSheet } from '@/components/cards/DetailSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useViewportCampgrounds } from '@/hooks/useViewportCampgrounds';
import type { Campground } from '@/types/campground';

interface MobileBottomSheetProps {
  className?: string;
  selectedCampground?: Campground | null;
  onCloseDetail?: () => void;
  onSelectCampground?: (campground: Campground) => void;
}

export default function MobileBottomSheet({
  className,
  selectedCampground,
  onCloseDetail,
  onSelectCampground,
}: MobileBottomSheetProps) {
  const { bottomSheetSnap, setBottomSheetSnap } = useUIStore();
  const { isLoading } = useCampgrounds();
  const viewportCampgrounds = useViewportCampgrounds();

  const getHeight = (snap: typeof bottomSheetSnap) => {
    switch (snap) {
      case 'closed':
        return '0px';
      case 'peek':
        return '5rem';
      case 'half':
        return '50vh';
      case 'full':
        return '85vh';
      default:
        return '5rem';
    }
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { velocity } = info;
    const threshold = 300;

    if (velocity.y < -threshold) {
      // Swiping up
      if (bottomSheetSnap === 'peek') setBottomSheetSnap('half');
      else if (bottomSheetSnap === 'half') setBottomSheetSnap('full');
    } else if (velocity.y > threshold) {
      // Swiping down
      if (bottomSheetSnap === 'full') setBottomSheetSnap('half');
      else if (bottomSheetSnap === 'half') setBottomSheetSnap('peek');
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 w-full bg-white rounded-t-2xl z-40 flex flex-col',
        className,
      )}
      style={{
        height: getHeight(bottomSheetSnap),
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Drag Handle – NUR dieser Bereich ist draggable */}
      <motion.div
        className="flex flex-col items-center pt-2 pb-3 px-4 border-b border-gray-200 cursor-grab active:cursor-grabbing shrink-0"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ touchAction: 'none' }}
        onClick={() => {
          if (bottomSheetSnap === 'peek') setBottomSheetSnap('half');
          else if (bottomSheetSnap === 'half' || bottomSheetSnap === 'full')
            setBottomSheetSnap('peek');
        }}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
        {bottomSheetSnap !== 'closed' && (
          <div className="w-full flex items-center justify-between">
            {selectedCampground ? (
              <>
                <button
                  onClick={() => {
                    onCloseDetail?.();
                    // Bleibe im halb-offenen Zustand statt zu peek
                    setBottomSheetSnap('half');
                  }}
                  className="flex items-center gap-1 text-sm text-[#1B4332] font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {selectedCampground.name}
                </p>
                <div className="w-16" /> {/* Spacer für Zentrierung */}
              </>
            ) : (
              <div className="text-center w-full">
                <p className="text-sm font-medium text-gray-900">
                  {viewportCampgrounds.length} Campingplätze in der Nähe
                </p>
                <p className="text-xs text-gray-500">Nach oben wischen</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Peek: Horizontale Card-Reihe oder Loading */}
      {bottomSheetSnap === 'peek' && !selectedCampground && (
        <div className="px-4 pb-3 shrink-0 overflow-hidden">
          {isLoading ? (
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-[180px] h-[140px] rounded-xl shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {viewportCampgrounds.slice(0, 10).map((campground) => (
                <CampingCardCompact
                  key={campground.id}
                  campground={campground}
                  onClick={() => {
                    onSelectCampground?.(campground);
                    setBottomSheetSnap('full');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scrollable Content */}
      {(bottomSheetSnap === 'half' || bottomSheetSnap === 'full') && (
        <div
          className="flex-1 overflow-y-auto overscroll-contain p-4"
          style={{ touchAction: 'pan-y' }}
        >
          {selectedCampground && onCloseDetail ? (
            <DetailSheet
              campground={selectedCampground}
              onClose={() => {
                onCloseDetail();
                setBottomSheetSnap('peek');
              }}
            />
          ) : (
            <CampingList />
          )}
        </div>
      )}
    </div>
  );
}
