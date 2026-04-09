import { useState, useRef, useEffect, useCallback } from 'react';
import PageHeader   from '@/components/layout/PageHeader';
import Button       from '@/components/common/Button';
import DataTable    from '@/components/table/DataTable';
import Modal        from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { useChecksheetList, useSaveChecksheet } from '@/hooks/useChecksheet';

/* ─── tiny SVG helper ──────────────────────────────────────────────────────── */
const S = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

/* ─── constants ────────────────────────────────────────────────────────────── */
const RESULT_OPTIONS = ['OK', 'NG', 'Pass', 'Fail', 'N/A'];
const RES_COLOR      = { OK: 'var(--green)', Pass: 'var(--green)', NG: 'var(--red)', Fail: 'var(--red)', 'N/A': 'var(--text3)' };
const RES_BG         = { OK: 'rgba(34,197,94,0.12)', Pass: 'rgba(34,197,94,0.12)', NG: 'rgba(239,68,68,0.12)', Fail: 'rgba(239,68,68,0.12)', 'N/A': 'var(--bg4)' };
const STATUS_FILTERS = ['all', 'Pending', 'Overdue'];
const freqOptions    = [
  { label: 'All',       value: 'all'       },
  // { label: 'Daily',     value: 'Daily'     },
  { label: 'Monthly',   value: 'Monthly'   },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually',  value: 'Annually'  },
];
const currentStatusList = [
  { Id: 1, CurrentStatus: "Pending" },
  { Id: 2, CurrentStatus: "In Progress" },
  { Id: 3, CurrentStatus: "Completed" },
  { Id: 4, CurrentStatus: "On Hold" },
  { Id: 5, CurrentStatus: "Cancelled" }
];

