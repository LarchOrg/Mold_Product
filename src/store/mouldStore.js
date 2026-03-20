import { create } from 'zustand';

export const useMouldStore = create((set, get) => ({
  moulds:        [],
  pmPlans:       [],
  specs:         [],
  selectedMould: null,

  // ── Filters & Pagination ──────────────────────────────────────────────────
  filters: { search: '', category: 'all', status: 'all' },
  pagination: { page: 1, pageSize: 15, total: 0 },

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters }, pagination: { ...s.pagination, page: 1 } })),

  setPage: (page) =>
    set((s) => ({ pagination: { ...s.pagination, page } })),

  // ── Setters ───────────────────────────────────────────────────────────────
  setMoulds: (moulds, total) =>
    set((s) => ({ moulds, pagination: { ...s.pagination, total } })),

  setPMPlans: (pmPlans) => set({ pmPlans }),

  setSpecs: (specs) => set({ specs }),

  selectMould: (mould) => set({ selectedMould: mould }),

  // ── Local CRUD helpers (optimistic UI) ───────────────────────────────────
  addMould: (mould) =>
    set((s) => ({ moulds: [mould, ...s.moulds] })),

  updateMould: (id, updates) =>
    set((s) => ({
      moulds: s.moulds.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  removeMould: (id) =>
    set((s) => ({ moulds: s.moulds.filter((m) => m.id !== id) })),
}));
