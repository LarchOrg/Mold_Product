const STATUS_MAP = {
  Active:      { bg:'var(--green-bg)',  color:'var(--green)',  dot:'var(--green)' },
  Completed:   { bg:'var(--green-bg)',  color:'var(--green)',  dot:'var(--green)' },
  Pass:        { bg:'var(--green-bg)',  color:'var(--green)',  dot:'var(--green)' },
  Maintenance: { bg:'var(--amber-bg)',  color:'var(--amber)',  dot:'var(--amber)' },
  Pending:     { bg:'var(--amber-bg)',  color:'var(--amber)',  dot:'var(--amber)' },
  Critical:    { bg:'var(--red-bg)',    color:'var(--red)',    dot:'var(--red)' },
  Overdue:     { bg:'var(--red-bg)',    color:'var(--red)',    dot:'var(--red)' },
  Fail:        { bg:'var(--red-bg)',    color:'var(--red)',    dot:'var(--red)' },
  Idle:        { bg:'var(--bg4)',       color:'var(--text3)',  dot:'var(--text3)' },
  Inactive:    { bg:'var(--bg4)',       color:'var(--text3)',  dot:'var(--text3)' },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.Idle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }}/>
      {status}
    </span>
  );
}

const CAT_MAP = {
  A: { bg:'var(--red-bg)',   color:'var(--red)' },
  B: { bg:'var(--amber-bg)', color:'var(--amber)' },
  C: { bg:'var(--green-bg)', color:'var(--green)' },
};

export function CategoryBadge({ category }) {
  const s = CAT_MAP[category] || CAT_MAP.C;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
      fontSize: 11, fontWeight: 600, background: s.bg, color: s.color,
      fontFamily: "'Geist Mono',monospace",
    }}>{category}</span>
  );
}

export function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 5,
      fontSize: 11, fontWeight: 500,
      background: 'var(--accent-glow)', color: 'var(--accent)',
      border: '1px solid rgba(79,143,255,0.15)',
    }}>{children}</span>
  );
}