const STAGE = { LIST: 'list', ENTRY: 'entry' };

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function ChecksheetPage() {
  const { data: apiData = [], loading } = useChecksheetList();
  const { showToast } = useUIStore();

  const [stage, setStage]           = useState(STAGE.LIST);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [statusFilter, setStatus]   = useState('all');
  const [freqFilter,   setFreqFilter] = useState('all');
  const [specs,        setSpecs]    = useState([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [credentials,  setCredentials] = useState({ prepared: '', checked: '', approved: '' });
  const [saving,       setSaving]   = useState(false);
  const [completing,   setCompleting] = useState(false);

  /* unified entry modal */
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entrySpecIdx,   setEntrySpecIdx]   = useState(0);

  const [accessRole] = useState('admin');

  /* ── open plan ── */
  const openPlan = async (plan) => {
    setSelectedPlan(plan);
    setSpecs([]);
    setCredentials({ prepared: plan.prepared ?? '', checked: plan.checked ?? '', approved: plan.approved ?? '' });
    setStage(STAGE.ENTRY);
    setSpecsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setSpecs(MOCK_SPECS.map(s => ({
        ...s,
        currentStatus: '',
        correctiveAction: '',
        remarks: '',
        beforeImg: null,
        afterImg: null,
      })));
    } finally {
      setSpecsLoading(false);
    }
  };

  const backToList = () => { setStage(STAGE.LIST); setSelectedPlan(null); setSpecs([]); };

  const updateSpecField = (id, field, value) =>
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  /* open entry modal at specific spec */
  const openEntryModal = (idx) => {
    setEntrySpecIdx(idx);
    setEntryModalOpen(true);
  };

  const completedCount = specs.filter(s => s.currentStatus && s.currentStatus !== '').length;
  const pendingCount   = specs.length - completedCount;
  const canComplete    = pendingCount === 0 && specs.length > 0;

  const handleSendToChecking = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      showToast({ type: 'success', title: 'Sent', message: `Report ${selectedPlan.reportNo} sent for checking.` });
      backToList();
    } finally { setSaving(false); }
  };

  const handleSendToApproval = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      showToast({ type: 'success', title: 'Sent', message: `Report ${selectedPlan.reportNo} sent for approval.` });
      backToList();
    } finally { setSaving(false); }
  };

  const handleComplete = async () => {
    if (!canComplete) {
      showToast({ type: 'error', title: 'Incomplete', message: `${pendingCount} item(s) still pending.` });
      return;
    }
    setCompleting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      showToast({ type: 'success', title: 'Completed', message: `Checksheet ${selectedPlan.reportNo} closed successfully.` });
      backToList();
    } finally { setCompleting(false); }
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
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 7,
          background: 'var(--accent-glow)', border: '1px solid rgba(79,143,255,0.2)',
          color: 'var(--accent)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          transition: 'all var(--trans)',
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
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500,
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
        columns={columns}
        data={displayData}
        searchKeys={['reportNo', 'mould', 'partNo']}
        pageSize={10}
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
      {/* breadcrumb header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={backToList} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8,
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          transition: 'all var(--trans)',
        }}>
          <S size={12} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/> Back
        </button>
        <div style={{ color: 'var(--text3)', fontSize: 12 }}>Checksheet Entry</div>
        <S size={12} d={<polyline points="9 18 15 12 9 6"/>}/>
        <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>
          {selectedPlan?.reportNo}
        </code>
      </div>

      <PlanInfoCard plan={selectedPlan} total={specs.length} completed={completedCount} pending={pendingCount}/>

      {/* progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: specs.length ? `${(completedCount / specs.length) * 100}%` : '0%',
            height: '100%', background: 'var(--accent)', borderRadius: 3,
            transition: 'width 0.4s ease',
          }}/>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>
          {completedCount}/{specs.length} filled
        </span>
      </div>

      {/* ── COLUMN HEADERS for spec rows ── */}
      {!specsLoading && specs.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px  1fr 1fr 1fr 1fr  130px auto',
          alignItems: 'center', gap: 5,
          padding: '6px 14px',
          marginBottom: 2,
        }}>
          <span/>
         
          <span style={colHeaderStyle}>Check Area</span>
          <span style={colHeaderStyle}>Check Point</span>
           <span style={colHeaderStyle}>Check Method</span>
          <span style={colHeaderStyle}>Required Condition</span>
          <span style={colHeaderStyle}>Result</span>
          <span style={colHeaderStyle}>Action</span>
        </div>
      )}

      {/* spec rows */}
      {specsLoading
        ? <LoadingRows/>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {specs.map((spec, idx) => (
              <SpecRow
                key={spec.id}
                spec={spec}
                idx={idx}
                onOpenEntry={() => openEntryModal(idx)}
                onQuickResult={val => updateSpecField(spec.id, 'currentStatus', val)}
              />
            ))}
          </div>
        )
      }

      {/* credentials */}
      {!specsLoading && specs.length > 0 && (
        <CredentialsBar credentials={credentials} setCredentials={setCredentials} accessRole={accessRole}/>
      )}

      {/* action buttons */}
      {!specsLoading && specs.length > 0 && (
        <WorkflowActions
          accessRole={accessRole}
          canComplete={canComplete}
          saving={saving}
          completing={completing}
          onSendToChecking={handleSendToChecking}
          onSendToApproval={handleSendToApproval}
          onComplete={handleComplete}
          onBack={backToList}
        />
      )}

      {/* unified entry modal */}
      <ChecksheetEntryModal
        open={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        specs={specs}
        currentIdx={entrySpecIdx}
        setCurrentIdx={setEntrySpecIdx}
        onUpdate={(id, field, value) => updateSpecField(id, field, value)}
        onUpdateSpec={(id, fields) => setSpecs(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s))}
        showToast={showToast}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   UNIFIED CHECKSHEET ENTRY MODAL
