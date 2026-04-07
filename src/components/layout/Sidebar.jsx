import { useState } from 'react';
import { NavLink } from 'react-router-dom';

/* ── Icons ───────────────────────────────────────────────────────────── */
const I = ({ d, size = 16, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const Icons = {
  Grid:      <I d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}/>,
  Box:       <I d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}/>,
  Clipboard: <I d={<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>}/>,
  Calendar:  <I d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}/>,
  Check:     <I d={<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>}/>,
  BarChart:  <I d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}/>,
  Clock:     <I d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>,
  Users:     <I d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}/>,
  FileText: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>}/>,
  Settings:  <I d={<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>}/>,
};

const NAV = [
  { section: 'Overview',     items: [{ to: '/dashboard', icon: 'Grid',      label: 'Dashboard' }] },
  { section: 'Masters',      items: [
    { to: '/moulds',          icon: 'Box',       label: 'Mould Master' },
    { to: '/spec-entry',      icon: 'Clipboard', label: 'PM Spec Entry' },
  ]},
  { section: 'Transactions', items: [
    { to: '/pm-plans',        icon: 'Calendar',  label: 'Prevention Plan', badge: '3' },
    { to: '/checksheet',      icon: 'Check',     label: 'PM Checksheet Entry' },
    { to: '/daily-checksheet', icon: 'Check', label: 'Daily Checksheet Entry' },
  ]},
  { section: 'Reports',      items: [
    { to: '/reports/life',        icon: 'BarChart', label: 'Mould Life Report' },
    { to: '/reports/pm-history',  icon: 'Clock',    label: 'PM Report' },
     { to: '/reports/mould-history', icon: 'FileText', label: 'Mould History' }, 
     { to: '/reports/dailyreport', icon: 'FileText', label: 'Daily Report' }, 
  ]},
  { section: 'System',       items: [
    { to: '/users',           icon: 'Users',    label: 'Users' },
    { to: '/settings',        icon: 'Settings', label: 'Settings' },
  ]},
];

export default function Sidebar({ collapsed, onToggle }) {
  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(NAV.map(n => [n.section, true]))
  );

  return (
    <aside style={{
      width: collapsed ? 56 : 'var(--sidebar-w)',
      flexShrink: 0,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', overflowX: 'hidden',
      transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
    }}>

      {/* Header row with hamburger */}
      <div style={{
        height: 'var(--topbar-h)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? 0 : '0 12px 0 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <span style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--text3)',
          }}>
            Menu
          </span>
        )}
        <button onClick={onToggle} style={{
          width: 32, height: 32, borderRadius: 8, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 5,
          color: 'var(--text3)', transition: 'background var(--trans), color var(--trans)',
          flexShrink: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; e.currentTarget.style.color = 'var(--text2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}
        >
          <span style={{ width: 15, height: 1.5, background: 'currentColor', borderRadius: 2, display: 'block', transition: 'width var(--trans)' }}/>
          <span style={{ width: collapsed ? 10 : 15, height: 1.5, background: 'currentColor', borderRadius: 2, display: 'block', transition: 'width var(--trans)' }}/>
          <span style={{ width: 15, height: 1.5, background: 'currentColor', borderRadius: 2, display: 'block', transition: 'width var(--trans)' }}/>
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '8px 0', flex: 1 }}>
        {NAV.map(({ section, items }) => {
          const isOpen = openSections[section];
          return (
            <div key={section} style={{ marginBottom: 2 }}>
              {/* Section label / toggle */}
              {!collapsed && (
                <button onClick={() => setOpenSections(p => ({ ...p, [section]: !p[section] }))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 14px 3px 16px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: 'var(--text3)',
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.9px', textTransform: 'uppercase' }}>
                    {section}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              )}

              {/* Items */}
              <div style={{
                overflow: 'hidden',
                maxHeight: (!collapsed && !isOpen) ? 0 : 400,
                transition: 'max-height 0.22s ease',
              }}>
                {items.map(({ to, icon, label, badge }) => (
                  <NavLink key={to} to={to} title={collapsed ? label : undefined}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      padding: collapsed ? '11px 0' : '8px 14px 8px 16px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      textDecoration: 'none', position: 'relative',
                      transition: 'background var(--trans)',
                      background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                      marginBottom: 1,
                    })}
                    onMouseEnter={e => { if (!e.currentTarget.style.background.includes('accent')) e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                  >
                    {({ isActive }) => (<>
                      {/* active bar */}
                      <div style={{
                        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 2.5, borderRadius: '0 3px 3px 0',
                        height: isActive ? 22 : 0,
                        background: 'var(--accent)',
                        transition: 'height 0.18s ease',
                      }}/>
                      {/* icon */}
                      <span style={{
                        width: 18, height: 18, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isActive ? 'var(--accent)' : 'var(--sidebar-text)',
                        transition: 'color var(--trans)',
                      }}>
                        {Icons[icon]}
                      </span>
                      {/* label */}
                      {!collapsed && (
                        <>
                          <span style={{
                            flex: 1, fontSize: 13,
                            color: isActive ? 'var(--text)' : 'var(--text2)',
                            fontWeight: isActive ? 500 : 400,
                            transition: 'color var(--trans)',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                          }}>{label}</span>
                          {badge && (
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              padding: '1px 6px', borderRadius: 20,
                              background: 'var(--red-bg)', color: 'var(--red)',
                              border: '1px solid rgba(239,68,68,0.15)',
                              flexShrink: 0,
                            }}>{badge}</span>
                          )}
                        </>
                      )}
                    </>)}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
