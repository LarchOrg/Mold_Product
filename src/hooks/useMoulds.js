import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mouldEndpoints } from '@/api/mouldApi';
import { useUIStore }     from '@/store/uiStore';

import { getMouldDropdown } from '@/services/mouldService';
const KEYS = {
  all:    ['moulds'],
  list:   (p) => ['moulds', 'list', p],
  detail: (id) => ['moulds', id],

    dropdown: ['moulds', 'dropdown'],
};


export function useMouldDropdown() {
  return useQuery({
    queryKey: KEYS.dropdown,
    queryFn: getMouldDropdown, // ✅ using service (clean)
    staleTime: Infinity,       // optional (best for dropdown)
  });
}

export function useMoulds(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn:  () => mouldEndpoints.getAll(params),
    keepPreviousData: true,
  });
}

export function useMould(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => mouldEndpoints.getById(id),
    enabled:  !!id,
  });
}

export function useCreateMould() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: mouldEndpoints.create,
    onSuccess: () => {
      qc.invalidateQueries(KEYS.all);
      showToast({ type: 'success', title: 'Saved', message: 'Mould created successfully.' });
    },
    onError: (err) => showToast({ type: 'error', title: 'Error', message: err.message }),
  });
}

export function useUpdateMould() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, ...data }) => mouldEndpoints.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries(KEYS.detail(vars.id));
      showToast({ type: 'success', title: 'Updated', message: 'Mould updated successfully.' });
    },
    onError: (err) => showToast({ type: 'error', title: 'Error', message: err.message }),
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
