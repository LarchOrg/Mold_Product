import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import PageHeader   from '@/components/layout/PageHeader';
import Button       from '@/components/common/Button';
import DataTable    from '@/components/table/DataTable';
import Modal        from '@/components/common/Modal';
import FormField, { inputStyle } from '@/components/common/FormField';
import { useUIStore } from '@/store/uiStore';
import { MOCK_SPECS, MOCK_MOULDS } from '@/utils/mockData';

const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const CHECK_AREAS   = ['Cooling System','Ejector Pins','Parting Line','Core & Cavity','Gate / Runner','Surface Finish','Venting'];
const CHECK_POINTS  = ['Water flow check','Pin movement','Flash inspection','Wear measurement','Gate condition','Surface scratch','Vent blockage'];
const CHECK_METHODS = ['Visual','Measurement','Functional','Dimensional'];
const CONDITIONS    = ['OK / NG','Pass / Fail','Within Spec','Not Applicable'];
const FREQ_OPTIONS  = ['Monthly','Quarterly','HalfYearly','Yearly'];

export default function SpecEntryPage() {
  const [specs, setSpecs]           = useState(MOCK_SPECS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editId, setEditId]         = useState(null);
  const { showToast } = useUIStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openCreate = () => { setEditId(null); reset({ order:1 }); setModalOpen(true); };
  const openEdit   = s  => { setEditId(s.id); reset(s); setModalOpen(true); };

  const confirmDelete = () => {
    setSpecs(s => s.filter(x => x.id !== deleteModal.id));
    showToast({ type:'success', title:'Deleted', message:'Spec entry removed.' });
    setDeleteModal(null);
  };

  const onSubmit = data => {
    const mould = MOCK_MOULDS.find(m => m.id===+data.mouldId);
    if (editId) {
      setSpecs(p => p.map(s => s.id===editId ? { ...s,...data, id:editId } : s));
      showToast({ type:'success', title:'Updated', message:'Spec entry updated.' });
    } else {
      setSpecs(p => [{ ...data, id:Date.now(), mouldCode:mould?.code??'', mouldName:mould?.name??'', order:+data.order }, ...p]);
      showToast({ type:'success', title:'Saved', message:'PM Spec added.' });
    }
    setModalOpen(false);
  };

  const columns = [
    { key:'mouldCode', label:'Mould Code', primary:true,
      render: v => <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key:'mouldName', label:'Mould Name' },
    { key:'area',      label:'Check Area' },
    { key:'point',     label:'Check Point' },
    { key:'method',    label:'Method' },
    { key:'condition', label:'Condition' },
    { key:'freq',      label:'Frequency' },
    { key:'order',     label:'#', align:'center' },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => openEdit(row)} style={actBtn}><S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/></button>
          <button onClick={() => setDeleteModal(row)} style={{ ...actBtn, color:'var(--red)' }}><S d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="PM Spec Entry" subtitle="Define check items and required conditions per mould"
        actions={<>
          <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}><S size={12} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/> Upload CSV</Button>
          <Button variant="secondary" size="sm" onClick={() => showToast({ type:'info', title:'Download', message:'Downloading CSV template...' })}><S size={12} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/> Template</Button>
          <Button onClick={openCreate}><S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> Add Spec</Button>
        </>}
      />

      <DataTable columns={columns} data={specs} searchKeys={['mouldCode','mouldName','area','point']} pageSize={10}/>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit PM Spec' : 'Add PM Spec'}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>
            {editId ? 'Update' : 'Save'} Spec
          </Button>
        </>}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {!editId && (
            <FormField label="Mould" required error={errors.mouldId?.message}>
              <select {...register('mouldId',{required:'Required'})} style={inputStyle}>
                <option value="">Select mould...</option>
                {MOCK_MOULDS.map(m => <option key={m.id} value={m.id}>{m.code} – {m.name}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="PM Frequency" required>
            <select {...register('freq',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Check Area" required>
            <select {...register('area',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              {CHECK_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </FormField>
          <FormField label="Check Point" required>
            <select {...register('point',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              {CHECK_POINTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Check Method" required>
            <select {...register('method',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              {CHECK_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Required Condition" required>
            <select {...register('condition',{required:'Required'})} style={inputStyle}>
              <option value="">Select...</option>
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Order By" required>
            <input {...register('order',{required:'Required'})} type="number" placeholder="1" style={inputStyle}/>
          </FormField>
        </div>
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Spec CSV"
        footer={<>
          <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button onClick={() => { setUploadOpen(false); showToast({ type:'success', title:'Uploaded', message:'Specs imported successfully.' }); }}>
            <S size={13} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/> Import
          </Button>
        </>}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>
            Upload a <strong>.csv</strong> file with columns:{' '}
            <code style={{ fontSize:11, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)' }}>
              Model, Pmfrequency, CheckAreas, CheckPoint, CheckMethod, RequiredCondition, OrderBy
            </code>
          </p>
          <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:'28px 20px', textAlign:'center', background:'var(--bg3)' }}>
            <S size={28} d={<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>}/>
            <p style={{ fontSize:13, color:'var(--text2)', margin:'10px 0 14px' }}>Drop your CSV file here or</p>
            <input type="file" accept=".csv" id="csv-upload" style={{ display:'none' }}/>
            <label htmlFor="csv-upload">
              <Button variant="secondary" size="sm" style={{ cursor:'pointer' }}>Browse File</Button>
            </label>
          </div>
          <p style={{ fontSize:11, color:'var(--text3)' }}>Only <strong>CSV</strong> format accepted. Download the template first to ensure correct column headers.</p>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}><S size={13} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/> Delete</Button>
        </>}
      >
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'var(--red-bg)', color:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <S size={18} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', marginBottom:6 }}>Delete this spec entry?</p>
            <p style={{ fontSize:13, color:'var(--text2)' }}><strong>{deleteModal?.area} — {deleteModal?.point}</strong> will be permanently removed.</p>
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
