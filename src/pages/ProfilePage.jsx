// ─── Vendor Profile Page — clean header, no blue bleed ────────────────
import { useState } from 'react';
import DB from '../utils/db';

const GREEN   = '#2d5a3d';
const GREEN_D = '#1e3d29';
const WHITE   = '#FFFFFF';
const LGRAY   = '#f8f7f4';
const BORDER  = '#e0d8cc';
const MUTED   = '#9a9a9a';
const TEXT    = '#1a1a1a';

const fi = {
  width:'100%', padding:'12px 14px',
  background:LGRAY, border:`1.5px solid ${BORDER}`,
  borderRadius:12, fontFamily:'DM Sans,sans-serif',
  fontSize:14, color:TEXT, outline:'none',
  boxSizing:'border-box',
};

export default function ProfilePage({ vendor, setVendor, showToast }) {
  const [form, setForm] = useState({
    biz:   vendor.businessName,
    owner: vendor.ownerName,
    spec:  vendor.specialty,
    momo:  '',
  });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    const v = { ...vendor, businessName:form.biz, ownerName:form.owner, specialty:form.spec };
    if (form.momo.trim()) v.momoNumber = form.momo.trim();
    DB.saveVendor(v); setVendor(v);
    showToast('Profile saved!', 'success');
  };

  // Initials from owner name
  const initials = vendor.ownerName?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'V';

  return (
    <div style={{ background:LGRAY, minHeight:'100vh' }}>

      {/* ── Clean green header — overflow:hidden prevents any bleed ── */}
      <div style={{ background:`linear-gradient(135deg,${GREEN_D},${GREEN})`, padding:'32px 28px 72px', position:'relative', overflow:'hidden' }}>
        {/* Decorative arc — fully inside header bounds */}
        <div style={{ position:'absolute', top:-40, right:-30, width:130, height:130, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:WHITE, marginBottom:4 }}>
            Vendor Profile
          </h1>
          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:'rgba(255,255,255,0.6)' }}>
            {vendor.businessName}
          </p>
        </div>
      </div>

      <div style={{ padding:'0 20px', marginTop:-48 }}>

        {/* ── Vendor identity card ── */}
        <div style={{ background:WHITE, borderRadius:20, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.1)', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:`linear-gradient(135deg,${GREEN},#40916C)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:WHITE }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:17, color:TEXT }}>{vendor.ownerName}</div>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:MUTED, marginTop:2 }}>{vendor.email}</div>
            </div>
          </div>

          {/* MoMo card */}
          <div style={{ background:`linear-gradient(135deg,${GREEN_D},${GREEN})`, borderRadius:16, padding:'16px 18px' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8, fontFamily:'DM Sans,sans-serif' }}>
              MoMo Number — Customers pay here
            </div>
            <div style={{ fontFamily:'Sora,sans-serif', fontSize:24, fontWeight:800, color:WHITE, letterSpacing:3 }}>
              {vendor.momoNumber}
            </div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:'rgba(255,255,255,.5)', marginTop:6 }}>
              {vendor.businessName}
            </div>
          </div>
        </div>

        {/* ── Business info form ── */}
        <div style={{ background:WHITE, borderRadius:20, padding:24, boxShadow:'0 4px 16px rgba(0,0,0,0.06)', marginBottom:14 }}>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:16, color:TEXT, marginBottom:18, paddingBottom:12, borderBottom:`1px solid ${BORDER}` }}>
            Business Information
          </h3>

          {[['biz','Business Name'],['owner','Owner Name']].map(([k,l]) => (
            <div key={k} style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:600, color:MUTED, marginBottom:7, textTransform:'uppercase', letterSpacing:1 }}>{l}</label>
              <input style={fi} value={form[k]} onChange={e=>upd(k,e.target.value)}/>
            </div>
          ))}

          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:600, color:MUTED, marginBottom:7, textTransform:'uppercase', letterSpacing:1 }}>Specialty</label>
            <select value={form.spec} onChange={e=>upd('spec',e.target.value)}
              style={{ ...fi, appearance:'none', WebkitAppearance:'none' }}>
              {['Rice & Stew','Local Ghanaian','Soups & Stew','Snacks & Fast Food',
                'Pizza & Burgers','Chicken & Grills','Drinks & Beverages','Mixed Menu'].map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button onClick={save}
            style={{ padding:'12px 24px', background:GREEN, border:'none', borderRadius:12, color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Save Changes
          </button>
        </div>

        {/* ── Update MoMo number ── */}
        <div style={{ background:WHITE, borderRadius:20, padding:24, boxShadow:'0 4px 16px rgba(0,0,0,0.06)', marginBottom:24 }}>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:16, color:TEXT, marginBottom:6 }}>Update MoMo Number</h3>
          <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:MUTED, marginBottom:16, lineHeight:1.6 }}>
            All customer payments go to this number. Enter the new number to update it.
          </p>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:600, color:MUTED, marginBottom:7, textTransform:'uppercase', letterSpacing:1 }}>New MoMo Number</label>
            <input style={fi} type="tel" placeholder="024XXXXXXX" value={form.momo} onChange={e=>upd('momo',e.target.value)}/>
          </div>
          <button onClick={save}
            style={{ padding:'12px 24px', background:GREEN, border:'none', borderRadius:12, color:WHITE, fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Update MoMo
          </button>
        </div>

      </div>
    </div>
  );
}
