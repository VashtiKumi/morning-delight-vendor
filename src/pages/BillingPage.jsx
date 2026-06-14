// ─── Vendor Billing & Subscription Page ──────────────────────────────
import { useState } from 'react';
import DB from '../utils/db';
import {
  getVendorStatus, computeCycles, submitPayment,
  COMMISSION_RATE, COLLECTION_MOMO, fmtCycleRange, fmtDays,
  TRIAL_DAYS, CYCLE_DAYS,
} from '../utils/subscriptionService';

const STATUS_CONFIG = {
  trial:    { label:'Free Trial',    color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0' },
  active:   { label:'Active',        color:'#10b981', bg:'#ecfdf5', border:'#a7f3d0' },
  overdue:  { label:'Payment Overdue', color:'#EF4444', bg:'#fef2f2', border:'#fecaca' },
  no_subscription: { label:'No Subscription', color:'#9CA3AF', bg:'#f9fafb', border:'#E5E7EB' },
};

// ── Small info row ────────────────────────────────────────────────────
function InfoRow({ label, value, mono, accent }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #f0ebe2' }}>
      <span style={{ fontSize:13, color:'#6B7280' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:700, color:accent||'#0F0F0F', fontFamily:mono?'monospace':'inherit' }}>{value}</span>
    </div>
  );
}

