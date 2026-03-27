import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mouldEndpoints } from '@/api/mouldApi';
import { useUIStore } from '@/store/uiStore';

import { getpmDropdown } from '@/services/mouldService';
// (optional) use service for mapping
import {
  createPMPlan,
  getPMPlans,
  updatePMPlan,
  deletePMPlan,
  getPMPlanById,

} from '@/services/pmPlanService';

// ── QUERY KEYS ─────────────────────────────────────────────
const KEYS = {
  all: ['pmPlans'],
  list: (p) => ['pmPlans', 'list', p],
  detail: (id) => ['pmPlans', id],
  pmDropdown: ['pmDropdown'],
};


// ── GET PM DROPDOWN ─────────────────────────
export function usePMDropdown() {
  return useQuery({
    queryKey: KEYS.pmDropdown,
    queryFn: getpmDropdown,
    staleTime: 5 * 60 * 1000, // optional: 5 minutes cache
    refetchOnWindowFocus: false, // optional
  });
}

// ── GET ALL ───────────────────────────────────────────────
// ⚠️ Use when backend supports GET
export function usePMPlans(params) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getPMPlans(params), // using service (mapping)
    keepPreviousData: true,
    enabled: true, //  disable for now if API not ready
  });
}

// ── GET BY ID ─────────────────────────────────────────────
export function usePMPlan(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getPMPlanById(id), // ✅ correct
    enabled: !!id,
  });
}

// ── CREATE ───────────────────────────────────────────────
export function useCreatePMPlan() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let savingToastId = null;

  return useMutation({
    mutationFn: createPMPlan,

    // 🔹 called immediately when mutation starts
    onMutate: () => {
      savingToastId = showToast({
        type: 'info',
        title: 'Saving...',
        message: 'Your PM Plan is being saved.',
        autoClose: false, // keep until we remove manually
      });
    },

    onSuccess: () => {
      // hide the saving toast
      if (savingToastId) removeToast(savingToastId);

      qc.invalidateQueries(KEYS.all);

      showToast({
        type: 'success',
        title: 'Created',
        message: 'PM Plan created successfully.',
      });
    },

    onError: (err) => {
      // hide the saving toast
      if (savingToastId) removeToast(savingToastId);

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

// ── UPDATE ───────────────────────────────────────────────
export function useUpdatePMPlan() {
  const qc = useQueryClient();
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, ...data }) => updatePMPlan(id, data),

    onSuccess: (_, vars) => {
      qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries(KEYS.detail(vars.id));

      showToast({
        type: 'success',
        title: 'Updated',
        message: 'PM Plan updated successfully.',
      });
    },

    onError: (err) =>
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message,
      }),
  });
}


// ── DELETE ───────────────────────────────────────────────
export function useDeletePMPlan() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let deletingToastId = null;

  return useMutation({
    // 🔹 Ensure we correctly pass id to service
    mutationFn: (id) => deletePMPlan(id),

    onMutate: (id) => {
      // optional: show deleting toast
      deletingToastId = showToast({
        type: 'info',
        title: 'Deleting...',
        message: `PM Plan ${id} is being deleted.`,
        autoClose: false,
      });
    },

    onSuccess: (_, id) => {
      // remove deleting toast
      if (deletingToastId) removeToast(deletingToastId);

      // refresh list and/or detail
      qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries(KEYS.detail(id));

      showToast({
        type: 'success',
        title: 'Deleted',
        message: `PM Plan ${id} deleted successfully.`,
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