import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore }   from '@/store/uiStore';
import { useTheme, ACCENT_PRESETS } from '@/themes/ThemeContext';
import logoLight from "../../assets/favicon.ico";
import logoDark from "../../assets/ERPIcon_White.png";

/* tiny svg helper */
const S = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export default function Topbar() {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { user, logout }          = useAuthStore();
  const { showToast }             = useUIStore();
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user ? user.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U';

  const closeAll = () => { setMenuOpen(false); setThemeOpen(false); };

  return (
    <>
      <header style={{
        height: 'var(--topbar-h)', display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        position: 'relative', zIndex: 100, flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          width: 'var(--sidebar-w)', flexShrink: 0, paddingLeft: 2,
        }}>
          <div style={{
  width: 32,
  height: 32,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
  background: theme === 'dark' ? 'transparent' : 'var(--bg3)',
}}>
  <img
    src={theme === 'dark' ? logoDark : logoLight}
    alt="Company Logo"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    }}
  />
</div>
          <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '-0.2px' }}>
            Larch <span style={{ color: 'var(--accent)' }}>Mold</span>
          </span>
        </div>

        {/* Search */}
        {/* <div style={{
          flex: 1, maxWidth: 320, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '0 12px', height: 34,
        }}>
          <S size={13} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />
          <input placeholder="Search moulds, plans..." style={{
            flex: 1, background: 'none', border: 'none', color: 'var(--text)',
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}/>
          <kbd style={{
            fontSize: 10, color: 'var(--text3)', background: 'var(--bg4)',
            border: '1px solid var(--border2)', borderRadius: 4,
            padding: '1px 5px', fontFamily: 'inherit',
          }}>⌘K</kbd>
        </div> */}

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Theme picker */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setThemeOpen(o => !o); setMenuOpen(false); }} style={iconBtnStyle} title="Theme">
              {theme === 'dark'
                ? <S d={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>}/>
                : <S d={<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>  </>}/>
              }
            </button>

            {themeOpen && (
              <div className="animate-scale-in" style={{
                position: 'absolute', top: 40, right: 0, zIndex: 300,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 14, padding: 16, width: 240,
                boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Appearance</p>
                <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 3, gap: 3, marginBottom: 16 }}>
                  {['dark','light'].map(t => (
                    <button key={t} onClick={() => theme !== t && toggleTheme()} style={{
                      flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all var(--trans)',
                      background: theme === t ? 'var(--surface)' : 'transparent',
                      border: theme === t ? '1px solid var(--border2)' : '1px solid transparent',
                      color: theme === t ? 'var(--text)' : 'var(--text2)',
                      boxShadow: theme === t ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
                    }}>{t === 'dark' ? '🌙 Dark' : '☀️ Light'}</button>
                  ))}
                </div>

                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Accent</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ACCENT_PRESETS.map(p => (
                    <div key={p.value} onClick={() => setAccent(p.value)} title={p.name} style={{
                      width: 26, height: 26, borderRadius: '50%', background: p.value,
                      cursor: 'pointer', flexShrink: 0,
                      boxShadow: accent === p.value ? `0 0 0 2px var(--bg2), 0 0 0 4px ${p.value}` : 'none',
                      transform: accent === p.value ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform var(--trans), box-shadow var(--trans)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {accent === p.value && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                    style={{ width: 28, height: 28, borderRadius: 6, padding: 2, border: '1px solid var(--border2)', background: 'var(--bg3)', cursor: 'pointer' }}/>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'Geist Mono',monospace" }}>{accent}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button onClick={() => { showToast({ type:'info', title:'Notifications', message:'3 PM schedules due this week.' }); closeAll(); }}
            style={{ ...iconBtnStyle, position: 'relative' }}>
            <S d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>}/>
            <span style={{
              position: 'absolute', top: -3, right: -3,
              width: 15, height: 15, borderRadius: '50%',
              background: 'var(--red)', color: '#fff', fontSize: 8, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--bg2)',
            }}>3</span>
          </button>

          <div style={{ width: 1, height: 20, background: 'var(--border2)' }}/>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setMenuOpen(o => !o); setThemeOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 8px 4px 4px', borderRadius: 8, border: '1px solid var(--border)',
              background: menuOpen ? 'var(--bg3)' : 'transparent', cursor: 'pointer',
              transition: 'background var(--trans)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, var(--accent), var(--purple))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{initials}</div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{user?.name?.split(' ')[0]}</span>
                <span style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.2 }}>{user?.role}</span>
              </div>
              <S size={12} d={<polyline points="6 9 12 15 18 9"/>}/>
            </button>

            {menuOpen && (
              <div className="animate-scale-in" style={{
                position: 'absolute', top: 44, right: 0, zIndex: 300,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 12, padding: 8, minWidth: 200,
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}>
                <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.role} · {user?.email}</div>
                </div>
                {[
                  [<S d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>, 'Profile'],
                  [<S d={<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>}/>, 'Settings'],
                ].map(([icon, label]) => (
                  <div key={label} style={menuRowStyle} onClick={closeAll}>{icon} {label}</div>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }}/>
                <div style={{ ...menuRowStyle, color: 'var(--red)' }} onClick={handleLogout}>
                  <S d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>}/> Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {(menuOpen || themeOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={closeAll}/>
      )}
    </>
  );
}

const iconBtnStyle = {
  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg3)', color: 'var(--text2)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background var(--trans)',
};
const menuRowStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '7px 12px', borderRadius: 8,
  color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
  transition: 'background var(--trans)',
};
