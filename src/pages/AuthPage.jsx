// ─── Vendor Auth Page — Deep blue theme (like reference image) ────────
// Mobile: Full-screen dark navy with purple glow, card slides from bottom
// Desktop: Two-column — left dark blue panel, right form
import { useState, useEffect } from 'react';
import DB from '../utils/db';
import { createTrialSubscription } from '../utils/subscriptionService';
import { LogoMark } from '../components/Logo';
import { enc } from '../utils/constants';

// Deep blue palette
const BG1      = '#00052e';
const BG2      = '#120D2E';
const CARD     = 'rgba(255,255,255,0.05)';
const CARD_D   = '#131830';
const INPUT_BG = 'rgba(95, 95, 95, 0.5)';
const BORDER   = 'rgba(255,255,255,0.12)';
const BORDER_F = 'rgba(25, 0, 150, 0.6)';
const BTN      = 'linear-gradient(135deg,#6B4EFF 0%,#A855F7 100%)';
const BTN_SH   = '0 8px 28px rgba(33, 0, 199, 0.45)';
const WHITE    = '#FFFFFF';
const MUTED    = 'rgba(255, 255, 255, 0.82)';
const ACCENT   = '#2f00bb';
const GREEN    = '#1e6b00';

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const h=()=>setM(window.innerWidth<768); window.addEventListener('resize',h); return ()=>window.removeEventListener('resize',h); },[]);
  return m;
}

function Input({ label, type='text', placeholder, value, onChange, icon, autoFocus, onKeyDown, tip }) {
  const [focused, setFocused] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const isPw   = type === 'password';
  const itype  = isPw ? (showPw ? 'text' : 'password') : type;
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontWeight:500, fontSize:13,
        color:MUTED, marginBottom:8, letterSpacing:.3 }}>{label}</label>}
      <div style={{ position:'relative' }}>
        {icon && <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
          color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', zIndex:1 }}>{icon}</div>}
        <input type={itype} placeholder={placeholder} value={value}
          onChange={onChange} onKeyDown={onKeyDown} autoFocus={autoFocus}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{ width:'100%', padding: icon?'14px 44px 14px 44px':'14px 16px',
            background:INPUT_BG, border:`1.5px solid ${focused?BORDER_F:BORDER}`,
            borderRadius:14, fontSize:15, fontFamily:'DM Sans,sans-serif', color:WHITE,
            outline:'none', transition:'border .2s, box-shadow .2s',
            boxShadow: focused?`0 0 0 3px rgba(107,78,255,0.15)`:'none' }} />
        {isPw && <button onClick={()=>setShowPw(!showPw)} type="button"
          style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
          </svg>
        </button>}
      </div>
      {tip && <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:5 }}>{tip}</p>}
    </div>
  );
}

function PurpleBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:'100%', padding:'16px',
      background: disabled?'rgba(255,255,255,0.08)':BTN, border:'none', borderRadius:50,
      color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:15,
      cursor: disabled?'not-allowed':'pointer', display:'flex', alignItems:'center',
      justifyContent:'center', gap:10, boxShadow: disabled?'none':BTN_SH,
      transition:'all .2s', letterSpacing:.3 }}>
      {children}
    </button>
  );
}

function detectMoMoNetwork(phone) {
  const n = phone.replace(/\D/g,'');
  if (/^(024|054|055|059)/.test(n)) return { name:'MTN MoMo', color:'#FFCC00' };
  if (/^(020|050)/.test(n))         return { name:'Vodafone Cash', color:'#d40000' };
  if (/^(026|056|027|057)/.test(n)) return { name:'AirtelTigo', color:'#f05400' };
  return null;
}

const EmailIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const LockIcon  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UserIcon  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PhoneIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 8.74 19.79 19.79 0 0 1 1.61 2.18 2 2 0 0 1 3.6.01h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

