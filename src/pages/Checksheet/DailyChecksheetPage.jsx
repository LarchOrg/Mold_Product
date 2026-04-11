import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import Modal      from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { MOCK_PM_PLANS, MOCK_SPECS } from '@/utils/mockData';

const S = ({ d, size=14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const RESULT_OPTIONS = ['OK','NG','Pass','Fail','N/A'];

const RES_COLOR = { OK:'var(--green)', Pass:'var(--green)', NG:'var(--red)', Fail:'var(--red)', 'N/A':'var(--text3)' };

export default function DailyChecksheetPage() {
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [viewModal, setViewModal]           = useState(null);
  const [selectedPlan, setSelectedPlan]     = useState(null);
  const [results, setResults]               = useState({});
  const { showToast } = useUIStore();

  const openChecksheet = plan => { setSelectedPlan(plan); setResults({}); setCheckModalOpen(true); };

  const handleResultChange = (specId, value) => setResults(p => ({ ...p, [specId]: value }));

  const handleSave = () => {
    const unanswered = MOCK_SPECS.filter(s => !results[s.id]);
    if (unanswered.length > 0) {
      showToast({ type:'error', title:'Incomplete', message:`${unanswered.length} item(s) not filled.` });
      return;
    }
    showToast({ type:'success', title:'Saved', message:`Checksheet for ${selectedPlan.reportNo} saved.` });
    setCheckModalOpen(false);
  };

  const columns = [
    { key:'open', label:'', sortable:false,
      render: (_,row) => (
        <button onClick={() => openChecksheet(row)} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'5px 12px', borderRadius:7,
          background:'var(--accent-glow)', border:'1px solid rgba(79,143,255,0.2)',
          color:'var(--accent)', fontSize:12, fontWeight:500, cursor:'pointer',
          transition:'all var(--trans)',
        }}>
          <S size={12} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}/> Open
        </button>
      ),
    },
    { key:'reportNo', label:'Report No', primary:true,
      render: v => <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key:'mould',  label:'Mould' },
    { key:'partNo', label:'Part No' },
    { key:'date',   label:'Target Date' },
    { key:'status', label:'Status', render: v => <StatusBadge status={v}/> },
  ];

  return (
    <div>
      <PageHeader title="Daily Checksheet Entry" subtitle="Enter actual PM check results per maintenance plan"/>

      <DataTable columns={columns} data={MOCK_PM_PLANS} searchKeys={['reportNo','mould','partNo']} pageSize={10}/>

      {/* Checksheet Entry Modal */}
      <Modal open={checkModalOpen} onClose={() => setCheckModalOpen(false)}
        title={`Checksheet — ${selectedPlan?.reportNo ?? ''}`} size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setCheckModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            <S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/> Save Checksheet
          </Button>
        </>}
      >
        {selectedPlan && (
          <div>
            {/* Plan info grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, background:'var(--bg3)', borderRadius:10, padding:16, marginBottom:20 }}>
              {[['Mould',selectedPlan.mould],['Part No',selectedPlan.partNo],['Target Date',selectedPlan.date],['PM Frequency',selectedPlan.freq],['Status',selectedPlan.status]].map(([label,value])=>(
                <div key={label}>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ flex:1, height:4, background:'var(--bg4)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ width:`${(Object.keys(results).length/MOCK_SPECS.length)*100}%`, height:'100%', background:'var(--accent)', borderRadius:2, transition:'width 0.3s ease' }}/>
              </div>
              <span style={{ fontSize:11, color:'var(--text2)', flexShrink:0 }}>{Object.keys(results).length}/{MOCK_SPECS.length} filled</span>
            </div>

            {/* Check items */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {MOCK_SPECS.map((spec,idx) => {
                const val = results[spec.id];
                const col = val ? RES_COLOR[val] : undefined;
                return (
                  <div key={spec.id} style={{
                    display:'grid', gridTemplateColumns:'28px 1fr 1fr 1fr 120px',
                    alignItems:'center', gap:12,
                    padding:'12px 14px', borderRadius:9,
                    background: val ? (val==='OK'||val==='Pass'?'rgba(34,197,94,0.04)':val==='NG'||val==='Fail'?'rgba(239,68,68,0.04)':'var(--bg3)') : 'var(--bg3)',
                    border:`1px solid ${val ? (val==='OK'||val==='Pass'?'rgba(34,197,94,0.15)':val==='NG'||val==='Fail'?'rgba(239,68,68,0.15)':'var(--border)') : 'var(--border)'}`,
                    transition:'all var(--trans)',
                  }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', fontFamily:"'Geist Mono',monospace" }}>{idx+1}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--text)' }}>{spec.area}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{spec.point}</div>
                    </div>
                    <span style={{ fontSize:12, color:'var(--text2)' }}>{spec.method}</span>
                    <span style={{ fontSize:12, color:'var(--text2)' }}>{spec.condition}</span>
                    <select value={val??''} onChange={e => handleResultChange(spec.id, e.target.value)} style={{
                      background:'var(--bg2)', border:`1px solid ${col ? col+'44' : 'var(--border2)'}`,
                      borderRadius:7, color: col || 'var(--text)', fontSize:12,
                      padding:'6px 10px', outline:'none', cursor:'pointer', fontFamily:'inherit',
                      fontWeight: val ? 600 : 400,
                      transition:'border-color var(--trans)',
                    }}>
                      <option value="">Select...</option>
                      {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}