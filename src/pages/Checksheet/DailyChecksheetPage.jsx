import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import Modal      from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { useDailyChecksheetList ,useCreateDailyChecksheet ,} from '@/hooks/useDailyChecksheet';
import { MOCK_PM_PLANS, MOCK_SPECS } from '@/utils/mockData';

const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const RESULT_OPTIONS = ['OK','NG','Pass','Fail','N/A'];
const RES_COLOR = { OK:'var(--green)', Pass:'var(--green)', NG:'var(--red)', Fail:'var(--red)', 'N/A':'var(--text3)' };

const LABEL_PALETTE = [
  { bg:'#eff6ff', color:'#2563eb' }, // blue
  { bg:'#f5f3ff', color:'#7c3aed' }, // purple
  { bg:'#ecfdf5', color:'#059669' }, // green
  { bg:'#fffbeb', color:'#d97706' }, // amber
  { bg:'#ecfeff', color:'#0891b2' }, // cyan
  { bg:'#fdf4ff', color:'#9333ea' }, // violet
];

const PlanField = ({ label, value, colorIdx = 0 }) => {
  const { bg, color } = LABEL_PALETTE[colorIdx % LABEL_PALETTE.length];
  return (
    <div>
      <div style={{
        display: 'inline-block',
        fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
        marginBottom: 4, padding: '2px 7px', borderRadius: 4,
        background: bg, color, border: `1px solid ${color}33`,
      }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', paddingLeft: 1 }}>{value}</div>
    </div>
  );
};

export default function DailyChecksheetPage() {
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const { data: plans = [], isLoading } = useDailyChecksheetList();
  const { mutateAsync: createDaily } = useCreateDailyChecksheet();
  // const { mutateAsync: fetchDetails } = useChecksheetDetails();
  const [selectedPlan, setSelectedPlan]     = useState(null);
  const [results, setResults]               = useState({});
  const [remarks, setRemarks]               = useState({});
  const [checkedBy, setCheckedBy]           = useState('');
  const { showToast } = useUIStore();

const openChecksheet = async (plan) => {
  try {
    // 🔥 ONLY CREATE (as per your current phase)
    await createDaily(plan);

    // open modal with MOCK data
    setSelectedPlan(plan);
    setResults({});
    setRemarks({});
    setCheckedBy('');
    setCheckModalOpen(true);

  } catch (err) {
    console.error(err);

    showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to create checksheet',
    });
  }
};

  const handleResultChange = (specId, value) => setResults(p => ({ ...p, [specId]: value }));
  const handleRemarkChange = (specId, value) => setRemarks(p => ({ ...p, [specId]: value }));

  const totalCount     = MOCK_SPECS.length;
  const completedCount = MOCK_SPECS.filter(s => !!results[s.id]).length;
  const pendingCount   = totalCount - completedCount;

  const allResultsFilled = MOCK_SPECS.every(s => !!results[s.id]);
  const canComplete      = pendingCount === 0 && allResultsFilled;

  const overallStatus = (() => {
    if (!allResultsFilled) return null;
    const hasIssue = MOCK_SPECS.some(s => results[s.id] === 'NG' || results[s.id] === 'Fail');
    return hasIssue ? 'NOT OK' : 'OK';
  })();

  const handleSave = () => {
    const unanswered = MOCK_SPECS.filter(s => !results[s.id]);
    if (unanswered.length > 0) {
      showToast({ type: 'error', title: 'Incomplete', message: `${unanswered.length} item(s) not filled.` });
      return;
    }
    showToast({ type: 'success', title: 'Saved', message: `Checksheet for ${selectedPlan.reportNo} saved.` });
    setCheckModalOpen(false);
  };

  const handleComplete = () => {
    if (!canComplete) return;
    showToast({ type: 'success', title: 'Completed', message: `Checksheet for ${selectedPlan.reportNo} marked as complete.` });
    setCheckModalOpen(false);
  };

  const columns = [
    {
      key: 'open', label: '', sortable: false,
      render: (_, row) => (
        <button onClick={() => openChecksheet(row)} style={{
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
      render: v => <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>{v}</code>,
    },
    { key: 'mould',  label: 'Mould' },
    { key: 'partNo', label: 'Part No' },
     { key: 'freq', label: 'Frequency' },
    { key: 'date',   label: 'Target Date' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v}/> },
  ];

  return (
    <div>
      <PageHeader title="Daily Checksheet Entry" subtitle="Enter actual PM check results per maintenance plan"/>
      <DataTable columns={columns} data={plans} searchKeys={['reportNo', 'mould', 'partNo']} pageSize={10}/>

      <Modal
        open={checkModalOpen}
        onClose={() => setCheckModalOpen(false)}
        title="Checksheet Entry"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/> Save Checksheet
            </Button>
          </>
        }
      >
        {selectedPlan && (
          <div>

            {/* Complete button — top right above plan grid */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                onClick={handleComplete}
                disabled={!canComplete}
                title={!canComplete ? 'Fill all items to enable Complete' : 'Mark as Complete'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: canComplete ? 'pointer' : 'not-allowed',
                  background: canComplete ? 'var(--green)' : 'var(--bg4)',
                  color:       canComplete ? '#fff'         : 'var(--text3)',
                  border: 'none',
                  opacity: canComplete ? 1 : 0.55,
                  transition: 'all var(--trans)',
                }}
              >
                <S size={13} d={<><polyline points="20 6 9 17 4 12"/></>}/> Complete
              </button>
            </div>

            {/* Plan info grid — counts in top-right corner inside the card */}
            <div style={{ position: 'relative', background: 'var(--bg3)', borderRadius: 10, padding: 16, marginBottom: 16 }}>

              {/* Counts + overall status — inside top-right of the grid */}
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                {[
                  { label: 'Total',   value: totalCount,     bg: 'var(--bg4)',          color: 'var(--text2)',  border: 'transparent' },
                  { label: 'Done',    value: completedCount, bg: 'rgba(34,197,94,0.1)', color: '#16a34a',       border: '#16a34a33' },
                  { label: 'Pending', value: pendingCount,   bg: 'rgba(239,68,68,0.1)', color: '#dc2626',       border: '#dc262633' },
                ].map(({ label, value, bg, color, border }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '2px 7px', borderRadius: 5,
                    background: bg, border: `1px solid ${border}`,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
                    <span style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
                  </div>
                ))}

                {overallStatus && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 5,
                    background: overallStatus === 'OK' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${overallStatus === 'OK' ? '#16a34a44' : '#dc262644'}`,
                  }}>
                    <span style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Overall</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: overallStatus === 'OK' ? '#16a34a' : '#dc2626' }}>{overallStatus}</span>
                  </div>
                )}
              </div>

              {/* Plan fields — padded right so they don't overlap the counts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, paddingRight: 210 }}>
                {[
                  ['Report No',    selectedPlan.reportNo, 0],
                  ['Mould',        selectedPlan.mould,    1],
                  ['Part No',      selectedPlan.partNo,   2],
                  ['Target Date',  selectedPlan.date,     3],
                  ['PM Frequency', selectedPlan.freq,     4],
                  ['Status',       selectedPlan.status,   5],
                ].map(([label, value, ci]) => (
                  <PlanField key={label} label={label} value={value} colorIdx={ci}/>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${(completedCount / totalCount) * 100}%`,
                  height: '100%', background: 'var(--accent)', borderRadius: 2,
                  transition: 'width 0.3s ease',
                }}/>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>{completedCount}/{totalCount} filled</span>
            </div>

            {/* Check items table */}
            <div style={{ overflowX: 'auto' }}>

              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '28px 120px 150px 120px 140px 110px 1fr',
                gap: 10, padding: '7px 14px', borderRadius: 7,
                background: 'var(--bg4)', marginBottom: 6,
              }}>
                {['#', 'Check Area', 'Check Point', 'Check Method', 'Condition', 'Result', 'Remarks / Spare Usage'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                ))}
              </div>

              {/* Data rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {MOCK_SPECS.map((spec, idx) => {
                  const val  = results[spec.id];
                  const col  = val ? RES_COLOR[val] : undefined;
                  const done = !!val;
                  return (
                    <div key={spec.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 120px 150px 120px 140px 110px 1fr',
                      alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 9,
                      background: done
                        ? (val === 'OK' || val === 'Pass' ? 'rgba(34,197,94,0.04)' : val === 'NG' || val === 'Fail' ? 'rgba(239,68,68,0.04)' : 'var(--bg3)')
                        : 'var(--bg3)',
                      border: `1px solid ${done
                        ? (val === 'OK' || val === 'Pass' ? 'rgba(34,197,94,0.18)' : val === 'NG' || val === 'Fail' ? 'rgba(239,68,68,0.18)' : 'var(--border)')
                        : 'var(--border)'}`,
                      transition: 'all var(--trans)',
                    }}>

                      {/* # */}
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', fontFamily: "'Geist Mono',monospace" }}>{idx + 1}</span>

                      {/* Check Area */}
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{spec.area}</span>

                      {/* Check Point */}
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.point}</span>

                      {/* Check Method */}
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.method}</span>

                      {/* Condition */}
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{spec.condition}</span>

                      {/* Result dropdown */}
                      <select
                        value={val ?? ''}
                        onChange={e => handleResultChange(spec.id, e.target.value)}
                        style={{
                          background: 'var(--bg2)',
                          border: `1px solid ${col ? col + '44' : 'var(--border2)'}`,
                          borderRadius: 7, color: col || 'var(--text)', fontSize: 12,
                          padding: '6px 8px', outline: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontWeight: val ? 600 : 400,
                          transition: 'border-color var(--trans)', width: '100%',
                        }}
                      >
                        <option value="">Select...</option>
                        {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                      </select>

                      {/* Remarks / Spare Usage */}
                      <input
                        type="text"
                        value={remarks[spec.id] ?? ''}
                        onChange={e => handleRemarkChange(spec.id, e.target.value)}
                        placeholder="Remarks / spare used..."
                        style={{
                          background: 'var(--bg2)', border: '1px solid var(--border2)',
                          borderRadius: 7, color: 'var(--text)', fontSize: 12,
                          padding: '6px 10px', outline: 'none', fontFamily: 'inherit',
                          width: '100%', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checked By — below the check items table */}
            <div style={{ marginTop: 18 }}>
              <div style={{
                display: 'inline-block',
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
                marginBottom: 5, padding: '2px 7px', borderRadius: 4,
                background: '#eff6ff', color: '#2563eb', border: '1px solid #2563eb33',
              }}>Checked By</div>
              <input
                type="text"
                value={checkedBy}
                onChange={e => setCheckedBy(e.target.value)}
                placeholder="Enter inspector name..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 8, color: 'var(--text)', fontSize: 13,
                  padding: '8px 12px', outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}