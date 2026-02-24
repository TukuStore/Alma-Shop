import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';

interface AdminStore {
    // Auth
    user: AdminUser | null;
    isAuthLoading: boolean;
    setUser: (user: AdminUser | null) => void;
    setAuthLoading: (loading: boolean) => void;

    // UI
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

export const useAdminStore = create<AdminStore>()(
    persist(
        (set) => ({
            // Auth
            user: null,
            isAuthLoading: false,  // start false if using persist
            setUser: (user) => set({ user, isAuthLoading: false }),
            setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

            // UI
            sidebarOpen: true,
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
            toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        }),
        {
            name: 'admin-store',
            partialize: (state) => ({ user: state.user, sidebarOpen: state.sidebarOpen }),
        }
    )
);
