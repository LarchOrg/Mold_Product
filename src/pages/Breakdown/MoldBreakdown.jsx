import { useState, useEffect } from 'react';
import PageHeader      from '@/components/layout/PageHeader';
import Button          from '@/components/common/Button';
import DataTable       from '@/components/table/DataTable';
import Modal           from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';

/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════════════════ */
const MOCK_MACHINES = [
  { id: '1', name: 'INJECTION M/C – 01 (250T)' },
  { id: '2', name: 'INJECTION M/C – 02 (350T)' },
  { id: '3', name: 'INJECTION M/C – 03 (180T)' },
  { id: '4', name: 'INJECTION M/C – 04 (500T)' },
  { id: '5', name: 'INJECTION M/C – 05 (120T)' },
];

const MOCK_MOULDS_BY_MACHINE = {
  '1': [
    { id: 'm101', name: 'MD-101 | Front Bumper Cover' },
    { id: 'm102', name: 'MD-102 | Rear Bumper Cover' },
    { id: 'm103', name: 'MD-103 | Dashboard Panel' },
  ],
  '2': [
    { id: 'm201', name: 'MD-201 | Door Inner Panel' },
    { id: 'm202', name: 'MD-202 | Center Console' },
    { id: 'm203', name: 'MD-203 | Glove Box' },
  ],
  '3': [
    { id: 'm301', name: 'MD-301 | Side Mirror Housing' },
    { id: 'm302', name: 'MD-302 | Pillar Trim A' },
  ],
  '4': [
    { id: 'm401', name: 'MD-401 | Bumper Bracket LH' },
    { id: 'm402', name: 'MD-402 | Bumper Bracket RH' },
    { id: 'm403', name: 'MD-403 | Fender Liner Front' },
    { id: 'm404', name: 'MD-404 | Fender Liner Rear' },
  ],
  '5': [
    { id: 'm501', name: 'MD-501 | Clip Retainer' },
    { id: 'm502', name: 'MD-502 | Grommet Housing' },
  ],
};

const MOCK_BREAKDOWN_TYPES = [
  { id: 'bt1',  name: 'Cooling Line Leak' },
  { id: 'bt2',  name: 'Ejector Pin Broken' },
  { id: 'bt3',  name: 'Core Damage' },
  { id: 'bt4',  name: 'Runner System Blockage' },
  { id: 'bt5',  name: 'Cavity Surface Damage' },
  { id: 'bt6',  name: 'Parting Line Damage' },
  { id: 'bt7',  name: 'Slide / Lifter Malfunction' },
  { id: 'bt8',  name: 'Hot Runner System Fault' },
  { id: 'bt9',  name: 'Gate Wear / Erosion' },
  { id: 'bt10', name: 'Venting Issue' },
];

