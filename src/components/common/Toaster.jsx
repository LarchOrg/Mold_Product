import { useUIStore } from '@/store/uiStore';

const CFG = {
  success: { border:'rgba(34,197,94,0.3)',  color:'var(--green)', bg:'var(--green-bg)',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
  error:   { border:'rgba(239,68,68,0.3)',  color:'var(--red)',   bg:'var(--red-bg)',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
  info:    { border:'rgba(79,143,255,0.3)', color:'var(--accent)',bg:'var(--accent-glow)',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  warning: { border:'rgba(245,158,11,0.3)', color:'var(--amber)', bg:'var(--amber-bg)',
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
};

function Toast({ id, type, title, message }) {
  const removeToast = useUIStore(s => s.removeToast);
  const c = CFG[type] || CFG.info;
  return (
    <div className="animate-slide-up" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: 'var(--surface2)',
      border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.color}`,
      borderRadius: 10, padding: '12px 14px',
      minWidth: 280, maxWidth: 360, marginBottom: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
        background: c.bg, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{c.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{title}</div>
        {message && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, lineHeight: 1.4 }}>{message}</div>}
      </div>
      <button onClick={() => removeToast(id)} style={{
        background: 'none', border: 'none', color: 'var(--text3)',
        cursor: 'pointer', fontSize: 13, padding: 2, flexShrink: 0,
        lineHeight: 1,
      }}>✕</button>
    </div>
  );
}

export function Toaster() {
  const toasts = useUIStore(s => s.toasts);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column-reverse' }}>
      {toasts.map(t => <Toast key={t.id} {...t}/>)}
    </div>
  );
}
