export default function StatCard({ label, value, change, changeType='neutral', icon, accentColor='var(--accent)', iconBg='var(--accent-glow)' }) {
  const cc = { up:'var(--green)', down:'var(--red)', neutral:'var(--text3)' };
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden',
      transition: 'border-color var(--trans), transform var(--trans), box-shadow var(--trans)',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor }}/>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>{label}</div>
          <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 8, color: 'var(--text)' }}>{value}</div>
          {change && <div style={{ fontSize: 11, color: cc[changeType] }}>{change}</div>}
        </div>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: iconBg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor,
          }}>{icon}</div>
        )}
      </div>
    </div>
  );
}
