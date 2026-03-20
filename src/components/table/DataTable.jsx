import { useState, useMemo } from 'react';

export default function DataTable({ columns, data, pageSize=15, searchKeys=[], toolbar, emptyMessage='No records found' }) {
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage]       = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(r => searchKeys.some(k => String(r[k]??'').toLowerCase().includes(q)));
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a,b) => {
      const av=a[sortKey]??'', bv=b[sortKey]??'';
      const c = typeof av==='number' ? av-bv : String(av).localeCompare(String(bv));
      return sortDir==='asc' ? c : -c;
    });
  }, [filtered, sortKey, sortDir]);

  const total      = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total/pageSize));
  const sp         = Math.min(page, totalPages);
  const slice      = sorted.slice((sp-1)*pageSize, sp*pageSize);

  const handleSort = k => {
    if (sortKey===k) setSortDir(d => d==='asc'?'desc':'asc');
    else { setSortKey(k); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display:'flex', alignItems:'center', gap:10, padding:'12px 16px',
        borderBottom:'1px solid var(--border)', background:'var(--bg2)', flexWrap:'wrap',
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap:7,
          background:'var(--bg3)', border:'1px solid var(--border)',
          borderRadius:8, padding:'0 10px', height:34, flex:1, maxWidth:260,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color:'var(--text3)', flexShrink:0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Search..." style={{ flex:1, background:'none', border:'none', color:'var(--text)', fontSize:13, outline:'none', fontFamily:'inherit' }}/>
          {search && <button onClick={()=>{setSearch('');setPage(1);}} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:13, lineHeight:1 }}>✕</button>}
        </div>
        {toolbar}
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={col.sortable!==false ? ()=>handleSort(col.key) : undefined}
                  style={{
                    textAlign: col.align||'left', padding:'9px 14px',
                    fontSize:10, fontWeight:700, letterSpacing:'0.7px',
                    textTransform:'uppercase', color:'var(--text3)',
                    borderBottom:'1px solid var(--border)',
                    background:'var(--bg2)', whiteSpace:'nowrap',
                    cursor: col.sortable!==false ? 'pointer' : 'default',
                    userSelect:'none',
                  }}>
                  {col.label}
                  {col.sortable!==false && (
                    <span style={{ marginLeft:4, opacity: sortKey===col.key ? 1 : 0.25, color: sortKey===col.key ? 'var(--accent)' : undefined }}>
                      {sortKey===col.key ? (sortDir==='asc'?'↑':'↓') : '↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length===0 ? (
              <tr><td colSpan={columns.length}>
                <div style={{ textAlign:'center', padding:'52px 24px', color:'var(--text3)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.3, marginBottom:12 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text2)' }}>{emptyMessage}</div>
                </div>
              </td></tr>
            ) : slice.map((row,ri) => (
              <tr key={row.id??ri}
                style={{ transition:'background var(--trans)', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background=''}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding:'10px 14px', fontSize:13,
                    color: col.primary ? 'var(--text)' : 'var(--text2)',
                    fontWeight: col.primary ? 500 : 400,
                    borderBottom:'1px solid var(--border)',
                    textAlign: col.align||'left', whiteSpace:'nowrap',
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 16px', borderTop:'1px solid var(--border)',
        background:'var(--bg2)', flexWrap:'wrap', gap:10,
      }}>
        <span style={{ fontSize:12, color:'var(--text3)' }}>
          {total===0 ? '0 records' : `${(sp-1)*pageSize+1}–${Math.min(sp*pageSize,total)} of ${total}`}
        </span>
        <div style={{ display:'flex', gap:4 }}>
          <PBtn onClick={()=>setPage(p=>p-1)} disabled={sp<=1}>‹</PBtn>
          {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
            <PBtn key={p} onClick={()=>setPage(p)} active={p===sp}>{p}</PBtn>
          ))}
          <PBtn onClick={()=>setPage(p=>p+1)} disabled={sp>=totalPages}>›</PBtn>
        </div>
      </div>
    </div>
  );
}

function PBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:30, height:30, borderRadius:7,
      border:`1px solid ${active?'var(--accent)':'var(--border)'}`,
      background: active?'var(--accent)':'var(--bg3)',
      color: active?'#fff':'var(--text2)',
      fontSize:12, cursor:disabled?'not-allowed':'pointer',
      opacity:disabled?0.35:1,
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all var(--trans)', fontFamily:'inherit',
    }}>{children}</button>
  );
}
