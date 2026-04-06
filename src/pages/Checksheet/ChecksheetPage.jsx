import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import Modal      from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
// import { MOCK_PM_PLANS, MOCK_SPECS } from '@/utils/mockData';
import { useChecksheetList, useSaveChecksheet } from '@/hooks/useChecksheet';




const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const RESULT_OPTIONS = ['OK','NG','Pass','Fail','N/A'];
const RES_COLOR = { OK:'var(--green)', Pass:'var(--green)', NG:'var(--red)', Fail:'var(--red)', 'N/A':'var(--text3)' };

const STATUS_FILTERS = ['all','Pending','Completed','Overdue'];
const freqOptions = [
  { label: 'All',       value: 'all'       },
  { label: 'Daily',     value: 'Daily'     },
  { label: 'Monthly',   value: 'Monthly'   },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually',  value: 'Annually'  },
];

export default function ChecksheetPage() {
  const { data: apiData = [], loading } = useChecksheetList();
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan]     = useState(null);
  const [results, setResults]               = useState({});
  const [statusFilter, setStatus]           = useState('all');
  const [freqFilter, setFreqFilter]         = useState('all');
  const { showToast } = useUIStore();

  const openChecksheet = plan => {
    setSelectedPlan(plan);
    setResults({});
    setCheckModalOpen(true);
  };

  const handleResultChange = (specId, value) =>
    setResults(p => ({ ...p, [specId]: value }));

  const handleSave = () => {
    const unanswered = MOCK_SPECS.filter(s => !results[s.id]);
    if (unanswered.length > 0) {
      showToast({ type:'error', title:'Incomplete', message:`${unanswered.length} item(s) not filled.` });
      return;
    }
    showToast({ type:'success', title:'Saved', message:`Checksheet for ${selectedPlan.reportNo} saved.` });
    setCheckModalOpen(false);
  };

  // Apply filters
