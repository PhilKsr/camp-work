'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import MapView from '@/components/map/MapView';
import MobileBottomSheet from '@/components/layout/MobileBottomSheet';
import { CampingList } from '@/components/cards/CampingList';
import { DetailSheet } from '@/components/cards/DetailSheet';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ActiveFilters } from '@/components/search/ActiveFilters';
import { useMapStore } from '@/stores/mapStore';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useUrlState } from '@/hooks/useUrlState';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import type { Campground } from '@/types/campground';

export default function Home() {
  const { selectedCampground, setSelectedCampground } = useMapStore();
  const { data: campgroundsData } = useCampgrounds();
  const [showBanner, setShowBanner] = useState(true);

  // Initialize location on app start
  const locationState = useInitialLocation();

  // Auto-dismiss banner after 5 seconds
  useEffect(() => {
    if (locationState.error && showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationState.error, showBanner]);

  // Sync state with URL
  useUrlState();

  const selectedCampgroundData =
    selectedCampground && campgroundsData
      ? campgroundsData.features.find(
          (f) => f.properties.id === selectedCampground,
        )?.properties
      : null;

  const handleCloseDetail = () => {
    setSelectedCampground(null);
  };

  const handleSelectCampground = (campground: Campground) => {
    setSelectedCampground(campground.id);
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        <Header />
        <ActiveFilters />

        {/* Location Warning - direkt unter dem Header, nicht über der Karte */}
        {locationState.error && !locationState.hasLocation && showBanner && (
          <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 px-4 py-2 flex items-center justify-between">
            <p className="text-sm text-[#D97706]">
              <strong>Hinweis:</strong> {locationState.error}. Verwende die
              Suchleiste um zu einem Ort zu navigieren.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[#D97706] hover:text-[#F59E0B] ml-2 shrink-0 p-1 rounded-md hover:bg-[#F59E0B]/10 transition-colors"
              aria-label="Banner schließen"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-[420px] flex-col bg-white overflow-hidden shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
            <AnimatePresence mode="wait">
              {selectedCampgroundData ? (
                <motion.div
                  key="detail"
                  initial={{ x: 420, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 420, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="h-full overflow-y-auto p-4"
                >
                  <DetailSheet
                    campground={selectedCampgroundData}
                    onClose={handleCloseDetail}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ x: -420, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -420, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="h-full overflow-y-auto p-4"
                >
                  <CampingList />
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          {/* Map */}
          <main id="main-content" className="flex-1 relative">
            <MapView />

            {/* Location Loading Overlay */}
            {locationState.isLoading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1B4332]"></div>
                  <span className="text-foreground font-medium">
                    Standort wird ermittelt...
                  </span>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet
          className="lg:hidden"
          selectedCampground={selectedCampgroundData}
          onCloseDetail={handleCloseDetail}
          onSelectCampground={handleSelectCampground}
        />

        {/* Install Prompt */}
        <InstallPrompt />
      </div>
    </ErrorBoundary>
  );
}
