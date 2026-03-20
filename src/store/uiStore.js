import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // ── Toast ─────────────────────────────────────────────────────────────────
  toasts: [],

  showToast: ({ type = 'success', title, message, duration = 3500 }) => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, type, title, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