export default function AuthPage({ onLogin, showToast }) {
  const isMobile = useIsMobile();
  const [tab,  setTab]  = useState('login');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email:'', password:'', owner:'', biz:'', momo:'', specialty:'' });
  const [code, setCode] = useState('');
  const [demo, setDemo] = useState('');
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const momoNet = detectMoMoNetwork(form.momo);

  const handleLogin = () => {
    if (!form.email||!form.password) { showToast('Enter email and password','error'); return; }
    const v = DB.findVendorByEmail(form.email.trim().toLowerCase());
    if (v && v.password===enc(form.password)) { onLogin(v); return; }
    showToast('Invalid email or password','error');
  };

  const handleReg1 = () => {
    if (!form.owner||!form.biz||!form.email||!form.momo||!form.password||!form.specialty) { showToast('Please fill all fields','error'); return; }
    if (form.momo.replace(/\D/g,'').length<10) { showToast('Enter a valid 10-digit MoMo number','error'); return; }
    if (DB.findVendorByEmail(form.email)) { showToast('Email already registered','error'); return; }
    const c=DB.genCode(); DB.setVC(form.email,c); setDemo(c); setStep(2);
    showToast('Verification code sent!','success');
  };

  const handleReg2 = () => {
    if (!DB.verifyVC(form.email, code)) { showToast('Invalid or expired code','error'); return; }
    const vendor = { id:DB.genId(), ownerName:form.owner, businessName:form.biz, email:form.email.toLowerCase(),
      momoNumber:form.momo.replace(/\D/g,''), password:enc(form.password), specialty:form.specialty,
      rating:4.5, reviewCount:0, deliveryTime:'20-35', deliveryFee:0, minOrder:10,
      verified:true, active:true, joinDate:new Date().toISOString(), role:'vendor' };
    DB.saveVendor(vendor); createTrialSubscription(vendor.id);
    onLogin(vendor); showToast(`Welcome, ${vendor.businessName}!`,'success');
  };

  // ── Shared hero top section (mobile) ──
  const Hero = ({title, sub}) => (
    <div style={{ position:'relative', background:`linear-gradient(160deg,${BG1} 0%,${BG2} 100%)`,
      paddingTop:'max(56px,env(safe-area-inset-top))', paddingBottom:36,
      display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
      paddingLeft:24, paddingRight:24, overflow:'hidden' }}>
      {/* Purple glow */}
      <div style={{ position:'absolute', top:-20, left:'50%', transform:'translateX(-50%)',
        width:260, height:200, borderRadius:'50%',
        background:'radial-gradient(ellipse, rgba(107,78,255,0.2) 0%, transparent 70%)' }}/>
      <div style={{ marginBottom:20, position:'relative', zIndex:1 }}><LogoMark size={64}/></div>
      {title && <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, color:WHITE, margin:0, zIndex:1, position:'relative' }}>{title}</h1>}
      {sub   && <p  style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:MUTED, marginTop:8, zIndex:1, position:'relative' }}>{sub}</p>}
    </div>
  );

  // ── Mobile card ──
  const Card = ({children}) => (
    <div style={{ background:'#0E1228', borderRadius:'28px 28px 0 0', flex:1, overflowY:'auto', padding:'28px 24px 40px' }}>
      {children}
    </div>
  );

  // ─── MOBILE LOGIN ───
  if (isMobile && tab==='login') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:`linear-gradient(160deg,${BG1},${BG2})` }}>
      <Hero title="Welcome back" sub="Sign in to continue"/>
      <Card>
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e=>upd('email',e.target.value)} icon={<EmailIcon/>} autoFocus/>
        <Input label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={e=>upd('password',e.target.value)} icon={<LockIcon/>} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
        <div style={{ textAlign:'right', marginBottom:20, marginTop:-8 }}>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:ACCENT, fontWeight:500, cursor:'pointer' }}>Forgot password?</span>
        </div>
        <PurpleBtn onClick={handleLogin}>
          Sign in
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </PurpleBtn>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', marginTop:20, fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.8, fontFamily:'DM Sans,sans-serif' }}>
          Demo: ama@demo.com / demo123
        </div>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:14, color:MUTED, marginTop:20 }}>
          New vendor?{' '}<span onClick={()=>setTab('register')} style={{ color:ACCENT, fontWeight:600, cursor:'pointer' }}>Register</span>
        </p>
      </Card>
    </div>
  );

  // ─── MOBILE REGISTER STEP 1 ───
  if (isMobile && tab==='register' && step===1) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:`linear-gradient(160deg,${BG1},${BG2})` }}>
      <Hero title="Register Business" sub="Your MoMo number receives all payments"/>
      <Card>
        <Input label="Owner Name" placeholder="Ama Owusu" value={form.owner} onChange={e=>upd('owner',e.target.value)} icon={<UserIcon/>} autoFocus/>
        <Input label="Business Name" placeholder="Ama's Kitchen" value={form.biz} onChange={e=>upd('biz',e.target.value)}/>
        <Input label="Email" type="email" placeholder="ama@example.com" value={form.email} onChange={e=>upd('email',e.target.value)} icon={<EmailIcon/>}/>
        <Input label="MoMo Number (receiving wallet)" type="tel" placeholder="024 XXX XXXX" value={form.momo}
          onChange={e=>upd('momo',e.target.value)} icon={<PhoneIcon/>}
          tip={momoNet ? `Detected: ${momoNet.name}` : 'Enter your 10-digit MoMo number'}/>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontWeight:500, fontSize:13, color:MUTED, marginBottom:8 }}>Specialty</label>
          <select value={form.specialty} onChange={e=>upd('specialty',e.target.value)}
            style={{ width:'100%', padding:'14px 16px', background:INPUT_BG, border:`1.5px solid ${BORDER}`,
              borderRadius:14, fontSize:15, fontFamily:'DM Sans,sans-serif', color:form.specialty?WHITE:MUTED, outline:'none' }}>
            <option value="">Select your food specialty...</option>
            {['Rice & Stew','Local Ghanaian','Soups & Stew','Snacks & Fast Food','Pizza & Burgers','Chicken & Grills','Drinks & Beverages','Mixed Menu'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Input label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={e=>upd('password',e.target.value)} icon={<LockIcon/>}/>
        <PurpleBtn onClick={handleReg1}>Continue →</PurpleBtn>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:14, color:MUTED, marginTop:16 }}>
          Have an account?{' '}<span onClick={()=>setTab('login')} style={{ color:ACCENT, fontWeight:600, cursor:'pointer' }}>Sign In</span>
        </p>
      </Card>
    </div>
  );

  // ─── MOBILE REGISTER STEP 2 (OTP) ───
  if (isMobile && tab==='register' && step===2) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:`linear-gradient(160deg,${BG1},${BG2})` }}>
      <Hero title="Verify Email" logoSize={56}/>
      <Card>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:14, color:MUTED, marginBottom:6 }}>Code sent to</p>
        <p style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:ACCENT, marginBottom:20 }}>{form.email}</p>
        {demo && <div style={{ background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.25)', borderRadius:12, padding:'12px 16px', marginBottom:20, textAlign:'center' }}>
          <div style={{ fontSize:11, color:MUTED, marginBottom:6, fontFamily:'DM Sans,sans-serif' }}>Demo verification code</div>
          <div style={{ fontFamily:'DM Sans,monospace', fontWeight:800, fontSize:26, letterSpacing:10, color:WHITE }}>{demo}</div>
        </div>}
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:24, maxWidth:320, margin:'0 auto 24px' }}>
          {['','','','','',''].map((_,i)=>(
            <input
              key={i}
              id={`votp-${i}`}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={code[i]||''}
              placeholder="0"
              autoFocus={i===0}
              onChange={e=>{const n=code.split(''); n[i]=e.target.value.replace(/\D/g,'').slice(-1); setCode(n.join('')); if(e.target.value&&i<5)document.getElementById(`votp-${i+1}`)?.focus();}}
              onKeyDown={e=>{if(e.key==='Backspace'&&!code[i]&&i>0)document.getElementById(`votp-${i-1}`)?.focus();}}
              style={{
                width: 'min(44px, calc((100vw - 96px) / 6))',
                height: 52,
                background: INPUT_BG,
                border: `2.5px solid ${code[i] ? 'rgba(107,78,255,0.85)' : 'rgba(255,255,255,0.25)'}`,
                borderRadius:14,
                textAlign:'center',
                fontSize:22,
                fontWeight:800,
                color: code[i] ? WHITE : 'rgba(255,255,255,0.3)',
                outline:'none',
                fontFamily:'DM Sans,monospace',
                caretColor: '#A78BFA',
                boxShadow: code[i] ? '0 0 0 3px rgba(107,78,255,0.2)' : 'none',
                transition:'border-color .15s',
              }}
            />
          ))}
        </div>
        <PurpleBtn onClick={handleReg2}>Verify &amp; Register →</PurpleBtn>
        <button onClick={()=>setStep(1)} style={{ display:'block', margin:'14px auto 0', background:'none', border:'none', color:MUTED, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>← Back</button>
      </Card>
    </div>
  );

  // ─── DESKTOP: Two-column layout ───────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:BG1 }}>
      {/* Left dark panel */}
      <div style={{ background:`linear-gradient(160deg,${BG1},${BG2})`, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:60, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:400, height:300,
          background:'radial-gradient(ellipse, rgba(107,78,255,0.15) 0%, transparent 70%)' }}/>
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:340 }}>
          <div style={{ marginBottom:28, display:'flex', justifyContent:'center' }}><LogoMark size={80}/></div>
          <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:26, color:WHITE, marginBottom:12 }}>Morning Delight<br/>Vendor Portal</h1>
          <p style={{ color:MUTED, lineHeight:1.7, fontSize:14, marginBottom:36 }}>
            Register your MoMo number once — every customer payment goes directly to your wallet automatically.
          </p>
          {[['💳','Automatic payments'],['📊','Order tracking'],['🔔','Real-time alerts'],['📈','Analytics']].map(([i,l])=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <span style={{ fontSize:20 }}>{i}</span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:'rgba(255,255,255,0.6)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ background:CARD_D, display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:`1px solid ${BORDER}`, marginBottom:32 }}>
            {['login','register'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setStep(1);}} style={{ flex:1, padding:'13px 0', border:'none',
                borderBottom:`2.5px solid ${tab===t?ACCENT:'transparent'}`, marginBottom:-1,
                background:'transparent', color:tab===t?WHITE:MUTED, fontFamily:'DM Sans,sans-serif',
                fontWeight:tab===t?700:400, fontSize:14, cursor:'pointer', textTransform:'capitalize', transition:'all .2s' }}>
                {t==='login'?'Sign In':'Register Vendor'}
              </button>
            ))}
          </div>

          {tab==='login' && <>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:WHITE, marginBottom:6 }}>Welcome back</h2>
            <p style={{ color:MUTED, fontSize:13, marginBottom:24 }}>Sign in to your vendor account</p>
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e=>upd('email',e.target.value)} icon={<EmailIcon/>} autoFocus/>
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e=>upd('password',e.target.value)} icon={<LockIcon/>} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            <PurpleBtn onClick={handleLogin}>Sign In →</PurpleBtn>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 14px', marginTop:18, fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.8, fontFamily:'DM Sans,sans-serif' }}>
              Demo: ama@demo.com / demo123 · kofi@demo.com / demo123
            </div>
          </>}

          {tab==='register' && step===1 && <>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:WHITE, marginBottom:6 }}>Register Business</h2>
            <p style={{ color:MUTED, fontSize:13, marginBottom:24 }}>Your MoMo number will receive all customer payments</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Input label="Owner Name" placeholder="Ama Owusu" value={form.owner} onChange={e=>upd('owner',e.target.value)} icon={<UserIcon/>}/>
              <Input label="Business Name" placeholder="Ama's Kitchen" value={form.biz} onChange={e=>upd('biz',e.target.value)}/>
            </div>
            <Input label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={e=>upd('email',e.target.value)} icon={<EmailIcon/>}/>
            <Input label="MoMo Number" type="tel" placeholder="024 XXX XXXX" value={form.momo}
              onChange={e=>upd('momo',e.target.value)} icon={<PhoneIcon/>}
              tip={momoNet?`Detected: ${momoNet.name}`:undefined}/>
            <Input label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={e=>upd('password',e.target.value)} icon={<LockIcon/>}/>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontWeight:500, fontSize:13, color:MUTED, marginBottom:8 }}>Specialty</label>
              <select value={form.specialty} onChange={e=>upd('specialty',e.target.value)}
                style={{ width:'100%', padding:'14px 16px', background:INPUT_BG, border:`1.5px solid ${BORDER}`, borderRadius:14, color:form.specialty?WHITE:MUTED, fontFamily:'DM Sans,sans-serif', fontSize:14, outline:'none' }}>
                <option value="">Select specialty...</option>
                {['Rice & Stew','Local Ghanaian','Soups & Stew','Snacks & Fast Food','Pizza & Burgers','Chicken & Grills','Drinks & Beverages','Mixed Menu'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <PurpleBtn onClick={handleReg1}>Continue →</PurpleBtn>
          </>}

          {tab==='register' && step===2 && <>
            <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:WHITE, marginBottom:6 }}>Verify Email</h2>
            <p style={{ color:MUTED, fontSize:13, marginBottom:8 }}>Code sent to <strong style={{ color:ACCENT }}>{form.email}</strong></p>
            {demo && <div style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, textAlign:'center' }}>
              <div style={{ fontSize:11, color:MUTED, fontFamily:'DM Sans,sans-serif', marginBottom:4 }}>Demo code</div>
              <div style={{ fontFamily:'DM Sans,monospace', fontWeight:800, fontSize:24, letterSpacing:8, color:WHITE }}>{demo}</div>
            </div>}
            <input value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              maxLength={6} placeholder="0  0  0  0  0  0"
              type="tel" inputMode="numeric" autoFocus
              style={{ width:'100%', padding:'16px', background:INPUT_BG,
                border:`1.5px solid ${code ? 'rgba(107,78,255,0.8)' : BORDER}`,
                borderRadius:14, textAlign:'center', fontSize:28, fontWeight:800,
                fontFamily:'DM Sans,monospace', letterSpacing:8,
                color: code ? WHITE : 'rgba(255,255,255,0.3)',
                caretColor:'#A78BFA', outline:'none', marginBottom:20,
                boxShadow: code ? '0 0 0 3px rgba(107,78,255,0.2)' : 'none',
                transition:'border-color .15s',
              }}/>
            <PurpleBtn onClick={handleReg2}>Verify &amp; Register →</PurpleBtn>
            <button onClick={()=>setStep(1)} style={{ display:'block', margin:'14px auto 0', background:'none', border:'none', color:MUTED, fontSize:13, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>← Back</button>
          </>}
        </div>
      </div>
    </div>
  );
}
