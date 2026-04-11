import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';
import { getChecksheetList, saveChecksheet ,checksheetService,updateChecksheet,completeChecksheet  } from '@/services/checksheet';

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
// export function useSaveChecksheet() {
//   const qc = useQueryClient();
//   const { showToast, removeToast } = useUIStore();
//   let savingToastId = null;

//   return useMutation({
//     mutationFn: (payload) => saveChecksheet(payload),

//     onMutate: () => {
//       savingToastId = showToast({
//         type: 'info',
//         title: 'Saving...',
//         message: 'Checksheet is being saved.',
//         autoClose: false,
//       });
//     },

//     onSuccess: () => {
//       if (savingToastId) removeToast(savingToastId);

//       qc.invalidateQueries(KEYS.all);

//       showToast({
//         type: 'success',
//         title: 'Saved',
//         message: 'Checksheet saved successfully.',
//       });
//     },

//     onError: (err) => {
//       if (savingToastId) removeToast(savingToastId);

//       showToast({
//         type: 'error',
//         title: 'Error',
//         message:
//           err?.response?.data?.message ||
//           err?.message ||
//           'Something went wrong',
//       });
//     },
//   });
// }

// create checksheet
export function useSaveChecksheet() {
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await checksheetService.createCheckSheet(payload);

      // 🔥 Handle API-level failure (success:false)
      if (!res?.success) {
        throw new Error(res?.message || 'Checksheet insert failed.');
      }

      return res;
    },

    onSuccess: (data) => {
      showToast({
        type: 'success',
        title: 'Success',
        message: data?.message || 'Checksheet created successfully.',
      });
    },

    onError: (error) => {
      console.error(error);

      showToast({
        type: 'error',
        title: 'Failed',
        // ✅ Show actual backend message
        message: error?.message || 'Checksheet insert failed.',
      });
    }
  });
}


export const useChecksheetDetails = () => {
  return useMutation({
    mutationFn: async (id) => {
      // 🔥 call service
      const data = await checksheetService.getChecksheetDetails(id);
      return data;
    }
  });
};

// ── UPDATE CHECKSHEET ───────────────────────────────────────
export function useUpdateChecksheet() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let updatingToastId = null;

  return useMutation({
    mutationFn: async (payload) => {
      const res = await updateChecksheet(payload);

      // handle API-level failure
      if (!res?.success) {
        throw new Error(res?.message || 'Update failed.');
      }

      return res;
    },

    onMutate: () => {
      updatingToastId = showToast({
        type: 'info',
        title: 'Updating...',
        message: 'Checksheet is being updated.',
        autoClose: false,
      });
    },

    onSuccess: (data) => {
      if (updatingToastId) removeToast(updatingToastId);

      // 🔥 refresh list after update
      // qc.invalidateQueries(KEYS.all);
      qc.invalidateQueries({ queryKey: KEYS.all });

      showToast({
        type: 'success',
        title: 'Updated',
        message: data?.message || 'Checksheet updated successfully.',
      });
    },

    onError: (error) => {
      if (updatingToastId) removeToast(updatingToastId);

      console.error(error);

      showToast({
        type: 'error',
        title: 'Failed',
        message: error?.message || 'Update failed.',
      });
    },
  });
}

// ── COMPLETE CHECKSHEET ─────────────────────────────────────
export function useCompleteChecksheet() {
  const qc = useQueryClient();
  const { showToast, removeToast } = useUIStore();
  let completingToastId = null;

  return useMutation({
    mutationFn: async (payload) => {
      const res = await completeChecksheet(payload);

      // 🔥 handle API-level failure
      if (!res?.success) {
        throw new Error(res?.message || 'Complete failed.');
      }

      return res;
    },

    onMutate: () => {
      completingToastId = showToast({
        type: 'info',
        title: 'Completing...',
        message: 'Closing checksheet...',
        autoClose: false,
      });
    },

    onSuccess: (data) => {
      if (completingToastId) removeToast(completingToastId);

      // ✅ refresh list after complete
      qc.invalidateQueries({ queryKey: KEYS.all });

      showToast({
        type: 'success',
        title: 'Completed',
        message: data?.message || 'Checksheet completed successfully.',
      });
    },

    onError: (error) => {
      if (completingToastId) removeToast(completingToastId);

      console.error(error);

      showToast({
        type: 'error',
        title: 'Failed',
        message: error?.message || 'Complete failed.',
      });
    },
  });
}