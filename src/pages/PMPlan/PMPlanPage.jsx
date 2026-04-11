import { useState, useRef, useEffect } from 'react';
import { useForm }  from 'react-hook-form';
import PageHeader   from '@/components/layout/PageHeader';
import Button       from '@/components/common/Button';
import Modal        from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { useMouldDropdown } from '@/hooks/useMoulds';
import {
  usePMDropdown,
  useCreatePMPlan,
  usePMPlans,
  usePMPlan,
  useUpdatePMPlan,
  useDeletePMPlan,
} from '@/hooks/usePMPlans';

// ── Tiny SVG helper ───────────────────────────────────────────────────────────
const S = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const IconCalendar = ({ size = 13 }) => <S size={size} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}/>;
const IconWrench   = ({ size = 13 }) => <S size={size} d={<><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>}/>;
const IconPlus     = ({ size = 13 }) => <S size={size} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>;
const IconEdit     = ({ size = 13 }) => <S size={size} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>;
const IconTrash    = ({ size = 13 }) => <S size={size} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/>;
const IconChevL    = ({ size = 13 }) => <S size={size} d={<><polyline points="15 18 9 12 15 6"/></>}/>;
const IconChevR    = ({ size = 13 }) => <S size={size} d={<><polyline points="9 18 15 12 9 6"/></>}/>;
const IconClock    = ({ size = 13 }) => <S size={size} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>;
const IconInfo     = ({ size = 13 }) => <S size={size} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>;
const IconWarn     = ({ size = 13 }) => <S size={size} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>;
const IconDoc      = ({ size = 13 }) => <S size={size} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}/>;
const IconSave     = ({ size = 13 }) => <S size={size} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>;

// ── Date helpers ──────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function isDateToday(y, m, d) {
  const t = new Date();
  return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
}

// ── NEW: returns true if the given calendar day is strictly before today ──────
function isDatePast(y, m, d) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(y, m, d);
  return target < today;
}

function formatDisplayDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PMPlanPage() {
  const today = new Date();

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [statusFilter, setStatus] = useState('all');

  // Modal states
  const [dayModal, setDayModal]       = useState(null);  // { dayNum }
  const [addModal, setAddModal]       = useState(null);  // { dayNum, isToday }
  const [editModal, setEditModal]     = useState(null);  // plan object
  const [deleteModal, setDeleteModal] = useState(null);  // plan object

  // ── FIX: Track mould/pm selections in plain state — NOT via RHF
  const [addMouldId, setAddMouldId] = useState('');
  const [addPmId,    setAddPmId]    = useState('');
  const [planType,   setPlanType]   = useState('pm');
  const [addErrors,  setAddErrors]  = useState({});

  // Hooks
  const { data: plans = [], isLoading }                        = usePMPlans();
  const { data: mouldOptions = [], isLoading: mouldLoading }   = useMouldDropdown();
  const { data: pmOptions = [], isLoading: pmLoading }         = usePMDropdown();
  const filteredPmOptions = (pmOptions || []).filter(
  opt => !opt.label?.toLowerCase().includes('Daily')
);

  const { data: editData }                                     = usePMPlan(editModal?.id);
  const { mutate: createPMPlan }                               = useCreatePMPlan();
  const { mutate: updatePMPlan }                               = useUpdatePMPlan();
  const { mutate: deletePMPlan }                               = useDeletePMPlan();
  const { showToast }                                          = useUIStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (editData && editModal?.id) {
      reset({ date: editData.date });
    }
  }, [editData, editModal, reset]);

  // ── Calendar navigation ───────────────────────────────────────────────────
  const changeMonth = (dir) => {
    setViewMonth(prev => {
      let m = prev + dir;
      if (m > 11) { setViewYear(y => y + 1); return 0; }
      if (m < 0)  { setViewYear(y => y - 1); return 11; }
      return m;
    });
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  // ── Plans visible in current calendar view ────────────────────────────────
  const visiblePlans = plans.filter(p => {
    const d = new Date(p.date);
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && statusOk;
  });

  const planMap = {};
  visiblePlans.forEach(p => {
    const k = new Date(p.date).getDate();
    if (!planMap[k]) planMap[k] = [];
    planMap[k].push(p);
  });

  // Stats (unfiltered by status)
  const monthPlans = plans.filter(p => {
    const d = new Date(p.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const calDays = [];
  for (let i = 0; i < totalCells; i++) {
    let dayNum, isOther = false;
    if (i < firstDay) {
      dayNum = daysInPrev - firstDay + i + 1; isOther = true;
    } else if (i >= firstDay + daysInMonth) {
      dayNum = i - firstDay - daysInMonth + 1; isOther = true;
    } else {
      dayNum = i - firstDay + 1;
    }
    calDays.push({ dayNum, isOther, isToday: !isOther && isDateToday(viewYear, viewMonth, dayNum) });
  }

  // ── Open day modal ────────────────────────────────────────────────────────
  const openDay = (dayNum) => setDayModal({ dayNum });

  // ── Open add modal ────────────────────────────────────────────────────────
  const openAdd = (dayNum) => {
    const isTod = isDateToday(viewYear, viewMonth, dayNum);
    setAddMouldId('');
    setAddPmId('');
    setAddErrors({});
    setPlanType(isTod ? 'daily' : 'pm');
    setDayModal(null);
    setAddModal({ dayNum, isToday: isTod });
  };

  const handlePlanTypeChange = (t) => {
    if (t === 'daily' && !addModal?.isToday) return;
    setPlanType(t);
    setAddPmId('');
    setAddErrors({});
  };

  // ── Save plan ─────────────────────────────────────────────────────────────
  const handleSavePlan = () => {
    const errs = {};
    if (!addMouldId) errs.mouldId = 'Select a mould';
    if (planType === 'pm' && !addPmId) errs.pmId = 'Select a PM frequency';
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }

    createPMPlan(
      {
        mouldId: addMouldId,
        pmId:    planType === 'pm' ? addPmId : undefined,
        planType,
        date:    toDateStr(viewYear, viewMonth, addModal.dayNum),
      },
      {
        onSuccess: () => {
          setAddModal(null);
          showToast({ type: 'success', title: 'Plan Created', message: 'PM plan added successfully' });
        },
        onError: (err) => {
          showToast({ type: 'error', title: 'Error', message: err?.message || 'Failed to create plan' });
        },
      }
    );
  };

  // ── Edit submit ───────────────────────────────────────────────────────────
  const onSubmitEdit = (data) => {
    updatePMPlan(
      { id: editModal.id, ...data },
      {
        onSuccess: () => {
          setEditModal(null);
          showToast({ type: 'success', title: 'Plan Updated', message: 'PM plan updated successfully' });
        },
      }
    );
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (!deleteModal) return;
    deletePMPlan(deleteModal.id, {
      onSuccess: () => {
        setDeleteModal(null);
        showToast({ type: 'success', title: 'Deleted', message: `${deleteModal.reportNo} removed` });
      },
      onError: () => setDeleteModal(null),
    });
  };

  // Plans for the open day modal
  const dayPlans = dayModal
    ? plans.filter(p => {
        const d = new Date(p.date);
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === dayModal.dayNum;
      })
    : [];

  // ── Is the currently open day modal a past date? ──────────────────────────
  const isDayPast = dayModal ? isDatePast(viewYear, viewMonth, dayModal.dayNum) : false;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Preventive Maintenance Plan"
        subtitle="Click any date to view or add PM plans"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { label: 'Daily',        color: 'var(--purple)' },
              { label: 'PM · Pending', color: 'var(--accent)' },
              { label: 'Completed',    color: 'var(--green,#3b6d11)' },
              { label: 'Overdue',      color: 'var(--red)' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, opacity: .85 }}/>
                {l.label}
              </div>
            ))}
          </div>
        }
      />

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '16px 0' }}>
        {[
          { label: 'Total Plans',  val: monthPlans.length,                                       color: 'var(--text)' },
          { label: 'Completed',    val: monthPlans.filter(p => p.status === 'Completed').length,  color: 'var(--green,#3b6d11)' },
          { label: 'Pending',      val: monthPlans.filter(p => p.status === 'Pending').length,    color: 'var(--amber,#ba7517)' },
          { label: 'Overdue',      val: monthPlans.filter(p => p.status === 'Overdue').length,    color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Calendar nav ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
            style={{ ...inputStyle, width: 130, padding: '5px 10px', fontSize: 12 }}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => changeMonth(-1)} style={navBtn}><IconChevL/></button>
            <button onClick={goToday} style={{ ...navBtn, fontSize: 11, fontWeight: 600, padding: '0 10px', color: 'var(--accent)', borderColor: 'var(--accent)' }}>Today</button>
            <button onClick={() => changeMonth(1)}  style={navBtn}><IconChevR/></button>
          </div>
        </div>
      </div>

      {/* ── Calendar grid ───────────────────────────────────────────────── */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Day name header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '8px 4px', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {calDays.map(({ dayNum, isOther, isToday }, idx) => {
            const dayChips = isOther ? [] : (planMap[dayNum] || []);
            const maxShow  = 3;
            const extra    = dayChips.length - maxShow;
            // Dim past date cells subtly
            const isPast   = !isOther && isDatePast(viewYear, viewMonth, dayNum);

            return (
              <div
                key={idx}
                onClick={() => !isOther && openDay(dayNum)}
                style={{
                  minHeight: 96, padding: 6,
                  borderRight:  (idx + 1) % 7 === 0 ? 'none' : '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  background:   isOther ? 'var(--bg2)' : isToday ? 'rgba(79,143,255,0.04)' : 'var(--bg)',
                  cursor:       isOther ? 'default' : 'pointer',
                  transition:   'background var(--trans)',
                  // Subtle dimming for past dates
                  opacity:      isPast ? 0.65 : 1,
                }}
                onMouseEnter={e => { if (!isOther) e.currentTarget.style.background = 'var(--bg2)'; }}
                onMouseLeave={e => { if (!isOther) e.currentTarget.style.background = isToday ? 'rgba(79,143,255,0.04)' : 'var(--bg)'; }}
              >
                <div style={{ fontSize: 12, fontWeight: 500, height: 24, display: 'flex', alignItems: 'center' }}>
                  <span style={isToday ? todayNumStyle : { color: isOther ? 'var(--text3)' : 'var(--text2)', opacity: isOther ? 0.3 : 1 }}>
                    {dayNum}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 3 }}>
                  {dayChips.slice(0, maxShow).map(p => (
                    <PlanChip key={p.id} plan={p} onClick={e => { e.stopPropagation(); openDay(dayNum); }}/>
                  ))}
                  {extra > 0 && (
                    <div onClick={e => { e.stopPropagation(); openDay(dayNum); }}
                      style={{ fontSize: 10, color: 'var(--text3)', padding: '2px 4px', cursor: 'pointer' }}>
                      +{extra} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ Day Modal ════════════════════════════════════════════════════════
          CHANGED:
          - Layout is now a 3-column card grid with max-height + overflow scroll
          - "Add Plan" button and "Close" button are hidden for past dates
          - Only a "Close" label button shown for past dates
      ════════════════════════════════════════════════════════════════════ */}
      <Modal
        open={!!dayModal}
        onClose={() => setDayModal(null)}
        title={dayModal ? `${MONTH_SHORT[viewMonth]} ${dayModal.dayNum}, ${viewYear}` : ''}
        size="xl"
        footer={
          <>
            {/* Past date: only a plain close button, no Add Plan */}
            {isDayPast ? (
              <Button variant="secondary" onClick={() => setDayModal(null)}>Close</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setDayModal(null)}>Close</Button>
                <Button onClick={() => openAdd(dayModal.dayNum)}>
                  <IconPlus/> Add Plan
                </Button>
              </>
            )}
          </>
        }
      >
        {/* Past date read-only notice */}
        {isDayPast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginBottom: 14,
            borderRadius: 8, fontSize: 12,
            background: 'rgba(186,117,23,0.1)',
            border: '1px solid rgba(186,117,23,0.2)',
            color: 'var(--amber,#ba7517)',
          }}>
            <IconWarn size={13}/>
            This is a past date — plans are read-only.
          </div>
        )}

        {dayPlans.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0 28px' }}>
            No plans for this day
          </p>
        ) : (
          /* ── 3-column card grid, scrollable ─────────────────────────── */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 4,      // breathing room next to scrollbar
          }}>
            {dayPlans.map(p => {
              const barColor = p.type === 'daily' ? 'var(--purple)'
                : p.status === 'Completed' ? 'var(--green,#3b6d11)'
                : p.status === 'Overdue'   ? 'var(--red)'
                : 'var(--accent)';
              return (
                <div key={p.id} style={{
                  background: 'var(--bg3)',
                  borderRadius: 10,
                  padding: 12,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                }}>
                  {/* Colour bar at top of card */}
                  <div style={{ height: 3, borderRadius: 2, background: barColor, marginBottom: 10 }}/>

                  <InfoRow label="Report No" value={
                    <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, background: 'var(--bg3)', padding: '2px 6px', borderRadius: 5, color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)' }}>
                      {p.reportNo}
                    </code>
                  }/>
                  <InfoRow label="Mould"   value={p.mould}  />
                  <InfoRow label="Part No" value={p.partNo} />
                  <InfoRow label="Type" value={
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                      background: p.type === 'daily' ? 'var(--purple-bg)' : 'var(--accent-glow)',
                      color:      p.type === 'daily' ? 'var(--purple)'    : 'var(--accent)',
                    }}>
                      {p.type === 'daily' ? <IconCalendar size={11}/> : <IconWrench size={11}/>}
                      {p.type === 'daily' ? 'Daily' : 'PM'} · {p.freq}
                    </span>
                  }/>
                  <InfoRow label="Status" value={<StatusBadge status={p.status}/>}/>

                  {/* Action buttons at bottom of card */}
                  <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setDayModal(null); setEditModal(p); reset({ date: p.date }); }}
                      style={actBtn}
                    >
                      <IconEdit size={12}/> Edit
                    </button>
                    <button
                      onClick={() => showToast({ type: 'info', title: 'Checksheet', message: `Opening checksheet for ${p.reportNo}` })}
                      style={actBtn}
                    >
                      <IconDoc size={12}/> Sheet
                    </button>
                    <button
                      onClick={() => { setDayModal(null); setDeleteModal(p); }}
                      style={{ ...actBtn, color: 'var(--red)' }}
                    >
                      <IconTrash size={12}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* ══ Add Plan Modal ════════════════════════════════════════════════════ */}
      <Modal
        open={!!addModal}
        onClose={() => { setAddModal(null); setDayModal({ dayNum: addModal?.dayNum }); }}
        title="New PM Plan"
        footer={<>
          <Button variant="secondary" onClick={() => { setAddModal(null); setDayModal({ dayNum: addModal?.dayNum }); }}>
            Back
          </Button>
          <Button onClick={handleSavePlan}>
            <IconSave/> Save Plan
          </Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Date pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'var(--text2)', alignSelf: 'flex-start' }}>
            <IconCalendar size={12}/>
            {addModal && formatDisplayDate(toDateStr(viewYear, viewMonth, addModal.dayNum))}
          </div>

          {/* Plan type toggle */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 8 }}>Plan Type</label>
            <div style={{ display: 'flex', background: 'var(--bg3)', padding: 3, borderRadius: 9, border: '1px solid var(--border)', gap: 3 }}>
              {[
                { value: 'daily', label: 'Daily', icon: <IconCalendar size={13}/>, activeColor: 'var(--purple)', disabled: !addModal?.isToday },
                { value: 'pm',    label: 'PM',    icon: <IconWrench  size={13}/>, activeColor: 'var(--accent)', disabled: false },
              ].map(t => (
                <button
                  key={t.value}
                  type="button"
                  disabled={t.disabled}
                  onClick={() => !t.disabled && handlePlanTypeChange(t.value)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 7,
                    fontSize: 13, fontWeight: 500,
                    cursor: t.disabled ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all var(--trans)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    opacity: t.disabled ? 0.3 : 1,
                    background: planType === t.value ? 'var(--surface)' : 'transparent',
                    border:     planType === t.value ? `1px solid ${t.activeColor}` : '1px solid transparent',
                    color:      planType === t.value ? t.activeColor : 'var(--text2)',
                    boxShadow:  planType === t.value ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Info banner */}
            {planType === 'daily' ? (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 7, background: 'var(--purple-bg)', border: '1px solid rgba(127,119,221,0.2)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--purple)' }}>
                <IconClock size={13}/> Date is set to today
              </div>
            ) : addModal && !addModal.isToday ? (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 7, background: 'rgba(186,117,23,0.1)', border: '1px solid rgba(186,117,23,0.2)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--amber,#ba7517)' }}>
                <IconWarn size={13}/> Daily plans can only be created for today
              </div>
            ) : (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 7, background: 'var(--accent-glow)', border: '1px solid rgba(79,143,255,0.2)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--accent)' }}>
                <IconInfo size={13}/> PM maintenance plan for the selected date
              </div>
            )}
          </div>

          {/* Mould + PM Frequency */}
          <div style={{ display: 'grid', gridTemplateColumns: planType === 'pm' ? '1fr 1fr' : '1fr', gap: 16 }}>
            <FormField label="Mould" required error={addErrors.mouldId}>
              <SearchableSelect
                options={mouldLoading ? [] : mouldOptions}
                value={addMouldId}
                onChange={val => { setAddMouldId(val); setAddErrors(e => ({ ...e, mouldId: '' })); }}
                placeholder={mouldLoading ? 'Loading moulds...' : 'Search mould...'}
                disabled={mouldLoading}
                error={addErrors.mouldId}
              />
            </FormField>

            {planType === 'pm' && (
              <FormField label="PM Frequency" required error={addErrors.pmId}>
                <SearchableSelect
                  options={pmLoading ? [] : filteredPmOptions}
                  value={addPmId}
                  onChange={val => { setAddPmId(val); setAddErrors(e => ({ ...e, pmId: '' })); }}
                  placeholder={pmLoading ? 'Loading...' : 'Search frequency...'}
                  disabled={pmLoading}
                  error={addErrors.pmId}
                />
              </FormField>
            )}
          </div>
        </div>
      </Modal>

      {/* ══ Edit Modal ════════════════════════════════════════════════════════ */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit PM Plan"
        footer={<>
          <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmitEdit)}>
            <IconSave/> Update Plan
          </Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 120 }}>
          <FormField label="Target Date" required error={errors.date?.message}>
            <input
              {...register('date', { required: 'Date is required' })}
              type="date"
              style={inputStyle}
            />
          </FormField>
        </div>
      </Modal>

      {/* ══ Delete Confirm Modal ══════════════════════════════════════════════ */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirm Delete"
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <IconTrash size={13}/> Delete Plan
          </Button>
        </>}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconWarn size={18}/>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
              Delete <strong style={{ color: 'var(--red)' }}>{deleteModal?.reportNo}</strong>?
            </p>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>
              This PM plan will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 12 }}>
      <span style={{ color: 'var(--text3)', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500, textAlign: 'right', marginLeft: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function PlanChip({ plan, onClick }) {
  const isDaily = plan.type === 'daily';
  const chipStyles = isDaily
    ? { background: 'var(--purple-bg)', color: 'var(--purple)', borderColor: 'var(--purple)' }
    : plan.status === 'Completed'
    ? { background: 'rgba(99,153,34,0.1)', color: 'var(--green,#3b6d11)', borderColor: 'var(--green,#3b6d11)' }
    : plan.status === 'Overdue'
    ? { background: 'var(--red-bg)', color: 'var(--red)', borderColor: 'var(--red)' }
    : { background: 'var(--accent-glow)', color: 'var(--accent)', borderColor: 'var(--accent)' };

  return (
    <div onClick={onClick} style={{
      fontSize: 10, padding: '2px 6px 2px 7px', borderRadius: 4,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      cursor: 'pointer', fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 4,
      ...chipStyles,
      boxShadow: `inset 3px 0 0 ${chipStyles.borderColor}`,
    }}>
      {isDaily
        ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      }
      {plan.mould}
    </div>
  );
}

// ── Searchable Select ─────────────────────────────────────────────────────────
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
      setDropUp(window.innerHeight - triggerRef.current.getBoundingClientRect().bottom < 240);
    }
    setOpen(o => !o);
    if (open) setSearch('');
  };

  const handleSelect = opt => { onChange(opt.value); setSearch(''); setOpen(false); };
  const handleClear  = e   => { e.stopPropagation(); onChange(''); setSearch(''); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <div ref={triggerRef} onClick={handleToggle} style={{
        ...inputStyle,
        background:  disabled ? 'var(--bg3)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderColor: open ? 'var(--accent)' : error ? 'var(--red)' : undefined,
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
            {filtered.length === 0 ? (
              <div style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>No results for "{search}"</div>
            ) : filtered.map((opt, idx) => {
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
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const navBtn = {
  height: 30, borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all var(--trans)', padding: '0 8px',
};

const todayNumStyle = {
  background: 'var(--accent)', color: '#fff', borderRadius: '50%',
  width: 24, height: 24, display: 'flex', alignItems: 'center',
  justifyContent: 'center', fontWeight: 600, fontSize: 12,
};

const actBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer',
  fontSize: 12, fontFamily: 'inherit', transition: 'all var(--trans)',
};