export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      marginBottom: 24, display:'flex', alignItems:'center',
      justifyContent:'space-between', gap:16, flexWrap:'wrap',
      paddingBottom: 18, borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:20, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px' }}>
          {title}
        </h1>
        {subtitle && <p style={{ color:'var(--text3)', fontSize:12, marginTop:2 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>{actions}</div>}
    </div>
  );
}
