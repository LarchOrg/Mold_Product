import { mouldEndpoints } from '@/api/mouldApi';


// ── MAP FUNCTION ───────────────────────────────────────────
const mapDailyChecksheet = (item, index) => ({
  id: item.transId,
  transId: item.transId,

  sNo: index + 1,

  reportNo: item.reportNo,
  mould: item.mould,
  partNo: item.partNo,

  freq: item.pmFreq,              // match UI key
  date: formatDate(item.targetDate),
  status: item.status,

  // helpers
  isOverdue: item.status === 'Overdue',
});


// ── GET DAILY LIST ─────────────────────────────────────────
export const getDailyChecksheetList = async () => {
  const res = await mouldEndpoints.getDailyChecksheet();

  console.log('Daily API Response:', res);

  return res.map(mapDailyChecksheet);
};

// ── CREATE DAILY CHECKSHEET ───────────────────────────────
export const createDailyChecksheet = async (plan) => {
  const payload = {
    reportNo: plan.transId,   // same as PM
    prepareBy: 'admin',
    createdBy: 3,
  };

  console.log('Daily Create Payload:', payload);

  return await mouldEndpoints.createCheckSheet(payload);
};


// ── HELPER ────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-';

  const [day, month, year] = dateStr.split('.');
  return `${day}-${month}-${year}`; // keep UI format same as PM
};