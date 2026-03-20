import { useState } from 'react';
import { useTheme, ACCENT_PRESETS } from '@/themes/ThemeContext';
import { useUIStore } from '@/store/uiStore';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/common/Button';

const S = ({ d, size=17 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

export default function SettingsPage() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const { showToast } = useUIStore();
  const [refreshInterval, setRefreshInterval] = useState(() => parseInt(localStorage.getItem('erp-refresh')||'30'));
  const [shiftStart, setShiftStart]     = useState(() => localStorage.getItem('erp-shift-start')||'06:00');
  const [dateFormat, setDateFormat]     = useState(() => localStorage.getItem('erp-date-format')||'DD/MM/YYYY');
  const [notifications, setNotifications] = useState({
    pmDue:     JSON.parse(localStorage.getItem('notif-pm-due')     ?? 'true'),
    overdue:   JSON.parse(localStorage.getItem('notif-overdue')    ?? 'true'),
    criticalA: JSON.parse(localStorage.getItem('notif-critical-a') ?? 'false'),
  });

  const handleSave = () => {
    localStorage.setItem('erp-refresh',     refreshInterval);
    localStorage.setItem('erp-shift-start', shiftStart);
    localStorage.setItem('erp-date-format', dateFormat);
    localStorage.setItem('notif-pm-due',    notifications.pmDue);
    localStorage.setItem('notif-overdue',   notifications.overdue);
    localStorage.setItem('notif-critical-a',notifications.criticalA);
    showToast({ type:'success', title:'Settings saved', message:'Your preferences have been updated.' });
  };

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Manage dashboard behaviour and preferences"
        actions={<Button size="sm" onClick={handleSave}><S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/> Save Changes</Button>}
      />

      <div style={{ display:'flex', flexDirection:'column', gap:18, maxWidth:900 }}>

        {/* Display & Theme */}
        <Section icon={<S d={<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>}/>}
          iconColor="var(--accent)" iconBg="var(--accent-glow)"
          title="Display & Theme" subtitle="Appearance and colour preferences">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            <div>
              <FieldLabel>Theme Preference</FieldLabel>
              <div style={{ display:'flex', background:'var(--bg3)', padding:3, borderRadius:9, border:'1px solid var(--border)', gap:3 }}>
                {['dark','light'].map(t => (
                  <button key={t} onClick={() => theme!==t && toggleTheme()} style={{
                    flex:1, padding:'8px 0', borderRadius:7, fontSize:12, fontWeight:500,
                    cursor:'pointer', fontFamily:'inherit', transition:'all var(--trans)',
                    background: theme===t ? 'var(--surface)' : 'transparent',
                    border:     theme===t ? '1px solid var(--border2)' : '1px solid transparent',
                    color:      theme===t ? 'var(--text)' : 'var(--text2)',
                    boxShadow:  theme===t ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                  }}>{t==='dark' ? '🌙  Dark Mode' : '☀️  Light Mode'}</button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Accent Color</FieldLabel>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                {ACCENT_PRESETS.map(p => (
                  <button key={p.value} onClick={() => setAccent(p.value)} title={p.name} style={{
                    display:'flex', alignItems:'center', gap:7,
                    padding:'6px 12px', borderRadius:8,
                    fontSize:12, fontWeight:500, cursor:'pointer',
                    fontFamily:'inherit', transition:'all var(--trans)',
                    background: accent===p.value ? 'var(--accent-glow)' : 'var(--bg3)',
                    border:     accent===p.value ? `1.5px solid ${p.value}` : '1px solid var(--border2)',
                    color:      accent===p.value ? p.value : 'var(--text2)',
                  }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:p.value, flexShrink:0, boxShadow: accent===p.value ? `0 0 6px ${p.value}88` : 'none' }}/>
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:11, color:'var(--text3)' }}>Custom:</span>
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                  style={{ width:28, height:28, borderRadius:7, padding:2, border:'1px solid var(--border2)', background:'var(--bg3)', cursor:'pointer' }}/>
                <span style={{ fontSize:11, color:'var(--text2)', fontFamily:"'Geist Mono',monospace" }}>{accent}</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop:20, padding:'12px 16px', borderRadius:9, background:'var(--bg3)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', flexShrink:0 }}>Preview</span>
            <div style={{ width:1, height:16, background:'var(--border2)' }}/>
            <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:500, background:'var(--accent)', color:'#fff' }}>Primary</span>
            <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:500, background:'var(--accent-glow)', color:'var(--accent)', border:'1px solid var(--accent)' }}>Outline</span>
            <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:500, background:'var(--green-bg)', color:'var(--green)' }}>Active</span>
            <span style={{ padding:'3px 12px', borderRadius:20, fontSize:11, fontWeight:500, background:'var(--red-bg)', color:'var(--red)' }}>Danger</span>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 12px', borderRadius:7, background:'var(--accent-glow)', borderLeft:'2.5px solid var(--accent)' }}>
                <span style={{ fontSize:11, color:'var(--accent)', fontWeight:500 }}>◉ Active nav</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Data & Operations */}
        <Section icon={<S d={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}/>}
          iconColor="var(--green)" iconBg="var(--green-bg)"
          title="Data & Operations" subtitle="Refresh intervals and shift configuration">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div>
              <FieldLabel>Auto-Refresh Interval (seconds)</FieldLabel>
              <input type="number" min={5} max={300} value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} style={ipt}/>
              <p style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>Range: 5–300 s · 0 to disable</p>
            </div>
            <div>
              <FieldLabel>Shift Start Time</FieldLabel>
              <input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} style={ipt}/>
            </div>
            <div>
              <FieldLabel>Date Format</FieldLabel>
              <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={{ ...ipt, appearance:'none', cursor:'pointer', paddingRight:34,
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center' }}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={<S d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>}/>}
          iconColor="var(--amber)" iconBg="var(--amber-bg)"
          title="Notifications" subtitle="Configure alert and warning preferences">
          {[
            { key:'pmDue',     label:'PM Due Alerts',     desc:'Notify when preventive maintenance is due this week' },
            { key:'overdue',   label:'Overdue Warnings',  desc:'Alert when PM plans become overdue' },
            { key:'criticalA', label:'Category A Alerts', desc:'Notify for critical Category A mould events' },
          ].map(({ key,label,desc },i,arr) => (
            <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, padding:'14px 0', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{desc}</div>
              </div>
              <Toggle checked={notifications[key]} onChange={v => setNotifications(n => ({ ...n, [key]:v }))}/>
            </div>
          ))}
        </Section>

        {/* About */}
        <Section icon={<S d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>}
          iconColor="var(--purple)" iconBg="var(--purple-bg)"
          title="About" subtitle="Application and system information">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[['Application','MouldERP'],['Version','v2.1.0'],['Environment','Production'],['Database','PostgreSQL 15'],['API Status','● Online','var(--green)'],['Last Sync','Just now']].map(([label,value,color])=>(
              <div key={label} style={{ padding:'12px 14px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:10, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:500, color:color||'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div style={{ position:'sticky', bottom:0, marginTop:22, display:'flex', justifyContent:'flex-end', gap:10, padding:'14px 0 4px', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
        <Button variant="secondary" onClick={() => window.location.reload()}>Reset to Defaults</Button>
        <Button onClick={handleSave}><S size={13} d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/> Save Changes</Button>
      </div>
    </div>
  );
}

function Section({ icon, iconColor, iconBg, title, subtitle, children }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg2)' }}>
        <div style={{ width:36, height:36, borderRadius:9, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text)', fontFamily:"'Bricolage Grotesque',sans-serif" }}>{title}</div>
          {subtitle && <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding:'18px 20px' }}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <div style={{ fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:7 }}>{children}</div>;
}

function Toggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width:42, height:23, borderRadius:12, flexShrink:0, cursor:'pointer',
      background: checked ? 'var(--accent)' : 'var(--bg4)',
      border:`1px solid ${checked ? 'var(--accent)' : 'var(--border2)'}`,
      position:'relative', transition:'background 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{
        position:'absolute', top:2, left: checked ? 21 : 2,
        width:17, height:17, borderRadius:'50%',
        background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
        transition:'left 0.2s ease',
      }}/>
    </div>
  );
}

const ipt = { width:'100%', padding:'9px 13px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none', transition:'border-color var(--trans),box-shadow var(--trans)' };
