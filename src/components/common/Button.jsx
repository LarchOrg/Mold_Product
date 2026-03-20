const V = {
  primary:   { background: 'var(--accent)',   color: '#fff',         border: '1px solid transparent' },
  secondary: { background: 'var(--bg3)',      color: 'var(--text2)', border: '1px solid var(--border2)' },
  ghost:     { background: 'transparent',     color: 'var(--text2)', border: '1px solid transparent' },
  danger:    { background: 'var(--red-bg)',   color: 'var(--red)',   border: '1px solid rgba(239,68,68,0.18)' },
  success:   { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.18)' },
};
const SZ = {
  sm:   { padding: '5px 12px',  fontSize: 12, borderRadius: 7, gap: 5 },
  md:   { padding: '8px 16px',  fontSize: 13, borderRadius: 8, gap: 6 },
  lg:   { padding: '10px 22px', fontSize: 14, borderRadius: 9, gap: 7 },
  icon: { padding: '7px',       fontSize: 14, borderRadius: 7, gap: 0 },
};

export default function Button({ children, variant='primary', size='md', onClick, disabled=false, type='button', style={} }) {
  const v = V[variant] || V.primary;
  const s = SZ[size]   || SZ.md;
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      fontFamily: 'inherit', fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all var(--trans)',
      whiteSpace: 'nowrap', lineHeight: 1,
      ...v, ...s, ...style,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
    >
      {children}
    </button>
  );
}
