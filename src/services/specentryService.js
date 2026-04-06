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

//insert 

export const createSpec = async (data) => {
  const payload = {
    mouldMachineId: Number(data.mouldId),   
    checkAreaId: Number(data.area),         
    checkPoint: Number(data.point),         
    checkMethod: Number(data.method),       
    pmFreq: Number(data.freq),              
    imgId: Number(data.image),              
    orderby: Number(data.order),            
    resultId: Number(data.condition),       
    createdBy: 3,
  };

  return await mouldEndpoints.createSpec(payload);
};

export const updateSpec = async (id, data) => {
  return await mouldEndpoints.updateSpec(id, data);
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