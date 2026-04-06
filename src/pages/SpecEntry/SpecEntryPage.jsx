import { useState, useRef, useEffect } from 'react';
import { useForm }  from 'react-hook-form';
import PageHeader   from '@/components/layout/PageHeader';
import Button       from '@/components/common/Button';
import DataTable    from '@/components/table/DataTable';
import Modal        from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { useUIStore } from '@/store/uiStore';
import { MOCK_SPECS, MOCK_MOULDS } from '@/utils/mockData';
import { useImgDropdown } from '@/hooks/useSpecEntry';
import { useMouldDropdown } from '@/hooks/useMoulds';
import { usePMDropdown } from '@/hooks/usePMPlans';
import { useSpecDropdowns } from '@/hooks/useSpecEntry';
import { useCreateSpec } from '@/hooks/useSpecEntry';
import { useSpecs } from '@/hooks/useSpecEntry';
const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const CHECK_AREAS   = ['Cooling System','Ejector Pins','Parting Line','Core & Cavity','Gate / Runner','Surface Finish','Venting'];
const CHECK_POINTS  = ['Water flow check','Pin movement','Flash inspection','Wear measurement','Gate condition','Surface scratch','Vent blockage'];
const CHECK_METHODS = ['Visual','Measurement','Functional','Dimensional'];
const CONDITIONS    = ['OK / NG','Pass / Fail','Within Spec','Not Applicable'];
// const FREQ_OPTIONS  = ['Monthly','Quarterly','HalfYearly','Yearly'];

// ── Convert string arrays to option objects ───────────────────────────────────
const toOptions = arr => arr.map(v => ({ label: v, value: v }));

// const FREQ_OPT        = toOptions(FREQ_OPTIONS);

// ── Image options (placeholder names — swap src with real paths later) ────────
// const IMAGE_OPTIONS = [
//   { label: 'cooling_system_check.png',   value: 'cooling_system_check.png',   src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'ejector_pin_inspect.png',    value: 'ejector_pin_inspect.png',    src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'parting_line_flash.png',     value: 'parting_line_flash.png',     src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'core_cavity_wear.png',       value: 'core_cavity_wear.png',       src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'gate_runner_cond.png',       value: 'gate_runner_cond.png',       src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'surface_scratch_ref.png',    value: 'surface_scratch_ref.png',    src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'vent_blockage_guide.png',    value: 'vent_blockage_guide.png',    src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
//   { label: 'water_flow_diagram.png',     value: 'water_flow_diagram.png',     src: 'https://placehold.co/48x48/1e293b/64748b?text=IMG' },
// ];

export default function SpecEntryPage() {
    const { data: dropdowns, isLoading: dropdownLoading } = useSpecDropdowns();

  // ✅ since mapping already done in service, just assign
  const AREA_OPTIONS   = dropdowns?.checkAreas   || [];
const POINT_OPTIONS  = dropdowns?.checkPoints  || [];   // ✅ fix
const METHOD_OPTIONS = dropdowns?.checkMethods || [];   // ✅ fix
const COND_OPTIONS   = dropdowns?.conditions   || []; 
  // const [specs, setSpecs]             = useState(MOCK_SPECS);
  const [modalOpen, setModalOpen]     = useState(false);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editId, setEditId]           = useState(null);
  const { showToast } = useUIStore();

  const { data: MOULD_OPTIONS = [] } = useMouldDropdown();
const { data: FREQ_OPTIONS = [] }    = usePMDropdown();
const { data: IMAGE_OPTIONS = [], isLoading: imgLoading } = useImgDropdown();
const { mutate: createSpec } = useCreateSpec();
const { data: specs = [], isLoading } = useSpecs();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const openCreate = () => { setEditId(null); reset({ order: 1 }); setModalOpen(true); };
  const openEdit   = s  => { setEditId(s.id); reset(s); setModalOpen(true); };

  const confirmDelete = () => {
    setSpecs(s => s.filter(x => x.id !== deleteModal.id));
    showToast({ type: 'success', title: 'Deleted', message: 'Spec entry removed.' });
    setDeleteModal(null);
  };