const MOCK_BREAKDOWN_ENTRIES = [
  {
    id: 'MWR-2401', machineId: '1', machine: 'INJECTION M/C – 01 (250T)',
    mouldId: 'm101', mould: 'MD-101 | Front Bumper Cover',
    bdStartTime: '2024-03-10T08:30', bdStopTime: '2024-03-10T11:45',
    breakdownHrs: '03:15', breakdownTypeId: 'bt2', breakdownType: 'Ejector Pin Broken',
    cStatus: 'Ongoing',
    cause: 'Ejector pin fractured due to metal fatigue from repeated cycling without lubrication.',
    correctiveAction: 'Replaced all ejector pins with upgraded hardened steel variant. Applied lubricant.',
    remarksSpares: 'Ejector pins x8 (PN: EP-250-08), Lubricant 500ml',
    status: 'Open',
  },
  {
    id: 'MWR-2402', machineId: '2', machine: 'INJECTION M/C – 02 (350T)',
    mouldId: 'm201', mould: 'MD-201 | Door Inner Panel',
    bdStartTime: '2024-03-11T14:00', bdStopTime: '2024-03-11T16:30',
    breakdownHrs: '02:30', breakdownTypeId: 'bt1', breakdownType: 'Cooling Line Leak',
    cStatus: 'Test Running',
    cause: 'Hairline crack in cooling channel O-ring seat caused slow water ingress into cavity.',
    correctiveAction: 'O-rings replaced on all 6 cooling circuits. Pressure tested at 8 bar for 30 min.',
    remarksSpares: 'O-Ring set 22mm x12 (PN: OR-22-KIT), Thread sealant',
    status: 'Open',
  },
  {
    id: 'MWR-2403', machineId: '4', machine: 'INJECTION M/C – 04 (500T)',
    mouldId: 'm401', mould: 'MD-401 | Bumper Bracket LH',
    bdStartTime: '2024-03-12T06:00', bdStopTime: '2024-03-13T10:00',
    breakdownHrs: '28:00', breakdownTypeId: 'bt3', breakdownType: 'Core Damage',
    cStatus: 'Hold',
    cause: 'Core fractured due to improper shut height setting. Operator error during last shift changeover.',
    correctiveAction: 'Core section sent to tool room for repair welding. Shut height re-calibrated and locked.',
    remarksSpares: 'Welding rods, Grinding consumables, Core insert replacement pending',
    status: 'Open',
  },
  {
    id: 'MWR-2404', machineId: '1', machine: 'INJECTION M/C – 01 (250T)',
    mouldId: 'm103', mould: 'MD-103 | Dashboard Panel',
    bdStartTime: '2024-03-08T09:15', bdStopTime: '2024-03-08T12:00',
    breakdownHrs: '02:45', breakdownTypeId: 'bt8', breakdownType: 'Hot Runner System Fault',
    cStatus: 'Ongoing',
    cause: 'Zone 3 heater wire shorted, causing temperature imbalance and gate freeze.',
    correctiveAction: 'Replaced heater cartridge and thermocouple for zone 3. Verified all zone temps.',
    remarksSpares: 'Heater cartridge 250W (PN: HC-250-Z3), Thermocouple type-K',
    status: 'Closed',
  },
  {
    id: 'MWR-2405', machineId: '3', machine: 'INJECTION M/C – 03 (180T)',
    mouldId: 'm301', mould: 'MD-301 | Side Mirror Housing',
    bdStartTime: '2024-03-14T07:30', bdStopTime: '2024-03-14T09:00',
    breakdownHrs: '01:30', breakdownTypeId: 'bt7', breakdownType: 'Slide / Lifter Malfunction',
    cStatus: 'Yet To Attend',
    cause: 'Side core slide stuck in retracted position. Wear on wear plate exceed tolerance.',
    correctiveAction: 'Wear plate replaced. Slide lubricated and manual cycle tested 20 times.',
    remarksSpares: 'Wear plate (PN: WP-180-SC), Molykote grease 250g',
    status: 'Open',
  },
  {
    id: 'MWR-2406', machineId: '5', machine: 'INJECTION M/C – 05 (120T)',
    mouldId: 'm501', mould: 'MD-501 | Clip Retainer',
    bdStartTime: '2024-03-15T11:00', bdStopTime: '2024-03-15T13:30',
    breakdownHrs: '02:30', breakdownTypeId: 'bt6', breakdownType: 'Parting Line Damage',
    cStatus: 'Test Running',
    cause: 'Excess flash accumulated on PL causing mould crush during closure.',
    correctiveAction: 'PL surface stoned and polished. Flash root cause (injection pressure) adjusted.',
    remarksSpares: 'Diamond stone set, Polishing paste 100g',
    status: 'Closed',
  },
  {
    id: 'MWR-2407', machineId: '2', machine: 'INJECTION M/C – 02 (350T)',
    mouldId: 'm202', mould: 'MD-202 | Center Console',
    bdStartTime: '2024-03-16T08:00', bdStopTime: '',
    breakdownHrs: '—', breakdownTypeId: 'bt5', breakdownType: 'Cavity Surface Damage',
    cStatus: 'Hold',
    cause: 'Scratch marks on class-A cavity surface. Suspected foreign particle introduced during last run.',
    correctiveAction: 'Cavity polished by tool room. Under review for chrome re-plating.',
    remarksSpares: 'Polishing consumables, Chrome plating under evaluation',
    status: 'Open',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════════════════════ */
const LABEL_PALETTE = [
  { bg: '#eff6ff', color: '#2563eb' },
  { bg: '#f5f3ff', color: '#7c3aed' },
  { bg: '#ecfdf5', color: '#059669' },
  { bg: '#fffbeb', color: '#d97706' },
  { bg: '#ecfeff', color: '#0891b2' },
  { bg: '#fdf4ff', color: '#9333ea' },
  { bg: '#fff1f2', color: '#e11d48' },
];

const CSTATUS_OPTIONS = ['Ongoing', 'Yet To Attend', 'Test Running', 'Hold'];
const STATUS_OPTIONS  = ['Open', 'Closed'];

const CSTATUS_CFG = {
  'Ongoing':       { bg: 'rgba(59,130,246,0.1)',  color: '#2563eb', dot: '#3b82f6' },
  'Yet To Attend': { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', dot: '#f59e0b' },
  'Test Running':  { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981' },
  'Hold':          { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444' },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

// SVG icon helper
const S = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

// Coloured label pill
const FieldLabel = ({ children, colorIdx = 0, required = false }) => {
  const { bg, color } = LABEL_PALETTE[colorIdx % LABEL_PALETTE.length];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
      marginBottom: 5, padding: '2px 7px', borderRadius: 4,
      background: bg, color, border: `1px solid ${color}33`,
    }}>
      {required && <span style={{ color: '#ef4444', fontSize: 10, marginRight: 1 }}>*</span>}
      {children}
    </div>
  );
};

// Form field wrapper with label + validation error
function Field({ label, colorIdx = 0, required, error, children }) {
  return (
    <div>
      <FieldLabel colorIdx={colorIdx} required={required}>{label}</FieldLabel>
      {children}
      {error && (
        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <S size={11} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
          {error}
        </div>
      )}
    </div>
  );
}

// Summary stat card
function StatCard({ icon, label, value, bg, color, border }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px', borderRadius: 10,
      background: bg, border: `1px solid ${border}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}18`, color,
      }}>
        <S size={16} d={icon}/>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      </div>
    </div>
  );
}

