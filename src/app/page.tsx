import Header from '@/components/layout/Header';
import MapView from '@/components/map/MapView';
import SidebarPlaceholder from '@/components/layout/SidebarPlaceholder';
import MobileBottomSheet from '@/components/layout/MobileBottomSheet';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[420px] flex-col border-r border-[#E8E4D8] bg-white overflow-y-auto">
          <SidebarPlaceholder />
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <MapView />
        </main>
      </div>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet className="lg:hidden" />
    </div>
  );
}
