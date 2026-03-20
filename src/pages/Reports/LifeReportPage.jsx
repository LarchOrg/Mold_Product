import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import { MOCK_MOULDS } from '@/utils/mockData';
import { formatNumber, getShotLifePercent, getShotLifeColor } from '@/utils/formatters';

const S = ({ d, size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const SUMMARY = [
  { label:'Critical (>85%)', filter: m => getShotLifePercent(m)>=85, color:'var(--red)',    icon:<S size={16} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/> },
  { label:'Warning (60–85%)', filter: m => { const p=getShotLifePercent(m); return p>=60&&p<85; }, color:'var(--amber)', icon:<S size={16} d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/> },
  { label:'Healthy (<60%)',   filter: m => getShotLifePercent(m)<60, color:'var(--green)',  icon:<S size={16} d={<><polyline points="20 6 9 17 4 12"/></>}/> },
  { label:'Total Moulds',    filter: () => true,                     color:'var(--accent)', icon:<S size={16} d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>}/> },
];

export default function LifeReportPage() {
  const columns = [
    { key:'code', label:'Model', primary:true,
      render: v => <code style={{ fontFamily:"'Geist Mono',monospace", fontSize:12, background:'var(--bg3)', padding:'2px 8px', borderRadius:5, color:'var(--cyan)', border:'1px solid rgba(6,182,212,0.15)' }}>{v}</code> },
    { key:'name',        label:'Mould Name' },
    { key:'openingShot', label:'Opening Shot', align:'right', render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{formatNumber(v)}</span> },
    { key:'currentShot', label:'Running Shot', align:'right', render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{formatNumber(v)}</span> },
    { key:'lifeShot',    label:'Life Shot',    align:'right', render: v => <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{formatNumber(v)}</span> },
    { key:'remaining', label:'Remaining', align:'right', sortable:false,
      render: (_,row) => {
        const rem = row.lifeShot - row.currentShot;
        const col = rem<20000?'var(--red)':rem<80000?'var(--amber)':'var(--text2)';
        return <span style={{ color:col, fontWeight:500, fontFamily:"'Geist Mono',monospace", fontSize:12 }}>{formatNumber(rem)}</span>;
      }
    },
    { key:'shotPct', label:'Life Used', sortable:false,
      render: (_,row) => {
        const pct = getShotLifePercent(row);
        const col = getShotLifeColor(pct);
        return (
          <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:120 }}>
            <div style={{ flex:1, height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:col, borderRadius:3 }}/>
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:col, minWidth:30, textAlign:'right' }}>{pct}%</span>
          </div>
        );
      }
    },
    { key:'projection', label:'Health', sortable:false,
      render: (_,row) => {
        const pct = getShotLifePercent(row);
        if (pct>=85) return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--red)',   background:'var(--red-bg)',   padding:'2px 8px', borderRadius:20 }}><span style={{ width:5,height:5,borderRadius:'50%',background:'var(--red)',flexShrink:0 }}/>Critical</span>;
        if (pct>=60) return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--amber)', background:'var(--amber-bg)', padding:'2px 8px', borderRadius:20 }}><span style={{ width:5,height:5,borderRadius:'50%',background:'var(--amber)',flexShrink:0 }}/>Warning</span>;
        return              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--green)', background:'var(--green-bg)', padding:'2px 8px', borderRadius:20 }}><span style={{ width:5,height:5,borderRadius:'50%',background:'var(--green)',flexShrink:0 }}/>Healthy</span>;
      }
    },
  ];

  return (
    <div>
      <PageHeader title="Mould Life Report" subtitle="Shot lifecycle analysis and end-of-life projection"
        actions={<>
          <Button variant="secondary" size="sm"><S d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>}/> Excel</Button>
          <Button variant="secondary" size="sm"><S d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/> PDF</Button>
        </>}
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
        {SUMMARY.map(({ label,filter,color,icon }) => (
          <div key={label} style={{
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:12, padding:'16px 18px',
            borderTop:`2px solid ${color}`,
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', fontWeight:600 }}>{label}</div>
              <div style={{ color }}>{icon}</div>
            </div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:28, fontWeight:700, color }}>{MOCK_MOULDS.filter(filter).length}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={MOCK_MOULDS} searchKeys={['code','name']} pageSize={10}/>
    </div>
  );
}
