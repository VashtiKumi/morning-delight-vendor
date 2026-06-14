// ─── Vendor Dashboard Overview ────────────────────────────────────────
import { useState, useEffect } from 'react';
import DB from '../utils/db';
import { FOOD_IMGS } from '../utils/constants';

function StatCard({ label, value, sub, color, img }) {
  return (
    <div style={{ background:'white', borderRadius:18, padding:'18px 20px', boxShadow:'0 2px 12px rgba(0,0,0,.06)', borderTop:`3px solid ${color||'#2d5a3d'}`, position:'relative', overflow:'hidden' }}>
      {img&&<div style={{ position:'absolute', top:-12, right:-12, width:70, height:70, borderRadius:'50%', overflow:'hidden', opacity:.12 }}><img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>}
      <div style={{ fontSize:11, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:.8, marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:'Sora,sans-serif', fontSize:30, fontWeight:800, color:'#1a1a1a', marginBottom:4 }}>{value}</div>
      {sub&&<div style={{ fontSize:12, color:'#9a9a9a' }}>{sub}</div>}
    </div>
  );
}

export default function OverviewPage({ vendor, showToast }) {
  const [, rerender] = useState(0);
  useEffect(() => { const t = setInterval(() => rerender(n=>n+1), 5000); return () => clearInterval(t); }, []);
  const orders    = DB.getOrdersByVendor(vendor.id);
  const pending   = orders.filter(o=>o.status==='pending');
  const preorders = orders.filter(o=>o.isPreorder);
  const revenue   = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+parseFloat(o.total||0),0);
  const today     = orders.filter(o=>new Date(o.createdAt).toDateString()===new Date().toDateString());
  const recent    = [...orders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,10);

  const h = new Date().getHours();
  const greet = h<12?'Good morning':h<17?'Good afternoon':'Good evening';

  const updateStatus = (id, st) => {
    const o=DB.getOrders().find(x=>x.id===id);
    if(o){ o.status=st; DB.saveOrder(o);
      DB.saveNotification({ id:DB.genId(), userId:o.customerId, type:'order_update', title:`Order ${st}`, body:`Your order from ${vendor.businessName} is now ${st}`, orderId:o.id, read:false, createdAt:new Date().toISOString() });
      showToast(`Order updated to: ${st}`,'success'); rerender(n=>n+1); }
  };

  const STATUS_COLORS = { pending:'#F59E0B', confirmed:'#FF6B35', preparing:'#7C3AED', ready:'#10b981', delivered:'#6B7280', cancelled:'#EF4444' };

  return (
    <div style={{ padding:28, animation:'fadeUp .4s ease', minHeight:'100vh', background:'#f9f9f7' }}>
      {/* Greeting */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontSize:24, fontWeight:800, color:'#1a1a1a' }}>{greet}, {vendor.businessName}</h1>
        <p style={{ color:'#9a9a9a', marginTop:4, fontSize:13 }}>Here's how your business is doing today</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:28 }}>
        <StatCard label="Total Orders"  value={orders.length}     sub={`${today.length} today`}              color="#2d5a3d" img={FOOD_IMGS.Rice} />
        <StatCard label="Pending"       value={pending.length}    sub="awaiting action"                       color="#F59E0B" img={FOOD_IMGS.Soup} />
        <StatCard label="Revenue (GH₵)" value={revenue.toFixed(2)} sub="from delivered orders"              color="#10b981" img={FOOD_IMGS.Local} />
        <StatCard label="Pre-orders"    value={preorders.length}  sub="scheduled orders"                     color="#7C3AED" img={FOOD_IMGS.Snacks} />
      </div>

      {/* Pending orders quick action */}
      {pending.length > 0 && (
        <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:18, padding:20, marginBottom:24 }}>
          <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, color:'#92400E', marginBottom:14 }}>
            Action Required — {pending.length} pending order{pending.length!==1?'s':''}
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {pending.slice(0,4).map(o=>{
              const c=DB.getCustomerById(o.customerId);
              return (
                <div key={o.id} style={{ background:'white', borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{c?.name||'Customer'} — #{o.id.slice(0,6).toUpperCase()}</div>
                    <div style={{ fontSize:12, color:'#9a9a9a' }}>{o.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}</div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, color:'#2d5a3d' }}>GH₵{parseFloat(o.total).toFixed(2)}</span>
                    <button onClick={()=>updateStatus(o.id,'confirmed')} style={{ padding:'6px 14px', background:'#2d5a3d', border:'none', borderRadius:20, color:'white', fontFamily:'inherit', fontWeight:700, fontSize:12, cursor:'pointer' }}>Accept</button>
                    <button onClick={()=>updateStatus(o.id,'cancelled')} style={{ padding:'6px 14px', background:'white', border:'1px solid #FECACA', borderRadius:20, color:'#EF4444', fontFamily:'inherit', fontWeight:600, fontSize:12, cursor:'pointer' }}>Decline</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent orders table */}
      <div style={{ background:'white', borderRadius:18, boxShadow:'0 2px 12px rgba(0,0,0,.06)', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0ebe2', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, color:'#1a1a1a' }}>Recent Orders</h2>
          <span style={{ fontSize:12, color:'#9a9a9a' }}>{orders.length} total</span>
        </div>
        {!recent.length ? (
          <div style={{ padding:'40px', textAlign:'center', color:'#9a9a9a', fontSize:14 }}>No orders yet — share your menu link!</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#faf7f3' }}>
                  {['Order','Customer','Items','Total','Type','Status','Update'].map(h=>(
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:.8, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(o=>{
                  const c=DB.getCustomerById(o.customerId);
                  const sc=STATUS_COLORS[o.status]||'#9a9a9a';
                  return (
                    <tr key={o.id} style={{ borderBottom:'1px solid #f5f0e8' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#faf7f3'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>#{o.id.slice(0,6).toUpperCase()}</td>
                      <td style={{ padding:'12px 16px', fontSize:13 }}>{c?.name||'Customer'}</td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'#5a5a5a', maxWidth:180 }}>{o.items?.map(i=>`${i.qty}x ${i.name}`).join(', ')}</td>
                      <td style={{ padding:'12px 16px', fontWeight:700, color:'#2d5a3d' }}>GH₵{parseFloat(o.total).toFixed(2)}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:o.isPreorder?'rgba(124,58,237,.1)':'rgba(45,90,61,.1)', color:o.isPreorder?'#7C3AED':'#2d5a3d' }}>
                          {o.isPreorder?'Pre-order':'Instant'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${sc}18`, color:sc }}>{o.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}
                          style={{ padding:'5px 10px', border:'1.5px solid #e5e0d8', borderRadius:8, fontFamily:'inherit', fontSize:12, cursor:'pointer', background:'white', color:'#1a1a1a', outline:'none' }}>
                          {['pending','confirmed','preparing','ready','on_the_way','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
