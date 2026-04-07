// ── useSpecEntry.js ─────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';

import {
  getSpecs,
  createSpec,
  updateSpec,
  deleteSpec,
//   getSpecById,
  getImgDropdown,
  getSpecDropdowns,
  addSpecDropdownItem ,
} from '@/services/specentryService';

// ── QUERY KEYS ─────────────────────────────────────────────
const KEYS = {
  all: ['specs'],
  list: (p) => ['specs', 'list', p],
  detail: (id) => ['specs', id],
  imgDropdown: ['imgDropdown'],
};

// ── IMAGE DROPDOWN ─────────────────────────────────────────
export function useImgDropdown() {
  return useQuery({
    queryKey: KEYS.imgDropdown,
    queryFn: getImgDropdown,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
// ── ALL DROPDOWNS HOOK ─────────────────────────────
export const useSpecDropdowns = () =>
  useQuery({
    queryKey: ['specDropdowns'],
    queryFn: getSpecDropdowns,
    staleTime: 5 * 60 * 1000,
  });
// ── GET ALL SPECS ──────────────────────────────────────────
// export function useSpecs(params) {
//   return useQuery({
//     queryKey: KEYS.list(params),
//     queryFn: () => getSpecs(params),
//     keepPreviousData: true,
//     enabled: true,
//   });
// }
export function useSpecs(params) {
   console.log('useSpecs hook called');
  return useQuery({
    queryKey: KEYS.list(params || {}),
    queryFn: () => getSpecs(params || {}),
    keepPreviousData: true,
    enabled: true,
  });
}

// ── GET BY ID ─────────────────────────────────────────────
export function useSpec(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getSpecById(id),
    enabled: !!id,
  });
}

export const useAddSpecDropdownItem = () => {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let savingToastId = null;

  return useMutation({
    mutationFn: (payload) => addSpecDropdownItem(payload),

    onMutate: () => {
      savingToastId = showToast({
        type: 'info',
        title: 'Saving...',
        message: 'Adding new item.',
        autoClose: false,
      });
    },

    onSuccess: () => {
      if (savingToastId) removeToast(savingToastId);

      // ✅ Refresh dropdowns
      qc.invalidateQueries(['specDropdowns']);  

      showToast({
        type: 'success',
        title: 'Added',
        message: 'Item added successfully.',
      });
    },

    onError: (err) => {
      if (savingToastId) removeToast(savingToastId);

      showToast({
        type: 'error',
        title: 'Error',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Failed to add item',
      });
    },
  });
};

// ── CREATE ────────────────────────────────────────────────
export function useCreateSpec() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let savingToastId = null;

  return useMutation({
    mutationFn: (payload) => createSpec(payload), // ✅ pass payload

    onMutate: () => {
      savingToastId = showToast({
        type: 'info',
        title: 'Saving...',
        message: 'Spec is being saved.',
        autoClose: false,
      });
    },

    onSuccess: () => {
      if (savingToastId) removeToast(savingToastId);

      qc.invalidateQueries(['specs']); // ✅ better key

      showToast({
        type: 'success',
        title: 'Created',
        message: 'Spec created successfully.',
      });
    },

    onError: (err) => {
      if (savingToastId) removeToast(savingToastId);

      showToast({
        type: 'error',
        title: 'Error',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Something went wrong',
      });
    },
  });
}

// ── UPDATE ────────────────────────────────────────────────
export function useUpdateSpec() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, ...data }) => updateSpec(id, data),

    onSuccess: (_, vars) => {
      qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries(KEYS.detail(vars.id));

      showToast({
        type: 'success',
        title: 'Updated',
        message: 'Spec updated successfully.',
      });
    },

    onError: (err) => {
      const message =
        err?.response?.data?.message || err?.message || 'Something went wrong';

      showToast({
        type: 'error',
        title: 'Error',
        message,
      });
    },
  });
}

// ── DELETE ────────────────────────────────────────────────
export function useDeleteSpec() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let deletingToastId = null;

  return useMutation({
    mutationFn: (id) => deleteSpec(id),

    onMutate: (id) => {
      deletingToastId = showToast({
        type: 'info',
        title: 'Deleting...',
        message: `Spec ${id} is being deleted.`,
        autoClose: false,
      });
    },

    onSuccess: (_, id) => {
      if (deletingToastId) removeToast(deletingToastId);

      qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries(KEYS.detail(id));

      showToast({
        type: 'success',
        title: 'Deleted',
        message: `Spec ${id} deleted successfully.`,
      });
    },

    onError: (err) => {
      if (deletingToastId) removeToast(deletingToastId);

      const message =
        err?.response?.data?.message || err?.message || 'Something went wrong';

      showToast({
        type: 'error',
        title: 'Error',
        message,
      });
    },
  });
}