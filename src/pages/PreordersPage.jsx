// ─── Vendor Pre-orders Page ───────────────────────────────────────────
// Shows all scheduled (pre-order) orders from customers, grouped by
// delivery date. Vendor can update status and see customer contact info.

import { useState } from 'react';
import DB from '../utils/db';
import { FOOD_IMGS } from '../utils/constants';

const STATUS_OPTIONS = ['pending','confirmed','preparing','ready','on_the_way','delivered','cancelled'];
const STATUS_COLORS  = { pending:'#F59E0B', confirmed:'#FF6B35', preparing:'#7C3AED', ready:'#10b981', delivered:'#6B7280', cancelled:'#EF4444' };

function StatusBadge({ status }) {
  const col = STATUS_COLORS[status] || '#9CA3AF';
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${col}18`, color:col, border:`1px solid ${col}30` }}>
      {status}
    </span>
  );
}

export default function PreordersPage({ vendor, showToast }) {
  const [filter, setFilter] = useState('all');
  const [, rerender] = useState(0);

  const all = DB.getOrdersByVendor(vendor.id)
    .filter(o => o.isPreorder)
    .sort((a, b) => {
      // Sort by scheduled date, then creation date
      const da = a.scheduledFor || a.createdAt;
      const db_ = b.scheduledFor || b.createdAt;
      return da < db_ ? -1 : 1;
    });

  const filtered = filter === 'all' ? all : all.filter(o => o.status === filter);

  // Group by scheduled date
  const grouped = {};
  filtered.forEach(o => {
    const key = o.scheduledFor || 'No date set';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(o);
  });

  const updateStatus = (orderId, newStatus) => {
    const order = DB.getOrders().find(x => x.id === orderId);
    if (!order) return;
    order.status = newStatus;
    DB.saveOrder(order);
    // Save notification to customer
    DB.saveNotification({
      id:        DB.genId(),
      userId:    order.customerId,
      type:      'order_update',
      title:     `Pre-order ${newStatus}`,
      body:      `Your pre-order from ${vendor.businessName} is now ${newStatus}`,
      orderId:   order.id,
      read:      false,
      createdAt: new Date().toISOString(),
    });
    showToast(`Order updated to: ${newStatus}`, 'success');
    rerender(n => n + 1);
  };

  const totalRevenue = all
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + parseFloat(o.total || 0), 0);

  return (
    <div style={{ padding:28, animation:'fadeUp .4s ease', minHeight:'100vh', background:'#f9f9f7' }}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Sora,sans-serif', fontSize:24, fontWeight:800, color:'#1a1a1a' }}>Pre-orders</h1>
        <p style={{ color:'#9a9a9a', fontSize:13, marginTop:4 }}>
          {all.length} scheduled order{all.length!==1?'s':''} · GH₵{totalRevenue.toFixed(2)} delivered revenue
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {['pending','confirmed','ready','delivered'].map(s=>{
          const count = all.filter(o=>o.status===s).length;
          return (
            <div key={s} style={{ background:'white', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,.05)', borderTop:`3px solid ${STATUS_COLORS[s]||'#9CA3AF'}` }}>
              <div style={{ fontFamily:'Sora,sans-serif', fontSize:26, fontWeight:800, color:'#1a1a1a' }}>{count}</div>
              <div style={{ fontSize:11, color:'#9a9a9a', textTransform:'capitalize', marginTop:2 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['all',...STATUS_OPTIONS].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'7px 16px', borderRadius:20, border:'1.5px solid', borderColor:filter===s?'#e8935a':'#e5e0d8', background:filter===s?'#e8935a':'white', color:filter===s?'white':'#5a5a5a', fontFamily:'inherit', fontSize:12, fontWeight:filter===s?700:400, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}>
            {s==='all'?'All Orders':s} {s!=='all'&&`(${all.filter(o=>o.status===s).length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {!filtered.length && (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ width:64, height:64, borderRadius:16, overflow:'hidden', margin:'0 auto 18px', opacity:.35 }}>
            <img src={FOOD_IMGS.Default} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, marginBottom:8 }}>
            {filter==='all' ? 'No pre-orders yet' : `No ${filter} pre-orders`}
          </h3>
          <p style={{ color:'#9a9a9a', fontSize:14 }}>
            {filter==='all'
              ? 'Customers can pre-order for tomorrow from your menu'
              : 'Pre-orders with this status will appear here'}
          </p>
        </div>
      )}

      {/* Grouped by date */}
      {Object.entries(grouped).map(([date, orders]) => (
        <div key={date} style={{ marginBottom:28 }}>
          {/* Date header */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, color:'#1a1a1a' }}>
              {date === 'No date set' ? 'Unscheduled' :
                (() => {
                  try {
                    const d = new Date(date);
                    const today    = new Date(); today.setHours(0,0,0,0);
                    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
                    d.setHours(0,0,0,0);
                    if (d.getTime()===today.getTime())    return 'Today';
                    if (d.getTime()===tomorrow.getTime()) return 'Tomorrow';
                    return d.toLocaleDateString('en-GH',{weekday:'short',day:'numeric',month:'short'});
                  } catch { return date; }
                })()
              }
            </div>
            <div style={{ flex:1, height:1, background:'#e5e0d8' }} />
            <div style={{ fontSize:12, color:'#9a9a9a', fontWeight:600 }}>{orders.length} order{orders.length!==1?'s':''}</div>
          </div>

          {/* Order cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {orders.map(o => {
              const customer = DB.getCustomerById(o.customerId);
              return (
                <div key={o.id} style={{ background:'white', borderRadius:18, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.06)', borderLeft:`4px solid ${STATUS_COLORS[o.status]||'#e5e0d8'}` }}>
                  {/* Header row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:'#1a1a1a' }}>#{o.id.slice(0,8).toUpperCase()}</div>
                      <div style={{ fontSize:12, color:'#9a9a9a', marginTop:2 }}>{new Date(o.createdAt).toLocaleDateString('en-GH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  {/* Customer info */}
                  <div style={{ background:'#f9f9f7', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>{customer?.name || 'Customer'}</div>
                      <div style={{ fontSize:12, color:'#9a9a9a', marginTop:2 }}>
                        {customer?.phone && <span>{customer.phone}</span>}
                        {customer?.phone && customer?.location && <span style={{ margin:'0 6px', color:'#e5e0d8' }}>·</span>}
                        {customer?.location && <span>{customer.location}</span>}
                      </div>
                    </div>
                    <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, color:'#2d5a3d' }}>
                      GH₵{parseFloat(o.total||0).toFixed(2)}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom:14 }}>
                    {o.items?.map((item, idx) => (
                      <div key={idx} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'4px 0', color:'#5a5a5a' }}>
                        <span>{item.qty}× {item.name}</span>
                        <span style={{ fontWeight:600 }}>GH₵{(item.price*item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Special note if any */}
                  {o.note && (
                    <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:10, padding:'8px 12px', marginBottom:12, fontSize:12, color:'#92400E' }}>
                      Note: {o.note}
                    </div>
                  )}

                  {/* Status update */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'#9a9a9a', fontWeight:600 }}>Update status:</span>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {STATUS_OPTIONS.filter(s=>s!==o.status).map(s=>(
                        <button key={s} onClick={()=>updateStatus(o.id,s)} style={{ padding:'6px 14px', background:'white', border:`1.5px solid ${STATUS_COLORS[s]||'#e5e0d8'}`, borderRadius:20, color:STATUS_COLORS[s]||'#5a5a5a', fontFamily:'inherit', fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize', transition:'all .15s' }}
                          onMouseEnter={e=>{e.target.style.background=`${STATUS_COLORS[s]}15`;}}
                          onMouseLeave={e=>{e.target.style.background='white';}}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
