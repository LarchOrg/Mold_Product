import { useState, useMemo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import Modal      from '@/components/common/Modal';
import { MOCK_MOULDS } from '@/utils/mockData';
import { formatNumber } from '@/utils/formatters';

const S = ({ d, size=14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

// ── Mock history data ─────────────────────────────────────────────────────────
const MOCK_MOULD_HISTORY = [
  { id:1,  mouldId:1, loadingDT:'2026-01-05 08:00', unloadingDT:'2026-01-05 18:30', machine:'IMM-01', shots:1200,  cumulativeShots:121200, type:'PM',  startDate:'2026-01-06 09:00', cause:'Scheduled PM',          reason:'Cooling lines flushed, ejector pins lubricated', completedDT:'2026-01-06 14:00', reviewedBy:'Raj Kumar',  remarks:'All OK' },
  { id:2,  mouldId:1, loadingDT:'2026-01-10 07:30', unloadingDT:'2026-01-10 19:00', machine:'IMM-01', shots:1500,  cumulativeShots:122700, type:'BD',  startDate:'2026-01-11 10:00', cause:'BD-2026-001 Ejector pin broken', reason:'Pin replaced, tested OK', completedDT:'2026-01-11 15:30', reviewedBy:'Sarah Chen', remarks:'Spare pin used from stock' },
  { id:3,  mouldId:1, loadingDT:'2026-01-18 08:00', unloadingDT:'2026-01-18 20:00', machine:'IMM-02', shots:2100,  cumulativeShots:124800, type:'PM',  startDate:'2026-01-19 08:00', cause:'Monthly PM',             reason:'Full inspection done',    completedDT:'2026-01-19 12:00', reviewedBy:'Raj Kumar',  remarks:'Cooling OK' },
  { id:4,  mouldId:1, loadingDT:'2026-02-01 09:00', unloadingDT:'2026-02-01 17:00', machine:'IMM-01', shots:980,   cumulativeShots:125780, type:'ECN', startDate:'2026-02-02 09:00', cause:'ECN-2026-012 Gate resize', reason:'Gate diameter increased 0.5mm', completedDT:'2026-02-02 13:00', reviewedBy:'Admin User', remarks:'Customer approved' },
  { id:5,  mouldId:1, loadingDT:'2026-02-15 08:00', unloadingDT:'2026-02-15 18:00', machine:'IMM-03', shots:1800,  cumulativeShots:127580, type:'PM',  startDate:'2026-02-16 08:00', cause:'Monthly PM',             reason:'Standard PM completed',  completedDT:'2026-02-16 11:00', reviewedBy:'Raj Kumar',  remarks:'Good condition' },
  { id:6,  mouldId:1, loadingDT:'2026-03-01 07:00', unloadingDT:'2026-03-01 19:00', machine:'IMM-01', shots:2200,  cumulativeShots:129780, type:'BD',  startDate:'2026-03-02 08:00', cause:'BD-2026-008 Flash issue', reason:'Parting line cleaned, clamp force adjusted', completedDT:'2026-03-02 16:00', reviewedBy:'Sarah Chen', remarks:'Monitor next run' },
  { id:7,  mouldId:2, loadingDT:'2026-01-08 08:00', unloadingDT:'2026-01-08 17:30', machine:'IMM-04', shots:900,   cumulativeShots:51000,  type:'PM',  startDate:'2026-01-09 09:00', cause:'Quarterly PM',           reason:'Full strip and inspect', completedDT:'2026-01-09 17:00', reviewedBy:'Raj Kumar',  remarks:'Cavity wear noted' },
  { id:8,  mouldId:2, loadingDT:'2026-02-10 08:00', unloadingDT:'2026-02-10 18:00', machine:'IMM-04', shots:1100,  cumulativeShots:52100,  type:'IMP', startDate:'2026-02-11 08:00', cause:'Improvement: Venting',   reason:'Additional vents added to reduce burn marks', completedDT:'2026-02-11 14:00', reviewedBy:'Admin User', remarks:'Burn marks eliminated' },
  { id:9,  mouldId:3, loadingDT:'2026-01-12 09:00', unloadingDT:'2026-01-12 20:00', machine:'IMM-02', shots:3200,  cumulativeShots:163200, type:'BD',  startDate:'2026-01-13 08:00', cause:'BD-2026-003 Core crack',  reason:'Core insert replaced',   completedDT:'2026-01-14 12:00', reviewedBy:'Sarah Chen', remarks:'Critical repair' },
  { id:10, mouldId:3, loadingDT:'2026-02-20 08:00', unloadingDT:'2026-02-20 19:00', machine:'IMM-02', shots:2800,  cumulativeShots:166000, type:'PM',  startDate:'2026-02-21 09:00', cause:'Monthly PM',             reason:'Post-repair PM done',    completedDT:'2026-02-21 13:00', reviewedBy:'Raj Kumar',  remarks:'All systems OK' },
  { id:11, mouldId:4, loadingDT:'2026-01-20 07:00', unloadingDT:'2026-01-20 19:00', machine:'IMM-05', shots:4200,  cumulativeShots:304200, type:'PM',  startDate:'2026-01-21 08:00', cause:'Quarterly PM',           reason:'Standard quarterly done', completedDT:'2026-01-21 15:00', reviewedBy:'Raj Kumar',  remarks:'Good' },
  { id:12, mouldId:5, loadingDT:'2026-01-03 08:00', unloadingDT:'2026-01-03 18:00', machine:'IMM-03', shots:1600,  cumulativeShots:321600, type:'BD',  startDate:'2026-01-04 08:00', cause:'BD-2026-002 Ejector bent', reason:'Ejector plate realigned', completedDT:'2026-01-04 16:00', reviewedBy:'Sarah Chen', remarks:'Critical mould - priority repair' },
];

// ── Type badge config ─────────────────────────────────────────────────────────
const TYPE_CFG = {
  PM:  { color:'var(--accent)',  bg:'var(--accent-glow)',  label:'PM' },
  BD:  { color:'var(--red)',     bg:'var(--red-bg)',       label:'Breakdown' },
  ECN: { color:'var(--amber)',   bg:'var(--amber-bg)',     label:'ECN' },
  IMP: { color:'var(--green)',   bg:'var(--green-bg)',     label:'Improvement' },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CFG[type] || { color:'var(--text3)', bg:'var(--bg4)', label: type };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600,
      background: cfg.bg, color: cfg.color,
      border:`1px solid ${cfg.color}22`,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }}/>
      {cfg.label}
    </span>
  );
}

