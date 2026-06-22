// ─── Vendor All Orders Page ──────────────────────────────────────────
import { useState } from 'react';
import DB from '../utils/db';

const TABS = ['all','pending','confirmed','ready','delivered','cancelled'];

export default function OrdersPage({ vendor, showToast }) {
  const [tab, setTab] = useState('all');
  const [, rerender] = useState(0);

  let orders = DB.getOrdersByVendor(vendor.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (tab !== 'all') orders = orders.filter((o) => o.status === tab);

  const update = (oid, st) => {
    const o = DB.getOrders().find((x) => x.id === oid);
    if (o) { o.status = st; DB.saveOrder(o); showToast(`Updated to ${st}`, 'success'); rerender((n) => n + 1); }
  };

  return (
    <div style={{ padding:32, animation:'fadeUp .4s ease' }}>
      <h1 style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:800, color:'#574f4f', marginBottom:20 }}>All Orders</h1>
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'7px 16px', borderRadius:20, border:'1.5px solid', borderColor:tab===t?'#000838':'#e0d8cc', background:tab===t?'#000838':'white', color:tab===t?'white':'#d4c2c2', fontFamily:'inherit', fontSize:13, fontWeight:tab===t?700:400, cursor:'pointer', textTransform:'capitalize' }}>
            {t}
          </button>
        ))}
      </div>
      <div style={{ background:'white', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#faf7f3' }}>
              {['ID','Customer','Items','Total','Date','Type','Update Status'].map((h) => <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {orders.length ? orders.map((o) => {
                const c = DB.getCustomerById(o.customerId);
                return (
                  <tr key={o.id} style={{ borderBottom:'1px solid #faf7f3' }}>
                    <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>#{o.id.slice(0,8).toUpperCase()}</td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{c?.name||'Student'}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#5a5a5a', maxWidth:160 }}>{o.items?.map((i) => `${i.qty}x ${i.name}`).join(', ')}</td>
                    <td style={{ padding:'12px 16px', fontWeight:700 }}>₵{parseFloat(o.total).toFixed(2)}</td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#9a9a9a', whiteSpace:'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding:'12px 16px' }}><span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:700, background:o.isPreorder?'rgba(83,74,183,.1)':'rgba(45,90,61,.1)', color:o.isPreorder?'#534ab7':'#2d5a3d' }}>{o.isPreorder?'Pre-order':'Instant'}</span></td>
                    <td style={{ padding:'12px 16px' }}>
                      <select value={o.status} onChange={(e) => update(o.id, e.target.value)} style={{ padding:'5px 10px', border:'1.5px solid #e0d8cc', borderRadius:8, fontFamily:'inherit', fontSize:12, cursor:'pointer', background:'#faf7f3' }}>
                        {['pending','confirmed','preparing','ready','on_the_way','delivered','cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#9a9a9a' }}>No orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
