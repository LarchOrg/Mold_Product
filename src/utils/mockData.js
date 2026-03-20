export const MOCK_MOULDS = [
  { id:1, code:'ML-0001', name:'Front Cover Mould',    size:'450×300×200', cavity:4, openingShot:120000, lifeShot:500000, currentShot:284500, location:'Shop A', partNo:'FC-2024-001', category:'A', direction:'F', pmDays:30,  pmShots:10000, barcode:'BC-001', color:'Silver', supplier:'Toyota',  maker:'MouldTech',     remarks:'High priority',           status:'Active',      usedFrom:'2020-03-15' },
  { id:2, code:'ML-0002', name:'Rear Panel Mould',     size:'600×400×250', cavity:2, openingShot:50000,  lifeShot:300000, currentShot:198000, location:'Shop B', partNo:'RP-2022-002', category:'B', direction:'R', pmDays:45,  pmShots:15000, barcode:'BC-002', color:'N/A',    supplier:'Honda',   maker:'PrecisionMolds',remarks:'Check cooling',            status:'Active',      usedFrom:'2021-06-10' },
  { id:3, code:'ML-0003', name:'Dashboard Frame',      size:'800×500×300', cavity:1, openingShot:0,      lifeShot:200000, currentShot:195600, location:'Shop A', partNo:'DF-2023-003', category:'A', direction:'F', pmDays:30,  pmShots:8000,  barcode:'BC-003', color:'Black',  supplier:'Toyota',  maker:'GlobalMolds',   remarks:'Near end of life',         status:'Maintenance', usedFrom:'2019-11-01' },
  { id:4, code:'ML-0004', name:'Door Handle Mould',    size:'200×150×100', cavity:8, openingShot:300000, lifeShot:1000000,currentShot:420000, location:'Shop C', partNo:'DH-2022-004', category:'C', direction:'F', pmDays:90,  pmShots:25000, barcode:'BC-004', color:'Chrome', supplier:'Hyundai', maker:'SmallMolds',    remarks:'Good condition',           status:'Active',      usedFrom:'2022-01-20' },
  { id:5, code:'ML-0005', name:'Side Mirror Bracket',  size:'350×250×150', cavity:4, openingShot:0,      lifeShot:400000, currentShot:380000, location:'Shop B', partNo:'SM-2021-005', category:'A', direction:'R', pmDays:30,  pmShots:5000,  barcode:'BC-005', color:'N/A',    supplier:'Nissan',  maker:'AutoMolds',     remarks:'Critical - check ejectors',status:'Critical',    usedFrom:'2020-08-12' },
  { id:6, code:'ML-0006', name:'Console Box Mould',    size:'500×350×200', cavity:2, openingShot:80000,  lifeShot:350000, currentShot:142000, location:'Shop A', partNo:'CB-2023-006', category:'B', direction:'F', pmDays:60,  pmShots:12000, barcode:'BC-006', color:'Gray',   supplier:'Toyota',  maker:'MouldTech',     remarks:'PM done Jan',              status:'Active',      usedFrom:'2023-02-28' },
  { id:7, code:'ML-0007', name:'Bumper Lower Trim',    size:'900×600×300', cavity:1, openingShot:0,      lifeShot:250000, currentShot:87500,  location:'Shop D', partNo:'BT-2024-007', category:'B', direction:'R', pmDays:45,  pmShots:18000, barcode:'BC-007', color:'N/A',    supplier:'BMW',     maker:'EuroMolds',     remarks:'Imported mould',           status:'Active',      usedFrom:'2024-01-05' },
  { id:8, code:'ML-0008', name:'Pillar Trim Mould',    size:'700×200×180', cavity:4, openingShot:200000, lifeShot:800000, currentShot:250000, location:'Shop C', partNo:'PT-2022-008', category:'C', direction:'F', pmDays:90,  pmShots:30000, barcode:'BC-008', color:'Beige',  supplier:'Honda',   maker:'PrecisionMolds',remarks:'Stable mould',             status:'Idle',        usedFrom:'2022-05-15' },
];

export const MOCK_PM_PLANS = [
  { id:1, reportNo:'PM-2026-001', mould:'ML-0001 Front Cover Mould',   partNo:'FC-2024-001', freq:'Monthly',   date:'2026-03-20', status:'Pending' },
  { id:2, reportNo:'PM-2026-002', mould:'ML-0003 Dashboard Frame',     partNo:'DF-2023-003', freq:'Monthly',   date:'2026-03-18', status:'Overdue' },
  { id:3, reportNo:'PM-2026-003', mould:'ML-0005 Side Mirror Bracket', partNo:'SM-2021-005', freq:'Monthly',   date:'2026-03-15', status:'Overdue' },
  { id:4, reportNo:'PM-2026-004', mould:'ML-0002 Rear Panel Mould',    partNo:'RP-2022-002', freq:'Quarterly', date:'2026-04-01', status:'Pending' },
  { id:5, reportNo:'PM-2025-048', mould:'ML-0004 Door Handle Mould',   partNo:'DH-2022-004', freq:'Quarterly', date:'2026-02-28', status:'Completed' },
  { id:6, reportNo:'PM-2025-047', mould:'ML-0006 Console Box Mould',   partNo:'CB-2023-006', freq:'Monthly',   date:'2026-02-15', status:'Completed' },
];

export const MOCK_SPECS = [
  { id:1, mouldCode:'ML-0001', mouldName:'Front Cover Mould', area:'Cooling System', point:'Water flow check',  method:'Visual',      condition:'OK / NG',     freq:'Monthly',   order:1 },
  { id:2, mouldCode:'ML-0001', mouldName:'Front Cover Mould', area:'Ejector Pins',   point:'Pin movement',      method:'Functional',  condition:'Pass / Fail', freq:'Monthly',   order:2 },
  { id:3, mouldCode:'ML-0002', mouldName:'Rear Panel Mould',  area:'Parting Line',   point:'Flash inspection',  method:'Visual',      condition:'OK / NG',     freq:'Quarterly', order:1 },
  { id:4, mouldCode:'ML-0003', mouldName:'Dashboard Frame',   area:'Core & Cavity',  point:'Wear measurement',  method:'Measurement', condition:'Pass / Fail', freq:'Monthly',   order:1 },
];

export const MOCK_HISTORY = [
  { id:1, reportNo:'PM-2025-048', mould:'Door Handle Mould',  type:'Quarterly', points:12, tech:'Raj Kumar',  completed:'2026-02-28', result:'Pass' },
  { id:2, reportNo:'PM-2025-047', mould:'Console Box Mould',  type:'Monthly',   points:8,  tech:'Sarah Chen', completed:'2026-02-15', result:'Pass' },
  { id:3, reportNo:'PM-2025-046', mould:'Rear Panel Mould',   type:'Monthly',   points:6,  tech:'Raj Kumar',  completed:'2026-01-31', result:'Fail' },
];

export const MOCK_USERS = [
  { id:1, name:'Admin User',   email:'admin@factory.com',  role:'Admin',      dept:'IT / Management', lastLogin:'Today, 09:15',  status:'Active' },
  { id:2, name:'Sarah Chen',   email:'s.chen@factory.com', role:'Supervisor', dept:'Production',      lastLogin:'Today, 08:30',  status:'Active' },
  { id:3, name:'Raj Kumar',    email:'r.kumar@factory.com',role:'Operator',   dept:'Shop Floor A',    lastLogin:'Yesterday',     status:'Active' },
  { id:4, name:'Mike Torres',  email:'m.torres@factory.com',role:'Operator',  dept:'Shop Floor B',    lastLogin:'2 days ago',    status:'Inactive' },
];
