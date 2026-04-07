import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';

import { getMouldDropdown, getMouldMasterList ,createMould,getMouldById,updateMould      } from '@/services/mouldService';

const KEYS = {
  all: ['moulds'],
  list: (p) => ['moulds', 'list', p],
  detail: (id) => ['moulds', id],
  dropdown: ['moulds', 'dropdown'],
};

// ── DROPDOWN ─────────────────────────────────────────────
export function useMouldDropdown() {
  return useQuery({
    queryKey: KEYS.dropdown,
    queryFn: getMouldDropdown,
    staleTime: Infinity,
  });
}

// ── LIST (FIXED HERE) ─────────────────────────────────────
export function useMoulds(params) {
  return useQuery({
    queryKey: KEYS.list(params || {}),
    queryFn: () => getMouldMasterList(params || {}), // ✅ use service
    keepPreviousData: true,
  });
}

export function useMould(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getMouldById(id), // ✅ use dedicated API
    enabled: !!id,
  });
}

export function useCreateMould() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: createMould,

    onSuccess: () => {
      qc.invalidateQueries(['moulds']);

      showToast({
        type: 'success',
        title: 'Saved',
        message: 'Mould created successfully.',
      });
    },

    onError: (err) => {
      showToast({
        type: 'error',
        title: 'Error',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Insert failed',
      });
    },
  });
}

export function useUpdateMould() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: (vars) => {
      if (!vars || !vars.id) {
        console.error('❌ Invalid update payload:', vars);
        throw new Error('Invalid update data');
      }

      const { id, ...data } = vars;
      return updateMould(id, data);
    },

    onSuccess: (_, vars) => {
      qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries(KEYS.detail(vars.id));

      showToast({
        type: 'success',
        title: 'Updated',
        message: 'Mould updated successfully.',
      });
    },

    onError: (err) => {
      showToast({
        type: 'error',
        title: 'Error',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Update failed',
      });
    },
  });
}

export function useDeleteMould() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: mouldEndpoints.remove,
    onSuccess: () => {
      qc.invalidateQueries(KEYS.all);
      showToast({ type: 'success', title: 'Deleted', message: 'Mould deleted.' });
    },
    onError: (err) => showToast({ type: 'error', title: 'Error', message: err.message }),
  });
}
