// ── pmHistoryHooks.js ─────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { getPMHistory  } from '@/services/pmhistory';

// ── QUERY KEYS ────────────────────────────────────────────────
const KEYS = {
  pmReport: (fromDate, toDate) => ['pmReport', fromDate, toDate],
};

export function usePMHistory(fromDate, toDate) {
  return useQuery({
    queryKey: KEYS.pmReport(fromDate, toDate),
    queryFn: () => getPMHistory(fromDate, toDate),
    enabled: !!fromDate && !!toDate,  // fires immediately on mount
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
}