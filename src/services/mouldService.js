// src/services/mouldService.js
import { mouldEndpoints } from '../api/mouldApi';


// ── Mappers ───────────────────────────────────────────────────────────────────
export function mapMouldDropdown(raw) {
  return {
    label: raw.name,   // mould name
    value: raw.id,     // mould id
  };
}
export function mapMouldDropdownList(rawList) {
  return rawList.map(mapMouldDropdown);
}

export async function getMouldDropdown() {
  const data = await mouldEndpoints.getDropdown();
  return mapMouldDropdownList(data);
}


//pmdropdown
export function mapPMDropdown(raw) {
  return {
    label: raw.name,   // mould name
    value: raw.id,     // mould id
  };
}
export function mapPMDropdownList(rawList) {
  return rawList.map(mapPMDropdown);
}

export async function getpmDropdown() {
  const data = await mouldEndpoints.getPMDropdown();
  return mapPMDropdownList(data);
}

// Map single mould from backend shape → UI shape
export function mapMould(raw) {
  return {
    id:          raw.mouldId      ?? raw.id,
    code:        raw.modelCode    ?? raw.code,
    name:        raw.mouldName    ?? raw.name,
    size:        raw.mouldSize    ?? raw.size,
    cavity:      raw.cavityCount  ?? raw.cavity,
    currentShot: raw.runningShot  ?? raw.currentShot,
    lifeShot:    raw.maximumShot  ?? raw.lifeShot,
    openingShot: raw.openingShot  ?? 0,
    status:      raw.mouldStatus  ?? raw.status,
    category:    raw.riskCategory ?? raw.category,
    location:    raw.location,
    partNo:      raw.partNo       ?? raw.partNumber,
    pmDays:      raw.pmFreqDays   ?? raw.pmDays,
    pmShots:     raw.pmFreqShots  ?? raw.pmShots,
    barcode:     raw.barcode,
    color:       raw.mouldColor   ?? raw.color,
    supplier:    raw.customer     ?? raw.supplier,
    maker:       raw.maker        ?? raw.supplier,
    remarks:     raw.remarks,
    usedFrom:    raw.installDate  ?? raw.usedFrom,
  };
}

// Map array of moulds
export function mapMoulds(rawList) {
  return rawList.map(mapMould);
}

// Map UI form data → backend shape (for POST/PUT)
export function mapMouldToPayload(formData) {
  return {
    modelCode:    formData.code,
    mouldName:    formData.name,
    mouldSize:    formData.size,
    cavityCount:  Number(formData.cavity),
    openingShot:  Number(formData.openingShot),
    maximumShot:  Number(formData.lifeShot),
    location:     formData.location,
    partNumber:   formData.partNo,
    pmFreqDays:   Number(formData.pmDays),
    pmFreqShots:  Number(formData.pmShots),
    barcode:      formData.barcode,
    mouldColor:   formData.color,
    customer:     formData.supplier,
    maker:        formData.maker,
    remarks:      formData.remarks,
    installDate:  formData.usedFrom,
    riskCategory: formData.category,
  };
}

// ── Business Logic ────────────────────────────────────────────────────────────

export function getMouldHealthStatus(mould) {
  const used  = mould.currentShot - mould.openingShot;
  const total = mould.lifeShot    - mould.openingShot;
  if (total <= 0) return { pct: 0, color: 'var(--green)', label: 'Healthy' };
  const pct = Math.min(100, Math.round((used / total) * 100));
  if (pct >= 85) return { pct, color: 'var(--red)',   label: 'Critical' };
  if (pct >= 60) return { pct, color: 'var(--amber)', label: 'Warning' };
  return               { pct, color: 'var(--green)', label: 'Healthy' };
}

export function isPMDue(mould) {
  const health = getMouldHealthStatus(mould);
  return health.pct >= 85 || mould.status === 'Maintenance';
}