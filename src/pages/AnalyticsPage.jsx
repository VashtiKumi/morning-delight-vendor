import DB from '../utils/db';

export default function AnalyticsPage({ vendor }) {
  const orders    = DB.getOrdersByVendor(vendor.id);
  const delivered = orders.filter((o) => o.status === 'delivered');
  const revenue   = delivered.reduce((s, o) => s + o.total, 0);
  const menus     = DB.getMenuByVendor(vendor.id);
  const counts    = {};
  orders.forEach((o) => o.items?.forEach((i) => { counts[i.name] = (counts[i.name] || 0) + i.qty; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] || 1;

  const StatCard = ({ label, value, dot }) => (
    <div style={{ background:'white', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
      <div style={{ width:10, height:10, borderRadius:'50%', background:dot, marginBottom:12 }} />
      <div style={{ fontSize:11, fontWeight:700, color:'#9a9a9a', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Sora, sans-serif', fontSize:28, fontWeight:800, color:'#1a1a1a' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding:32, animation:'fadeUp .4s ease' }}>
      <h1 style={{ fontFamily:'Sora, sans-serif', fontSize:24, fontWeight:800, color:'#1a1a1a', marginBottom:24 }}>Analytics</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:28 }}>
        <StatCard label="Total Revenue"    value={`₵${revenue.toFixed(2)}`} dot="#129e00" />
        <StatCard label="Delivered Orders" value={delivered.length}          dot="#fdd300" />
        <StatCard label="Menu Items"       value={menus.length}              dot="#f04000" />
      </div>
      <div style={{ background:'white', borderRadius:16, padding:24, boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
        <h2 style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Top Selling Items</h2>
        {top.length ? top.map(([name, count]) => (
          <div key={name} style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
              <span style={{ fontWeight:600 }}>{name}</span><span style={{ color:'#9a9a9a' }}>{count} sold</span>
            </div>
            <div style={{ height:8, background:'#f0ebe2', borderRadius:8, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(count/max)*100}%`, background:'linear-gradient(90deg,#2d5a3d,#e8935a)', borderRadius:8, transition:'width 1s ease' }} />
            </div>
          </div>
        )) : <p style={{ color:'#9a9a9a' }}>No sales data yet</p>}
      </div>
    </div>
  );
}