// CStatus badge pill
function CStatusBadge({ value }) {
  const c = CSTATUS_CFG[value] ?? { bg: 'var(--bg3)', color: 'var(--text2)', dot: 'var(--text3)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }}/>
      {value}
    </span>
  );
}

// View detail row
function DetailRow({ label, value, colorIdx = 0, mono = false }) {
  const { bg, color } = LABEL_PALETTE[colorIdx % LABEL_PALETTE.length];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{
        display: 'inline-block', fontSize: 9, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.7px',
        padding: '2px 7px', borderRadius: 4,
        background: bg, color, border: `1px solid ${color}33`,
        alignSelf: 'flex-start',
      }}>{label}</div>
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.5,
        fontFamily: mono ? "'Geist Mono',monospace" : 'inherit',
        background: 'var(--bg3)', borderRadius: 7, padding: '8px 11px',
        border: '1px solid var(--border)',
      }}>{value || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>—</span>}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STYLE HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const inputSt = (extra = {}) => ({
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg2)', border: '1px solid var(--border2)',
  borderRadius: 8, color: 'var(--text)', fontSize: 13,
  padding: '8px 11px', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color var(--trans)',
  ...extra,
});

const selectSt = (extra = {}) => ({
  ...inputSt(),
  cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  paddingRight: 30,
  ...extra,
});

const actionBtnSt = (color) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 7,
  background: `${color}14`, border: `1px solid ${color}30`,
  color, cursor: 'pointer', transition: 'all var(--trans)',
});

const row2col = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 };
const row3col = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 };

const nowISO = () => new Date().toISOString().slice(0, 16);

