import { useState } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader  from '@/components/layout/PageHeader';
import Button      from '@/components/common/Button';
import DataTable   from '@/components/table/DataTable';
import Modal       from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { StatusBadge, CategoryBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { MOCK_MOULDS } from '@/utils/mockData';
import { formatNumber, getShotLifePercent, getShotLifeColor, CATEGORY_LABELS, toInputDate } from '@/utils/formatters';

const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const STATUSES = ['Active','Maintenance','Critical','Idle'];
const CAT_KEYS = Object.keys(CATEGORY_LABELS);

export default function MouldPage() {
  const [moulds, setMoulds]         = useState(MOCK_MOULDS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // holds row to delete
  const [editId, setEditId]         = useState(null);
  const [catFilter, setCatFilter]   = useState('all');
  const { showToast } = useUIStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openCreate = () => { setEditId(null); reset({ color:'N/A', usedFrom: new Date().toISOString().split('T')[0] }); setModalOpen(true); };
  const openEdit   = m  => { setEditId(m.id); reset({ ...m, usedFrom: toInputDate(m.usedFrom) }); setModalOpen(true); };

  const confirmDelete = () => {
    setMoulds(p => p.filter(m => m.id !== deleteModal.id));
    showToast({ type:'success', title:'Deleted', message:`${deleteModal.code} removed.` });
    setDeleteModal(null);
  };

  const onSubmit = data => {
    if (editId) {
      setMoulds(p => p.map(m => m.id===editId ? { ...m,...data, id:editId } : m));
      showToast({ type:'success', title:'Updated', message:'Mould record updated.' });
    } else {
      setMoulds(p => [{ ...data, id:Date.now(), status:'Active', currentShot:+data.openingShot||0 }, ...p]);
      showToast({ type:'success', title:'Saved', message:'New mould added.' });
    }
    setModalOpen(false);
  };

  const displayData = catFilter==='all' ? moulds : moulds.filter(m => m.category===catFilter);

  const columns = [
    { key:'code', label:'Model', primary:true,
      render: v => <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key:'name',        label:'Mould Name' },
    { key:'size',        label:'Size' },
    { key:'cavity',      label:'Cavity', align:'center' },
    { key:'partNo',      label:'Part No' },
    { key:'currentShot', label:'Running Shot', align:'right', render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{formatNumber(v)}</span> },
    { key:'lifeShot',    label:'Life Shot',    align:'right', render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{formatNumber(v)}</span> },
    { key:'shotLife', label:'Shot %', sortable:false,
      render: (_,row) => {
        const pct = getShotLifePercent(row);
        const col = getShotLifeColor(pct);
        return (
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:72, height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:col, borderRadius:3 }}/>
            </div>
            <span style={{ fontSize:11, color:col, fontWeight:600, minWidth:28 }}>{pct}%</span>
          </div>
        );
      }
    },
    { key:'category', label:'Cat',    render: v => <CategoryBadge category={v}/> },
    { key:'status',   label:'Status', render: v => <StatusBadge   status={v}/> },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => openEdit(row)} title="Edit" style={actBtn}>
            <S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          <button onClick={() => showToast({ type:'info', title:'Print Label', message:`Printing label for ${row.code}...` })} title="Print" style={actBtn}>
            <S d={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>}/>
          </button>
          <button onClick={() => setDeleteModal(row)} title="Delete" style={{ ...actBtn, color:'var(--red)' }}>
            <S d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>}/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Mould Master" subtitle="Manage all mould records and configurations"
        actions={<>
          <Button variant="secondary" size="sm"><S size={12} d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}/> Excel</Button>
          <Button variant="secondary" size="sm"><S size={12} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/> PDF</Button>
          <Button onClick={openCreate}><S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> Add Mould</Button>
        </>}
      />

      <DataTable columns={columns} data={displayData} searchKeys={['code','name','partNo','location']} pageSize={10}
        toolbar={
          <div style={{ display:'flex', gap:6, marginLeft:'auto', flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Filter:</span>
            {['all',...CAT_KEYS].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:500, cursor:'pointer',
                background: catFilter===c ? 'var(--accent-glow)' : 'transparent',
                border:     catFilter===c ? '1px solid var(--accent)' : '1px solid var(--border)',
                color:      catFilter===c ? 'var(--accent)' : 'var(--text3)',
                transition: 'all var(--trans)',
              }}>{c==='all' ? 'All' : `Cat ${c}`}</button>
            ))}
          </div>
        }
      />

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Mould' : 'Add New Mould'} size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Mould
          </Button>
        </>}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <FormField label="Model Code"    required error={errors.code?.message}><input {...register('code',     {required:'Required'})} placeholder="ML-0042"       style={inputStyle}/></FormField>
          <FormField label="Mould Name"    required error={errors.name?.message}><input {...register('name',     {required:'Required'})} placeholder="Front Cover"    style={inputStyle}/></FormField>
          <FormField label="Mould Size"    required><input {...register('size',     {required:'Required'})} placeholder="450×300×200"  style={inputStyle}/></FormField>
          <FormField label="Cavity"        required><input {...register('cavity',   {required:'Required'})} type="number" placeholder="4" style={inputStyle}/></FormField>
          <FormField label="Opening Shot"  required><input {...register('openingShot',{required:'Required'})} type="number" placeholder="0" style={inputStyle}/></FormField>
          <FormField label="Life Shot"     required><input {...register('lifeShot', {required:'Required'})} type="number" placeholder="500000" style={inputStyle}/></FormField>
          <FormField label="Location"      required><input {...register('location', {required:'Required'})} placeholder="Shop Floor A"  style={inputStyle}/></FormField>
          <FormField label="Part No"       required><input {...register('partNo',   {required:'Required'})} placeholder="FC-2024-001"   style={inputStyle}/></FormField>
          <FormField label="Installation Date" required><input {...register('usedFrom',{required:'Required'})} type="date" style={inputStyle}/></FormField>
          <FormField label="Category"      required>
            <select {...register('category',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              {CAT_KEYS.map(k => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
            </select>
          </FormField>
          <FormField label="Direction"     required>
            <select {...register('direction',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              <option value="F">Front</option>
              <option value="R">Rear</option>
            </select>
          </FormField>
          <FormField label="PM Freq (Days)"  required><input {...register('pmDays',  {required:'Required'})} type="number" placeholder="30" style={inputStyle}/></FormField>
          <FormField label="PM Freq (Shots)" required><input {...register('pmShots', {required:'Required'})} type="number" placeholder="10000" style={inputStyle}/></FormField>
          <FormField label="Barcode"       required><input {...register('barcode',  {required:'Required'})} placeholder="BC-2024-0042" style={inputStyle}/></FormField>
          <FormField label="Mould Color"         ><input {...register('color')}    placeholder="Silver / N/A"   style={inputStyle}/></FormField>
          <FormField label="Customer"            ><input {...register('supplier')} placeholder="Customer name"  style={inputStyle}/></FormField>
          <FormField label="Maker / Supplier" required><input {...register('maker',{required:'Required'})} placeholder="Supplier name" style={inputStyle}/></FormField>
          <FormField label="Remarks" required full>
            <textarea {...register('remarks',{required:'Required'})} placeholder="Additional notes..." style={{ ...inputStyle, minHeight:72, resize:'vertical' }}/>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <S size={13} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/> Delete
          </Button>
        </>}
      >
        <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'var(--red-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--red)' }}>
            <S size={18} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:6 }}>Delete <strong style={{ color:'var(--red)' }}>{deleteModal?.code}</strong>?</p>
            <p style={{ fontSize:13, color:'var(--text2)' }}>This will permanently remove <strong>{deleteModal?.name}</strong> and all associated data. This action cannot be undone.</p>
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
