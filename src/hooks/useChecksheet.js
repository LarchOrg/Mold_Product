import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';
import { getChecksheetList, saveChecksheet } from '@/services/checksheet';

// ── QUERY KEYS ─────────────────────────────────────────────
const KEYS = {
  all: ['checksheet'],
  list: ['checksheet', 'list'],
};

// ── GET LIST ───────────────────────────────────────────────
export function useChecksheetList() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: getChecksheetList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ── SAVE ───────────────────────────────────────────────────
export function useSaveChecksheet() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let savingToastId = null;

  return useMutation({
    mutationFn: (payload) => saveChecksheet(payload),

    onMutate: () => {
      savingToastId = showToast({
        type: 'info',
        title: 'Saving...',
        message: 'Checksheet is being saved.',
        autoClose: false,
      });
    },

    onSuccess: () => {
      if (savingToastId) removeToast(savingToastId);

      qc.invalidateQueries(KEYS.all);

      showToast({
        type: 'success',
        title: 'Saved',
        message: 'Checksheet saved successfully.',
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