const emptyForm = () => ({
  machineId: '', mouldId: '', breakdownTypeId: '',
  bdStartTime: nowISO(), bdStopTime: '',
  cause: '', correctiveAction: '', remarksSpares: '',
  cStatus: 'Ongoing', status: 'Open',
});

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════════════════════════ */
function calcHrs(start, stop) {
  if (!start || !stop) return '—';
  const diff = new Date(stop) - new Date(start);
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtDt(v) {
  return v ? v.replace('T', '  ') : '—';
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function MouldBreakdownEntryPage() {
  const [entries,     setEntries]     = useState(MOCK_BREAKDOWN_ENTRIES);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [viewRow,     setViewRow]     = useState(null);   // view detail modal
  const [deleteRow,   setDeleteRow]   = useState(null);   // delete confirm modal
  const [editMode,    setEditMode]    = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState(emptyForm());
  const [errors,      setErrors]      = useState({});
  const [moulds,      setMoulds]      = useState([]);
  const { showToast } = useUIStore();

  /* cascade moulds on machine change */
  useEffect(() => {
    if (form.machineId) {
      setMoulds(MOCK_MOULDS_BY_MACHINE[form.machineId] ?? []);
    } else {
      setMoulds([]);
    }
    setForm(f => ({ ...f, mouldId: '' }));
  }, [form.machineId]);

  /* ── form helpers ─────────────────────────────────────────────────── */
  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.machineId)       e.machineId       = 'Machine is required';
    if (!form.mouldId)         e.mouldId         = 'Mould is required';
    if (!form.breakdownTypeId) e.breakdownTypeId = 'Problem type is required';
    if (!form.bdStartTime)     e.bdStartTime     = 'BD start time is required';
    if (form.bdStopTime && form.bdStopTime < form.bdStartTime)
                               e.bdStopTime      = 'Stop time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── open modals ─────────────────────────────────────────────────── */
  const openNew = () => {
    setForm(emptyForm());
    setErrors({});
    setEditMode(false);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setForm({
      machineId:        row.machineId        ?? '',
      mouldId:          row.mouldId          ?? '',
      breakdownTypeId:  row.breakdownTypeId  ?? '',
      bdStartTime:      row.bdStartTime      ?? nowISO(),
      bdStopTime:       row.bdStopTime       ?? '',
      cause:            row.cause            ?? '',
      correctiveAction: row.correctiveAction ?? '',
      remarksSpares:    row.remarksSpares    ?? '',
      cStatus:          row.cStatus          ?? 'Ongoing',
      status:           row.status           ?? 'Open',
    });
    setMoulds(MOCK_MOULDS_BY_MACHINE[row.machineId] ?? []);
    setErrors({});
    setEditMode(true);
    setEditId(row.id);
    setModalOpen(true);
  };

  /* ── save / delete ─────────────────────────────────────────────────── */
  const handleSave = () => {
    if (!validate()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Please fix the highlighted fields.' });
      return;
    }
    const machine       = MOCK_MACHINES.find(m => m.id === form.machineId)?.name ?? '';
    const mould         = (MOCK_MOULDS_BY_MACHINE[form.machineId] ?? []).find(m => m.id === form.mouldId)?.name ?? '';
    const breakdownType = MOCK_BREAKDOWN_TYPES.find(b => b.id === form.breakdownTypeId)?.name ?? '';
    const hrs           = calcHrs(form.bdStartTime, form.bdStopTime);

    if (editMode) {
      setEntries(prev => prev.map(e =>
        e.id === editId ? { ...e, ...form, machine, mould, breakdownType, breakdownHrs: hrs } : e
      ));
      showToast({ type: 'success', title: 'Updated', message: `${editId} has been updated.` });
    } else {
      const newId = `MWR-${2400 + entries.length + 1}`;
      setEntries(prev => [{ id: newId, ...form, machine, mould, breakdownType, breakdownHrs: hrs }, ...prev]);
      showToast({ type: 'success', title: 'Created', message: `${newId} recorded successfully.` });
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    setEntries(prev => prev.filter(e => e.id !== deleteRow.id));
    showToast({ type: 'success', title: 'Deleted', message: `${deleteRow.id} has been removed.` });
    setDeleteRow(null);
  };

  /* ── stat card values ───────────────────────────────────────────────── */
  const total       = entries.length;
  const openCount   = entries.filter(e => e.status === 'Open').length;
  const closedCount = entries.filter(e => e.status === 'Closed').length;
  const holdCount   = entries.filter(e => e.cStatus === 'Hold').length;
  const bdHours     = calcHrs(form.bdStartTime, form.bdStopTime);

  /* ── table columns ───────────────────────────────────────────────────── */
  const columns = [
    {
      key: '_actions', label: '', sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 5 }}>
          {/* View */}
          <button onClick={() => setViewRow(row)} title="View Details" style={actionBtnSt('#0891b2')}>
            <S size={12} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>
          </button>
          {/* Edit */}
          <button onClick={() => openEdit(row)} title="Edit" style={actionBtnSt('#3b82f6')}>
            <S size={12} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          {/* Delete */}
          <button onClick={() => setDeleteRow(row)} title="Delete" style={actionBtnSt('#ef4444')}>
            <S size={12} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>}/>
          </button>
        </div>
      ),
    },
    {
      key: 'id', label: 'MWR No', primary: true,
      render: v => (
        <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>
          {v}
        </code>
      ),
    },
    { key: 'machine', label: 'Machine' },
    { key: 'mould',   label: 'Mould' },
    { key: 'bdStartTime', label: 'BD Start', render: v => <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>{fmtDt(v)}</span> },
    { key: 'bdStopTime',  label: 'BD Stop',  render: v => v ? <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>{fmtDt(v)}</span> : <span style={{ color: 'var(--text3)' }}>In progress</span> },
    {
      key: 'breakdownHrs', label: 'Duration',
      render: v => (
        <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, fontWeight: 600, color: v === '—' ? 'var(--text3)' : (v.startsWith('2') || parseInt(v) >= 20 ? '#dc2626' : 'var(--text)') }}>
          {v}
        </span>
      ),
    },
    { key: 'cStatus',      label: 'Current Status', render: v => <CStatusBadge value={v}/> },
    { key: 'breakdownType', label: 'Problem' },
    { key: 'cause',         label: 'Cause', render: v => <span style={{ fontSize: 12, color: 'var(--text2)', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v}/> },
  ];

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div>
      <PageHeader
        title="Mould Breakdown Entry"
        subtitle="Record, track and manage all mould breakdown events"
      />

      {/* ── Summary stat cards ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard
          icon={<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>}
          label="Total Breakdowns" value={total}
          bg="var(--bg3)" color="var(--accent)" border="var(--border)"
        />
        <StatCard
          icon={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
          label="Open" value={openCount}
          bg="rgba(239,68,68,0.06)" color="#dc2626" border="rgba(239,68,68,0.2)"
        />
        <StatCard
          icon={<><polyline points="20 6 9 17 4 12"/></>}
          label="Closed" value={closedCount}
          bg="rgba(34,197,94,0.06)" color="#16a34a" border="rgba(34,197,94,0.2)"
        />
        <StatCard
          icon={<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>}
          label="On Hold" value={holdCount}
          bg="rgba(245,158,11,0.06)" color="#d97706" border="rgba(245,158,11,0.2)"
        />

        {/* Add New CTA card */}
        <button
          onClick={openNew}
          style={{
            flex: 1, minWidth: 140,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '5px 5px', borderRadius: 10, cursor: 'pointer',
            background: 'var(--accent)', color: '#fff',
            border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
            transition: 'all var(--trans)', boxShadow: '0 2px 12px rgba(79,143,255,0.25)',
          }}
        >
          <S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>
          Add New Breakdown
        </button>
      </div>

      {/* ── Info note ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '5px 13px', borderRadius: 7, marginBottom: 14,
        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
        fontSize: 12, color: '#dc2626', fontWeight: 500,
      }}>
        <S size={12} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
        All times are in 24-hour format
      </div>

      {/* ── Data table ──────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={entries}
        searchKeys={['id', 'machine', 'mould', 'breakdownType', 'cause']}
        pageSize={15}
      />

      {/* ════════════════════════════════════════════════════════════════
          ADD / EDIT MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: editMode ? 'rgba(59,130,246,0.12)' : 'rgba(79,143,255,0.12)',
              color: editMode ? '#3b82f6' : 'var(--accent)',
            }}>
              <S size={15} d={editMode
                ? <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
              }/>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                {editMode ? `Edit — ${editId}` : 'New Breakdown Entry'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                {editMode ? 'Update breakdown details below' : 'Fill in the form to record a new breakdown'}
              </div>
            </div>
          </div>
        }
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              <S size={13} d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}/> Cancel
            </Button>
            <Button onClick={handleSave}>
              <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
              {editMode ? 'Update Entry' : 'Save Entry'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Section: Machine & Mould */}
          <SectionHeader icon={<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>} title="Machine & Mould" />
          <div style={row2col}>
            <Field label="Machine" colorIdx={0} required error={errors.machineId}>
              <select value={form.machineId} onChange={e => set('machineId', e.target.value)} style={selectSt()}>
                <option value="">Select machine…</option>
                {MOCK_MACHINES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Mould" colorIdx={1} required error={errors.mouldId}>
              <select
                value={form.mouldId}
                onChange={e => set('mouldId', e.target.value)}
                style={selectSt({ opacity: moulds.length ? 1 : 0.55 })}
                disabled={!moulds.length}
              >
                <option value="">{form.machineId ? 'Select mould…' : 'Select machine first…'}</option>
                {moulds.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }}/>

          {/* Section: Breakdown Time */}
          <SectionHeader icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} title="Breakdown Time" />
          <div style={row2col}>
            <Field label="BD Start Time" colorIdx={2} required error={errors.bdStartTime}>
              <input type="datetime-local" value={form.bdStartTime} onChange={e => set('bdStartTime', e.target.value)} style={inputSt()}/>
            </Field>
            <Field label="BD Stop Time" colorIdx={3} error={errors.bdStopTime}>
              <input type="datetime-local" value={form.bdStopTime} onChange={e => set('bdStopTime', e.target.value)} style={inputSt()}/>
            </Field>
          </div>

          {/* Live BD Hours badge */}
          {form.bdStartTime && form.bdStopTime && bdHours !== '—' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', borderRadius: 9, alignSelf: 'flex-start',
              background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
            }}>
              <S size={14} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Breakdown Duration</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#16a34a', fontFamily: "'Geist Mono',monospace", letterSpacing: 1 }}>
                {bdHours}  hrs
              </span>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }}/>

          {/* Section: Problem */}
          <SectionHeader icon={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} title="Problem Details" />

          <Field label="Problem / Breakdown Type" colorIdx={4} required error={errors.breakdownTypeId}>
            <select value={form.breakdownTypeId} onChange={e => set('breakdownTypeId', e.target.value)} style={selectSt()}>
              <option value="">Select problem type…</option>
              {MOCK_BREAKDOWN_TYPES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>

          <Field label="Cause" colorIdx={5}>
            <textarea rows={3} value={form.cause} onChange={e => set('cause', e.target.value)}
              placeholder="Describe the root cause of the breakdown…"
              style={inputSt({ resize: 'vertical', lineHeight: 1.6 })}/>
          </Field>

          <Field label="Corrective Action" colorIdx={6}>
            <textarea rows={3} value={form.correctiveAction} onChange={e => set('correctiveAction', e.target.value)}
              placeholder="Describe the steps taken to resolve the issue…"
              style={inputSt({ resize: 'vertical', lineHeight: 1.6 })}/>
          </Field>

          <Field label="Remarks & Spares Used" colorIdx={0}>
            <textarea rows={2} value={form.remarksSpares} onChange={e => set('remarksSpares', e.target.value)}
              placeholder="List spare parts replaced, quantities, part numbers…"
              style={inputSt({ resize: 'vertical', lineHeight: 1.6 })}/>
          </Field>

          <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0' }}/>

          {/* Section: Status */}
          <SectionHeader icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} title="Status" />

          {/* Current Status pill toggles */}
          <div>
            <FieldLabel colorIdx={1}>Current Status</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {CSTATUS_OPTIONS.map(opt => {
                const active = form.cStatus === opt;
                const c = CSTATUS_CFG[opt];
                return (
                  <button key={opt} type="button" onClick={() => set('cStatus', opt)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all var(--trans)',
                    background: active ? c.bg    : 'var(--bg3)',
                    color:      active ? c.color : 'var(--text3)',
                    border:     active ? `1.5px solid ${c.color}55` : '1.5px solid var(--border)',
                  }}>
                    {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }}/>}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status (Open/Closed) — edit only */}
          {editMode && (
            <div>
              <FieldLabel colorIdx={2}>Record Status</FieldLabel>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {STATUS_OPTIONS.map(opt => {
                  const active = form.status === opt;
                  const color  = opt === 'Open' ? '#dc2626' : '#16a34a';
                  const bg     = opt === 'Open' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)';
                  return (
                    <button key={opt} type="button" onClick={() => set('status', opt)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 22px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', transition: 'all var(--trans)',
                      background: active ? bg     : 'var(--bg3)',
                      color:      active ? color  : 'var(--text3)',
                      border:     active ? `1.5px solid ${color}55` : '1.5px solid var(--border)',
                    }}>
                      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }}/>}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          VIEW DETAIL MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        open={!!viewRow}
        onClose={() => setViewRow(null)}
        title={
          viewRow && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(8,145,178,0.12)', color: '#0891b2',
              }}>
                <S size={15} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Breakdown Details</div>
                <code style={{ fontSize: 11, color: 'var(--cyan)' }}>{viewRow?.id}</code>
              </div>
            </div>
          )
        }
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewRow(null)}>Close</Button>
            <Button onClick={() => { openEdit(viewRow); setViewRow(null); }}>
              <S size={13} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/> Edit This Record
            </Button>
          </>
        }
      >
        {viewRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Top info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, background: 'var(--bg3)', borderRadius: 10, padding: 16 }}>
              {[
                ['MWR No',    viewRow.id,            0, true],
                ['Machine',   viewRow.machine,        1],
                ['Mould',     viewRow.mould,          2],
                ['BD Start',  fmtDt(viewRow.bdStartTime), 3, true],
                ['BD Stop',   viewRow.bdStopTime ? fmtDt(viewRow.bdStopTime) : 'In progress', 4, true],
                ['Duration',  viewRow.breakdownHrs,  5, true],
              ].map(([lbl, val, ci, mono]) => {
                const { bg, color } = LABEL_PALETTE[ci % LABEL_PALETTE.length];
                return (
                  <div key={lbl}>
                    <div style={{ display: 'inline-block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 4, padding: '2px 7px', borderRadius: 4, background: bg, color, border: `1px solid ${color}33` }}>{lbl}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', fontFamily: mono ? "'Geist Mono',monospace" : 'inherit' }}>{val}</div>
                  </div>
                );
              })}
            </div>

            {/* Status row */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <FieldLabel colorIdx={1}>Problem</FieldLabel>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', background: 'var(--bg3)', borderRadius: 7, padding: '8px 11px', border: '1px solid var(--border)' }}>
                  {viewRow.breakdownType}
                </div>
              </div>
              <div>
                <FieldLabel colorIdx={2}>Current Status</FieldLabel>
                <div style={{ padding: '8px 0' }}><CStatusBadge value={viewRow.cStatus}/></div>
              </div>
              <div>
                <FieldLabel colorIdx={3}>Record Status</FieldLabel>
                <div style={{ padding: '8px 0' }}><StatusBadge status={viewRow.status}/></div>
              </div>
            </div>

            {/* Text fields */}
            <DetailRow label="Cause"             value={viewRow.cause}            colorIdx={5}/>
            <DetailRow label="Corrective Action" value={viewRow.correctiveAction} colorIdx={6}/>
            <DetailRow label="Remarks & Spares"  value={viewRow.remarksSpares}    colorIdx={0}/>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ════════════════════════════════════════════════════════════════ */}
      <Modal
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteRow(null)}>Cancel</Button>
            <button onClick={confirmDelete} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: '#ef4444', color: '#fff', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <S size={13} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>}/>
              Yes, Delete
            </button>
          </>
        }
      >
        {deleteRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            }}>
              <S size={24} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>}/>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Delete this record?</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                You are about to permanently delete breakdown record{' '}
                <code style={{ fontFamily: "'Geist Mono',monospace", color: 'var(--cyan)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>
                  {deleteRow.id}
                </code>
                . This action cannot be undone.
              </div>
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '10px 14px',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>
                <strong>Mould:</strong> {deleteRow.mould}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                <strong>Problem:</strong> {deleteRow.breakdownType}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ─── Section header inside modal ────────────────────────────────────────── */
function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--accent-glow)', color: 'var(--accent)',
      }}>
        <S size={13} d={icon}/>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}/>
    </div>
  );
}