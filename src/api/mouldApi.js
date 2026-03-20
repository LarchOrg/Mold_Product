import { mouldApi } from './axiosInstance';
//used for api endpoints
export const mouldEndpoints = {
  // ── Mould Master ──────────────────────────────────────────────────────────
  getAll:   (params)  => mouldApi.get('/api/moulds', { params }).then(r => r.data),
  getById:  (id)      => mouldApi.get(`/api/moulds/${id}`).then(r => r.data),
  create:   (payload) => mouldApi.post('/api/moulds', payload).then(r => r.data),
  update:   (id, payload) => mouldApi.put(`/api/moulds/${id}`, payload).then(r => r.data),
  remove:   (id)      => mouldApi.delete(`/api/moulds/${id}`).then(r => r.data),

  // ── PM Plans ──────────────────────────────────────────────────────────────
  getPMPlans:    (params)      => mouldApi.get('/api/pm-plans', { params }).then(r => r.data),
  createPMPlan:  (payload)     => mouldApi.post('/api/pm-plans', payload).then(r => r.data),
  updatePMPlan:  (id, payload) => mouldApi.put(`/api/pm-plans/${id}`, payload).then(r => r.data),
  deletePMPlan:  (id)          => mouldApi.delete(`/api/pm-plans/${id}`).then(r => r.data),

  // ── Spec Entry ────────────────────────────────────────────────────────────
  getSpecs:   (params)      => mouldApi.get('/api/specs', { params }).then(r => r.data),
  createSpec: (payload)     => mouldApi.post('/api/specs', payload).then(r => r.data),
  updateSpec: (id, payload) => mouldApi.put(`/api/specs/${id}`, payload).then(r => r.data),
  deleteSpec: (id)          => mouldApi.delete(`/api/specs/${id}`).then(r => r.data),
  uploadSpecCsv: (formData) => mouldApi.post('/api/specs/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),

  // ── Checksheet ────────────────────────────────────────────────────────────
  getChecksheet:  (planId)  => mouldApi.get(`/api/checksheets/${planId}`).then(r => r.data),
  saveChecksheet: (payload) => mouldApi.post('/api/checksheets', payload).then(r => r.data),

  // ── Reports ───────────────────────────────────────────────────────────────
  getLifeReport: (params)  => mouldApi.get('/api/reports/life', { params }).then(r => r.data),
  getPMHistory:  (params)  => mouldApi.get('/api/reports/pm-history', { params }).then(r => r.data),
  getDashboard:  ()        => mouldApi.get('/api/reports/dashboard').then(r => r.data),
};
