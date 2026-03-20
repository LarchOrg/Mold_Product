import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import PageHeader   from '@/components/layout/PageHeader';
import Button       from '@/components/common/Button';
import DataTable    from '@/components/table/DataTable';
import Modal        from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { MOCK_PM_PLANS, MOCK_MOULDS } from '@/utils/mockData';

const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const STATUS_FILTERS = ['all','Pending','Completed','Overdue'];

export default function PMPlanPage() {
  const [plans, setPlans]           = useState(MOCK_PM_PLANS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editId, setEditId]         = useState(null);
  const [statusFilter, setStatus]   = useState('all');
  const { showToast } = useUIStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openCreate = () => { setEditId(null); reset({ date: new Date().toISOString().split('T')[0] }); setModalOpen(true); };
  const openEdit   = p  => { setEditId(p.id); reset({ mouldId: p.mouldId, date: p.date }); setModalOpen(true); };

  const confirmDelete = () => {
    setPlans(p => p.filter(x => x.id !== deleteModal.id));
    showToast({ type:'success', title:'Deleted', message:'PM Plan deleted.' });
    setDeleteModal(null);
  };

  const onSubmit = data => {
    if (editId) {
      setPlans(p => p.map(x => x.id===editId ? { ...x, date:data.date } : x));
      showToast({ type:'success', title:'Updated', message:'PM Plan updated.' });
    } else {
      const mould = MOCK_MOULDS.find(m => m.id===+data.mouldId);
      const newPlan = {
        id: Date.now(),
        reportNo: `PM-2026-${String(plans.length+1).padStart(3,'0')}`,
        mould:  mould ? `${mould.code} ${mould.name}` : 'Unknown',
        mouldId: +data.mouldId,
        partNo:  mould?.partNo ?? '',
        freq:    'Monthly',
        date:    data.date,
        status:  'Pending',
      };
      setPlans(p => [newPlan, ...p]);
      showToast({ type:'success', title:'Created', message:`${newPlan.reportNo} created.` });
    }
    setModalOpen(false);
  };

  const displayData = statusFilter==='all' ? plans : plans.filter(p => p.status===statusFilter);

  const columns = [
    { key:'reportNo', label:'Report No', primary:true,
      render: v => <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key:'mould',  label:'Mould' },
    { key:'partNo', label:'Part No' },
    { key:'freq',   label:'Frequency' },
    { key:'date',   label:'Target Date' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v}/> },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => openEdit(row)} title="Edit" style={actBtn}>
            <S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          <button onClick={() => showToast({ type:'info', title:'Checksheet', message:`Opening checksheet for ${row.reportNo}` })} title="Open Checksheet" style={actBtn}>
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
      <PageHeader title="Preventive Maintenance Plan" subtitle="Schedule and track mould PM activities"
        actions={<Button onClick={openCreate}><S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> New PM Plan</Button>}
      />

      <DataTable columns={columns} data={displayData} searchKeys={['reportNo','mould','partNo']} pageSize={10}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit PM Plan' : 'New PM Plan'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Plan
          </Button>
        </>}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {!editId && (
            <FormField label="Mould" required error={errors.mouldId?.message}>
              <select {...register('mouldId',{required:'Select a mould'})} style={inputStyle}>
                <option value="">Select mould...</option>
                {MOCK_MOULDS.map(m => <option key={m.id} value={m.id}>{m.code} – {m.name}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="Target Date" required error={errors.date?.message}>
            <input {...register('date',{required:'Date is required'})} type="date" style={inputStyle}/>
          </FormField>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm"
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
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:6 }}>Delete <strong style={{ color:'var(--red)' }}>{deleteModal?.reportNo}</strong>?</p>
            <p style={{ fontSize:13, color:'var(--text2)' }}>This PM plan will be permanently removed. This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const actBtn = {
  width:30, height:30, borderRadius:7, border:'1px solid var(--border)',
  background:'var(--bg3)', color:'var(--text2)', cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
  transition:'all var(--trans)',
};
