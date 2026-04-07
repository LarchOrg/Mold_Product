import { mouldApi } from './axiosInstance';
//used for api endpoints
export const mouldEndpoints = {
  // ── Mould Master ──────────────────────────────────────────────────────────
  getAll:   (params)  => mouldApi.get('api/Mold/MouldMstFetch', { params }).then(r => r.data),
getById: (id) => mouldApi.get(`/api/Mold/mouldbyid/${id}`).then(r => r.data),
  create:   (payload) => mouldApi.post('api/Mold/InsertMould', payload).then(r => r.data),
 update: (payload) =>
  mouldApi.put('/api/Mold/UpdateMouldMst', payload).then(r => r.data),
  remove:   (id)      => mouldApi.delete(`/api/moulds/${id}`).then(r => r.data),
   getDropdown: () => mouldApi.get('/api/Mold/dropdown').then(r => r.data),
  getPMDropdown: () => mouldApi.get('/api/Mold/PMFreqdropdown').then(r => r.data),
  // ── PM Plans ──────────────────────────────────────────────────────────────
  
  getPMPlans:    (params)      => mouldApi.get('/api/mold/pmplan', { params }).then(r => r.data),
  getPMPlansById:  (id)      => mouldApi.get(`/api/Mold/pmschedulebyid/${id}`).then(r => r.data),
  createPMPlan:  (payload)     => mouldApi.post('/api/Mold/pmschedule', payload).then(r => r.data),
updatePMPlan: (payload) =>  mouldApi.put(`/api/Mold/pmscheduleUpdate`, payload).then(r => r.data),
  deletePMPlan:  (id)          => mouldApi.delete(`/api/Mold/pmplan/${id}`).then(r => r.data),

  // ── Spec Entry ────────────────────────────────────────────────────────────
  getSpecs:   (params)      => mouldApi.get('/api/Mold/MoldSpecFetch', { params }).then(r => r.data),
  createSpec: (payload)     => mouldApi.post('/api/Mold/Insertspecentry', payload).then(r => r.data),
  updateSpec: (id, payload) => mouldApi.put(`/api/specs/${id}`, payload).then(r => r.data),
  deleteSpec: (id)          => mouldApi.delete(`/api/specs/${id}`).then(r => r.data),
  uploadSpecCsv: (formData) => mouldApi.post('/api/specs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
   getimgDropdown: () => mouldApi.get('/api/Mold/Imgdropdown').then(r =>r.data),
   getAllDropdowns: () => mouldApi.get('/api/Mold/alldropdowns').then(r => r.data),
insertDropdownItem: (payload) =>
  mouldApi.post('/api/Mold/Insert-CheckAll', payload).then(r => r.data),
  // ── Checksheet ────────────────────────────────────────────────────────────
getChecksheet: () =>
  mouldApi.get('api/Mold/PMCheckSheetFetch').then(r => r.data),
  saveChecksheet: (payload) => mouldApi.post('/api/checksheets', payload).then(r => r.data),

  // ── Reports ───────────────────────────────────────────────────────────────
  getLifeReport: (params)  => mouldApi.get('/api/reports/life', { params }).then(r => r.data),
  getPMHistory:  (params)  => mouldApi.get('/api/reports/pm-history', { params }).then(r => r.data),
  getDashboard:  ()        => mouldApi.get('/api/reports/dashboard').then(r => r.data),
};
