import { mouldEndpoints } from '@/api/mouldApi';

// ── SPEC APIs ─────────────────────────────

const mapSpec = (item) => ({
  id: item.id,
  mouldCode: item.mouldCode,
  mouldName: item.mouldName,

  area: item.checkAreas,
  point: item.checkPoint,
  method: item.checkMethod,
  condition: item.reqCondition,
  freq: item.pmFreq,
  image: item.imageName,
  order: item.orderby,
});

export const getSpecs = async (params) => {
  const res = await mouldEndpoints.getSpecs(params);
  return res?.map(mapSpec);
};

//get by id
// ── SINGLE SPEC (GET BY ID) ─────────────────────────────

const mapSpecById = (item) => ({
  id: item.transId,

  mouldId: item.mouldMachineId,
  freq: item.pmFreqId,
  area: item.checkAreaId,
  point: item.checkPointId,
  method: item.checkMethodId,
  condition: item.reqConditionId,
  image: item.imgId,
  order: item.orderBy,
});

export const getSpecById = async (id) => {
  const res = await mouldEndpoints.getSpecsById(id);
  return mapSpecById(res);
};

//insert 

export const createSpec = async (data) => {
  const payload = {
    mouldMachineId: Number(data.mouldId) || 0,
    checkAreaId: Number(data.area) || 0,
    checkPoint: Number(data.point) || 0,
    checkMethod: Number(data.method) || 0,
    pmFreq: Number(data.freq) || 0,
    imgId: Number(data.image) || 0,
    orderby: Number(data.order) || 0,
    resultId: Number(data.condition) || 0,
    createdBy: 3,
  };



  return await mouldEndpoints.createSpec(payload);
};
//update 
export const updateSpec = async (data) => {
  const payload = {
    id: Number(data.id) || 0,
    pmFreqId: Number(data.freq) || 0,
    checkPointId: Number(data.point) || 0,
    checkMethodId: Number(data.method) || 0,
    checkAreaId: Number(data.area) || 0,
    imgId: Number(data.image) || 0,
    orderBy: Number(data.order) || 0,
    reqConditionId: Number(data.condition) || 0,
    updateBy: 3,
  };

  return await mouldEndpoints.updateSpec(payload);
};

export const deleteSpec = async (id) => {
  return await mouldEndpoints.deleteSpec(id);
};


// ── IMAGE DROPDOWN ─────────────────────────

export const getImgDropdown = async () => {
  const res = await mouldEndpoints.getimgDropdown();

  return res.map(item => ({
    label: item.name,
    value: item.id,
  }));
};

// ── ALL DROPDOWNS (single API) ─────────────────────────────
export const getSpecDropdowns = async () => {
  const res = await mouldEndpoints.getAllDropdowns(); // api/Mold/alldropdowns

  return {
    checkAreas: res.checkAreas.map(i => ({
      label: i.checkAreas,
      value: i.id,
    })),
        partNoDrp: res.partNoDrp.map(i => ({
      label: i.partNo,
      value: i.id,
    })),

    checkPoints: res.checkPoint.map(i => ({
      label: i.checkPoint,
      value: i.id,
    })),

    checkMethods: res.checkMethod.map(i => ({
      label: i.checkMethod,
      value: i.id,
    })),

    conditions: res.reqCondition.map(i => ({
      label: i.reqCondition,
      value: i.id,
    })),
  };
};


const typeMap = {
  checkAreas: 'checkAreas',
  checkPoints: 'checkPoint',
  checkMethods: 'checkMethod',
  conditions: 'reqCondition'
};

export const addSpecDropdownItem = async ({ fieldKey, value }) => {
  const payload = {
    type: typeMap[fieldKey],
    name: value,
    createdBy: 3
  };

  return await mouldEndpoints.insertDropdownItem(payload);
};