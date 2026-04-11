import { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader        from '@/components/layout/PageHeader';
import DataTable         from '@/components/table/DataTable';
import Modal             from '@/components/common/Modal';
import { StatusBadge }   from '@/components/common/Badge';
import { useSpecDropdowns } from '@/hooks/useSpecEntry';
import { useUIStore }    from '@/store/uiStore';
import {
  useChecksheetList,
  useSaveChecksheet,
  useChecksheetDetails,
  useUpdateChecksheet,
  useCompleteChecksheet
} from '@/hooks/useChecksheet';

/* ─────────────────────────────────────────────────────────────────────────────
   IMAGE BASE PATH
   Files placed at: <project-root>/public/uploads/checksheet/<filename>
   are served at:   /uploads/checksheet/<filename>
───────────────────────────────────────────────────────────────────────────── */
const IMAGE_BASE_PATH = '/uploads/checksheet/';

/* ─── tiny SVG helper ──────────────────────────────────────────────────────── */
const S = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

/* ─── inline spinner ───────────────────────────────────────────────────────── */
const LoadingSpinner = ({ size = 14 }) => (
  <>
    <style>{`@keyframes cs-spin{to{transform:rotate(360deg)}}`}</style>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
      style={{ animation: 'cs-spin 0.7s linear infinite', flexShrink: 0 }}>
      <path d="M12 2a10 10 0 0 1 10 10" opacity={0.3}/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
  </>
);

/* ─── constants ────────────────────────────────────────────────────────────── */
const STATUS_FILTERS = ['all', 'Pending', 'Overdue'];
const freqOptions    = [
  { label: 'All',       value: 'all'       },
  { label: 'Monthly',   value: 'Monthly'   },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually',  value: 'Annually'  },
];
const STAGE = { LIST: 'list', ENTRY: 'entry' };

/* ── helpers ─────────────────────────────────────────────────────────────── */
const resolveImgSrc = (value) => {
  if (!value) return null;
  if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('/')) return value;
  return `${IMAGE_BASE_PATH}${value}`;
};

