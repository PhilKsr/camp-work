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

export default function Home() {
  const { selectedCampground, setSelectedCampground } = useMapStore();
  const { data: campgroundsData } = useCampgrounds();

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
        </main>
      </div>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet
        className="lg:hidden"
        selectedCampground={selectedCampgroundData}
        onCloseDetail={handleCloseDetail}
      />

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
