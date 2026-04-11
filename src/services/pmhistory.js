// ── pmReportService.js ───────────────────────────────────────────
import { mouldEndpoints } from '@/api/mouldApi';

// ── DATE FORMAT (if needed) ───────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '';

  if (d.includes('.')) {
    const [day, month, year] = d.split('.');
    return `${year}-${month}-${day}`;
  }

  return d;
};

const mapFromApi = (item) => ({
  TransId: item.transId,
  ReportNo: item.reportNo,
  Mould: item.mould,
  MouldName: item.mouldName,
  Date: formatDate(item.date),
  TargetDate: formatDate(item.targetDate),
  Prepared: item.prepared,
  Checked: item.checked,
  Approved: item.approved,
  Status: item.status,
});

export const getPMHistory = async (fromDate, toDate) => {
  const res = await mouldEndpoints.getPMHistory(fromDate, toDate);  // ← was getPMReport
  return res.map(mapFromApi);
};