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
import { useAddSpecDropdownItem } from '@/hooks/useSpecEntry'; // ← hook to save new item to DB

const S = ({ d, size=14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

// ── Quick-Add Popover ─────────────────────────────────────────────────────────
// Shows an inline input + Save when the + button is clicked next to a dropdown.
// fieldKey: the API key used to identify which dropdown list to add to
// onSaved:  callback after successful save — refreshes the dropdown list
function QuickAddPopover({ fieldKey, label, onSaved }) {
  const [open, setOpen]       = useState(false);
  const [value, setValue]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const wrapRef               = useRef(null);
  const inputRef              = useRef(null);
  const { mutate: addItem }   = useAddSpecDropdownItem();
  const { showToast }         = useUIStore();

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setValue('');
        setError('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

const handleSave = () => {
  const trimmed = value.trim();
  if (!trimmed) {
    setError('Please enter a value.');
    return;
  }

  setSaving(true);
  setError('');

  addItem(
    { fieldKey, value: trimmed },
    {
      onSuccess: () => {
        // ❌ REMOVE toast from here

        setValue('');
        setOpen(false);
        setSaving(false);

        if (onSaved) onSaved();
      },
      onError: (err) => {
        // ❌ DO NOT show toast here (hook handles it)

        setError(err?.message || 'Failed to save. Try again.');
        setSaving(false);
      },
    }
  );
};

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setOpen(false); setValue(''); setError(''); }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* + Button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setValue(''); setError(''); }}
        title={`Add new ${label}`}
        style={{
          width: 28, height: 28,
          borderRadius: 7,
          border: open ? '1px solid var(--accent)' : '1px solid var(--border)',
          background: open ? 'var(--accent-glow)' : 'var(--bg3)',
          color: open ? 'var(--accent)' : 'var(--text2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--trans)',
          flexShrink: 0,
        }}
      >
        <S size={13} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>
      </button>

      {/* Popover panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          zIndex: 1100,
          width: 260,
          background: 'var(--surface2)',
          border: '1px solid var(--accent)',
          borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '9px 12px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--accent-glow)',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              style={{ color: 'var(--accent)' }}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Add {label}
            </span>
          </div>

          {/* Input area */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              ref={inputRef}
              value={value}
              onChange={e => { setValue(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder={`Enter ${label.toLowerCase()}...`}
              style={{
                ...inputStyle,
                fontSize: 13,
                background: 'var(--bg3)',
                borderColor: error ? 'var(--red)' : 'var(--border)',
              }}
            />
            {error && (
              <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>
            )}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setOpen(false); setValue(''); setError(''); }}
                style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  border: 'none', background: 'var(--accent)',
                  color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {saving ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      style={{ animation: 'spin 0.7s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <S size={11} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner keyframe injected once */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── FieldWithAdd — wraps a SearchableSelect + QuickAddPopover in one row ───────
function FieldWithAdd({ label, required, error, fieldKey, dropdownLabel, options, value, onChange, placeholder, maxItems = 4, onItemAdded }) {
  return (
    <FormField label={label} required={required} error={error}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <SearchableSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            error={error}
            maxItems={maxItems}
          />
        </div>
        <QuickAddPopover
          fieldKey={fieldKey}
          label={dropdownLabel}
          onSaved={onItemAdded}
        />
      </div>
    </FormField>
  );
}

export default function SpecEntryPage() {
  const { data: dropdowns, isLoading: dropdownLoading, refetch: refetchDropdowns } = useSpecDropdowns();

  const AREA_OPTIONS   = dropdowns?.checkAreas   || [];
  const POINT_OPTIONS  = dropdowns?.checkPoints  || [];
  const METHOD_OPTIONS = dropdowns?.checkMethods || [];
  const COND_OPTIONS   = dropdowns?.conditions   || [];

  const [modalOpen, setModalOpen]     = useState(false);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editId, setEditId]           = useState(null);
  const { showToast } = useUIStore();

  const { data: MOULD_OPTIONS = [] }                      = useMouldDropdown();
  const { data: FREQ_OPTIONS = [] }                       = usePMDropdown();
  const { data: IMAGE_OPTIONS = [], isLoading: imgLoading } = useImgDropdown();
  const { mutate: createSpec }                            = useCreateSpec();
  const { data: specs = [], isLoading }                   = useSpecs();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const openCreate = () => { setEditId(null); reset({ order: 1 }); setModalOpen(true); };
  const openEdit   = s  => { setEditId(s.id); reset(s); setModalOpen(true); };

  const confirmDelete = () => {
    setDeleteModal(null);
    showToast({ type: 'success', title: 'Deleted', message: 'Spec entry removed.' });
  };

  const onSubmit = data => {
    if (editId) {
      updateSpec({ id: editId, ...data });
    } else {
      createSpec(data);
    }
    setModalOpen(false);
  };

  const columns = [
    { key: 'mouldCode', label: 'Mould Code', primary: true,
      render: v => (
        <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>
          {v}
        </code>
      ),
    },
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
    { key: 'order', label: '#', align: 'center' },
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
      <PageHeader
        title="PM Spec Entry"
        subtitle="Define check items and required conditions per mould"
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

      <DataTable
        columns={columns}
        data={specs}
        searchKeys={['mouldCode', 'mouldName', 'area', 'point']}
        pageSize={10}
      />

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit PM Spec' : 'Add PM Spec'}
        /* ← bigger modal */
        size="xl"                          
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Spec
          </Button>
        </>}
      >
          <div
    style={{
      marginBottom: 12,
      padding: '8px 12px',
      borderRadius: 7,
      background: 'var(--accent-glow)',
      border: '1px solid rgba(79,143,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 11,
      color: 'var(--accent)'
    }}
  >
    <S size={13} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />
    Click <strong>+</strong> to add items (Check Area, Point, Method, Condition)
  </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Mould — only on create */}
          {!editId && (
            <FormField label="Mould" required error={errors.mouldId?.message}>
              <SearchableSelect
                options={MOULD_OPTIONS}
                value={watch('mouldId') ?? ''}
                onChange={val => setValue('mouldId', val, { shouldValidate: true })}
                placeholder="Search mould..."
                error={errors.mouldId?.message}
                maxItems={5}
              />
              <input type="hidden" {...register('mouldId', { required: 'Select a mould' })}/>
            </FormField>
          )}

          {/* PM Frequency */}
          <FormField label="PM Frequency" required error={errors.freq?.message}>
            <SearchableSelect
              options={FREQ_OPTIONS}
              value={watch('freq') ?? ''}
              onChange={val => setValue('freq', val, { shouldValidate: true })}
              placeholder="Select frequency..."
              error={errors.freq?.message}
              maxItems={5}
            />
            <input type="hidden" {...register('freq', { required: 'Select a frequency' })}/>
          </FormField>

          {/* Check Area — with + quick add */}
          <FieldWithAdd
            label="Check Area"
            required
            error={errors.area?.message}
            fieldKey="checkAreas"
            dropdownLabel="Check Area"
            options={AREA_OPTIONS}
            value={watch('area') ?? ''}
            onChange={val => setValue('area', val, { shouldValidate: true })}
            placeholder="Select area..."
            maxItems={5}
            onItemAdded={refetchDropdowns}
          />
          <input type="hidden" {...register('area', { required: 'Select an area' })}/>

          {/* Check Point — with + quick add */}
          <FieldWithAdd
            label="Check Point"
            required
            error={errors.point?.message}
            fieldKey="checkPoints"
            dropdownLabel="Check Point"
            options={POINT_OPTIONS}
            value={watch('point') ?? ''}
            onChange={val => setValue('point', val, { shouldValidate: true })}
            placeholder="Select check point..."
            maxItems={5}
            onItemAdded={refetchDropdowns}
          />
          <input type="hidden" {...register('point', { required: 'Select a check point' })}/>

          {/* Check Method — with + quick add */}
          <FieldWithAdd
            label="Check Method"
            required
            error={errors.method?.message}
            fieldKey="checkMethods"
            dropdownLabel="Check Method"
            options={METHOD_OPTIONS}
            value={watch('method') ?? ''}
            onChange={val => setValue('method', val, { shouldValidate: true })}
            placeholder="Select method..."
            maxItems={5}
            onItemAdded={refetchDropdowns}
          />
          <input type="hidden" {...register('method', { required: 'Select a method' })}/>

          {/* Required Condition — with + quick add */}
          <FieldWithAdd
            label="Required Condition"
            required
            error={errors.condition?.message}
            fieldKey="conditions"
            dropdownLabel="Condition"
            options={COND_OPTIONS}
            value={watch('condition') ?? ''}
            onChange={val => setValue('condition', val, { shouldValidate: true })}
            placeholder="Select condition..."
            maxItems={5}
            onItemAdded={refetchDropdowns}
          />
          <input type="hidden" {...register('condition', { required: 'Select a condition' })}/>

          {/* Reference Image — full width */}
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

          {/* Order By */}
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
          <p style={{ fontSize: 11, color: 'var(--text3)' }}>
            Only <strong>CSV</strong> format accepted. Download the template first to ensure correct column headers.
          </p>
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
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              <strong>{deleteModal?.area} — {deleteModal?.point}</strong> will be permanently removed.
            </p>
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

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setSearch(''); }
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
      setDropUp(false);
    }
    setOpen(o => !o);
    if (open) setSearch('');
  };

  const handleSelect = opt => { onChange(opt.value); setSearch(''); setOpen(false); };
  const handleClear  = e  => { e.stopPropagation(); onChange(''); setSearch(''); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <div ref={triggerRef} onClick={handleToggle} style={{
        ...inputStyle,
        background:  disabled ? 'var(--bg3)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)',
        boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
        userSelect: 'none', gap: 8,
      }}>
        {selected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, overflow: 'hidden' }}>
            <div style={{ width: 26, height: 26, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
              <img src={selected.src} alt={selected.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.label}</span>
          </div>
        ) : (
          <span style={{ flex: 1, fontSize: 13, color: 'var(--text3)' }}>{placeholder}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selected && !disabled && (
            <span onClick={handleClear} style={{ color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
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

      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 999,
          top: 'calc(100% + 4px)',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
                if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0]);
              }}
              placeholder="Search image..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, padding: 0 }}>✕</button>}
          </div>
          <div className="dropdown-scroll" style={{ maxHeight: maxItems * 52, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>No results for "{search}"</div>
            ) : filtered.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div key={opt.value} onClick={() => handleSelect(opt)} style={{
                  padding: '8px 12px', cursor: 'pointer',
                  background: isSelected ? 'var(--accent-glow)' : 'transparent',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'background var(--trans)',
                }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--accent-glow)' : 'transparent'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 7, overflow: 'hidden', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, flexShrink: 0 }}>
                    <img src={opt.src} alt={opt.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{opt.label}</span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
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

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setSearch(''); }
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
      setDropUp(window.innerHeight - rect.bottom < 240);
    }
    setOpen(o => !o);
    if (open) setSearch('');
  };

  const handleSelect = opt => { onChange(opt.value); setSearch(''); setOpen(false); };
  const handleClear  = e  => { e.stopPropagation(); onChange(''); setSearch(''); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <div ref={triggerRef} onClick={handleToggle} style={{
        ...inputStyle,
        background: disabled ? 'var(--bg3)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)',
        boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
        userSelect: 'none', gap: 8,
      }}>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected ? 'var(--text)' : 'var(--text3)', fontSize: 13 }}>
          {selected ? selected.label : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selected && !disabled && (
            <span onClick={handleClear} style={{ color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4, lineHeight: 1, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
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

      {open && (
        <div style={{
          position: 'absolute', left: 0, right: 0, zIndex: 999,
          ...(dropUp ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setOpen(false); setSearch(''); }
                if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0]);
              }}
              placeholder="Type to search..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>✕</button>}
          </div>
          <div className="dropdown-scroll" style={{ maxHeight: maxItems * 40, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>No results for "{search}"</div>
            ) : filtered.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div key={opt.value} onClick={() => handleSelect(opt)} style={{
                  padding: '9px 12px', fontSize: 13, cursor: 'pointer',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                  background: isSelected ? 'var(--accent-glow)' : 'transparent',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background var(--trans)',
                }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--accent-glow)' : 'transparent'; }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{opt.label}</span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 8 }}>
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
