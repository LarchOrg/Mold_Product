import { useState, useRef, useEffect } from 'react';
import { useForm }  from 'react-hook-form';
import PageHeader   from '@/components/layout/PageHeader';
import Button       from '@/components/common/Button';
import DataTable    from '@/components/table/DataTable';
import Modal        from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { MOCK_PM_PLANS } from '@/utils/mockData';
import { useMouldDropdown } from '@/hooks/useMoulds';
import { 
  usePMDropdown,
  useCreatePMPlan,
  usePMPlans,
  usePMPlan, 
  useUpdatePMPlan // ✅ ADD THIS LINE
} from '@/hooks/usePMPlans';


const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const STATUS_FILTERS = ['all','Pending','Completed','Overdue'];
const TODAY    = new Date().toISOString().split('T')[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export default function PMPlanPage() {
  // const [plans, setPlans]             = useState(MOCK_PM_PLANS);
  const [modalOpen, setModalOpen]     = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editId, setEditId]           = useState(null);
  const [statusFilter, setStatus]     = useState('all');
  const [planType, setPlanType]       = useState('pm');

  const { mutate: createPMPlan }                          = useCreatePMPlan();
  const { showToast }                                     = useUIStore();
  const { data: mouldOptions = [], isLoading: mouldLoading } = useMouldDropdown();
  const { data: pmOptions = [], isLoading: pmLoading } = usePMDropdown();
  const { data: plans = [], isLoading } = usePMPlans();
  const { data: editData } = usePMPlan(editId);
  const { mutate: updatePMPlan } = useUpdatePMPlan();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  useEffect(() => {
  if (editData && editId) {
    reset({
      date: editData.date,
    });
  }
}, [editData, editId, reset]);

  const openCreate = () => {
    setEditId(null);
    setPlanType('pm');
    reset({ date: '', mouldId: '' });
    setModalOpen(true);
  };

  const openEdit = p => {
    setEditId(p.id);
    reset({ mouldId: p.mouldId, date: p.date });
    setModalOpen(true);
  };

  const handlePlanTypeChange = (type) => {
    setPlanType(type);
    if (type === 'daily') {
      setValue('date', TODAY);
    } else {
      setValue('date', '');
    }
  };

  const confirmDelete = () => {
    setPlans(p => p.filter(x => x.id !== deleteModal.id));
    showToast({ type:'success', title:'Deleted', message:'PM Plan deleted.' });
    setDeleteModal(null);
  };

const onSubmit = data => {
  if (editId) {
    updatePMPlan(
      { id: editId, ...data, planType },
      {
        onSuccess: () => setModalOpen(false),
      }
    );
  } else {
    createPMPlan(
      { ...data, planType },
      {
        onSuccess: () => setModalOpen(false),
      }
    );
  }
};

  const displayData = statusFilter === 'all'
    ? plans
    : plans.filter(p => p.status === statusFilter);

  const columns = [
    { key:'reportNo', label:'Report No', primary:true,
      render: v => (
        <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>
          {v}
        </code>
      ),
    },
    { key:'mould',  label:'Mould' },
    { key:'partNo', label:'Part No' },
    { key:'freq', label:'Frequency',
      render: v => (
        <span style={{
          display:'inline-flex', alignItems:'center', gap:5,
          padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:500,
          background: v==='Daily' ? 'var(--purple-bg)' : 'var(--accent-glow)',
          color:      v==='Daily' ? 'var(--purple)'    : 'var(--accent)',
        }}>{v}</span>
      ),
    },
    { key:'date',   label:'Target Date' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v}/> },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => openEdit(row)} title="Edit" style={actBtn}>
            <S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          <button
            onClick={() => showToast({ type:'info', title:'Checksheet', message:`Opening checksheet for ${row.reportNo}` })}
            title="Open Checksheet" style={actBtn}
          >
            <S d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>}/>
          </button>
          <button onClick={() => setDeleteModal(row)} title="Delete" style={{ ...actBtn, color:'var(--red)' }}>
            <S d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Preventive Maintenance Plan"
        subtitle="Schedule and track mould PM activities"
        actions={
          <Button onClick={openCreate}>
            <S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> New PM Plan
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={displayData}
        searchKeys={['reportNo','mould','partNo']}
        pageSize={10}
        toolbar={
          <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{
                padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer',
                background: statusFilter===s ? 'var(--accent-glow)' : 'transparent',
                border:     statusFilter===s ? '1px solid var(--accent)' : '1px solid var(--border)',
                color:      statusFilter===s ? 'var(--accent)' : 'var(--text3)',
                transition: 'all var(--trans)',
              }}>{s==='all' ? 'All' : s}</button>
            ))}
          </div>
        }
      />

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit PM Plan' : 'New PM Plan'}
        footer={<>
        
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Plan
          </Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:18 , minHeight: 300}}>

          {/* Plan Type toggle — only on create */}
          {!editId && (
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:8 }}>
                Plan Type
              </label>
              <div style={{ display:'flex', background:'var(--bg3)', padding:3, borderRadius:9, border:'1px solid var(--border)', gap:3 }}>
                {[
                  {
                    value: 'daily', label: 'Daily',
                    icon: <S size={13} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}/>,
                  },
                  {
                    value: 'pm', label: 'PM',
                    icon: <S size={13} d={<><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>}/>,
                  },
                ].map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handlePlanTypeChange(t.value)}
                    style={{
                      flex:1, padding:'9px 0', borderRadius:7,
                      fontSize:13, fontWeight:500, cursor:'pointer',
                      fontFamily:'inherit', transition:'all var(--trans)',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                      background: planType===t.value ? 'var(--surface)' : 'transparent',
                      border:     planType===t.value ? '1px solid var(--accent)' : '1px solid transparent',
                      color:      planType===t.value ? 'var(--accent)' : 'var(--text2)',
                      boxShadow:  planType===t.value ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Plan type info banner */}
              <div style={{
                marginTop:8, padding:'8px 12px', borderRadius:7,
                background: planType==='daily' ? 'var(--purple-bg)' : 'var(--accent-glow)',
                border:     planType==='daily' ? '1px solid rgba(167,139,250,0.2)' : '1px solid rgba(79,143,255,0.2)',
                display:'flex', alignItems:'center', gap:7,
              }}>
                <div style={{ color: planType==='daily' ? 'var(--purple)' : 'var(--accent)', flexShrink:0 }}>
                  {planType==='daily'
                    ? <S size={13} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>
                    : <S size={13} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>
                  }
                </div>
                <span style={{ fontSize:11, color: planType==='daily' ? 'var(--purple)' : 'var(--accent)' }}>
                  {planType==='daily'
                    ? 'Date is automatically set to today and cannot be changed'
                    : 'Select a future date for the PM schedule'
                  }
                </span>
              </div>
            </div>
          )}

          {/* Fields */}
          <div style={{ display:'grid', gridTemplateColumns: !editId ? '1fr 1fr' : '1fr', gap:16 }}>

            {/* Mould searchable select — only on create */}
            {!editId && (
              <FormField label="Mould" required error={errors.mouldId?.message}>
                <SearchableSelect
                  options={mouldLoading ? [] : mouldOptions}
                  value={watch('mouldId') ?? ''}
                  onChange={val => setValue('mouldId', val, { shouldValidate: true })}
                  placeholder={mouldLoading ? 'Loading moulds...' : 'Search mould...'}
                  disabled={mouldLoading}
                  error={errors.mouldId?.message}
                />
                {/* hidden input so react-hook-form validation works */}
                <input type="hidden" {...register('mouldId', { required: 'Select a mould' })}/>
              </FormField>
            )}

             {/* PM Frequency dropdown — only on create & PM plan */}
  {!editId && planType==='pm' && (
    <FormField label="PM Frequency" required error={errors.pmId?.message}>
      <SearchableSelect
        options={pmLoading ? [] : pmOptions}
        value={watch('pmId') ?? ''}
        onChange={val => setValue('pmId', val, { shouldValidate: true })}
        placeholder={pmLoading ? 'Loading PM frequencies...' : 'Search PM frequency...'}
        disabled={pmLoading}
        error={errors.pmId?.message}
      />
      <input
        type="hidden"
        {...register('pmId', {
          required: planType === 'pm' ? 'Select a PM frequency' : false
        })}
      />
    </FormField>
  )}

            {/* Date field */}
            <FormField
              label={planType==='daily' ? 'Date (Today — Auto)' : 'Target Date'}
              required
              error={errors.date?.message}
            >
              <div style={{ position:'relative' }}>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  disabled={planType==='daily'}
                  min={planType==='pm' ? TOMORROW : undefined}
                  style={{
                    ...inputStyle,
                    opacity:      planType==='daily' ? 0.6 : 1,
                    cursor:       planType==='daily' ? 'not-allowed' : 'pointer',
                    background:   planType==='daily' ? 'var(--bg4)' : 'var(--bg3)',
                    paddingRight: planType==='daily' ? 36 : 13,
                  }}
                />
                {planType==='daily' && (
                  <span style={{
                    position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    color:'var(--text3)', pointerEvents:'none', display:'flex',
                  }}>
                    <S size={13} d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>
                  </span>
                )}
              </div>
            </FormField>

          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirm Delete"
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <S size={13} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/> Delete Plan
          </Button>
        </>}
      >
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'var(--red-bg)', color:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <S size={18} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:6 }}>
              Delete <strong style={{ color:'var(--red)' }}>{deleteModal?.reportNo}</strong>?
            </p>
            <p style={{ fontSize:13, color:'var(--text2)' }}>
              This PM plan will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Searchable Select Component ───────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder='Select...', disabled=false, error,maxItems=3  }) {
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

  // close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // auto focus search when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const rect        = triggerRef.current.getBoundingClientRect();
      const spaceBelow  = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 240);
    }
    setOpen(o => !o);
    if (open) setSearch('');
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setSearch('');
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={wrapRef} style={{ position:'relative', width:'100%' }}>

      {/* Trigger button */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          ...inputStyle,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : undefined,
          boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
          userSelect:'none', gap:8,
        }}
      >
        <span style={{
          flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          color: selected ? 'var(--text)' : 'var(--text3)', fontSize:13,
        }}>
          {selected ? selected.label : placeholder}
        </span>

        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          {/* Clear button when value selected */}
          {selected && !disabled && (
            <span
              onClick={handleClear}
              style={{ color:'var(--text3)', display:'flex', padding:2, borderRadius:4, lineHeight:1, cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </span>
          )}
          {/* Chevron */}
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
          ...(dropUp
            ? { bottom:'calc(100% + 4px)' }
            : { top:'calc(100% + 4px)' }
          ),
          background:'var(--surface2)',
          border:'1px solid var(--border2)',
          borderRadius:10,
          boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
          overflow:'hidden',
        }}>

          {/* Search input */}
          <div style={{
            padding:'8px 10px', borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:8,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text3)', flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
                if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0]);
              }}
              placeholder="Type to search..."
              style={{
                flex:1, background:'none', border:'none',
                color:'var(--text)', fontSize:13,
                outline:'none', fontFamily:'inherit',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:13, lineHeight:1, padding:0 }}
              >✕</button>
            )}
          </div>

          {/* Options */}
          <div className="dropdown-scroll"
           style={{ maxHeight: maxItems * 40, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:'16px 12px', fontSize:13, color:'var(--text3)', textAlign:'center' }}>
                No results for "{search}"
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    style={{
                      padding:'9px 12px', fontSize:13, cursor:'pointer',
                      color:      isSelected ? 'var(--accent)' : 'var(--text)',
                      background: isSelected ? 'var(--accent-glow)' : 'transparent',
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      transition:'background var(--trans)',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)'; }}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const actBtn = {
  width:30, height:30, borderRadius:7, border:'1px solid var(--border)',
  background:'var(--bg3)', color:'var(--text2)', cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
  transition:'all var(--trans)',
};