const extractFileName = (value) => {
  if (!value) return null;
  if (value.startsWith('data:')) return null;
  return value.split('/').pop();
};

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function ChecksheetPage() {
  const { data: dropdowns, isLoading: dropdownLoading } = useSpecDropdowns();

  /* currentSts already mapped to { label, value, type } by getSpecDropdowns */
const currentStatusOptions = dropdowns?.currentStatus || [];

  const { data: apiData = [] }         = useChecksheetList();
  const saveChecksheetMutation         = useSaveChecksheet();
  const checksheetDetailsMutation      = useChecksheetDetails();

  /* ── useUpdateChecksheet exposes mutate + isPending ── */
  const updateChecksheetMutation       = useUpdateChecksheet();
  const completeMutation = useCompleteChecksheet();

  const { showToast }                  = useUIStore();

  const [stage,        setStage]       = useState(STAGE.LIST);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [statusFilter, setStatus]      = useState('all');
  const [freqFilter,   setFreqFilter]  = useState('all');
  const [specs,        setSpecs]       = useState([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [credentials,  setCredentials] = useState({ prepared: '', checked: '', approved: '' });
  const [completing,   setCompleting]  = useState(false);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entrySpecIdx,   setEntrySpecIdx]   = useState(0);
  const [accessRole]                        = useState('admin');

  /* ── open plan ── */
  const openPlan = async (plan) => {
    setSelectedPlan(plan);
    setSpecs([]);
    setStage(STAGE.ENTRY);
    setSpecsLoading(true);

    saveChecksheetMutation.mutate(plan, {
      onSuccess: async (saveRes) => {
        try {
          const id      = saveRes?.transId || plan.transId;
          const details = await checksheetDetailsMutation.mutateAsync(id);
          setSpecs(details);
        } catch (err) {
          console.error('Fetch details failed:', err);
          showToast({ type: 'error', title: 'Error', message: 'Failed to load checksheet details' });
        } finally {
          setSpecsLoading(false);
        }
      },
      onError: (err) => {
        console.error('Create failed:', err);
        setSpecsLoading(false);
      },
    });
  };

  const backToList     = () => { setStage(STAGE.LIST); setSelectedPlan(null); setSpecs([]); };
  const openEntryModal = (idx) => { setEntrySpecIdx(idx); setEntryModalOpen(true); };

  const updateSpecField = (id, field, value) =>
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const completedCount = specs.filter(s => s.statusText && s.statusText !== '').length;
  const pendingCount   = specs.length - completedCount;
  const canComplete    = pendingCount === 0 && specs.length > 0;

const handleComplete = () => {
  if (!canComplete) {
    showToast({
      type: 'error',
      title: 'Incomplete',
      message: `${pendingCount} item(s) still pending.`,
    });
    return;
  }

  completeMutation.mutate({
    reportNo: selectedPlan?.transId,
    preparedBy: credentials.prepared,
    checkedBy: credentials.checked,
    approvedBy: credentials.approved,
    createdBy: 3,
  }, {
    onSuccess: () => {
      backToList();
    }
  });
};

  const displayData = apiData.filter(p => {
    const statusMatch = statusFilter === 'all' || p.status === statusFilter;
    const freqMatch   = freqFilter   === 'all' || p.freq   === freqFilter;
    return statusMatch && freqMatch;
  });

  const columns = [
    {
      key: 'open', label: '', sortable: false,
      render: (_, row) => (
        <button onClick={() => openPlan(row)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7,
          background: 'var(--accent-glow)', border: '1px solid rgba(79,143,255,0.2)',
          color: 'var(--accent)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all var(--trans)',
        }}>
          <S size={12} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}/> Open
        </button>
      ),
    },
    {
      key: 'reportNo', label: 'Report No', primary: true,
      render: v => (
        <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>
          {v}
        </code>
      ),
    },
    { key: 'mould',  label: 'Mold'  },
    { key: 'partNo', label: 'Part No' },
    {
      key: 'freq', label: 'Frequency',
      render: v => (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500,
          background: v === 'Daily' ? 'var(--purple-bg)' : 'var(--accent-glow)',
          color:      v === 'Daily' ? 'var(--purple)'    : 'var(--accent)',
        }}>{v}</span>
      ),
    },
    { key: 'date',   label: 'Target Date' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v}/> },
  ];

  /* ── LIST VIEW ── */
  if (stage === STAGE.LIST) return (
    <div>
      <PageHeader title="Checksheet Entry" subtitle="Enter actual PM check results per maintenance plan"/>
      <DataTable
        columns={columns} data={displayData} searchKeys={['reportNo', 'mould', 'partNo']} pageSize={10}
        toolbar={
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
            <div style={{ width: 220, minWidth: 180 }}>
              <SearchableSelect options={freqOptions} value={freqFilter} onChange={setFreqFilter} placeholder="Frequency"/>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUS_FILTERS.map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  background: statusFilter === s ? 'var(--accent-glow)' : 'transparent',
                  border:     statusFilter === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color:      statusFilter === s ? 'var(--accent)' : 'var(--text3)',
                  transition: 'all var(--trans)',
                }}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );

  /* ── ENTRY VIEW ── */
  return (
    <div>
      {/* breadcrumb + Complete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={backToList} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all var(--trans)',
          }}>
            <S size={12} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/> Back
          </button>
          <div style={{ color: 'var(--text3)', fontSize: 12 }}>Checksheet Entry</div>
          <S size={12} d={<polyline points="9 18 15 12 9 6"/>}/>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Plan Detail</span>
        </div>

        <button
          onClick={handleComplete}
          disabled={!canComplete || completing}
          title={!canComplete ? `${pendingCount} item(s) still pending` : 'Complete and close the plan'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            color: canComplete ? '#fff' : 'var(--text3)',
            border: `1px solid ${canComplete ? 'transparent' : 'var(--border)'}`,
            cursor: canComplete ? 'pointer' : 'not-allowed',
            background: canComplete ? 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)' : 'var(--bg3)',
            opacity: completing ? 0.7 : 1,
            boxShadow: canComplete ? '0 2px 12px rgba(37,99,235,0.35)' : 'none',
            transition: 'all 0.2s',
          }}>
          <S size={14} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>
          {completing ? 'Completing…' : 'Complete'}
          {!canComplete && pendingCount > 0 && (
            <span style={{
              marginLeft: 4, fontSize: 10, fontWeight: 700, background: 'var(--bg4)',
              borderRadius: 20, padding: '1px 7px', color: 'var(--text3)', border: '1px solid var(--border)',
            }}>{pendingCount} left</span>
          )}
        </button>
      </div>

      <PlanInfoCard plan={selectedPlan} total={specs.length} completed={completedCount} pending={pendingCount}/>

      {/* progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: specs.length ? `${(completedCount / specs.length) * 100}%` : '0%',
            height: '100%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s ease',
          }}/>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>{completedCount}/{specs.length} filled</span>
      </div>

      {/* column headers */}
      {!specsLoading && specs.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 1fr 160px auto',
          alignItems: 'center', gap: 5, padding: '6px 14px', marginBottom: 2,
        }}>
          <span/>
          <span style={colHeaderStyle}>Check Area</span>
          <span style={colHeaderStyle}>Check Point</span>
          <span style={colHeaderStyle}>Check Method</span>
          <span style={colHeaderStyle}>Required Condition</span>
          <span style={colHeaderStyle}>Status</span>
          <span style={colHeaderStyle}>Action</span>
        </div>
      )}

      {specsLoading ? <LoadingRows/> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {specs.map((spec, idx) => (
            <SpecRow key={spec.id} spec={spec} idx={idx} onOpenEntry={() => openEntryModal(idx)}/>
          ))}
        </div>
      )}

      {!specsLoading && specs.length > 0 && (
        <CredentialsBar credentials={credentials} setCredentials={setCredentials} accessRole={accessRole}/>
      )}

      {/* ── Pass the full mutation object into the modal ── */}
      <ChecksheetEntryModal
        open={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        specs={specs}
        currentIdx={entrySpecIdx}
        setCurrentIdx={setEntrySpecIdx}
        onUpdate={(id, field, value) => updateSpecField(id, field, value)}
        onUpdateSpec={(id, fields) => setSpecs(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s))}
        showToast={showToast}
        currentStatusOptions={currentStatusOptions}
        dropdownLoading={dropdownLoading}
        updateMutation={updateChecksheetMutation}   /* ← the fix */
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SPEC REFERENCE IMAGE — display only
══════════════════════════════════════════════════════════════════════════════ */
function SpecReferenceImage({ specImage }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [specImage]);

  const apiFileName = extractFileName(specImage);
  const src         = resolveImgSrc(specImage);

  const SectionLabel = (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
      Spec Reference Image
    </div>
  );

  const FileNameBadge = apiFileName ? (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 8,
      padding: '3px 9px', borderRadius: 5,
      background: 'var(--bg4)', border: '1px solid var(--border)',
      fontSize: 10, color: 'var(--text3)', fontFamily: "'Geist Mono',monospace",
    }}>
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      {apiFileName}
    </div>
  ) : null;

  if (!specImage) {
    return (
      <div style={{ padding: '14px 18px 0' }}>
        {SectionLabel}
        <div style={{
          height: 100, borderRadius: 10,
          border: '1px dashed var(--border2)', background: 'var(--bg3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', opacity: 0.4 }}>
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
            <line x1="1" y1="1" x2="23" y2="23" stroke="var(--red)" strokeWidth={1.2} opacity={0.35}/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>No Image Configured</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, opacity: 0.7 }}>Set the spec image from the Spec Entry page</div>
          </div>
        </div>
      </div>
    );
  }

  if (src && !imgError) {
    return (
      <div style={{ padding: '14px 18px 0' }}>
        {SectionLabel}
        {FileNameBadge}
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg3)' }}>
          <img src={src} alt="Spec reference"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
            onError={() => setImgError(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 18px 0' }}>
      {SectionLabel}
      {FileNameBadge}
      <div style={{
        borderRadius: 10, border: '1px dashed rgba(239,68,68,0.35)',
        background: 'rgba(239,68,68,0.04)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '18px 16px',
      }}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444', opacity: 0.6 }}>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
          <line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" strokeWidth={1.2}/>
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#ef4444' }}>Image Not Found</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, lineHeight: 1.6 }}>
            Place the file at:&nbsp;
            <code style={{ background: 'var(--bg4)', padding: '1px 6px', borderRadius: 3, fontFamily: "'Geist Mono',monospace", fontSize: 9 }}>
              public{IMAGE_BASE_PATH}{apiFileName}
            </code>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, opacity: 0.7 }}>Update from the Spec Entry page</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   UNIFIED CHECKSHEET ENTRY MODAL

   KEY FIX: receives `updateMutation` (the full TanStack mutation object) from
   the parent. Calls updateMutation.mutate(payload, { onSuccess }) directly.
   isPending drives the button loading state — no local `saving` state needed.
══════════════════════════════════════════════════════════════════════════════ */
function ChecksheetEntryModal({
  open, onClose, specs, currentIdx, setCurrentIdx,
  onUpdate, onUpdateSpec, showToast,
  currentStatusOptions, dropdownLoading,
  updateMutation,      // ← { mutate, isPending } from useUpdateChecksheet()
}) {
  if (!open || specs.length === 0) return null;

  const spec = specs[currentIdx];
  if (!spec) return null;

  const total   = specs.length;
  const isFirst = currentIdx === 0;
  const isLast  = currentIdx === total - 1;

  const statusText = spec.statusText || '';
  const filled     = statusText.trim() !== '';
  const saving     = updateMutation?.isPending ?? false;

  const goNext = () => { if (!isLast)  setCurrentIdx(i => i + 1); };
  const goPrev = () => { if (!isFirst) setCurrentIdx(i => i - 1); };

  /* When dropdown changes → find the label and populate statusText */
const handleStatusDropdownChange = (val) => {
  const selected = currentStatusOptions.find(o => o.value === val);

  onUpdateSpec(spec.id, {
    currentStatusDropdown: val,
    statusText: selected?.label || '',
    statusType: selected?.type || ''
  });
};

  const handleStatusTextChange = (val) => {
    onUpdate(spec.id, 'statusText', val);
  };

  /* Store dataURL (preview) + raw File object (for API) + filename (display) */
  const handleImgUpload = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      onUpdateSpec(spec.id, {
        [field]:           e.target.result,   // dataURL → <img> preview
        [`${field}Name`]:  file.name,         // display badge
        [`${field}File`]:  file,              // raw File → multipart binary
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClearImg = (field) => {
    onUpdateSpec(spec.id, {
      [field]: null, [`${field}Name`]: null, [`${field}File`]: null,
    });
  };

  /* ── SAVE ────────────────────────────────────────────────────────────────
     The payload shape matches what updateChecksheet() in checksheet.js
     expects — it builds the FormData there, so we just pass plain fields.
     API: POST /api/Mold/UpdateCheckSheet  (multipart/form-data)
       TransId        integer
       CurrentStatus  string
       ActionTaken    string
       BeforeImage    binary (File)
       AfterImage     binary (File)
       Remarks        string
  ─────────────────────────────────────────────────────────────────────── */
const handleSaveAndNext = () => {
  const currentSpec = specs[currentIdx];

  if (!currentSpec.statusText?.trim()) {
    showToast({ type: 'error', title: 'Required', message: 'Please set a Current Status before saving.' });
    return;
  }

  updateMutation.mutate({
    transId:          currentSpec.transId ?? currentSpec.id,
    statusText:       currentSpec.statusText       ?? '',
    correctiveAction: currentSpec.correctiveAction ?? '',
    remarks:          currentSpec.remarks          ?? '',
    beforeImgFile:    currentSpec.beforeImgFile instanceof File ? currentSpec.beforeImgFile : undefined,
    afterImgFile:     currentSpec.afterImgFile  instanceof File ? currentSpec.afterImgFile  : undefined,
  }, {
    onSuccess: (res) => {
      // ✅ Persist the saved image URLs back into local spec state
      // so the thumbnail shows the server path, not just the dataURL
      onUpdateSpec(currentSpec.id, {
        beforeImg:     res?.beforeImg  ?? currentSpec.beforeImg,
        afterImg:      res?.afterImg   ?? currentSpec.afterImg,
        beforeImgFile: undefined,   // clear the raw File — already uploaded
        afterImgFile:  undefined,
      });

      if (!isLast) goNext();
      else         onClose();
    },
  });
};

  const handleClearRow = () => {
    onUpdateSpec(spec.id, {
      currentStatusDropdown: '', statusText:       '',
      correctiveAction:      '', remarks:          '',
      beforeImg:  null, beforeImgName:  null, beforeImgFile:  null,
      afterImg:   null, afterImgName:   null, afterImgFile:   null,
    });
  };

  const headerBorderColor = filled ? 'rgba(79,143,255,0.25)' : 'var(--border)';
  const headerAccentBg    = filled ? 'rgba(79,143,255,0.06)' : 'var(--bg3)';

  return (
    <Modal open={open} onClose={onClose} title="" size="xl" footer={null}>
      <style>{`
        @keyframes cs-slide-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .cs-anim { animation: cs-slide-in 0.22s ease; }
        .cs-nav-btn:hover:not(:disabled) { background: var(--bg4) !important; color: var(--text) !important; }
        .cs-img-drop:hover { border-color: var(--accent) !important; background: var(--accent-glow) !important; }
        .cs-img-drop:hover .cs-img-icon { color: var(--accent) !important; }
      `}</style>

      <div className="cs-anim" key={spec.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ── TOP HEADER ── */}
        <div style={{
          background: headerAccentBg, border: `1px solid ${headerBorderColor}`,
          borderRadius: 10, margin: '-8px -8px 0 -8px', overflow: 'hidden',
        }}>
          {/* nav row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: `1px solid ${headerBorderColor}`,
          }}>
            <button className="cs-nav-btn" onClick={goPrev} disabled={isFirst} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: isFirst ? 'var(--text3)' : 'var(--text2)', fontSize: 12, fontWeight: 500,
              cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.4 : 1, transition: 'all 0.15s',
            }}>
              <S size={12} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/>
              Prev
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text3)', fontFamily: "'Geist Mono',monospace" }}>
                Item {currentIdx + 1} of {total}
              </span>
              {filled && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                  background: 'rgba(79,143,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(79,143,255,0.3)',
                }}>
                  {statusText}
                </span>
              )}
            </div>

            <button className="cs-nav-btn" onClick={goNext} disabled={isLast} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: isLast ? 'var(--text3)' : 'var(--text2)', fontSize: 12, fontWeight: 500,
              cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.4 : 1, transition: 'all 0.15s',
            }}>
              Next
              <S size={12} d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>}/>
            </button>
          </div>

          {/* 2×2 spec info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 16, borderRight: `1px solid ${headerBorderColor}` }}>
              <ModalInfoField label="Check Area"  value={spec.area}  color="#3b82f6"/>
              <ModalInfoField label="Check Point" value={spec.point} color="#8b5cf6"/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 16 }}>
              <ModalInfoField label="Check Method"       value={spec.method}    color="#06b6d4"/>
              <ModalInfoField label="Required Condition" value={spec.condition} color="#f59e0b"/>
            </div>
          </div>
        </div>

        {/* dot navigator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '14px 18px 0' }}>
          {specs.map((s, i) => {
            const isDone = !!(s.statusText && s.statusText.trim() !== '');
            return (
              <button key={s.id} onClick={() => setCurrentIdx(i)}
                title={`${i + 1}. ${s.area} — ${isDone ? s.statusText : 'Pending'}`}
                style={{
                  width: i === currentIdx ? 20 : 8, height: 8, borderRadius: 4,
                  border: 'none', cursor: 'pointer', transition: 'all 0.25s ease', padding: 0, flexShrink: 0,
                  background: i === currentIdx ? 'var(--accent)' : isDone ? 'var(--green)' : 'var(--bg4)',
                }}
              />
            );
          })}
        </div>

        {/* Spec Reference Image — display only */}
        <SpecReferenceImage specImage={spec.specImage}/>

        {/* divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 18px 0' }}/>

        {/* ── CURRENT STATUS ── */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
            Current Status *
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SearchableSelect
              options={currentStatusOptions}
              value={spec.currentStatusDropdown || ''}
              onChange={handleStatusDropdownChange}
              placeholder={dropdownLoading ? 'Loading…' : 'Select Status'}
              disabled={dropdownLoading}
            />
            <input
              value={statusText}
              onChange={e => handleStatusTextChange(e.target.value)}
              placeholder="Status text (auto-filled or type)"
              style={{
                ...inputStyle, height: 34,
                background:  statusText ? 'rgba(79,143,255,0.07)' : 'var(--bg2)',
                borderColor: statusText ? 'rgba(79,143,255,0.4)'  : 'var(--border2)',
                color:       statusText ? 'var(--accent)' : 'var(--text)',
                fontWeight:  statusText ? 600 : 400,
                transition: 'all 0.2s',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            Select from dropdown to auto-fill, or type the status directly.
          </div>
        </div>

        {/* ── CORRECTIVE ACTION + REMARKS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '16px 18px 0' }}>
          <div>
            <label style={labelStyle}>Corrective Action</label>
            <textarea value={spec.correctiveAction ?? ''} onChange={e => onUpdate(spec.id, 'correctiveAction', e.target.value)}
              placeholder="Describe the corrective action taken…" rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Remarks &amp; Spare Usage</label>
            <textarea value={spec.remarks ?? ''} onChange={e => onUpdate(spec.id, 'remarks', e.target.value)}
              placeholder="Remarks, spare parts consumed…" rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </div>

        {/* ── BEFORE / AFTER IMAGE UPLOAD ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '16px 18px 0' }}>
          <ImageUploadField
            label="Before Image"
            value={spec.beforeImg}
            apiImgName={spec.beforeImgName ?? extractFileName(spec.beforeImg)}
            onChange={file => handleImgUpload('beforeImg', file)}
            onClear={() => handleClearImg('beforeImg')}
            accent="rgba(251,146,60,0.7)"
            accentBg="rgba(251,146,60,0.08)"
          />
          <ImageUploadField
            label="After Image"
            value={spec.afterImg}
            apiImgName={spec.afterImgName ?? extractFileName(spec.afterImg)}
            onChange={file => handleImgUpload('afterImg', file)}
            onClear={() => handleClearImg('afterImg')}
            accent="rgba(34,197,94,0.7)"
            accentBg="rgba(34,197,94,0.08)"
          />
        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 18px 4px', marginTop: 8, borderTop: '1px solid var(--border)',
        }}>
          <button onClick={handleClearRow} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text3)', fontSize: 12, fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.4 : 1, transition: 'all 0.15s',
          }}>
            <S size={12} d={<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></>}/>
            Clear
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} disabled={saving} style={{
              padding: '7px 16px', borderRadius: 8, background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 12, fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
            }}>
              Close
            </button>
            <button onClick={handleSaveAndNext} disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 8,
              background: saving ? 'var(--bg4)' : 'var(--accent)', border: 'none',
              color: saving ? 'var(--text3)' : '#fff', fontSize: 12, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.15s', minWidth: 120,
            }}>
              {saving
                ? <><LoadingSpinner size={12}/>&nbsp;Saving…</>
                : <><S size={12} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>{isLast ? 'Save & Close' : 'Save & Next →'}</>
              }
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

/* ── Colored label chip for modal spec info ── */
function ModalInfoField({ label, value, color }) {
  return (
    <div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '2px 8px', borderRadius: 5, marginBottom: 5,
        background: `${color}18`, border: `1px solid ${color}40`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0, display: 'inline-block' }}/>
        <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE UPLOAD FIELD  (Before / After)
══════════════════════════════════════════════════════════════════════════════ */
function ImageUploadField({ label, value, apiImgName, onChange, onClear, accent = 'var(--accent)', accentBg = 'var(--accent-glow)' }) {
  const inputRef   = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [value]);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImgError(false);
    onChange(file);
  }, [onChange]);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const previewSrc  = resolveImgSrc(value);
  const displayName = apiImgName || extractFileName(value);

  const LabelRow = (
    <div style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text3)',
      textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8,
      display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
    }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: accent }}/>
      {label}
      {displayName && (
        <span style={{
          fontSize: 10, color: 'var(--text3)', fontWeight: 400,
          fontFamily: "'Geist Mono',monospace",
          background: 'var(--bg4)', border: '1px solid var(--border)',
          padding: '1px 6px', borderRadius: 4,
        }}>
          {displayName}
        </span>
      )}
    </div>
  );

  /* Case A: no value → drop zone */
  if (!value && !apiImgName) {
    return (
      <div>
        {LabelRow}
        <div className="cs-img-drop"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            height: 160, borderRadius: 10, cursor: 'pointer',
            border: `2px dashed ${dragging ? accent : 'var(--border2)'}`,
            background: dragging ? accentBg : 'var(--bg3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, transition: 'all 0.2s ease',
          }}
        >
          <div className="cs-img-icon" style={{
            width: 40, height: 40, borderRadius: 10,
            background: dragging ? accentBg : 'var(--bg4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dragging ? accent : 'var(--text3)', transition: 'all 0.2s',
            border: `1px solid ${dragging ? accent + '44' : 'var(--border)'}`,
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
              Drop image here or <span style={{ color: accent, textDecoration: 'underline' }}>browse</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>PNG, JPG, WEBP up to 10MB</div>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
        />
      </div>
    );
  }

  /* Case B: has src + no error → thumbnail */
  if (previewSrc && !imgError) {
    return (
      <div>
        {LabelRow}
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${accent}44`, background: 'var(--bg3)' }}>
          <img src={previewSrc} alt={label}
            style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
            onError={() => setImgError(true)}
          />
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 6, padding: 8, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
          >
            <button onClick={() => inputRef.current?.click()} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7,
              fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', color: '#111',
            }}>
              <S size={11} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/> Replace
            </button>
            <button onClick={onClear} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7,
              fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,0.9)', border: 'none', cursor: 'pointer', color: '#fff',
            }}>
              <S size={11} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>}/> Remove
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
        />
      </div>
    );
  }

  /* Case C: has filename but file missing locally → error + compact upload */
  return (
    <div>
      {LabelRow}
      <div style={{
        borderRadius: 10, border: '1px dashed rgba(239,68,68,0.35)',
        background: 'rgba(239,68,68,0.04)', padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 11, color: '#ef4444', lineHeight: 1.5 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            File not found locally.
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
              Place it at:&nbsp;
              <code style={{ background: 'var(--bg4)', padding: '1px 5px', borderRadius: 3 }}>
                public{IMAGE_BASE_PATH}{displayName || '<filename>'}
              </code>
              &nbsp;or upload a replacement.
            </div>
          </div>
        </div>
        <div className="cs-img-drop"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            height: 72, borderRadius: 8, cursor: 'pointer',
            border: `2px dashed ${dragging ? accent : 'var(--border2)'}`,
            background: dragging ? accentBg : 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)' }}>
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            Drop or <span style={{ color: accent, textDecoration: 'underline' }}>browse</span> to upload
          </span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SPEC ROW
══════════════════════════════════════════════════════════════════════════════ */
function SpecRow({ spec, idx, onOpenEntry }) {
  const statusText = spec.statusText || '';
  const filled     = statusText.trim() !== '';
  const hasExtra   = spec.correctiveAction || spec.remarks || spec.beforeImg || spec.afterImg;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 1fr 160px auto',
      alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 9,
      background: filled ? 'rgba(79,143,255,0.04)' : 'var(--bg3)',
      border: `1px solid ${filled ? 'rgba(79,143,255,0.2)' : 'var(--border)'}`,
      transition: 'all var(--trans)',
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', fontFamily: "'Geist Mono',monospace" }}>{idx + 1}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {spec.area}
          {hasExtra && <span title="Has additional details" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.point}</div>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.method}</span>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.condition}</span>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 34, borderRadius: 7, padding: '0 10px',
        background: filled ? 'rgba(79,143,255,0.10)' : 'var(--bg2)',
        border: `1px solid ${filled ? 'rgba(79,143,255,0.3)' : 'var(--border2)'}`,
        fontSize: 12, fontWeight: filled ? 600 : 400,
        color: filled ? 'var(--accent)' : 'var(--text3)',
        userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {filled ? statusText : <span style={{ fontSize: 11 }}>—</span>}
      </div>
      <button onClick={onOpenEntry} title="Open detailed entry" style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, whiteSpace: 'nowrap',
        background: 'var(--accent-glow)', border: '1px solid rgba(79,143,255,0.2)',
        color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all var(--trans)',
      }}>
        <S size={11} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
        Entry
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PLAN INFO CARD
══════════════════════════════════════════════════════════════════════════════ */
const PLAN_FIELD_COLORS = {
  'Report No':   { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.25)'  },
  'Mould':       { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)' },
  'Part No':     { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)' },
  'Frequency':   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  'Target Date': { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' },
  'Status':      { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)'  },
};

function PlanInfoField({ label, value }) {
  const theme = PLAN_FIELD_COLORS[label] || { color: 'var(--accent)', bg: 'var(--accent-glow)', border: 'var(--border)' };
  return (
    <div style={{ padding: '10px 14px', borderRadius: 9, background: theme.bg, border: `1px solid ${theme.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
        {label === 'Report No'
          ? <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, color: theme.color }}>{value}</code>
          : value}
      </div>
    </div>
  );
}

function PlanInfoCard({ plan, total, completed, pending }) {
  if (!plan) return null;
  const fields = [
    ['Report No',   plan.reportNo],
    ['Mould',       plan.mould],
    ['Part No',     plan.partNo],
    ['Frequency',   plan.freq],
    ['Target Date', plan.date],
    ['Status',      plan.status],
  ];
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Mould PM Checksheet</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
            Total: <b style={{ color: 'var(--text)' }}>{total}</b>
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(16,185,129,0.10)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
            ✓ {completed} done
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: pending > 0 ? 'rgba(239,68,68,0.10)' : 'var(--bg4)',
            color: pending > 0 ? '#ef4444' : 'var(--text3)',
            border: `1px solid ${pending > 0 ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
          }}>
            {pending} pending
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
        {fields.map(([label, value]) => <PlanInfoField key={label} label={label} value={value}/>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CREDENTIALS BAR
══════════════════════════════════════════════════════════════════════════════ */
function CredentialsBar({ credentials, setCredentials, accessRole }) {
  const set        = field => e => setCredentials(prev => ({ ...prev, [field]: e.target.value }));
  const isAdmin    = accessRole === 'admin';
  const isChecker  = accessRole === 'checker'  || isAdmin;
  const isApprover = accessRole === 'approver' || isAdmin;
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 22, marginBottom: 14, flexWrap: 'wrap' }}>
      <CredField label="Prepared By" value={credentials.prepared} onChange={set('prepared')} disabled={false}/>
      {isChecker  && <CredField label="Checked By"  value={credentials.checked}  onChange={set('checked')}  disabled={false}/>}
      {isApprover && <CredField label="Approved By" value={credentials.approved} onChange={set('approved')} disabled={false}/>}
    </div>
  );
}
function CredField({ label, value, onChange, disabled }) {
  return (
    <div style={{ flex: 1, minWidth: 180 }}>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={onChange} disabled={disabled} placeholder={label}
        style={{ ...inputStyle, opacity: disabled ? 0.5 : 1 }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LOADING ROWS
══════════════════════════════════════════════════════════════════════════════ */
function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          height: 54, borderRadius: 9, background: 'var(--bg3)', border: '1px solid var(--border)',
          animation: 'pulse 1.4s ease-in-out infinite', opacity: 1 - i * 0.1,
        }}/>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SEARCHABLE SELECT
══════════════════════════════════════════════════════════════════════════════ */
function SearchableSelect({ options, value, onChange, placeholder = 'Select...', disabled = false, error, maxItems = 5 }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const [dropUp, setDropUp] = useState(false);
  const wrapRef    = useRef(null);
  const triggerRef = useRef(null);
  const inputRef   = useRef(null);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setSearch(''); } };
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
        padding: '6px 10px', borderRadius: 8, height: 34,
        border: `1px solid ${open ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)'}`,
        background: disabled ? 'var(--bg3)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        boxShadow: open ? '0 0 0 3px var(--accent-glow)' : 'none',
        userSelect: 'none', gap: 8, transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected ? 'var(--text)' : 'var(--text3)', fontSize: 12 }}>
          {selected ? selected.label : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selected && !disabled && (
            <span onClick={handleClear} style={{ color: 'var(--text3)', display: 'flex', padding: 2, borderRadius: 4, lineHeight: 1, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
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
          <div style={{ maxHeight: maxItems * 40, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>No results for "{search}"</div>
              : filtered.map((opt, i) => {
                  const isSel = String(opt.value) === String(value);
                  return (
                    <div key={opt.value} onClick={() => handleSelect(opt)} style={{
                      padding: '9px 12px', fontSize: 13, cursor: 'pointer',
                      color: isSel ? 'var(--accent)' : 'var(--text)',
                      background: isSel ? 'var(--accent-glow)' : 'transparent',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'background var(--trans)',
                    }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--bg3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'var(--accent-glow)' : 'transparent'; }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{opt.label}</span>
                      {isSel && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 8 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SHARED MICRO-STYLES
══════════════════════════════════════════════════════════════════════════════ */
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--text3)', textTransform: 'uppercase',
  letterSpacing: '0.5px', marginBottom: 5,
};
const inputStyle = {
  width: '100%', background: 'var(--bg2)', border: '1px solid var(--border2)',
  borderRadius: 7, color: 'var(--text)', fontSize: 13, padding: '7px 10px',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color var(--trans)',
  boxSizing: 'border-box',
};
const colHeaderStyle = {
  fontSize: 10, fontWeight: 700, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '0.6px',
};
