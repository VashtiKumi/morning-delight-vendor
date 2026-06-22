// ─── Morning Delight — Vendor App Root ────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import useToast from './hooks/useToast';
import DB from './utils/db';
import { enc } from './utils/constants';
import SoundService from './utils/soundService';
import { getVendorStatus, ALERT_DAYS, COLLECTION_MOMO } from './utils/subscriptionService';

import Toasts        from './components/Toasts';
import Loader        from './components/Loader';
import Sidebar       from './components/Sidebar';
import AuthPage      from './pages/AuthPage';
import OverviewPage  from './pages/OverviewPage';
import OrdersPage    from './pages/OrdersPage';
import PreordersPage from './pages/PreordersPage';
import MenuPage      from './pages/MenuPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BillingPage   from './pages/BillingPage';
import ProfilePage   from './pages/ProfilePage';

import './styles/global.css';

if (!DB.getAdmin()?.email) {
  DB.saveAdmin({ email:'admin@morningdelight.com', password:enc('Admin@2024'), name:'System Admin' });
}

// ── New order alert overlay ───────────────────────────────────────────
function NewOrderAlert({ orders, onDismiss }) {
  if (!orders.length) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
      <div style={{ background:'white', borderRadius:24, padding:'32px 28px', maxWidth:380, width:'90%', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,.3)', animation:'bounceIn .4s ease' }}>
        <div style={{ fontSize:60, marginBottom:16, animation:'pop .6s ease-in-out infinite' }}>🔔</div>
        <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:'#0F0F0F', marginBottom:8 }}>
          New Order{orders.length>1?`s (${orders.length})`:''}!
        </h2>
        {orders.slice(0,3).map(o => {
          const c = DB.getCustomerById(o.customerId);
          return (
            <div key={o.id} style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:14, padding:'12px 16px', marginBottom:10, textAlign:'left' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>#{o.id.slice(0,8).toUpperCase()} — {c?.name||'Customer'}</div>
              <div style={{ fontSize:12, color:'#6B7280', marginBottom:6 }}>{o.items?.map(i=>`${i.qty}× ${i.name}`).join(', ')}</div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, color:'#ec3f00' }}>GH₵{parseFloat(o.total||0).toFixed(2)}</div>
            </div>
          );
        })}
        <button onClick={onDismiss} style={{ width:'100%', padding:'15px', background:'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:50, color:'white', fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, cursor:'pointer', marginTop:8 }}>
          View Orders →
        </button>
      </div>
      <style>{`
        @keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
        @keyframes bounceIn{0%{transform:scale(.3);opacity:0}55%{transform:scale(1.08)}80%{transform:scale(.97)}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}

// ── Subscription alert banner (shown when ≤ 5 days to trial end / overdue) ──
function SubAlert({ vendor, onGoToBilling }) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (vendor) setInfo(getVendorStatus(vendor.id));
  }, [vendor?.id]);

  if (!info?.alertDue) return null;

  const isOverdue = info.status === 'overdue';
  const isTrial   = info.status === 'trial';

  return (
    <div style={{ background:isOverdue?'#FEF2F2':'#FFFBEB', borderBottom:`2px solid ${isOverdue?'#FECACA':'#FDE68A'}`, padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>{isOverdue?'🔴':'⚠️'}</span>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:isOverdue?'#f00000':'#92400E' }}>
            {isOverdue
              ? `Commission Overdue — GH₵${info.totalOwed?.toFixed(2)} outstanding`
              : isTrial
                ? `Trial ends in ${info.daysLeft} day${info.daysLeft!==1?'s':''}!`
                : `Commission due in ${info.daysUntilDue} day${info.daysUntilDue!==1?'s':''}!`
            }
          </div>
          <div style={{ fontSize:11, color:isOverdue?'#ec0000':'#92400E', opacity:.75 }}>
            {isOverdue
              ? `Pay to MoMo ${COLLECTION_MOMO} to restore full access`
              : `After trial: 10% commission on deliveries, due every 2 weeks. Pay to ${COLLECTION_MOMO}`
            }
          </div>
        </div>
      </div>
      <button onClick={onGoToBilling} style={{ padding:'7px 16px', background:isOverdue?'#be0000':'#eb9500', border:'none', borderRadius:20, color:'white', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer', flexShrink:0 }}>
        Go to Billing →
      </button>
    </div>
  );
}

export default function App() {
  const [screen,    setScreen]   = useState('loader');
  const [vendor,    setVendor]   = useState(null);
  const [section,   setSection]  = useState('overview');
  const [newOrders, setNewOrders] = useState([]);
  const [menuOpen,   setMenuOpen]  = useState(false);
  const [isMobile,   setIsMobile]  = useState(window.innerWidth < 1024);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const { toasts, showToast } = useToast();

  const knownOrderIds = useRef(new Set());

  useEffect(() => {
    const unlock = () => { SoundService.unlock(); document.removeEventListener('click', unlock); };
    document.addEventListener('click', unlock);
    return () => document.removeEventListener('click', unlock);
  }, []);

  // Session restore
  useEffect(() => {
    const t = setTimeout(() => {
      const sess = DB.getSession('vendor');
      if (sess?.id) {
        const v = DB.findVendorByEmail(sess.email);
        if (v) { setVendor(v); setScreen('dashboard'); return; }
      }
      setScreen('auth');
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // New order polling (every 2s)
  useEffect(() => {
    if (!vendor || screen !== 'dashboard') return;
    DB.getOrdersByVendor(vendor.id).forEach(o => knownOrderIds.current.add(o.id));

    const poll = setInterval(() => {
      const orders   = DB.getOrdersByVendor(vendor.id);
      const brandNew = orders.filter(o => !knownOrderIds.current.has(o.id) && o.status === 'pending');
      if (brandNew.length > 0) {
        brandNew.forEach(o => knownOrderIds.current.add(o.id));
        SoundService.newOrder();
        setNewOrders(brandNew);
        if ('Notification' in window && Notification.permission === 'granted') {
          const o = brandNew[0];
          const c = DB.getCustomerById(o.customerId);
          new Notification('New Order! 🔔', {
            body: `${c?.name||'Customer'} — GH₵${parseFloat(o.total||0).toFixed(2)}`,
          });
        }
        showToast(`🔔 ${brandNew.length} new order${brandNew.length>1?'s':''}!`, 'success');
      }
      orders.forEach(o => knownOrderIds.current.add(o.id));
    }, 2000);

    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    return () => clearInterval(poll);
  }, [vendor, screen]);

  const handleLogin  = (v) => { setVendor(v); DB.saveSession('vendor',{id:v.id,email:v.email}); setScreen('dashboard'); };
  const handleLogout = () => { DB.clearSession('vendor'); setVendor(null); setScreen('auth'); };

  if (screen === 'loader') return <><Loader /><Toasts toasts={toasts} /></>;
  if (screen === 'auth')   return <><AuthPage onLogin={handleLogin} showToast={showToast} /><Toasts toasts={toasts} /></>;

  return (
    <>
      {newOrders.length > 0 && (
        <NewOrderAlert orders={newOrders} onDismiss={()=>{setNewOrders([]);setSection('orders');}} />
      )}
      <div style={{ display:'flex', minHeight:'100vh', background:'#f3f4f0' }}>
        {/* Desktop sidebar — hidden on mobile */}
        {!isMobile && <Sidebar section={section} setSection={setSection} vendor={vendor} onLogout={handleLogout} />}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Mobile top bar */}
          {isMobile && (
            <div style={{ background:'#000838', padding:'max(44px,env(safe-area-inset-top)) 16px 12px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:200 }}>
              <button onClick={()=>setMenuOpen(true)} style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.6)', letterSpacing:2, textTransform:'uppercase', lineHeight:1 }}>Morning</div>
                <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, color:'white', lineHeight:1.1 }}>Delight</div>
              </div>
              <div style={{ marginLeft:'auto', fontFamily:'DM Sans,sans-serif', fontSize:12, color:'rgba(255,255,255,0.6)' }}>{vendor?.businessName}</div>
            </div>
          )}
          {/* Mobile drawer overlay */}
          {isMobile && menuOpen && (
            <div style={{ position:'fixed', inset:0, zIndex:1000 }}>
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)' }} onClick={()=>setMenuOpen(false)}/>
              <div style={{ position:'absolute', top:0, left:0, bottom:0, width:280, background:'#000838', padding:'max(56px,env(safe-area-inset-top)) 0 0', overflowY:'auto', animation:'slideRight .28s cubic-bezier(.34,1.2,.64,1)' }}>
                <Sidebar section={section} setSection={(s)=>{setSection(s);setMenuOpen(false);}} vendor={vendor} onLogout={handleLogout} />
              </div>
              <style>{`@keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
            </div>
          )}
          {/* Subscription alert banner */}
          <SubAlert vendor={vendor} onGoToBilling={()=>setSection('billing')} />
          {/* Main page */}
          <main style={{ flex:1, overflow:'auto', maxHeight: isMobile ? 'calc(100vh - 76px)' : '100vh', paddingBottom: isMobile ? 80 : 0 }}>
            {section==='overview'   && <OverviewPage  vendor={vendor} showToast={showToast} />}
            {section==='orders'     && <OrdersPage    vendor={vendor} showToast={showToast} />}
            {section==='preorders'  && <PreordersPage vendor={vendor} showToast={showToast} />}
            {section==='menu'       && <MenuPage      vendor={vendor} showToast={showToast} />}
            {section==='analytics'  && <AnalyticsPage vendor={vendor} />}
            {section==='billing'    && <BillingPage   vendor={vendor} showToast={showToast} />}
            {section==='profile'    && <ProfilePage   vendor={vendor} setVendor={setVendor} showToast={showToast} />}
          </main>
          {/* Mobile bottom nav */}
          {isMobile && (
            <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#1A1A2E', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', paddingBottom:'max(8px,env(safe-area-inset-bottom))', zIndex:300 }}>
              {[
                ['overview','Overview','M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z'],
                ['orders','Orders','M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2'],
                ['menu','Menu','M3 6h18M3 12h18M3 18h18'],
                ['billing','Billing','M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
                ['profile','Account','M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
              ].map(([id,label,path])=>{
                const active = section===id;
                const pending = id==='orders' ? DB.getOrdersByVendor(vendor.id).filter(o=>o.status==='pending').length : 0;
                return (
                  <button key={id} onClick={()=>setSection(id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'10px 4px 8px', background:'transparent', border:'none', cursor:'pointer', color: active?'#A78BFA':'rgba(255,255,255,0.4)', gap:3, position:'relative' }}>
                    <div style={{ position:'relative' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:2} strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg>
                      {pending>0 && <span style={{ position:'absolute', top:-3, right:-3, width:14, height:14, borderRadius:'50%', background:'#EF4444', color:'white', fontSize:8, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{pending}</span>}
                    </div>
                    <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, fontWeight:active?700:400 }}>{label}</span>
                    {active && <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:20, height:2, borderRadius:2, background:'#A78BFA' }}/>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Toasts toasts={toasts} />
    </>
  );
}
