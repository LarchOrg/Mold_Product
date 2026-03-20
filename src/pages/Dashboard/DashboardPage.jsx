import PageHeader from '@/components/layout/PageHeader';
import StatCard   from '@/components/common/StatCard';
import Button     from '@/components/common/Button';
import { CategoryBadge } from '@/components/common/Badge';
import { formatNumber, getShotLifePercent, getShotLifeColor } from '@/utils/formatters';
import { MOCK_MOULDS, MOCK_PM_PLANS } from '@/utils/mockData';

const S = ({ d, size=16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

const STAT_ICONS = {
  box:     <S d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></>}/>,
  check:   <S d={<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}/>,
  warning: <S d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}/>,
  alert:   <S d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>,
  chart:   <S d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}/>,
  wrench:  <S d={<><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>}/>,
};

export default function DashboardPage() {
  const active    = MOCK_MOULDS.filter(m => m.status==='Active').length;
  const critical  = MOCK_MOULDS.filter(m => m.category==='A').length;
  const pmDue     = MOCK_PM_PLANS.filter(p => p.status==='Pending'||p.status==='Overdue').length;
  const completed = MOCK_PM_PLANS.filter(p => p.status==='Completed').length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Industrial Mould Management Overview · March 2026"
        actions={<>
          <Button variant="secondary" size="sm">
            <S size={13} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/> Export
          </Button>
          <Button size="sm">
            <S size={13} d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/> New PM Plan
          </Button>
        </>}
      />

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:22 }}>
        <StatCard label="Total Moulds"     value={MOCK_MOULDS.length} change="↑ 4 added this month" changeType="up"      icon={STAT_ICONS.box}     accentColor="var(--accent)"  iconBg="var(--accent-glow)" />
        <StatCard label="Active Moulds"    value={active}             change="↑ 82% utilization"    changeType="up"      icon={STAT_ICONS.check}   accentColor="var(--green)"   iconBg="var(--green-bg)" />
        <StatCard label="PM Due This Week" value={pmDue}              change="3 overdue"             changeType="neutral" icon={STAT_ICONS.warning}  accentColor="var(--amber)"   iconBg="var(--amber-bg)" />
        <StatCard label="Critical Cat A"   value={critical}           change="↓ 2 need attention"   changeType="down"    icon={STAT_ICONS.alert}   accentColor="var(--red)"     iconBg="var(--red-bg)" />
        <StatCard label="Avg Shot Life"    value="67%"                change="Fleet average"         changeType="neutral" icon={STAT_ICONS.chart}   accentColor="var(--purple)"  iconBg="var(--purple-bg)" />
        <StatCard label="PM Completed"     value={completed}          change="↑ This month"          changeType="up"      icon={STAT_ICONS.wrench}  accentColor="var(--cyan)"    iconBg="var(--cyan-bg)" />
      </div>

      {/* Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
        <BarChartCard />
        <DonutCard moulds={MOCK_MOULDS} />
      </div>

      {/* Row 3 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
        <RecentMouldsCard moulds={MOCK_MOULDS} />
        <UpcomingPMCard   plans={MOCK_PM_PLANS} />
        <ShotStatusCard   moulds={MOCK_MOULDS} />
      </div>
    </div>
  );
}

function Card({ title, subtitle, action, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{title}</div>
          {subtitle && <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function BarChartCard() {
  const months  = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const planned = [8,10,12,9,11,14,10,8,13,11,12,9];
  const done    = [7,9,10,8,11,12,9,7,11,10,11,8];
  const maxV    = Math.max(...planned);
  return (
    <Card title="Monthly PM Activity" subtitle="Completed vs Planned">
      <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:130 }}>
        {months.map((m,i) => (
          <div key={m+i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
            <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:100, width:'100%' }}>
              <div style={{ flex:1, minWidth:6, borderRadius:'3px 3px 0 0', background:'var(--accent)', height:`${Math.round(done[i]/maxV*95)}%`, opacity:0.9 }}/>
              <div style={{ flex:1, minWidth:6, borderRadius:'3px 3px 0 0', background:'var(--amber)', height:`${Math.round(planned[i]/maxV*95)}%`, opacity:0.4 }}/>
            </div>
            <span style={{ fontSize:9, color:'var(--text3)' }}>{m}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:14, marginTop:10 }}>
        {[['var(--accent)','Completed'],['var(--amber)','Planned']].map(([c,l])=>(
          <span key={l} style={{ fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }}/> {l}
          </span>
        ))}
      </div>
    </Card>
  );
}

function DonutCard({ moulds }) {
  const catA = moulds.filter(m=>m.category==='A').length;
  const catB = moulds.filter(m=>m.category==='B').length;
  const catC = moulds.filter(m=>m.category==='C').length;
  const total = moulds.length;
  const r=38, circ=2*Math.PI*r;
  const dA=(catA/total)*circ, dB=(catB/total)*circ, dC=(catC/total)*circ;
  return (
    <Card title="Category Split" subtitle="Risk classification">
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <svg width="96" height="96" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg4)" strokeWidth="13"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--red)"   strokeWidth="13" strokeDasharray={`${dA} ${circ}`} strokeDashoffset="0"       strokeLinecap="round" transform="rotate(-90 50 50)"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--amber)" strokeWidth="13" strokeDasharray={`${dB} ${circ}`} strokeDashoffset={`${-dA}`} strokeLinecap="round" transform="rotate(-90 50 50)"/>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--green)" strokeWidth="13" strokeDasharray={`${dC} ${circ}`} strokeDashoffset={`${-dA-dB}`} strokeLinecap="round" transform="rotate(-90 50 50)"/>
          <text x="50" y="55" textAnchor="middle" fill="var(--text)" fontSize="16" fontWeight="700" fontFamily="'Bricolage Grotesque',sans-serif">{total}</text>
        </svg>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[['var(--red)','Cat A',catA],['var(--amber)','Cat B',catB],['var(--green)','Cat C',catC]].map(([col,name,val])=>(
            <div key={name} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:col, flexShrink:0 }}/>
              <span style={{ color:'var(--text2)', flex:1 }}>{name}</span>
              <span style={{ fontWeight:600, color:'var(--text)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RecentMouldsCard({ moulds }) {
  const dot = s => s==='Active'?'var(--green)':s==='Critical'?'var(--red)':'var(--amber)';
  return (
    <Card title="Recent Moulds" action={<Button variant="ghost" size="sm">View all →</Button>}>
      {moulds.slice(0,5).map(m => (
        <div key={m.id} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:dot(m.status), marginTop:5, flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{m.code} · {m.name}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
              {m.location} · {formatNumber(m.currentShot)} shots · <CategoryBadge category={m.category}/>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function UpcomingPMCard({ plans }) {
  const col = s => s==='Overdue'?'var(--red)':s==='Completed'?'var(--green)':'var(--accent)';
  return (
    <Card title="Upcoming PM" action={<Button variant="ghost" size="sm">View all →</Button>}>
      {plans.slice(0,5).map(p => (
        <div key={p.id} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:col(p.status), marginTop:5, flexShrink:0 }}/>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{p.reportNo}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
              {p.mould} · <span style={{ color:col(p.status), fontWeight:500 }}>{p.status}</span>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function ShotStatusCard({ moulds }) {
  return (
    <Card title="Shot Life Status">
      {moulds.slice(0,6).map(m => {
        const pct = getShotLifePercent(m);
        const col = getShotLifeColor(pct);
        return (
          <div key={m.id} style={{ marginBottom:11 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12, color:'var(--text2)', fontFamily:"'Geist Mono',monospace" }}>{m.code}</span>
              <span style={{ fontSize:11, fontWeight:600, color:col }}>{pct}%</span>
            </div>
            <div style={{ width:'100%', height:5, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:col, borderRadius:3, transition:'width 0.6s ease' }}/>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