══════════════════════════════════════════════════════════════════════════════ */
function ChecksheetEntryModal({ open, onClose, specs, currentIdx, setCurrentIdx, onUpdate, onUpdateSpec, showToast }) {
  if (!open || specs.length === 0) return null;

  const spec = specs[currentIdx];
  if (!spec) return null;

  const total     = specs.length;
  const isFirst   = currentIdx === 0;
  const isLast    = currentIdx === total - 1;
  const filled    = spec.currentStatus && spec.currentStatus !== '';
  const isGood    = spec.currentStatus === 'OK' || spec.currentStatus === 'Pass';
  const isBad     = spec.currentStatus === 'NG' || spec.currentStatus === 'Fail';

  const goNext = () => { if (!isLast) setCurrentIdx(i => i + 1); };
  const goPrev = () => { if (!isFirst) setCurrentIdx(i => i - 1); };

  const handleImgUpload = (field, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => onUpdate(spec.id, field, e.target.result);
    reader.readAsDataURL(file);
  };

  const handleClearImg = (field) => onUpdate(spec.id, field, null);

  const handleSaveAndNext = () => {
    showToast({ type: 'success', title: 'Saved', message: `${spec.area} updated.` });
    if (!isLast) goNext();
    else onClose();
  };

  const handleClearRow = () => {
    onUpdateSpec(spec.id, { currentStatus: '', correctiveAction: '', remarks: '', beforeImg: null, afterImg: null });
  };

  /* status color theme for top header gradient */
  const headerBorderColor = filled
    ? isGood ? 'rgba(34,197,94,0.25)' : isBad ? 'rgba(239,68,68,0.25)' : 'var(--border)'
    : 'var(--border)';

  const headerAccentBg = filled
    ? isGood ? 'rgba(34,197,94,0.06)' : isBad ? 'rgba(239,68,68,0.06)' : 'var(--bg3)'
    : 'var(--bg3)';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="xl"
      footer={null}
    >
      <style>{`
        @keyframes cs-slide-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cs-anim { animation: cs-slide-in 0.22s ease; }
        .cs-img-drop:hover { border-color: var(--accent) !important; background: var(--accent-glow) !important; }
        .cs-img-drop:hover .cs-img-icon { color: var(--accent) !important; }
        .cs-nav-btn:hover:not(:disabled) { background: var(--bg4) !important; color: var(--text) !important; }
        .cs-status-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
      `}</style>

      <div className="cs-anim" key={spec.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* ══════════════════════════════════════════════════
            TOP HEADER — Nav + 2×2 spec info grid
        ══════════════════════════════════════════════════ */}
        <div style={{
          background: headerAccentBg,
          border: `1px solid ${headerBorderColor}`,
          borderRadius: 10,
          margin: '-8px -8px 0 -8px',
          overflow: 'hidden',
        }}>

          {/* nav row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${headerBorderColor}`,
          }}>
            {/* prev */}
            <button
              className="cs-nav-btn"
              onClick={goPrev} disabled={isFirst}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: isFirst ? 'var(--text3)' : 'var(--text2)',
                fontSize: 12, fontWeight: 500, cursor: isFirst ? 'not-allowed' : 'pointer',
                opacity: isFirst ? 0.4 : 1, transition: 'all 0.15s',
              }}>
              <S size={12} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/>
              Prev
            </button>

            {/* center: item counter + status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                color: 'var(--text3)', fontFamily: "'Geist Mono',monospace",
              }}>
                Item {currentIdx + 1} of {total}
              </span>
              {filled && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  background: RES_BG[spec.currentStatus],
                  color: RES_COLOR[spec.currentStatus],
                  border: `1px solid ${RES_COLOR[spec.currentStatus]}44`,
                }}>
                  {spec.currentStatus}
                </span>
              )}
            </div>

            {/* next */}
            <button
              className="cs-nav-btn"
              onClick={goNext} disabled={isLast}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: isLast ? 'var(--text3)' : 'var(--text2)',
                fontSize: 12, fontWeight: 500, cursor: isLast ? 'not-allowed' : 'pointer',
                opacity: isLast ? 0.4 : 1, transition: 'all 0.15s',
              }}>
              Next
              <S size={12} d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>}/>
            </button>
          </div>

          {/* ── 2×2 spec info grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            padding: '14px 16px 16px',
          }}>
            {/* LEFT col: Check Area + Check Point */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              paddingRight: 16,
              borderRight: `1px solid ${headerBorderColor}`,
            }}>
              {/* Check Area */}
              <div>
                <div style={specLabelStyle}>Check Area</div>
                <div style={specValueStyle}>{spec.area}</div>
              </div>
              {/* Check Point */}
              <div>
                <div style={specLabelStyle}>Check Point</div>
                <div style={specValueStyle}>{spec.point}</div>
              </div>
            </div>

            {/* RIGHT col: Check Method + Required Condition */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              paddingLeft: 16,
            }}>
              {/* Check Method */}
              <div>
                <div style={specLabelStyle}>Check Method</div>
                <div style={specValueStyle}>{spec.method}</div>
              </div>
              {/* Required Condition */}
              <div>
                <div style={specLabelStyle}>Required Condition</div>
                <div style={{ ...specValueStyle, wordBreak: 'break-word', lineHeight: 1.5 }}>{spec.condition}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SPEC MINI-NAVIGATOR (dots) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '14px 18px 0' }}>
          {specs.map((s, i) => {
            const isDone  = s.currentStatus && s.currentStatus !== '';
            const isGoodS = s.currentStatus === 'OK' || s.currentStatus === 'Pass';
            const isBadS  = s.currentStatus === 'NG' || s.currentStatus === 'Fail';
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIdx(i)}
                title={`${i + 1}. ${s.area} — ${s.point}${isDone ? ` — ${s.currentStatus}` : ' — Pending'}`}
                style={{
                  width: i === currentIdx ? 20 : 8,
                  height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  background: i === currentIdx
                    ? 'var(--accent)'
                    : isDone
                      ? isGoodS ? 'var(--green)' : isBadS ? 'var(--red)' : 'var(--text3)'
                      : 'var(--bg4)',
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* ── SPEC IMAGE (from API) ── */}
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8,
          }}>
            Spec Reference Image
          </div>
          {spec.specImage ? (
            <div style={{
              borderRadius: 10, overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'var(--bg3)',
              maxHeight: 200,
            }}>
              <img
                src={spec.specImage}
                alt="Spec reference"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{
              height: 100, borderRadius: 10,
              border: '1px dashed var(--border2)',
              background: 'var(--bg3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8,
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--text3)', opacity: 0.5 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="var(--red)" strokeWidth={1.2} opacity={0.4}/>
              </svg>
              <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>No Image Available</span>
            </div>
          )}
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 18px 0' }}/>

        {/* ── RESULT STATUS PICKER ── */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Result *
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {RESULT_OPTIONS.map(opt => {
              const selected = spec.currentStatus === opt;
              const col = RES_COLOR[opt];
              const bg  = RES_BG[opt];
              return (
                <button
                  key={opt}
                  className="cs-status-pill"
                  onClick={() => onUpdate(spec.id, 'currentStatus', selected ? '' : opt)}
                  style={{
                    padding: '8px 20px', borderRadius: 30, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    background: selected ? bg : 'var(--bg3)',
                    border: `2px solid ${selected ? col : 'var(--border)'}`,
                    color: selected ? col : 'var(--text3)',
                    letterSpacing: '0.3px',
                  }}>
                  {selected && (
                    <span style={{ marginRight: 5 }}>
                      {(opt === 'OK' || opt === 'Pass') ? '✓' : (opt === 'NG' || opt === 'Fail') ? '✗' : '–'}
                    </span>
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CURRENT STATUS ── */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Current Status *
            </div>
            <button
              title="Add new status"
              style={{
                width: 22, height: 22, borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg3)', color: 'var(--text2)',
                cursor: 'pointer', fontSize: 14, fontWeight: 700, lineHeight: '18px',
              }}
              onClick={() => alert('Add new status (later API)')}
            >
              +
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select
              value={spec.currentStatusDropdown || ''}
              onChange={(e) => onUpdate(spec.id, 'currentStatusDropdown', e.target.value)}
              style={{ ...inputStyle, height: 34 }}
            >
              <option value="">Select Status</option>
              {['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
            <input
              value={spec.currentStatusDropdown || ''}
              disabled
              placeholder="Selected status"
              style={{ ...inputStyle, height: 34, background: 'var(--bg3)', cursor: 'not-allowed' }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            Select the current workflow status. This will be saved along with the checksheet.
          </div>
        </div>

        {/* ── CORRECTIVE ACTION + REMARKS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '16px 18px 0' }}>
          <div>
            <label style={labelStyle}>Corrective Action</label>
            <textarea
              value={spec.correctiveAction ?? ''}
              onChange={e => onUpdate(spec.id, 'correctiveAction', e.target.value)}
              placeholder="Describe the corrective action taken…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
          <div>
            <label style={labelStyle}>Remarks &amp; Spare Usage</label>
            <textarea
              value={spec.remarks ?? ''}
              onChange={e => onUpdate(spec.id, 'remarks', e.target.value)}
              placeholder="Remarks, spare parts consumed…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </div>
        </div>

        {/* ── BEFORE / AFTER IMAGE UPLOAD ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '16px 18px 0' }}>
          <ImageUploadField
            label="Before Image"
            value={spec.beforeImg}
            onChange={file => handleImgUpload('beforeImg', file)}
            onClear={() => handleClearImg('beforeImg')}
            accent="rgba(251,146,60,0.7)"
            accentBg="rgba(251,146,60,0.08)"
          />
          <ImageUploadField
            label="After Image"
            value={spec.afterImg}
            onChange={file => handleImgUpload('afterImg', file)}
            onClear={() => handleClearImg('afterImg')}
            accent="rgba(34,197,94,0.7)"
            accentBg="rgba(34,197,94,0.08)"
          />
        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 18px 4px', marginTop: 8,
          borderTop: '1px solid var(--border)',
        }}>
          <button
            onClick={handleClearRow}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text3)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
            <S size={12} d={<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></>}/>
            Clear
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 16px', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>
              Close
            </button>
            <button
              onClick={handleSaveAndNext}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 18px', borderRadius: 8,
                background: 'var(--accent)', border: 'none',
                color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}>
              <S size={12} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
              {isLast ? 'Save & Close' : 'Save & Next →'}
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE UPLOAD FIELD
══════════════════════════════════════════════════════════════════════════════ */
function ImageUploadField({ label, value, onChange, onClear, accent = 'var(--accent)', accentBg = 'var(--accent-glow)' }) {
  const inputRef   = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setLoading(true);
    onChange(file);
    setLoading(false);
  }, [onChange]);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const labelTag = (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: accent }}/>
      {label}
    </div>
  );

  if (value) {
    return (
      <div>
        {labelTag}
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${accent}44`, background: 'var(--bg3)' }}>
          <img src={value} alt={label} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}/>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex',
            alignItems: 'flex-end', justifyContent: 'flex-end', gap: 6, padding: 8,
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
          >
            <button
              onClick={() => inputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', color: '#111' }}>
              <S size={11} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/> Replace
            </button>
            <button
              onClick={onClear}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, background: 'rgba(239,68,68,0.9)', border: 'none', cursor: 'pointer', color: '#fff' }}>
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

  return (
    <div>
      {labelTag}
      <div
        className="cs-img-drop"
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
          color: dragging ? accent : 'var(--text3)',
          transition: 'all 0.2s',
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

/* ══════════════════════════════════════════════════════════════════════════════
   SPEC ROW — Check Area and Check Point in separate columns
══════════════════════════════════════════════════════════════════════════════ */
function SpecRow({ spec, idx, onOpenEntry, onQuickResult }) {
  const val    = spec.currentStatus;
  const col    = val ? RES_COLOR[val] : undefined;
  const bg     = val ? RES_BG[val]   : undefined;
  const isGood = val === 'OK'   || val === 'Pass';
  const isBad  = val === 'NG'   || val === 'Fail';
  const filled = !!val;
  const hasExtra = spec.correctiveAction || spec.remarks || spec.beforeImg || spec.afterImg;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 1fr 1fr 1fr 1fr 130px auto',
      alignItems: 'center', gap: 12,
      padding: '11px 14px', borderRadius: 9,
      background: filled ? (isGood ? 'rgba(34,197,94,0.04)' : isBad ? 'rgba(239,68,68,0.04)' : 'var(--bg3)') : 'var(--bg3)',
      border: `1px solid ${filled ? (isGood ? 'rgba(34,197,94,0.18)' : isBad ? 'rgba(239,68,68,0.18)' : 'var(--border)') : 'var(--border)'}`,
      transition: 'all var(--trans)',
    }}>
      {/* index */}
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', fontFamily: "'Geist Mono',monospace" }}>
        {idx + 1}
      </span>

      {/* check area */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {spec.area}
          {hasExtra && (
            <span title="Has additional details" style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0,
            }}/>
          )}
        </div>
      </div>

      {/* check point */}
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
        {spec.point}
      </div>

      {/* method */}
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.method}</span>

      {/* condition */}
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.condition}</span>

      {/* quick result selector */}
      <select
        value={val ?? ''}
        onChange={e => onQuickResult(e.target.value)}
        style={{
          background: filled ? bg : 'var(--bg2)',
          border: `1px solid ${col ? col + '55' : 'var(--border2)'}`,
          borderRadius: 7, color: col || 'var(--text)', fontSize: 12,
          padding: '6px 10px', outline: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: val ? 700 : 400,
          transition: 'all var(--trans)',
        }}
      >
        <option value="">Select…</option>
        {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
      </select>

      {/* open entry button */}
      <button
        onClick={onOpenEntry}
        title="Open detailed entry"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 7, whiteSpace: 'nowrap',
          background: 'var(--accent-glow)', border: '1px solid rgba(79,143,255,0.2)',
          color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          transition: 'all var(--trans)',
        }}>
        <S size={11} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
        Entry
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   REMAINING SUB-COMPONENTS
══════════════════════════════════════════════════════════════════════════════ */

function PlanInfoCard({ plan, total, completed, pending }) {
  if (!plan) return null;
  const fields = [
    ['Mould',       plan.mould],
    ['Part No',     plan.partNo],
    ['Frequency',   plan.freq],
    ['Target Date', plan.date],
    ['Status',      plan.status],
  ];
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 18, marginBottom: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Mould PM Checksheet</span>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: 'var(--text3)' }}>Total: <b style={{ color: 'var(--text)' }}>{total}</b></span>
          <span style={{ color: 'var(--green)' }}>Completed: <b>{completed}</b></span>
          <span style={{ color: pending > 0 ? 'var(--red)' : 'var(--text3)' }}>Pending: <b>{pending}</b></span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CredentialsBar({ credentials, setCredentials, accessRole }) {
  const set = field => e => setCredentials(prev => ({ ...prev, [field]: e.target.value }));
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
      <input value={value} onChange={onChange} disabled={disabled} placeholder={label} style={{ ...inputStyle, opacity: disabled ? 0.5 : 1 }}/>
    </div>
  );
}

function WorkflowActions({ accessRole, canComplete, saving, completing, onSendToChecking, onSendToApproval, onComplete, onBack }) {
  const isAdmin    = accessRole === 'admin';
  const isChecker  = accessRole === 'checker'  || isAdmin;
  const isApprover = accessRole === 'approver' || isAdmin;
  const isPreparer = accessRole === 'preparer' || isAdmin;

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
      {isPreparer && (
        <button onClick={onSendToChecking} disabled={saving} style={{ ...wfBtnStyle, background: '#ff9800' }}>
          <S size={13} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>
          {saving ? 'Sending…' : 'Send to Checking'}
        </button>
      )}
      {isChecker && (
        <button onClick={onSendToApproval} disabled={saving} style={{ ...wfBtnStyle, background: '#28a745' }}>
          <S size={13} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>
          {saving ? 'Sending…' : 'Send to Approval'}
        </button>
      )}
      {isApprover && (
        <button
          onClick={onComplete}
          disabled={!canComplete || completing}
          title={!canComplete ? 'All items must be filled before completing' : 'Complete and close the plan'}
          style={{
            ...wfBtnStyle,
            background: canComplete ? '#007bff' : '#6c757d',
            cursor: canComplete ? 'pointer' : 'not-allowed',
            opacity: canComplete ? 1 : 0.65,
          }}
        >
          <S size={13} d={<><polygon points="19 20 9 20 9 13 19 13 19 20"/><polygon points="15 9 5 9 5 2 15 2 15 9"/><path d="M19 13V9h-4"/><path d="M9 11V7H5"/></>}/>
          {completing ? 'Completing…' : 'Complete'}
        </button>
      )}
      <button onClick={onBack} style={{ ...wfBtnStyle, background: '#9e9e9e' }}>
        <S size={13} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>}/>
        Back
      </button>
    </div>
  );
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          height: 54, borderRadius: 9, background: 'var(--bg3)', border: '1px solid var(--border)',
          animation: 'pulse 1.4s ease-in-out infinite',
          opacity: 1 - i * 0.1,
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
        padding: '6px 10px', borderRadius: 8,
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
              : filtered.map((opt, idx) => {
                  const isSel = String(opt.value) === String(value);
                  return (
                    <div key={opt.value} onClick={() => handleSelect(opt)} style={{
                      padding: '9px 12px', fontSize: 13, cursor: 'pointer',
                      color: isSel ? 'var(--accent)' : 'var(--text)',
                      background: isSel ? 'var(--accent-glow)' : 'transparent',
                      borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
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
const wfBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#fff',
  border: 'none', borderRadius: 12, cursor: 'pointer',
  transition: 'background-color 0.3s ease', outline: 'none',
};
const colHeaderStyle = {
  fontSize: 10, fontWeight: 700, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '0.6px',
};
/* Modal spec info label/value styles */
const specLabelStyle = {
  fontSize: 10, fontWeight: 700, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4,
};
const specValueStyle = {
  fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4,
};

/* ══════════════════════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════════════════════ */
const MOCK_SPECS = [
  { id: 1, area: 'Cavity Surface',   point: 'Surface finish check',      method: 'Visual Inspection', condition: 'No scratches / burrs',          specImage: null },
  { id: 2, area: 'Ejector System',   point: 'Ejector pin movement',      method: 'Manual Push',       condition: 'Smooth, no resistance',          specImage: null },
  { id: 3, area: 'Cooling Circuit',  point: 'Water flow check',          method: 'Flow Meter',        condition: '> 5 L/min per circuit',          specImage: null },
  { id: 4, area: 'Parting Line',     point: 'Flash gap check',           method: 'Feeler Gauge',      condition: '< 0.05 mm gap',                  specImage: null },
  { id: 5, area: 'Runner System',    point: 'Runner condition',          method: 'Visual + Measure',  condition: 'No wear, dim within ±0.1 mm',    specImage: null },
  { id: 6, area: 'Mould Body',       point: 'Bolt torque check',         method: 'Torque Wrench',     condition: 'Per spec sheet torque values',    specImage: null },
  { id: 7, area: 'Hot Runner',       point: 'Heater resistance check',   method: 'Multimeter',        condition: '> 40 Ω per zone minimum',        specImage: null },
  { id: 8, area: 'Venting',          point: 'Vent groove depth',         method: 'Depth Gauge',       condition: '0.01–0.03 mm depth required',    specImage: null },
];