const displayData = apiData.filter(p => {
  const statusMatch = statusFilter === 'all' || p.status === statusFilter;
  const freqMatch   = freqFilter   === 'all' || p.freq   === freqFilter;
  return statusMatch && freqMatch;
});

  const columns = [
    { key:'open', label:'', sortable:false,
      render: (_,row) => (
        <button onClick={() => openChecksheet(row)} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'5px 12px', borderRadius:7,
          background:'var(--accent-glow)', border:'1px solid rgba(79,143,255,0.2)',
          color:'var(--accent)', fontSize:12, fontWeight:500, cursor:'pointer',
          transition:'all var(--trans)',
        }}>
          <S size={12} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}/> Open
        </button>
      ),
    },
    { key:'reportNo', label:'Report No', primary:true,
      render: v => (
        <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>
          {v}
        </code>
      ),
    },
    { key:'mould',    label:'Mould' },
    { key:'partNo',   label:'Part No' },
    { key:'freq',     label:'Frequency',
      render: v => (
        <span style={{
          display:'inline-flex', alignItems:'center', gap:5,
          padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:500,
          background: v==='Daily' ? 'var(--purple-bg)' : 'var(--accent-glow)',
          color:      v==='Daily' ? 'var(--purple)'    : 'var(--accent)',
        }}>{v}</span>
      ),
    },
    { key:'date',     label:'Target Date' },
    { key:'status',   label:'Status', render: v => <StatusBadge status={v}/> },
  ];

  return (
    <div>
      <PageHeader
        title="Checksheet Entry"
        subtitle="Enter actual PM check results per maintenance plan"
      />

      <DataTable
        columns={columns}
        data={displayData}
        searchKeys={['reportNo','mould','partNo']}
        pageSize={10}
        toolbar={
          <div style={{ display:'flex', gap:6, marginLeft:'auto', alignItems:'center' }}>

            {/* Frequency searchable dropdown */}
            <div style={{ width:220, minWidth:180 }}>
              <SearchableSelect
                options={freqOptions}
                value={freqFilter}
                onChange={setFreqFilter}
                placeholder="Frequency"
              />
            </div>

            {/* Status filter pills */}
            <div style={{ display:'flex', gap:6 }}>
              {STATUS_FILTERS.map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer',
                  background: statusFilter===s ? 'var(--accent-glow)' : 'transparent',
                  border:     statusFilter===s ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color:      statusFilter===s ? 'var(--accent)' : 'var(--text3)',
                  transition: 'all var(--trans)',
                }}>
                  {s==='all' ? 'All' : s}
                </button>
              ))}
            </div>

          </div>
        }
      />

      {/* Checksheet Entry Modal */}
      <Modal
        open={checkModalOpen}
        onClose={() => setCheckModalOpen(false)}
        title={`Checksheet — ${selectedPlan?.reportNo ?? ''}`}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setCheckModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/> Save Checksheet
          </Button>
        </>}
      >
        {selectedPlan && (
          <div>
            {/* Plan info grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, background:'var(--bg3)', borderRadius:10, padding:16, marginBottom:20 }}>
              {[
                ['Mould',        selectedPlan.mould],
                ['Part No',      selectedPlan.partNo],
                ['Frequency',    selectedPlan.freq],
                ['Target Date',  selectedPlan.date],
                ['Status',       selectedPlan.status],
              ].map(([label,value]) => (
                <div key={label}>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ flex:1, height:4, background:'var(--bg4)', borderRadius:2, overflow:'hidden' }}>
                <div style={{
                  width:`${(Object.keys(results).length / MOCK_SPECS.length) * 100}%`,
                  height:'100%', background:'var(--accent)', borderRadius:2,
                  transition:'width 0.3s ease',
                }}/>
              </div>
              <span style={{ fontSize:11, color:'var(--text2)', flexShrink:0 }}>
                {Object.keys(results).length}/{MOCK_SPECS.length} filled
              </span>
            </div>

            {/* Check items */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {MOCK_SPECS.map((spec, idx) => {
                const val = results[spec.id];
                const col = val ? RES_COLOR[val] : undefined;
                const isGood = val === 'OK' || val === 'Pass';
                const isBad  = val === 'NG' || val === 'Fail';
                return (
                  <div key={spec.id} style={{
                    display:'grid',
                    gridTemplateColumns:'28px 1fr 1fr 1fr 120px',
                    alignItems:'center', gap:12,
                    padding:'12px 14px', borderRadius:9,
                    background: val ? (isGood ? 'rgba(34,197,94,0.04)' : isBad ? 'rgba(239,68,68,0.04)' : 'var(--bg3)') : 'var(--bg3)',
                    border:`1px solid ${val ? (isGood ? 'rgba(34,197,94,0.15)' : isBad ? 'rgba(239,68,68,0.15)' : 'var(--border)') : 'var(--border)'}`,
                    transition:'all var(--trans)',
                  }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', fontFamily:"'Geist Mono',monospace" }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--text)' }}>{spec.area}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{spec.point}</div>
                    </div>
                    <span style={{ fontSize:12, color:'var(--text2)' }}>{spec.method}</span>
                    <span style={{ fontSize:12, color:'var(--text2)' }}>{spec.condition}</span>
                    <select
                      value={val ?? ''}
                      onChange={e => handleResultChange(spec.id, e.target.value)}
                      style={{
                        background:'var(--bg2)',
                        border:`1px solid ${col ? col + '44' : 'var(--border2)'}`,
                        borderRadius:7, color: col || 'var(--text)', fontSize:12,
                        padding:'6px 10px', outline:'none', cursor:'pointer',
                        fontFamily:'inherit', fontWeight: val ? 600 : 400,
                        transition:'border-color var(--trans)',
                      }}
                    >
                      <option value="">Select...</option>
                      {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Searchable Select (same as PMPlanPage) ────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder='Select...', disabled=false, error, maxItems=5 }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const [dropUp, setDropUp] = useState(false);
  const wrapRef             = useRef(null);
  const triggerRef          = useRef(null);
  const inputRef            = useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selected = options.find(o => String(o.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto focus search when opened
  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const rect       = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 240);
    }
    setOpen(o => !o);
    if (open) setSearch('');
  };

  const handleSelect = opt => { onChange(opt.value); setSearch(''); setOpen(false); };
  const handleClear  = e  => { e.stopPropagation(); onChange(''); setSearch(''); };

  return (
    <div ref={wrapRef} style={{ position:'relative', width:'100%' }}>

      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          padding:'6px 10px', borderRadius:8,
          border:`1px solid ${open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)'}`,
          background: disabled ? 'var(--bg3)' : 'var(--surface)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
          userSelect:'none', gap:8, transition:'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{
          flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          color: selected ? 'var(--text)' : 'var(--text3)', fontSize:12,
        }}>
          {selected ? selected.label : placeholder}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          {selected && !disabled && (
            <span onClick={handleClear} style={{ color:'var(--text3)', display:'flex', padding:2, borderRadius:4, lineHeight:1, cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ color:'var(--text3)', transition:'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position:'absolute', left:0, right:0, zIndex:999,
          ...(dropUp ? { bottom:'calc(100% + 4px)' } : { top:'calc(100% + 4px)' }),
          background:'var(--surface2)', border:'1px solid var(--border)',
          borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.35)', overflow:'hidden',
        }}>
          {/* Search */}
          <div style={{ padding:'8px 10px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text3)', flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key==='Escape') { setOpen(false); setSearch(''); }
                if (e.key==='Enter' && filtered.length===1) handleSelect(filtered[0]);
              }}
              placeholder="Type to search..."
              style={{ flex:1, background:'none', border:'none', color:'var(--text)', fontSize:13, outline:'none', fontFamily:'inherit' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:13, lineHeight:1, padding:0 }}>
                ✕
              </button>
            )}
          </div>

          {/* Options */}
          <div style={{ maxHeight: maxItems * 40, overflowY:'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:'16px 12px', fontSize:13, color:'var(--text3)', textAlign:'center' }}>
                No results for "{search}"
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div key={opt.value} onClick={() => handleSelect(opt)} style={{
                    padding:'9px 12px', fontSize:13, cursor:'pointer',
                    color:      isSelected ? 'var(--accent)' : 'var(--text)',
                    background: isSelected ? 'var(--accent-glow)' : 'transparent',
                    borderBottom: idx < filtered.length-1 ? '1px solid var(--border)' : 'none',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    transition:'background var(--trans)',
                  }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background='var(--bg3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--accent-glow)' : 'transparent'; }}
                  >
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                        style={{ color:'var(--accent)', flexShrink:0, marginLeft:8 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
