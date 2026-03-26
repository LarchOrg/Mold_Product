// ── pmPlanService.js ───────────────────────────────────────────
import { mouldEndpoints } from '@/api/mouldApi';

const TODAY = new Date().toISOString().split('T')[0];

// ── MAPPING HELPERS ─────────────────────────────────────────────
const formatToApiDate = (d) => {
  if (!d) return '';

  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`; // ✅ convert back for API
};
// UI → API
const mapToApiPayload = (data) => {
  return {
    dDate: data.planType === 'daily'
      ? TODAY
      : formatToApiDate(data.date),   // ✅ FIX HERE

    iMouldId: Number(data.mouldId),
    iPMFreq: data.planType === 'daily'
      ? 6
      : Number(data.pmId || 0),

    iCreatedBy: 3,
  };
};

const formatDate = (d) => {
  if (!d) return '';

  // handle DD/MM/YYYY
  if (d.includes('/')) {
    const [day, month, year] = d.split('/');
    return `${year}-${month}-${day}`;
  }

  // handle DD.MM.YYYY
  if (d.includes('.')) {
    const [day, month, year] = d.split('.');
    return `${year}-${month}-${day}`;
  }

  // handle ISO (YYYY-MM-DD or with T)
  if (d.includes('T')) {
    return d.split('T')[0];
  }

  return d;
};

// API → UI
const mapFromApi = (item) => ({
  id: item.transId,
  reportNo: item.reportNo || `PM-${item.id}`,
  mould: item.mould || '',
  mouldId: item.iMouldId,
  partNo: item.partNo || '',
  freq: item.iPMFreq === 1 ? 'Daily' : 'Monthly',
   date: formatDate(item.date), 
  status: item.status || 'Pending',
});

// ── SERVICE FUNCTIONS ───────────────────────────────────────────

// CREATE
export const createPMPlan = async (data) => {
  const payload = mapToApiPayload(data);
  return await mouldEndpoints.createPMPlan(payload);
};

// GET ALL
export const getPMPlans = async (params) => {
  const res = await mouldEndpoints.getPMPlans(params);
  return res.map(mapFromApi);
};

// GET BY ID
export const getPMPlanById = async (id) => {
  const res = await mouldEndpoints.getPMPlansById(id);
  return mapFromApi(res);
};

// UPDATE
export const updatePMPlan = async (id, data) => {
  const payload = {
    id: id,
     dDate: formatDate(data.date),  // only what API needs
  };

  return await mouldEndpoints.updatePMPlan(id, payload);
};

// DELETE
export const deletePMPlan = async (id) => {
  return await mouldEndpoints.remove(id);
};