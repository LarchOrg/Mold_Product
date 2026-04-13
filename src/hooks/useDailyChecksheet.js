import { useQuery, useMutation } from '@tanstack/react-query';
import { useUIStore } from '@/store/uiStore';
import { getDailyChecksheetList,createDailyChecksheet   } from '@/services/Dailychecksheet';


// ── QUERY KEYS ─────────────────────────────────────────────
const KEYS = {
  all: ['daily-checksheet'],
  list: ['daily-checksheet', 'list'],
};


// ── GET DAILY LIST ─────────────────────────────────────────
export function useDailyChecksheetList() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: getDailyChecksheetList,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// insert new daily checksheet
export function useCreateDailyChecksheet() {
  const { showToast } = useUIStore();

  return useMutation({
    mutationFn: createDailyChecksheet,

    onSuccess: (data) => {
      showToast({
        type: 'success',
        title: 'Success',
        message: data?.message || 'Daily Checksheet created successfully.',
      });
    },

    onError: (error) => {
      console.error(error);

      showToast({
        type: 'error',
        title: 'Failed',
        message: error?.message || 'Insert failed.',
      });
    }
  });
}