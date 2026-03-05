'use client';

import { motion, PanInfo } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import SidebarPlaceholder from './SidebarPlaceholder';

interface MobileBottomSheetProps {
  className?: string;
}

export default function MobileBottomSheet({
  className,
}: MobileBottomSheetProps) {
  const { bottomSheetSnap, setBottomSheetSnap } = useUIStore();

  // Calculate heights based on viewport
  const getHeight = (snap: typeof bottomSheetSnap) => {
    switch (snap) {
      case 'closed':
        return 0;
      case 'peek':
        return '4rem'; // 64px - just the handle and text
      case 'half':
        return '50vh';
      case 'full':
        return '85vh';
      default:
        return '4rem';
    }
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { offset, velocity } = info;
    const height = window.innerHeight;

    // Calculate snap points
    const snapPoints = {
      closed: 0,
      peek: height * 0.08, // ~64px on most screens
      half: height * 0.5,
      full: height * 0.85,
    };

    // Determine closest snap point based on velocity and position
    const currentY = -offset.y; // Negative because we're dragging up
    const velocityThreshold = 500;

    if (Math.abs(velocity.y) > velocityThreshold) {
      // Fast gesture - snap based on direction
      if (velocity.y < -velocityThreshold) {
        // Swiping up
        if (bottomSheetSnap === 'peek') setBottomSheetSnap('half');
        else if (bottomSheetSnap === 'half') setBottomSheetSnap('full');
      } else {
        // Swiping down
        if (bottomSheetSnap === 'full') setBottomSheetSnap('half');
        else if (bottomSheetSnap === 'half') setBottomSheetSnap('peek');
      }
    } else {
      // Slow gesture - snap to closest point
      const distances = Object.entries(snapPoints).map(([key, value]) => ({
        snap: key as keyof typeof snapPoints,
        distance: Math.abs(currentY - value),
      }));

      const closest = distances.reduce((min, current) =>
        current.distance < min.distance ? current : min,
      );

      setBottomSheetSnap(closest.snap);
    }
  };

  return (
    <motion.div
      className={cn(
        'fixed bottom-0 w-full bg-white rounded-t-2xl shadow-sheet z-40',
        className,
      )}
      initial={{ height: getHeight(bottomSheetSnap) }}
      animate={{ height: getHeight(bottomSheetSnap) }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Drag Handle */}
      <div className="flex flex-col items-center pt-2 pb-4 px-4 border-b border-[#E8E4D8]">
        <div className="w-10 h-1 bg-[#E8E4D8] rounded-full mb-2" />

        {/* Peek content */}
        {bottomSheetSnap !== 'closed' && (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              12 Campingplätze
            </p>
            <p className="text-xs text-muted-foreground">Tippen zum Öffnen</p>
          </div>
        )}
      </div>

      {/* Content */}
      {(bottomSheetSnap === 'half' || bottomSheetSnap === 'full') && (
        <div className="flex-1 overflow-y-auto">
          <SidebarPlaceholder />
        </div>
      )}
    </motion.div>
  );
}
