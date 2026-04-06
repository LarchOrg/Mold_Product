import { mouldEndpoints } from '@/api/mouldApi';

// ── MAP FUNCTION (VERY IMPORTANT) ───────────────────────────
const mapChecksheet = (item) => ({
  transId: item.transId,
  reportNo: item.reportNo,
  mould: item.mould,
  partNo: item.partNo,

  freq: item.pmFreq,        // match UI key
  date: formatDate(item.targetDate),
  status: item.status,

  // optional helpers
  isOverdue: item.status === 'Overdue',
});

// ── GET LIST ────────────────────────────────────────────────
export const getChecksheetList = async () => {
  const res = await mouldEndpoints.getChecksheet();
  console.log("API Response:", res); // 👈 check here
  return res.map(mapChecksheet);
};
// ── SAVE CHECKSHEET ─────────────────────────────────────────
export const saveChecksheet = async (data) => {
  const payload = {
    transId: data.transId,
    details: data.results.map(r => ({
      specId: Number(r.specId),
      result: r.result,
    })),
    createdBy: 3,
  };

  return await mouldEndpoints.saveChecksheet(payload);
};

// ── HELPER ──────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-';

  const [day, month, year] = dateStr.split('.');
  return `${day}-${month}-${year}`; // keep UI format
};