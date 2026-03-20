import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import Modal      from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { MOCK_HISTORY } from '@/utils/mockData';

const S = ({ d, size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

export default function PMHistoryPage() {
  const [viewRecord, setViewRecord] = useState(null);

  const columns = [
    { key:'reportNo', label:'Report No', primary:true,
      render: v => <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key:'mould',     label:'Mould' },
    { key:'type',      label:'PM Type' },
    { key:'points',    label:'Check Points', align:'center',
      render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, fontWeight:600 }}>{v}</span> },
    { key:'tech',      label:'Technician' },
    { key:'completed', label:'Completed Date' },
    { key:'result',    label:'Result', render: v => <StatusBadge status={v}/> },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <button onClick={() => setViewRecord(row)} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'5px 12px', borderRadius:7,
          background:'var(--bg3)', border:'1px solid var(--border2)',
          color:'var(--text2)', fontSize:12, fontWeight:500, cursor:'pointer',
          transition:'all var(--trans)',
        }}>
          <S d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}/> View
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="PM History" subtitle="Full preventive maintenance audit trail"
        actions={<>
          <Button variant="secondary" size="sm"><S d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}/> Excel</Button>
          <Button variant="secondary" size="sm"><S d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/> PDF</Button>
        </>}
      />
      <DataTable columns={columns} data={MOCK_HISTORY} searchKeys={['reportNo','mould','tech']} pageSize={10}/>

      <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title={`Record — ${viewRecord?.reportNo}`} size="sm"
        footer={<Button variant="secondary" onClick={() => setViewRecord(null)}>Close</Button>}
      >
        {viewRecord && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[['Mould',viewRecord.mould],['PM Type',viewRecord.type],['Check Points',viewRecord.points],['Technician',viewRecord.tech],['Completed',viewRecord.completed],['Result',viewRecord.result]].map(([label,value])=>(
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</span>
                <span style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>
                  {label==='Result' ? <StatusBadge status={value}/> : value}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
