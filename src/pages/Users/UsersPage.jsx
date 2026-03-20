import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import { StatusBadge, Tag } from '@/components/common/Badge';
import { useUIStore }  from '@/store/uiStore';
import { MOCK_USERS }  from '@/utils/mockData';

const S = ({ d, size=13 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const ROLE_CFG = [
  { role:'Admin',      color:'var(--accent)',  bg:'var(--accent-glow)' },
  { role:'Supervisor', color:'var(--purple)',  bg:'var(--purple-bg)' },
  { role:'Operator',   color:'var(--cyan)',    bg:'var(--cyan-bg)' },
  { role:'Active',     color:'var(--green)',   bg:'var(--green-bg)', key:'status' },
];

export default function UsersPage() {
  const { showToast } = useUIStore();

  const columns = [
    { key:'name', label:'User', primary:true,
      render: (v,row) => (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:9, flexShrink:0,
            background:`linear-gradient(135deg, var(--accent), var(--purple))`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:700, color:'#fff',
          }}>
            {v.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key:'role',  label:'Role',  render: v => <Tag>{v}</Tag> },
    { key:'dept',  label:'Department' },
    { key:'lastLogin', label:'Last Login', render: v => <span style={{ color:'var(--text3)', fontSize:12 }}>{v}</span> },
    { key:'status', label:'Status', render: v => <StatusBadge status={v}/> },
    { key:'actions', label:'', sortable:false,
      render: (_,row) => (
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={() => showToast({ type:'info', title:'Edit User', message:`Editing ${row.name}` })} style={actBtn}>
            <S d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>
          </button>
          <button onClick={() => showToast({ type:'success', title:'Removed', message:`${row.name} removed.` })} style={{ ...actBtn, color:'var(--red)' }}>
            <S d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="User Management" subtitle="Roles and access control"
        actions={<Button onClick={() => showToast({ type:'info', title:'Add User', message:'Connect to auth-service API.' })}>
          <S size={12} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> Add User
        </Button>}
      />

      {/* Role summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:20 }}>
        {ROLE_CFG.map(({ role,color,bg,key='role' }) => (
          <div key={role} style={{
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:12, padding:'14px 16px', borderTop:`2px solid ${color}`,
          }}>
            <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>{role}</div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:26, fontWeight:700, color }}>
              {MOCK_USERS.filter(u => u[key]===role).length}
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={MOCK_USERS} searchKeys={['name','email','role','dept']} pageSize={10}/>
    </div>
  );
}

const actBtn = {
  width:30, height:30, borderRadius:7, border:'1px solid var(--border)',
  background:'var(--bg3)', color:'var(--text2)', cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
  transition:'all var(--trans)',
};
