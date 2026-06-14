import { useEffect, useState } from 'react';
import { FOOD_IMGS } from '../utils/constants';

export default function Loader() {
  const [prog, setProg] = useState(0);
  useEffect(() => { const t = setInterval(() => setProg((p) => Math.min(p + 2.5, 100)), 75); return () => clearInterval(t); }, []);
  return (
    <div style={{ minHeight: '100vh', background: '#2d5a3d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <img src={FOOD_IMGS.VendorBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .18 }} />
      <div style={{ position: 'absolute', inset: 0, background: '#07091A' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: 22, overflow: 'hidden', marginBottom: 24, boxShadow: '0 12px 40px rgba(0,0,0,.3)', border: '2px solid rgba(255,255,255,.2)' }}>
          <img src={FOOD_IMGS.VendorBg} alt="Vendor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: 36, fontWeight: 800, color: 'white', fontStyle: 'italic', marginBottom: 8 }}>Morning Delight</h1>
        <p style={{ color: 'rgba(255,255,255,.45)', letterSpacing: 3, fontSize: 11, textTransform: 'uppercase', marginBottom: 48 }}>Vendor Portal</p>
        <div style={{ width: 240, height: 3, background: 'rgba(255,255,255,.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 48 }}>
          <div style={{ height: '100%', background: 'white', borderRadius: 3, width: `${prog}%`, transition: 'width .07s' }} />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[FOOD_IMGS.Rice, FOOD_IMGS.Soup, FOOD_IMGS.Snacks].map((src, i) => (
            <div key={i} style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,.2)', animation: `float ${1.4 + i * .2}s ease-in-out ${i * .15}s infinite` }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
