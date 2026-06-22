const COLORS = { success: '#006d09', error: '#c20000', info: '#06005a', warning: '#ffa200' };
const ICONS  = { success: '✓', error: '✕', info: '·', warning: '!' };

export default function Toasts({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ background: 'white', border: `1px solid ${COLORS[t.type]}`, borderRadius: 12, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,.12)', maxWidth: 320, fontSize: 14, color: '#1a1a1a', animation: 'fadeUp .3s ease' }}>
          <span style={{ color: COLORS[t.type], fontWeight: 700, fontSize: 16 }}>{ICONS[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
