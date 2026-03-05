import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  bottomSheetSnap: 'closed' | 'peek' | 'half' | 'full';
  setBottomSheetSnap: (snap: UIState['bottomSheetSnap']) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  bottomSheetSnap: 'peek',

  setBottomSheetSnap: (snap) => set({ bottomSheetSnap: snap }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