const onSubmit = (data) => {
  if (editId) {
    updateSpec({
      id: editId,
      ...data
    });
  } else {
    createSpec(data);
  }

  setModalOpen(false);
};
  const columns = [
    { key: 'mouldCode', label: 'Mould Code', primary: true,
      render: v => <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key: 'mouldName', label: 'Mould Name' },
    { key: 'area',      label: 'Check Area' },
    { key: 'point',     label: 'Check Point' },
    { key: 'method',    label: 'Method' },
    { key: 'condition', label: 'Condition' },
    { key: 'freq',      label: 'Frequency' },
    { key: 'image', label: 'Ref Image',
      render: v => v ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
            <img src={IMAGE_OPTIONS.find(i => i.value === v)?.src} alt={v} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
        </div>
      ) : <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>,
    },
    { key: 'order',     label: '#', align: 'center' },
    { key: 'actions', label: '', sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => openEdit(row)} style={actBtn}>
            <S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          <button onClick={() => setDeleteModal(row)} style={{ ...actBtn, color: 'var(--red)' }}>
            <S d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="PM Spec Entry" subtitle="Define check items and required conditions per mould"
        actions={<>
          <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}>
            <S size={12} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/> Upload CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => showToast({ type: 'info', title: 'Download', message: 'Downloading CSV template...' })}>
            <S size={12} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/> Template
          </Button>
          <Button onClick={openCreate}>
            <S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> Add Spec
          </Button>
        </>}
      />

      <DataTable columns={columns} data={specs} searchKeys={['mouldCode', 'mouldName', 'area', 'point']} pageSize={10}/>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit PM Spec' : 'Add PM Spec'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Spec
          </Button>
        </>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Mould — SearchableSelect, only on create */}
          {!editId && (
            <FormField label="Mould" required error={errors.mouldId?.message}>
              <SearchableSelect
                options={MOULD_OPTIONS}
                value={watch('mouldId') ?? ''}
                onChange={val => setValue('mouldId', val, { shouldValidate: true })}
                placeholder="Search mould..."
                error={errors.mouldId?.message}
                maxItems={4}
              />
              <input type="hidden" {...register('mouldId', { required: 'Select a mould' })}/>
            </FormField>
          )}

          {/* PM Frequency — SearchableSelect */}
          <FormField label="PM Frequency" required error={errors.freq?.message}>
            <SearchableSelect
              options={FREQ_OPTIONS}
              value={watch('freq') ?? ''}
              onChange={val => setValue('freq', val, { shouldValidate: true })}
              placeholder="Select frequency..."
              error={errors.freq?.message}
              maxItems={4}
            />
            <input type="hidden" {...register('freq', { required: 'Select a frequency' })}/>
          </FormField>

          {/* Check Area — SearchableSelect */}
          <FormField label="Check Area" required error={errors.area?.message}>
            <SearchableSelect
              options={AREA_OPTIONS}
              value={watch('area') ?? ''}
              onChange={val => setValue('area', val, { shouldValidate: true })}
              placeholder="Select area..."
              error={errors.area?.message}
              maxItems={4}
            />
            <input type="hidden" {...register('area', { required: 'Select an area' })}/>
          </FormField>

          {/* Check Point — SearchableSelect */}
          <FormField label="Check Point" required error={errors.point?.message}>
            <SearchableSelect
              options={POINT_OPTIONS}
              value={watch('point') ?? ''}
              onChange={val => setValue('point', val, { shouldValidate: true })}
              placeholder="Select check point..."
              error={errors.point?.message}
              maxItems={4}
            />
            <input type="hidden" {...register('point', { required: 'Select a check point' })}/>
          </FormField>

          {/* Check Method — SearchableSelect */}
          <FormField label="Check Method" required error={errors.method?.message}>
            <SearchableSelect
              options={METHOD_OPTIONS}
              value={watch('method') ?? ''}
              onChange={val => setValue('method', val, { shouldValidate: true })}
              placeholder="Select method..."
              error={errors.method?.message}
              maxItems={4}
            />
            <input type="hidden" {...register('method', { required: 'Select a method' })}/>
          </FormField>

          {/* Required Condition — SearchableSelect */}
          <FormField label="Required Condition" required error={errors.condition?.message}>
            <SearchableSelect
              options={COND_OPTIONS}
              value={watch('condition') ?? ''}
              onChange={val => setValue('condition', val, { shouldValidate: true })}
              placeholder="Select condition..."
              error={errors.condition?.message}
              maxItems={4}
            />
            <input type="hidden" {...register('condition', { required: 'Select a condition' })}/>
          </FormField>

          {/* Reference Image — ImageSelect (required on both create & edit) */}
          <div style={{ gridColumn: '1 / -1' }}>
          <FormField label="Reference Image" required error={errors.image?.message}>
            <ImageSelect
              options={IMAGE_OPTIONS}
              value={watch('image') ?? ''}
              onChange={val => setValue('image', val, { shouldValidate: true })}
              placeholder="Select reference image..."
              error={errors.image?.message}
              maxItems={4}
            />
            <input type="hidden" {...register('image', { required: 'Select a reference image' })}/>
          </FormField>
          </div>

          {/* Order By — plain number input (no dropdown needed) */}
          <FormField label="Order By" required error={errors.order?.message}>
            <input
              {...register('order', { required: 'Required' })}
              type="number"
              placeholder="1"
              style={inputStyle}
            />
          </FormField>

        </div>
      </Modal>

      {/* ── Upload CSV Modal ─────────────────────────────────────────────── */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Spec CSV"
        footer={<>
          <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button onClick={() => { setUploadOpen(false); showToast({ type: 'success', title: 'Uploaded', message: 'Specs imported successfully.' }); }}>
            <S size={13} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/> Import
          </Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            Upload a <strong>.csv</strong> file with columns:{' '}
            <code style={{ fontSize: 11, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)' }}>
              Model, Pmfrequency, CheckAreas, CheckPoint, CheckMethod, RequiredCondition, OrderBy
            </code>
          </p>
          <div style={{ border: '2px dashed var(--border2)', borderRadius: 10, padding: '28px 20px', textAlign: 'center', background: 'var(--bg3)' }}>
            <S size={28} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/>
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: '10px 0 14px' }}>Drop your CSV file here or</p>
            <input type="file" accept=".csv" id="csv-upload" style={{ display: 'none' }}/>
            <label htmlFor="csv-upload">
              <Button variant="secondary" size="sm" style={{ cursor: 'pointer' }}>Browse File</Button>
            </label>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)' }}>Only <strong>CSV</strong> format accepted. Download the template first to ensure correct column headers.</p>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <S size={13} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/> Delete
          </Button>
        </>}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <S size={18} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Delete this spec entry?</p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}><strong>{deleteModal?.area} — {deleteModal?.point}</strong> will be permanently removed.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Image Select Component ────────────────────────────────────────────────────