// ── Summary stat card ─────────────────────────────────────────────────────────
function MiniStat({ label, value, color, icon }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:12, padding:'14px 18px',
      borderTop:`2px solid ${color}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <div>
        <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:6 }}>{label}</div>
        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:26, fontWeight:700, color }}>{value}</div>
      </div>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}15`, color, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {icon}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MouldHistoryPage() {
  const [selectedMouldId, setSelectedMouldId] = useState('');
  const [fromDate, setFromDate]               = useState('');
  const [toDate, setToDate]                   = useState('');
  const [activeType, setActiveType]           = useState('all');
  const [viewRecord, setViewRecord]           = useState(null);
  const [searched, setSearched]               = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Filter history data
  const filteredData = useMemo(() => {
    if (!searched) return [];

    return MOCK_MOULD_HISTORY.filter(r => {
      const matchMould = selectedMouldId ? r.mouldId === Number(selectedMouldId) : true;
      const matchFrom  = fromDate ? r.loadingDT >= fromDate : true;
      const matchTo    = toDate   ? r.loadingDT <= toDate + ' 23:59' : true;
      const matchType  = activeType !== 'all' ? r.type === activeType : true;
      return matchMould && matchFrom && matchTo && matchType;
    });
  }, [searched, selectedMouldId, fromDate, toDate, activeType]);

  // Summary counts from filtered data
  const summary = useMemo(() => ({
    total:       filteredData.length,
    pm:          filteredData.filter(r => r.type === 'PM').length,
    bd:          filteredData.filter(r => r.type === 'BD').length,
    ecn:         filteredData.filter(r => r.type === 'ECN').length,
    imp:         filteredData.filter(r => r.type === 'IMP').length,
    totalShots:  filteredData.reduce((s, r) => s + r.shots, 0),
  }), [filteredData]);

  const selectedMould = MOCK_MOULDS.find(m => m.id === Number(selectedMouldId));

  const handleSearch = () => {
    if (!selectedMouldId) return;
    setSearched(true);
    setActiveType('all');
  };

  const handleReset = () => {
    setSelectedMouldId('');
    setFromDate('');
    setToDate('');
    setActiveType('all');
    setSearched(false);
  };

  const columns = [
    { key:'loadingDT', label:'Loading Date', primary:true,
      render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{v}</span> },
    { key:'unloadingDT', label:'Unloading Date',
      render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{v}</span> },
    { key:'machine', label:'Machine' },
    { key:'shots', label:'Shots', align:'right',
      render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, fontWeight:600 }}>{formatNumber(v)}</span> },
    { key:'cumulativeShots', label:'Cumulative', align:'right',
      render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, color:'var(--text2)' }}>{formatNumber(v)}</span> },
    { key:'type', label:'Type', render: v => <TypeBadge type={v}/> },
    { key:'cause', label:'Cause / Reference',
      render: v => (
        <span style={{ fontSize:12, color:'var(--text2)', maxWidth:180, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={v}>{v}</span>
      )
    },
    { key:'completedDT', label:'Completed',
      render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, color:'var(--text3)' }}>{v}</span> },
    { key:'reviewedBy', label:'Reviewed By' },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <button onClick={() => setViewRecord(row)} style={{
          display:'flex', alignItems:'center', gap:5,
          padding:'4px 10px', borderRadius:7,
          background:'var(--accent-glow)', border:'1px solid rgba(79,143,255,0.2)',
          color:'var(--accent)', fontSize:11, fontWeight:500, cursor:'pointer',
          transition:'all var(--trans)',
        }}>
          <S size={11} d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/> View
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mould History Report"
        subtitle="Full activity history — PM, Breakdowns, ECN and Improvements"
        actions={
          <Button variant="secondary" size="sm">
            <S size={12} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}/> Export Excel
          </Button>
        }
      />

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:14, padding:'18px 20px', marginBottom:20,
      }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:16, flexWrap:'wrap' }}>

          {/* Mould select */}
          <div style={{ minWidth:220 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6 }}>
              Mould <span style={{ color:'var(--red)' }}>*</span>
            </label>
            <select
              value={selectedMouldId}
              onChange={e => { setSelectedMouldId(e.target.value); setSearched(false); }}
              style={{
                width:'100%', padding:'8px 32px 8px 12px', borderRadius:8,
                background:'var(--bg3)', border:'1px solid var(--border2)',
                color: selectedMouldId ? 'var(--text)' : 'var(--text3)',
                fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer',
                appearance:'none',
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
              }}
            >
              <option value="">Select mould...</option>
              {MOCK_MOULDS.map(m => (
                <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
              ))}
            </select>
          </div>

          {/* From date */}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6 }}>
              From Date
            </label>
            <input
              type="date" value={fromDate} max={toDate || today}
              onChange={e => setFromDate(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}
            />
          </div>

          {/* To date */}
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6 }}>
              To Date
            </label>
            <input
              type="date" value={toDate} min={fromDate} max={today}
              onChange={e => setToDate(e.target.value)}
              style={{ padding:'8px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none', cursor:'pointer' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:8, paddingBottom:1 }}>
            <Button
              onClick={handleSearch}
              disabled={!selectedMouldId}
            >
              <S size={13} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/> Search
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              <S size={13} d={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}/> Reset
            </Button>
          </div>
        </div>

        {/* Active filter info bar */}
        {searched && selectedMould && (
          <div style={{
            marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:16, flexWrap:'wrap',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Mould:</span>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--accent)' }}>{selectedMould.code} — {selectedMould.name}</span>
            </div>
            {fromDate && (
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>From:</span>
                <span style={{ fontSize:12, color:'var(--text2)', fontFamily:"'Geist Mono',monospace" }}>{fromDate}</span>
              </div>
            )}
            {toDate && (
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>To:</span>
                <span style={{ fontSize:12, color:'var(--text2)', fontFamily:"'Geist Mono',monospace" }}>{toDate}</span>
              </div>
            )}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, color:'var(--text3)' }}>{filteredData.length} records found</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Only show below after search ────────────────────────────────────── */}
      {!searched ? (
        <div style={{
          background:'var(--surface)', border:'1px dashed var(--border2)',
          borderRadius:14, padding:'60px 24px', textAlign:'center',
        }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--accent)' }}>
            <S size={24} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>
          </div>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>Select a mould and search</p>
          <p style={{ fontSize:12, color:'var(--text3)' }}>Choose a mould from the dropdown above to view its full activity history</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:14, padding:'60px 24px', textAlign:'center',
        }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--text3)' }}>
            <S size={24} d={<><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></>}/>
          </div>
          <p style={{ fontSize:14, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>No records found</p>
          <p style={{ fontSize:12, color:'var(--text3)' }}>Try adjusting the date range or selecting a different mould</p>
        </div>
      ) : (
        <>
          {/* ── Summary stats ────────────────────────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:20 }}>
            <MiniStat label="Total Events"   value={summary.total}  color="var(--accent)"  icon={<S size={18} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/>} />
            <MiniStat label="PM Events"      value={summary.pm}     color="var(--accent)"  icon={<S size={18} d={<><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>}/>} />
            <MiniStat label="Breakdowns"     value={summary.bd}     color="var(--red)"     icon={<S size={18} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>} />
            <MiniStat label="ECN Changes"    value={summary.ecn}    color="var(--amber)"   icon={<S size={18} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>} />
            <MiniStat label="Improvements"   value={summary.imp}    color="var(--green)"   icon={<S size={18} d={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>}/>} />
            <MiniStat label="Total Shots"    value={formatNumber(summary.totalShots)} color="var(--purple)" icon={<S size={18} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>} />
          </div>

          {/* ── Type filter pills ─────────────────────────────────────────── */}
          <div style={{
            display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap',
          }}>
            <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px' }}>Filter by type:</span>
            {[
              { value:'all', label:'All',         color:'var(--accent)' },
              { value:'PM',  label:'PM',           color:'var(--accent)' },
              { value:'BD',  label:'Breakdown',    color:'var(--red)' },
              { value:'ECN', label:'ECN',          color:'var(--amber)' },
              { value:'IMP', label:'Improvement',  color:'var(--green)' },
            ].map(t => (
              <button key={t.value} onClick={() => setActiveType(t.value)} style={{
                padding:'4px 14px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer',
                transition:'all var(--trans)', fontFamily:'inherit',
                background: activeType===t.value ? `${t.color}18` : 'transparent',
                border:     activeType===t.value ? `1px solid ${t.color}` : '1px solid var(--border)',
                color:      activeType===t.value ? t.color : 'var(--text3)',
              }}>{t.label}{t.value !== 'all' && ` (${summary[t.value.toLowerCase()]})`}</button>
            ))}
          </div>

          {/* ── Table ─────────────────────────────────────────────────────── */}
          <DataTable
            columns={columns}
            data={filteredData}
            searchKeys={['machine','cause','reason','reviewedBy']}
            pageSize={10}
          />
        </>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title={`Activity Detail — ${viewRecord?.type ?? ''}`}
        size="md"
        footer={<Button variant="secondary" onClick={() => setViewRecord(null)}>Close</Button>}
      >
        {viewRecord && (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

            {/* Type badge + machine header */}
            <div style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'0 0 16px', marginBottom:16,
              borderBottom:'1px solid var(--border)',
            }}>
              <TypeBadge type={viewRecord.type}/>
              <span style={{ fontSize:13, color:'var(--text2)' }}>Machine: <strong style={{ color:'var(--text)' }}>{viewRecord.machine}</strong></span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text3)', fontFamily:"'Geist Mono',monospace" }}>
                {formatNumber(viewRecord.shots)} shots
              </span>
            </div>

            {/* Detail rows */}
            {[
              ['Loading Date',     viewRecord.loadingDT],
              ['Unloading Date',   viewRecord.unloadingDT],
              ['Machine',          viewRecord.machine],
              ['No of Shots',      formatNumber(viewRecord.shots)],
              ['Cumulative Shots', formatNumber(viewRecord.cumulativeShots)],
              ['Start Date',       viewRecord.startDate],
              ['Cause / Reference',viewRecord.cause],
              ['Root Cause / Action Taken', viewRecord.reason],
              ['Completed Date',   viewRecord.completedDT],
              ['Reviewed By',      viewRecord.reviewedBy],
              ['Remarks / Spares', viewRecord.remarks],
            ].map(([label, value]) => (
              <div key={label} style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', gap:16,
                padding:'10px 0', borderBottom:'1px solid var(--border)',
              }}>
                <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0, minWidth:140 }}>
                  {label}
                </span>
                <span style={{ fontSize:13, color:'var(--text)', textAlign:'right', lineHeight:1.5 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}