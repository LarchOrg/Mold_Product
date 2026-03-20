import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token:   null,
      user:    null,
      isAuth:  false,

      login: ({ token, user }) =>
        set({ token, user, isAuth: true }),

      logout: () =>
        set({ token: null, user: null, isAuth: false }),

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'erp-auth',         // localStorage key
      partialize: (s) => ({ token: s.token, user: s.user, isAuth: s.isAuth }),
    }
  )
);
