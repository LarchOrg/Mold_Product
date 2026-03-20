export default function FormField({ label, required, error, children, full=false }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
      {label && (
        <label style={{ display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>
          {label}{required && <span style={{ color:'var(--red)', marginLeft:2 }}>*</span>}
        </label>
      )}
      {children}
      {error && <p style={{ fontSize:11, color:'var(--red)', marginTop:4 }}>{error}</p>}
    </div>
  );
}

export const inputStyle = {
  width:'100%', padding:'9px 13px',
  background:'var(--bg3)', border:'1px solid var(--border2)',
  borderRadius:'var(--radius)', color:'var(--text)', fontSize:13,
  fontFamily:'inherit', outline:'none',
  transition:'border-color var(--trans), box-shadow var(--trans)',
};
