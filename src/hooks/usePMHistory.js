// ── pmHistoryHooks.js ─────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { getPMHistory  } from '@/services/pmhistory';

// ── QUERY KEYS ────────────────────────────────────────────────
const KEYS = {
  pmReport: (fromDate, toDate) => ['pmReport', fromDate, toDate],
};

export function usePMHistory(fromDate, toDate, enabled = false) {
  return useQuery({
    queryKey: KEYS.pmReport(fromDate, toDate),
    queryFn: () => getPMHistory(fromDate, toDate),
    enabled: enabled && !!fromDate && !!toDate,  // ← only runs when Search is clicked
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
}