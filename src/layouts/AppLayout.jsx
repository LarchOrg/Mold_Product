import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Topbar  from '@/components/layout/Topbar';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <Topbar />
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main style={{ flex:1, overflowY:'auto', background:'var(--bg)', transition:'all 0.22s ease' }}>
          <div style={{ padding:'24px 28px', maxWidth:1600, margin:'0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