function ImageSelect({ options, value, onChange, placeholder = 'Select image...', disabled = false, error, maxItems = 4 }) {
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
      const rect = triggerRef.current.getBoundingClientRect();
      // setDropUp(window.innerHeight - rect.bottom < 300);
      setDropUp(false);
    }
    setOpen(o => !o);
    if (open) setSearch('');
  };

  const handleSelect = opt => { onChange(opt.value); setSearch(''); setOpen(false); };
  const handleClear  = e  => { e.stopPropagation(); onChange(''); setSearch(''); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          ...inputStyle,
          background:  disabled ? 'var(--bg3)' : 'var(--surface)',
          display:     'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor:      disabled ? 'not-allowed' : 'pointer',
          opacity:     disabled ? 0.5 : 1,
          borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)',
          boxShadow:   open ? '0 0 0 3px var(--accent-glow)' : 'none',
          userSelect:  'none', gap: 8,
        }}
      >
        {selected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, overflow: 'hidden' }}>
            <div style={{ width: 26, height: 26, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
              <img src={selected.src} alt={selected.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.label}
            </span>
          </div>
        ) : (
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text3)' }}>{placeholder}</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selected && !disabled && (
            <span
              onClick={handleClear}
              style={{ color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4, cursor: 'pointer' }}
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

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 999,
          ...(dropUp ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          overflow: 'hidden',
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
              placeholder="Search image..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: 0 }}>✕</button>
            )}
          </div>

          {/* Options with thumbnail */}
          <div className="dropdown-scroll" style={{ maxHeight: maxItems * 52, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
                No results for "{search}"
              </div>
            ) : filtered.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    background: isSelected ? 'var(--accent-glow)' : 'transparent',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background var(--trans)',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--accent-glow)' : 'transparent'; }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: 36, height: 36, borderRadius: 7, overflow: 'hidden', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, flexShrink: 0 }}>
                    <img src={opt.src} alt={opt.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  {/* Label */}
                  <span style={{
                    flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: isSelected ? 'var(--accent)' : 'var(--text)',
                  }}>
                    {opt.label}
                  </span>
                  {/* Checkmark */}
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: 'var(--accent)', flexShrink: 0 }}>
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

// ── Searchable Select Component ───────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder = 'Select...', disabled = false, error, maxItems = 3 }) {
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
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto focus search when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
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

  const handleSelect = opt => {
    onChange(opt.value);
    setSearch('');
    setOpen(false);
  };

  const handleClear = e => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>

      {/* Trigger button */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        style={{
          ...inputStyle,
          background: disabled ? 'var(--bg3)' : 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)',
          boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
          userSelect: 'none', gap: 8,
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
            <span
              onClick={handleClear}
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
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}>

          {/* Search input */}
          <div style={{
            padding: '8px 10px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
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
              style={{
                flex: 1, background: 'none', border: 'none',
                color: 'var(--text)', fontSize: 13,
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}
              >✕</button>
            )}
          </div>

          {/* Options list with scroll limit */}
          <div className="dropdown-scroll" style={{ maxHeight: maxItems * 40, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
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
  width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all var(--trans)',
};