// ── Payment submission form ───────────────────────────────────────────
function PayCycleForm({ cycle, vendor, onPaid, showToast }) {
  const [ref,    setRef]    = useState('');
  const [busy,   setBusy]   = useState(false);
  const [sent,   setSent]   = useState(false);

  const handlePay = () => {
    const r = ref.trim();
    if (r.length < 4) { showToast('Enter your MoMo transaction reference', 'error'); return; }
    setBusy(true);
    setTimeout(() => {
      submitPayment(cycle.id, vendor.id, cycle.cycleNum, cycle.commission, r);
      setSent(true); setBusy(false);
      showToast('Payment submitted for admin verification!', 'success');
      onPaid();
    }, 900);
  };

  if (sent) return (
    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'12px 16px', fontSize:13, color:'#166534', marginTop:12 }}>
      ✅ Payment submitted. Awaiting admin verification.
    </div>
  );

  return (
    <div style={{ marginTop:12, background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:14, padding:'16px 18px' }}>
      <div style={{ fontWeight:700, fontSize:14, color:'#92400E', marginBottom:6 }}>
        Pay GH₵{cycle.commission.toFixed(2)} to Morning Delight
      </div>

      {/* Step-by-step */}
      <div style={{ fontSize:12, color:'#92400E', lineHeight:1.7, marginBottom:14 }}>
        <strong>1.</strong> Open your MoMo app or dial the USSD code<br/>
        <strong>2.</strong> Send <strong>GH₵{cycle.commission.toFixed(2)}</strong> to{' '}
        <strong style={{ fontFamily:'monospace', fontSize:14, background:'#fff', padding:'1px 6px', borderRadius:4 }}>{COLLECTION_MOMO}</strong><br/>
        <strong>3.</strong> Enter the transaction reference from your SMS below<br/>
        <strong>4.</strong> Click Submit — admin will verify and approve
      </div>

      {/* Copy number */}
      <div style={{ background:'white', borderRadius:10, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #fde68a' }}>
        <div>
          <div style={{ fontSize:10, color:'#9CA3AF', marginBottom:2 }}>Pay to this MoMo number</div>
          <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:20, color:'#0F0F0F', letterSpacing:2 }}>{COLLECTION_MOMO}</div>
        </div>
        <button onClick={()=>{ navigator.clipboard?.writeText(COLLECTION_MOMO); showToast('Number copied!','success'); }}
          style={{ padding:'6px 12px', background:'#FF6B35', border:'none', borderRadius:8, color:'white', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
          Copy
        </button>
      </div>

      <input value={ref} onChange={e=>{setRef(e.target.value);}}
        placeholder="e.g. GH24XXXXXXXXX"
        style={{ width:'100%', padding:'12px 14px', border:'2px solid #fde68a', borderRadius:10, fontSize:15, fontFamily:'monospace', letterSpacing:1, outline:'none', textTransform:'uppercase', marginBottom:12 }}
        onFocus={e=>e.target.style.borderColor='#FF6B35'}
        onBlur={e=>e.target.style.borderColor='#fde68a'}
      />
      <button onClick={handlePay} disabled={busy}
        style={{ width:'100%', padding:'13px', background:busy?'#9CA3AF':'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:50, color:'white', fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, cursor:busy?'not-allowed':'pointer' }}>
        {busy ? 'Submitting...' : 'Submit Payment →'}
      </button>
    </div>
  );
}

// ── Billing cycle row ────────────────────────────────────────────────
function CycleRow({ cycle, vendor, showToast, onRefresh }) {
  const [showPay, setShowPay] = useState(false);
  const isUnpaid = cycle.status === 'unpaid' && cycle.isPast;
  const isPending = cycle.status === 'pending_verification';
  const isPaid    = cycle.status === 'paid';
  const isCurrent = cycle.isCurrent;

  const statusColor = isPaid    ? '#10b981'
                    : isPending ? '#F59E0B'
                    : isUnpaid  ? '#EF4444'
                    : '#9CA3AF';

  const statusLabel = isPaid    ? '✅ Paid & Verified'
                    : isPending ? '⏳ Awaiting Verification'
                    : isUnpaid  ? '🔴 Unpaid'
                    : isCurrent ? '🔄 Current Cycle'
                    : '—';

  return (
    <div style={{ background:isUnpaid?'#fff8f7':'#fafaf8', border:`1.5px solid ${isUnpaid?'#fecaca':isCurrent?'#fed7aa':'#f0ebe2'}`, borderRadius:14, padding:'16px 18px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:'#0F0F0F' }}>
            Cycle {cycle.cycleNum} {isCurrent && '(Current)'}
          </div>
          <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>{fmtCycleRange(cycle)}</div>
          <div style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>{cycle.orderCount} delivered order{cycle.orderCount!==1?'s':''}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:20, color:isUnpaid?'#EF4444':'#0F0F0F' }}>
            GH₵{cycle.commission.toFixed(2)}
          </div>
          <div style={{ fontSize:11, color:'#9CA3AF' }}>from GH₵{cycle.revenue.toFixed(2)} revenue</div>
          <div style={{ fontSize:11, fontWeight:700, color:statusColor, marginTop:4 }}>{statusLabel}</div>
        </div>
      </div>

      {isPaid && cycle.paymentRef && (
        <div style={{ marginTop:10, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'7px 12px', fontSize:11, color:'#166534', fontFamily:'monospace' }}>
          Ref: {cycle.paymentRef} · Paid {new Date(cycle.paidAt).toLocaleDateString('en-GH')}
        </div>
      )}

      {isPending && (
        <div style={{ marginTop:10, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#92400E' }}>
          Your payment reference {cycle.paymentRef} is under review by admin.
        </div>
      )}

      {isUnpaid && !showPay && (
        <button onClick={()=>setShowPay(true)} style={{ marginTop:12, padding:'9px 20px', background:'linear-gradient(135deg,#FF6B35,#F7931E)', border:'none', borderRadius:20, color:'white', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          Pay Now →
        </button>
      )}

      {showPay && isUnpaid && (
        <PayCycleForm cycle={cycle} vendor={vendor} onPaid={() => { setShowPay(false); onRefresh(); }} showToast={showToast} />
      )}
    </div>
  );
}

// ─── Main BillingPage ─────────────────────────────────────────────────
export default function BillingPage({ vendor, showToast }) {
  const [, rerender] = useState(0);
  const refresh = () => rerender(n => n + 1);

  const info   = getVendorStatus(vendor.id);
  const cycles = info.cycles || [];

  const trialEndDate  = info.sub?.trialEnd
    ? new Date(info.sub.trialEnd).toLocaleDateString('en-GH', {day:'numeric',month:'long',year:'numeric'})
    : '—';
  const statusCfg = STATUS_CONFIG[info.status] || STATUS_CONFIG.no_subscription;

  return (
    <div style={{ padding:28, animation:'fadeUp .4s ease', minHeight:'100vh', background:'#f9f9f7' }}>
      <h1 style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:24, color:'#0F0F0F', marginBottom:4 }}>Billing & Subscription</h1>
      <p style={{ color:'#9CA3AF', fontSize:13, marginBottom:24 }}>3 weeks free · then 10% commission every 2 weeks</p>

      {/* ── Status hero card ── */}
      <div style={{ background:statusCfg.bg, border:`1.5px solid ${statusCfg.border}`, borderRadius:20, padding:'22px 24px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:statusCfg.color, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
              Subscription Status
            </div>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:22, color:statusCfg.color, marginBottom:4 }}>
              {statusCfg.label}
            </div>
            {info.status === 'trial' && (
              <div style={{ fontSize:14, color:'#374151', marginTop:4 }}>
                <strong style={{ color:'#10b981' }}>{fmtDays(info.daysLeft)}</strong> remaining in your free trial
              </div>
            )}
            {info.status === 'overdue' && (
              <div style={{ fontSize:14, color:'#EF4444', marginTop:4 }}>
                GH₵<strong>{info.totalOwed.toFixed(2)}</strong> outstanding — please pay immediately
              </div>
            )}
            {info.status === 'active' && (
              <div style={{ fontSize:14, color:'#374151', marginTop:4 }}>
                Next billing due in <strong>{fmtDays(info.daysUntilDue)}</strong>
              </div>
            )}
          </div>
          <div style={{ background:'white', borderRadius:14, padding:'14px 18px', textAlign:'center', minWidth:120, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
            <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:28, color:'#FF6B35' }}>{COMMISSION_RATE*100}%</div>
            <div style={{ fontSize:11, color:'#9CA3AF' }}>commission rate</div>
          </div>
        </div>

        {/* Trial progress bar */}
        {info.status === 'trial' && (
          <div style={{ marginTop:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9CA3AF', marginBottom:6 }}>
              <span>Trial started</span>
              <span>{info.daysLeft} day{info.daysLeft!==1?'s':''} left</span>
              <span>Trial ends {trialEndDate}</span>
            </div>
            <div style={{ height:8, background:'rgba(0,0,0,.06)', borderRadius:8 }}>
              <div style={{ height:'100%', width:`${Math.max(0,((TRIAL_DAYS-info.daysLeft)/TRIAL_DAYS)*100)}%`, background:'linear-gradient(90deg,#10b981,#34d399)', borderRadius:8, transition:'width 1s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── How billing works ── */}
      <div style={{ background:'white', borderRadius:18, padding:'18px 22px', marginBottom:20, boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
        <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, marginBottom:16 }}>How Billing Works</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {[
            ['🆓', `${TRIAL_DAYS} Days Free`, 'Full access, no charge during your trial period'],
            ['📅', 'Every 2 Weeks', `After trial, a ${COMMISSION_RATE*100}% commission bill is generated`],
            ['💳', `Pay to ${COLLECTION_MOMO}`, 'Send via MoMo and enter your transaction reference'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background:'#f9f9f7', borderRadius:12, padding:'14px' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:12, color:'#9CA3AF', lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Current cycle (if post-trial) ── */}
      {info.current && (
        <div style={{ background:'white', borderRadius:18, padding:'18px 22px', marginBottom:20, border:'1.5px solid #fed7aa', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, marginBottom:14 }}>Current Billing Cycle</div>
          <InfoRow label="Period"          value={fmtCycleRange(info.current)} />
          <InfoRow label="Orders delivered" value={info.current.orderCount} />
          <InfoRow label="Revenue earned"  value={`GH₵${info.current.revenue.toFixed(2)}`} accent="#2d5a3d" />
          <InfoRow label="Commission (10%)"value={`GH₵${info.current.commission.toFixed(2)}`} accent="#FF6B35" />
          <InfoRow label="Due date"        value={new Date(info.current.end).toLocaleDateString('en-GH',{day:'numeric',month:'long',year:'numeric'})} />
          {info.current.commission > 0 && (
            <div style={{ marginTop:10, background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#92400E' }}>
              At end of this cycle, <strong>GH₵{info.current.commission.toFixed(2)}</strong> will be due. Current revenue so far: GH₵{info.current.revenue.toFixed(2)}.
            </div>
          )}
        </div>
      )}

      {/* ── Past billing cycles ── */}
      {cycles.filter(c => c.isPast).length > 0 && (
        <div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:16, marginBottom:14 }}>
            Billing History
            {info.unpaid?.length > 0 && (
              <span style={{ marginLeft:10, fontSize:12, fontWeight:700, color:'#EF4444', background:'#fef2f2', border:'1px solid #fecaca', padding:'2px 10px', borderRadius:20 }}>
                {info.unpaid.length} unpaid
              </span>
            )}
          </div>
          {cycles.filter(c => c.isPast).reverse().map(cycle => (
            <CycleRow key={cycle.id} cycle={cycle} vendor={vendor} showToast={showToast} onRefresh={refresh} />
          ))}
        </div>
      )}

      {/* ── Empty state (in trial, no cycles yet) ── */}
      {info.status === 'trial' && cycles.length === 0 && (
        <div style={{ background:'white', borderRadius:18, padding:'32px', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🎉</div>
          <div style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:18, marginBottom:8 }}>You're on Free Trial!</div>
          <div style={{ color:'#9CA3AF', fontSize:14, lineHeight:1.7, maxWidth:320, margin:'0 auto' }}>
            Your first {TRIAL_DAYS} days are completely free. After that, a {COMMISSION_RATE*100}% commission will be calculated from your delivered orders every {CYCLE_DAYS} days.
          </div>
        </div>
      )}
    </div>
  );
}
