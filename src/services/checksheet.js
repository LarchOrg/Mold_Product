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

// ── MAP DETAILS (FOR MODAL) ───────────────────────────
const mapChecksheetDetails = (res) => {
  const list = Array.isArray(res) ? res : [res];

  return list.map(item => ({
    id: item.id,

    area: item.checkArea,
    point: item.checkPoint,
    method: item.checkMethod,
    condition: item.reqCondition,

    // modal fields
    currentStatus: item.judgement || '',
    correctiveAction: item.actionTaken || '',
    remarks: item.remarks || '',

    beforeImg: item.beforeImg || null,
    afterImg: item.afterImg || null,

    // if you later show image
    specImage: item.imageName || null,
  }));
};

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

// ── CREATE CHECKSHEET ───────────────────────────────────────
export const checksheetService = {
  createCheckSheet: async (plan) => {
    const payload = {
      reportNo: plan.transId,
      prepareBy: 'admin',
      createdBy: 3
    };

    console.log('Mapped Payload:', payload);

    return await mouldEndpoints.createCheckSheet(payload);
  },

  // ✅ NEW
  getChecksheetDetails: async (id) => {
    const res = await mouldEndpoints.getChecksheetDetails(id);
    console.log('Details API:', res);
    return mapChecksheetDetails(res);
  }
};



// ── HELPER ──────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-';

  const [day, month, year] = dateStr.split('.');
  return `${day}-${month}-${year}`; // keep UI format
};