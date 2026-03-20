import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const maxW = { sm:480, md:620, lg:840, xl:1020 }[size] || 620;

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div className="animate-scale-in" style={{
        background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: 16, width: '100%', maxWidth: maxW, maxHeight: '90vh',
        overflowY: 'auto', position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0,
          background: 'var(--surface2)', zIndex: 1,
        }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background var(--trans)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            padding: '14px 22px 18px', borderTop: '1px solid var(--border)',
            position: 'sticky', bottom: 0,
            background: 'var(--surface2)',
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
