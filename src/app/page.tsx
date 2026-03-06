'use client';

import Header from '@/components/layout/Header';
import MapView from '@/components/map/MapView';
import MobileBottomSheet from '@/components/layout/MobileBottomSheet';
import { CampingList } from '@/components/cards/CampingList';
import { DetailSheet } from '@/components/cards/DetailSheet';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useMapStore } from '@/stores/mapStore';
import { useCampgrounds } from '@/hooks/useCampgrounds';
import { useUrlState } from '@/hooks/useUrlState';
import { useInitialLocation } from '@/hooks/useInitialLocation';
import type { Campground } from '@/types/campground';

export default function Home() {
  const { selectedCampground, setSelectedCampground } = useMapStore();
  const { data: campgroundsData } = useCampgrounds();

  // Initialize location on app start
  const locationState = useInitialLocation();

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
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[420px] flex-col border-r border-[#E8E4D8] bg-white overflow-y-auto">
          <div className="p-4 flex-1">
            {selectedCampgroundData ? (
              <DetailSheet
                campground={selectedCampgroundData}
                onClose={handleCloseDetail}
              />
            ) : (
              <CampingList />
            )}
          </div>
        </aside>

        {/* Map */}
        <main id="main-content" className="flex-1 relative">
          <ErrorBoundary>
            <MapView />
          </ErrorBoundary>

          {/* Location Loading Overlay */}
          {locationState.isLoading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E19B53]"></div>
                <span className="text-foreground font-medium">
                  Standort wird ermittelt...
                </span>
              </div>
            </div>
          )}

          {/* Location Error Overlay */}
          {locationState.error && !locationState.hasLocation && (
            <div className="absolute top-4 left-4 right-4 z-50">
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                <p className="text-orange-800 text-sm">
                  <strong>Hinweis:</strong> {locationState.error}. Verwende die
                  Suchleiste, um zu einem Ort zu navigieren.
                </p>
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
  );
}
