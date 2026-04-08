import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader  from '@/components/layout/PageHeader';
import Button      from '@/components/common/Button';
import DataTable   from '@/components/table/DataTable';
import Modal       from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { StatusBadge, CategoryBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { MOCK_MOULDS } from '@/utils/mockData';

import { useSpecDropdowns } from '@/hooks/useSpecEntry';
import {
  useMoulds,
   useMould,  
  useCreateMould,
  useUpdateMould,
  useDeleteMould
} from '@/hooks/useMoulds';
import { usePMDropdown } from '@/hooks/usePMPlans';
import { formatNumber, getShotLifePercent, getShotLifeColor, CATEGORY_LABELS, toInputDate } from '@/utils/formatters';

const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const STATUSES = ['Active','Maintenance','Critical','Idle'];
const CAT_KEYS = Object.keys(CATEGORY_LABELS);

// Unified style for all active (non-disabled) inputs and selects
const activeInputStyle = {
  ...inputStyle,
  background: 'var(--surface)',
  color: 'var(--text)',
};

// Style for disabled fields
const disabledInputStyle = {
  ...inputStyle,
  opacity: 0.55,
  cursor: 'not-allowed',
  background: 'var(--bg4)',
  color: 'var(--text2)',
};

export default function MouldPage() {
  const { data: moulds = [], isLoading } = useMoulds();
  const { data: dropdowns = {} } = useSpecDropdowns();
  const PART_OPTIONS = dropdowns.partNoDrp || [];
 const [selectedId, setSelectedId] = useState(null);
 const { data: selectedMould, isLoading: isMouldLoading } = useMould(selectedId);
  const [modalOpen, setModalOpen]       = useState(false);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [editId, setEditId]             = useState(null);
  const [catFilter, setCatFilter]       = useState('all');

  const { showToast }                             = useUIStore();
  const { data: FREQ_OPTIONS = [] }               = usePMDropdown();
  const { mutate: createMould }                   = useCreateMould();
  const { mutate: updateMould }                   = useUpdateMould();
  // const { mutate: deleteMould }                   = useDeleteMould();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  // Mirror opening shot → current shot live (only on create)
  const openingShotVal = watch('openingShot');
  useEffect(() => {
    if (!editId) {
      setValue('currentShot', openingShotVal ?? '');
    }
  }, [openingShotVal, editId, setValue]);

  useEffect(() => {
  if (selectedMould && editId) {
    reset({
      ...selectedMould,
      usedFrom: toInputDate(selectedMould.usedFrom),
    });
  }
}, [selectedMould, editId, reset]);

  const openCreate = () => {
    setEditId(null);
    reset({ color: 'N/A', usedFrom: new Date().toISOString().split('T')[0], openingShot: '', currentShot: '' });
    setModalOpen(true);
  };

const openEdit = (m) => {
  setSelectedId(m.id);
  setEditId(m.id);
  setModalOpen(true);
};

  const confirmDelete = () => {
    deleteMould(deleteModal.id, {
      onSuccess: () => {
        showToast({ type: 'success', title: 'Deleted', message: `${deleteModal.code} removed.` });
        setDeleteModal(null);
      },
      onError: () => setDeleteModal(null),
    });
  };

  const onSubmit = data => {
    if (editId) {
      updateMould(
        { id: editId, ...data },
        { onSuccess: () => { showToast({ type: 'success', title: 'Updated', message: 'Mould record updated.' }); setModalOpen(false); } }
      );
    } else {
      createMould(
        data,
        { onSuccess: () => { showToast({ type: 'success', title: 'Saved', message: 'New mould added.' }); setModalOpen(false); } }
      );
    }
  };

  const displayData = catFilter === 'all' ? moulds : moulds.filter(m => m.category === catFilter);

  const columns = [
    { key: 'code', label: 'Model', primary: true,
      render: v => <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key: 'name',        label: 'Mould Name' },
    { key: 'size',        label: 'Size' },
    { key: 'cavity',      label: 'Cavity', align: 'center' },
    { key: 'partNo',      label: 'Part No' },
    { key: 'currentShot', label: 'Running Shot', align: 'right',
      render: v => <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>{formatNumber(v)}</span> },
    { key: 'lifeShot',    label: 'Life Shot',    align: 'right',
      render: v => <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12 }}>{formatNumber(v)}</span> },
    {
      key: 'shotLifeBar', label: 'Shot %', sortable: false,
      render: (_, row) => {
        const pct = getShotLifePercent(row);
        const col = getShotLifeColor(pct);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 72, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 3 }}/>
            </div>
            <span style={{ fontSize: 11, color: col, fontWeight: 600, minWidth: 28 }}>{pct}%</span>
          </div>
        );
      },
    },
    { key: 'category', label: 'Cat',    render: v => <CategoryBadge category={v}/> },
    // { key: 'status',   label: 'Status', render: v => <StatusBadge   status={v}/> },
    { key: 'actions', label: '', sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => openEdit(row)} title="Edit" style={actBtn}>
            <S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          <button onClick={() => showToast({ type: 'info', title: 'Print Label', message: `Printing label for ${row.code}...` })} title="Print" style={actBtn}>
            <S d={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}/>
          </button>
          {/* <button onClick={() => setDeleteModal(row)} title="Delete" style={{ ...actBtn, color: 'var(--red)' }}>
            <S d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>}/>
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Mould Master" subtitle="Manage all mould records and configurations"
        actions={<>
          <Button variant="secondary" size="sm">
            <S size={12} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}/> Excel
          </Button>
          <Button variant="secondary" size="sm">
            <S size={12} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/> PDF
          </Button>
          <Button onClick={openCreate}>
            <S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> Add Mould
          </Button>
        </>}
      />

      <DataTable
        columns={columns}
        data={displayData}
        searchKeys={['code', 'name', 'partNo', 'location']}
        pageSize={10}
        toolbar={
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter:</span>
            {['all', ...CAT_KEYS].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                background: catFilter === c ? 'var(--accent-glow)' : 'transparent',
                border:     catFilter === c ? '1px solid var(--accent)' : '1px solid var(--border)',
                color:      catFilter === c ? 'var(--accent)' : 'var(--text3)',
                transition: 'all var(--trans)',
              }}>
                {c === 'all' ? 'All' : `Cat ${c}`}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Add / Edit Modal ───────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Mould' : 'Add New Mould'}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Mould
          </Button>
        </>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          <FormField label="Mould Code" required error={errors.code?.message}>
            <input {...register('code', { required: 'Required' })} placeholder="Enter a Mold Code" style={activeInputStyle}/>
          </FormField>

          <FormField label="Mould Name" required error={errors.name?.message}>
            <input {...register('name', { required: 'Required' })} placeholder="Front Cover" style={activeInputStyle}/>
          </FormField>

          <FormField label="Mould Size" required error={errors.size?.message}>
            <input {...register('size', { required: 'Required' })} placeholder="450×300×200" style={activeInputStyle}/>
          </FormField>

          <FormField label="Cavity" required error={errors.cavity?.message}>
            <input {...register('cavity', { required: 'Required' })} type="number" placeholder="Enter number of cavity" style={activeInputStyle}/>
          </FormField>

          {/* ── Opening Shot — unlocked on create, always disabled on edit ── */}
          <FormField label="Opening Shot" required error={errors.openingShot?.message}>
            {editId ? (
              <div style={{ position: 'relative' }}>
                <input
                  {...register('openingShot', { required: 'Required' })}
                  type="number"
                  placeholder="0"
                  disabled
                  style={{ ...disabledInputStyle, paddingRight: 36 }}
                />
                <span style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text3)', pointerEvents: 'none', display: 'flex',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              </div>
            ) : (
              <input
                {...register('openingShot', { required: 'Required' })}
                type="number"
                placeholder="0"
                style={activeInputStyle}
              />
            )}
          </FormField>

          {/* ── Current Shot — always disabled, mirrors opening shot on create ── */}
          <FormField label="Current Shot" required error={errors.currentShot?.message}>
            <div style={{ position: 'relative' }}>
              <input
                {...register('currentShot', { required: 'Required' })}
                type="number"
                placeholder="Auto"
                disabled
                style={{ ...disabledInputStyle, paddingRight: 36 }}
              />
              <span style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text3)', pointerEvents: 'none', display: 'flex',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
            </div>
          </FormField>

          <FormField label="Life Shot" required error={errors.lifeShot?.message}>
            <input {...register('lifeShot', { required: 'Required' })} type="number" placeholder="500000" style={activeInputStyle}/>
          </FormField>

          <FormField label="Location" required error={errors.location?.message}>
            <input {...register('location', { required: 'Required' })} placeholder="Shop Floor A" style={activeInputStyle}/>
          </FormField>

          <FormField label="Part No" required error={errors.partNo?.message}>
            <SearchableSelect
              options={PART_OPTIONS}
              value={watch('partNo') ?? ''}
              onChange={val => setValue('partNo', val, { shouldValidate: true })}
              placeholder="Select Part No..."
            />
            <input
              type="hidden"
              {...register('partNo', { required: 'Select Part No' })}
            />
          </FormField>

          <FormField label="Installation Date" required error={errors.usedFrom?.message}>
            <input {...register('usedFrom', { required: 'Required' })} type="date" style={activeInputStyle}/>
          </FormField>

          <FormField label="Category" required error={errors.category?.message}>
            <select {...register('category', { required: 'Required' })} style={activeInputStyle}>
              <option value="">Select...</option>
              {CAT_KEYS.map(k => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
            </select>
          </FormField>

          <FormField label="Direction" required error={errors.direction?.message}>
            <select {...register('direction', { required: 'Required' })} style={activeInputStyle}>
              <option value="">Select...</option>
              <option value="F">Front</option>
              <option value="R">Rear</option>
            </select>
          </FormField>

          {/* ── PM Frequency Dropdown ── */}
          <FormField label="PM Frequency (Days)" error={errors.pmDaysOption?.message}>
            <SearchableSelect
              options={FREQ_OPTIONS}
              value={watch('pmDaysOption') ?? ''}
              onChange={val => setValue('pmDaysOption', Number(val), { shouldValidate: true })}
              placeholder="Select PM frequency..."
            />
            <input type="hidden" {...register('pmDaysOption')} />
          </FormField>

          <FormField label="PM Freq (Days)" required error={errors.pmDays?.message}>
            <input {...register('pmDays', { required: 'Required' })} type="number" placeholder="30" style={activeInputStyle}/>
          </FormField>

          <FormField label="PM Freq (Shots)" required error={errors.pmShots?.message}>
            <input {...register('pmShots', { required: 'Required' })} type="number" placeholder="10000" style={activeInputStyle}/>
          </FormField>

          <FormField label="Barcode" required error={errors.barcode?.message}>
            <input {...register('barcode', { required: 'Required' })} placeholder="BC-2024-0042" style={activeInputStyle}/>
          </FormField>

          <FormField label="Mould Color">
            <input {...register('color')} placeholder="Silver / N/A" style={activeInputStyle}/>
          </FormField>

          <FormField label="Customer">
            <input {...register('supplier')} placeholder="Customer name" style={activeInputStyle}/>
          </FormField>

          <FormField label="Maker / Supplier" required error={errors.maker?.message}>
            <input {...register('maker', { required: 'Required' })} placeholder="Supplier name" style={activeInputStyle}/>
          </FormField>

          <FormField label="Remarks" required full error={errors.remarks?.message}>
            <textarea {...register('remarks', { required: 'Required' })} placeholder="Additional notes..." style={{ ...activeInputStyle, minHeight: 72, resize: 'vertical' }}/>
          </FormField>

        </div>
      </Modal>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <S size={13} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/> Delete
          </Button>
        </>}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--red)' }}>
            <S size={18} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Delete <strong style={{ color: 'var(--red)' }}>{deleteModal?.code}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              This will permanently remove <strong>{deleteModal?.name}</strong> and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Searchable Select ─────────────────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder = 'Select...', disabled = false, error, maxItems = 4 }) {
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

  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

      {/* Trigger — matches activeInputStyle */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          ...activeInputStyle,
          display:     'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor:      disabled ? 'not-allowed' : 'pointer',
          opacity:     disabled ? 0.5 : 1,
          borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)',
          boxShadow:   open ? '0 0 0 3px var(--accent-glow)' : 'none',
          userSelect:  'none', gap: 8,
        }}
      >
        <span style={{
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: selected ? 'var(--text)' : 'var(--text3)', fontSize: 13,
        }}>
          {selected ? selected.label : placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selected && !disabled && (
            <span onClick={handleClear}
              style={{ color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4, lineHeight: 1, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--text3)', transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 999,
          ...(dropUp ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}>

          {/* Search */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
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
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>
                ✕
              </button>
            )}
          </div>

          {/* Options */}
          <div className="dropdown-scroll" style={{ maxHeight: maxItems * 40, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
                No results for "{search}"
              </div>
            ) : filtered.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div key={opt.value} onClick={() => handleSelect(opt)} style={{
                  padding: '9px 12px', fontSize: 13, cursor: 'pointer',
                  color:      isSelected ? 'var(--accent)' : 'var(--text)',
                  background: isSelected ? 'var(--accent-glow)' : 'transparent',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background var(--trans)',
                }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--accent-glow)' : 'transparent'; }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {opt.label}
                  </span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 8 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const actBtn = {
  width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all var(--trans)',
};
