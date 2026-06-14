// ─── Vendor App Sidebar ──────────────────────────────────────────────
import { useEffect, useState } from 'react';
import DB from '../utils/db';
import { getVendorStatus } from '../utils/subscriptionService';
import { LogoMark } from './Logo';

const NAV_SVGS = {
  overview:  'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  orders:    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2',
  preorders: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  menu:      'M3 6h18M3 12h18M3 18h18',
  analytics: 'M18 20V10M12 20V4M6 20v-6',
  billing:   'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  profile:   'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

const NAV_ITEMS = [
  { id:'overview',  label:'Overview'    },
  { id:'orders',    label:'All Orders'  },
  { id:'preorders', label:'Pre-orders'  },
  { id:'menu',      label:'Manage Menu' },
  { id:'analytics', label:'Analytics'  },
  { id:'billing',   label:'Billing'    },
  { id:'profile',   label:'Profile'    },
];

export default function Sidebar({ section, setSection, vendor, onLogout }) {
  const [subInfo, setSubInfo] = useState(null);
  const pending = vendor ? DB.getOrdersByVendor(vendor.id).filter(o=>o.status==='pending').length : 0;

  // Refresh subscription status every 30s
  useEffect(() => {
    if (!vendor) return;
    const check = () => setSubInfo(getVendorStatus(vendor.id));
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [vendor?.id]);

  const billingAlert = subInfo?.alertDue;
  const billingBadge = subInfo?.status === 'overdue'
    ? (subInfo.unpaid?.length || '!')
    : (billingAlert ? '!' : null);

  return (
    <aside style={{ width:220, background:'#2d5a3d', display:'flex', flexDirection:'column', padding:'18px 12px', minHeight:'100vh', position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
      {/* Brand */}
      <div style={{ padding:'0 8px', marginBottom:8, display:'flex', alignItems:'center', gap:9 }}>
        <LogoMark size={36}/>
        <div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:11, color:'#FF8C42', letterSpacing:2, textTransform:'uppercase', lineHeight:1.0 }}>Morning</div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:14, color:'white', lineHeight:1.1 }}>Delight</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', letterSpacing:1, textTransform:'uppercase', marginTop:1 }}>Vendor Portal</div>
        </div>
      </div>

      {/* Vendor info */}
      {vendor && (
        <div style={{ background:'rgba(255,255,255,.08)', borderRadius:10, padding:'12px 14px', margin:'12px 0 8px' }}>
          <div style={{ fontWeight:600, fontSize:13, color:'white' }}>{vendor.ownerName}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:2 }}>{vendor.businessName}</div>
        </div>
      )}

      {/* Subscription mini-status */}
      {subInfo && (
        <div style={{ borderRadius:8, padding:'8px 12px', margin:'4px 0 14px', background: subInfo.status==='overdue'?'rgba(239,68,68,.15)' : subInfo.alertDue?'rgba(245,158,11,.15)' : 'rgba(16,185,129,.1)', border:`1px solid ${subInfo.status==='overdue'?'rgba(239,68,68,.3)':subInfo.alertDue?'rgba(245,158,11,.3)':'rgba(16,185,129,.2)'}` }}>
          <div style={{ fontSize:10, fontWeight:700, color: subInfo.status==='overdue'?'#EF4444':subInfo.alertDue?'#F59E0B':'#10b981', textTransform:'uppercase', letterSpacing:.8, marginBottom:3 }}>
            {subInfo.status==='trial'?'Free Trial':subInfo.status==='overdue'?'⚠ Overdue':'Subscribed'}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>
            {subInfo.status==='trial'  && `${subInfo.daysLeft} day${subInfo.daysLeft!==1?'s':''} left`}
            {subInfo.status==='active' && `Next bill in ${subInfo.daysUntilDue} day${subInfo.daysUntilDue!==1?'s':''}`}
            {subInfo.status==='overdue'&& `GH₵${subInfo.totalOwed?.toFixed(2)} due`}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex:1 }}>
        {NAV_ITEMS.map(({ id, label }) => (
          <button key={id} onClick={()=>setSection(id)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer', marginBottom:2, background:section===id?'rgba(255,255,255,.12)':'transparent', color:section===id?'white':'rgba(255,255,255,.5)', fontWeight:section===id?700:400, fontSize:14, transition:'all .15s', border:'none', fontFamily:'inherit', textAlign:'left' }}
            onMouseEnter={e=>{ if(section!==id) e.currentTarget.style.background='rgba(255,255,255,.06)'; }}
            onMouseLeave={e=>{ if(section!==id) e.currentTarget.style.background='transparent'; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
              <path d={NAV_SVGS[id]}/>
            </svg>
            <span style={{ flex:1 }}>{label}</span>
            {id==='orders'  && pending > 0     && <span style={{ background:'#ef4444', color:'white', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>{pending}</span>}
            {id==='billing' && billingBadge     && <span style={{ background: subInfo?.status==='overdue'?'#EF4444':'#F59E0B', color:'white', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:20 }}>{billingBadge}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={onLogout}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer', color:'rgba(255,255,255,.35)', fontSize:14, transition:'all .15s', background:'transparent', border:'none', fontFamily:'inherit', width:'100%' }}
        onMouseEnter={e=>{e.currentTarget.style.color='#ef4444';}}
        onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,.35)';}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        Logout
      </button>
    </aside>
  );
}
