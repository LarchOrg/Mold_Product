import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { useNavigate }  from 'react-router-dom';
import { useUIStore }   from '@/store/uiStore';

const ROLES = ['Admin','Supervisor','Operator'];
const S = ({ d, size=16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;

export default function LoginPage() {
  const [role, setRole] = useState('Admin');
  const [showPw, setShowPw] = useState(false);
  const { login }     = useAuthStore();
  const { showToast } = useUIStore();
  const navigate      = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email:'admin@factory.com', password:'password' },
  });

  const onSubmit = async ({ email, password }) => {
    if (email==='admin@factory.com' && password==='password') {
      login({ token:'mock-jwt-token', user:{ id:1, name:`${role} User`, email, role } });
      showToast({ type:'success', title:'Welcome back!', message:`Signed in as ${role}` });
      navigate('/dashboard');
    } else {
      showToast({ type:'error', title:'Login failed', message:'Invalid credentials.' });
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)',
      backgroundImage:`radial-gradient(ellipse 70% 60% at 70% 10%, rgba(79,143,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 90%, rgba(167,139,250,0.05) 0%, transparent 60%)`,
      padding:20,
    }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <S size={17} d={<><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
            </>}/>
          </div>
          <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>
            Mould<span style={{ color:'var(--accent)' }}>ERP</span>
          </span>
        </div>

        <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:26, fontWeight:700, marginBottom:4, letterSpacing:'-0.4px' }}>
          Welcome back
        </h1>
        <p style={{ color:'var(--text2)', fontSize:13, marginBottom:28 }}>Industrial Mould Management System</p>

        {/* Role selector */}
        <div style={{ display:'flex', background:'var(--bg3)', padding:4, borderRadius:10, border:'1px solid var(--border)', marginBottom:26 }}>
          {ROLES.map(r => (
            <button key={r} type="button" onClick={() => setRole(r)} style={{
              flex:1, padding:'8px 0', borderRadius:7, fontSize:12, fontWeight:500,
              cursor:'pointer', transition:'all var(--trans)', fontFamily:'inherit',
              background: role===r ? 'var(--surface)' : 'transparent',
              border:     role===r ? '1px solid var(--border2)' : '1px solid transparent',
              color:      role===r ? 'var(--text)' : 'var(--text2)',
              boxShadow:  role===r ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
            }}>{r}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Email</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', display:'flex' }}>
                <S size={14} d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>
              </span>
              <input {...register('email',{required:'Email is required'})} type="email" placeholder="admin@factory.com" style={{ ...ipt, paddingLeft:36 }}/>
            </div>
            {errors.email && <p style={err}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom:26 }}>
            <label style={lbl}>Password</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', display:'flex' }}>
                <S size={14} d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>
              </span>
              <input {...register('password',{required:'Password is required'})} type={showPw?'text':'password'} placeholder="••••••••" style={{ ...ipt, paddingLeft:36, paddingRight:40 }}/>
              <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', display:'flex' }}>
                <S size={14} d={showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                }/>
              </button>
            </div>
            {errors.password && <p style={err}>{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} style={{
            width:'100%', padding:13, borderRadius:9,
            background:'var(--accent)', color:'#fff',
            fontSize:14, fontWeight:600, fontFamily:'inherit',
            cursor:isSubmitting?'wait':'pointer', border:'none',
            transition:'all var(--trans)', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
            onMouseEnter={e => e.currentTarget.style.filter='brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter='none'}
          >
            {isSubmitting ? 'Signing in...' : <><S size={14} d={<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>}/> Sign In</>}
          </button>
        </form>

        <div style={{ marginTop:22, padding:'12px 16px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:9 }}>
          <p style={{ fontSize:10, color:'var(--text3)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>Demo Credentials</p>
          <p style={{ fontSize:12, color:'var(--text2)' }}>
            <span style={{ fontFamily:"'Geist Mono',monospace", color:'var(--text)' }}>admin@factory.com</span>
            {' / '}
            <span style={{ fontFamily:"'Geist Mono',monospace", color:'var(--text)' }}>password</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const lbl = { display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 };
const ipt = { width:'100%', padding:'10px 13px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, color:'var(--text)', fontSize:13, fontFamily:'inherit', outline:'none', transition:'border-color var(--trans),box-shadow var(--trans)' };
const err = { fontSize:11, color:'var(--red)', marginTop:4 };
