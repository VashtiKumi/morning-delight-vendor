// ─── Subscription & Commission Service ───────────────────────────────
//
// Business rules:
//   • Every vendor gets 21-day FREE TRIAL on signup (no charge)
//   • After trial: 10% commission on every delivered order
//   • Billing cycle: every 14 days (2 weeks)
//   • Vendor pays to MoMo number: 0248415784
//   • Alert fires when ≤ 5 days left in trial OR billing cycle due
//
// How cycles work:
//   Trial ends → Cycle 1 starts (14 days) → Cycle 2 → Cycle 3 → ...
//   Revenue is calculated from DELIVERED orders in each 14-day window.
//   10% of that revenue = commission owed to Morning Delight.
// ─────────────────────────────────────────────────────────────────────

import DB from './db';

export const TRIAL_DAYS      = 21;
export const CYCLE_DAYS      = 14;
export const COMMISSION_RATE = 0.10;     // 10%
export const COLLECTION_MOMO = '0248415784';
export const ALERT_DAYS      = 5;       // warn when ≤ 5 days left
export const MS_DAY          = 86_400_000;

// ── Create trial subscription for a new vendor ────────────────────────
export function createTrialSubscription(vendorId) {
  if (DB.getSubscriptionByVendor(vendorId)) return; // already exists
  const now = new Date();
  const sub = {
    id:         DB.genId(),
    vendorId,
    trialStart: now.toISOString(),
    trialEnd:   new Date(+now + TRIAL_DAYS * MS_DAY).toISOString(),
    status:     'trial',
    createdAt:  now.toISOString(),
  };
  DB.saveSubscription(sub);
  return sub;
}

// ── Get rich status object for a vendor ───────────────────────────────
export function getVendorStatus(vendorId) {
  const sub = DB.getSubscriptionByVendor(vendorId);
  if (!sub) return { status: 'no_subscription' };

  const now      = Date.now();
  const trialEnd = +new Date(sub.trialEnd);

  // ── Still in trial ──
  if (now < trialEnd) {
    const msLeft   = trialEnd - now;
    const daysLeft = Math.ceil(msLeft / MS_DAY);
    return {
      status:   'trial',
      daysLeft,
      trialEnd: sub.trialEnd,
      alertDue: daysLeft <= ALERT_DAYS,
      sub,
    };
  }

  // ── Trial ended — compute billing cycles ──
  const cycles     = computeCycles(vendorId, sub);
  const current    = cycles.find(c => c.isCurrent) || null;
  const unpaid     = cycles.filter(c => c.isPast && c.status !== 'paid' && c.commission > 0);
  const totalOwed  = unpaid.reduce((s, c) => s + c.commission, 0);
  const daysUntilDue = current
    ? Math.ceil((+new Date(current.end) - now) / MS_DAY)
    : null;

  return {
    status:       unpaid.length ? 'overdue' : 'active',
    current,
    unpaid,
    totalOwed:    +totalOwed.toFixed(2),
    daysUntilDue,
    alertDue:     unpaid.length > 0 || (daysUntilDue != null && daysUntilDue <= ALERT_DAYS && current?.commission > 0),
    cycles,
    sub,
  };
}

// ── Compute all 14-day billing cycles since trial ended ───────────────
export function computeCycles(vendorId, sub) {
  if (!sub) return [];
  const trialEnd   = new Date(sub.trialEnd);
  const now        = new Date();
  if (now <= trialEnd) return [];

  const savedCycles = DB.getBillingCyclesByVendor(vendorId);
  const cycles     = [];
  let start        = new Date(trialEnd);
  let num          = 1;

  while (start < now && num <= 52) {
    const end       = new Date(+start + CYCLE_DAYS * MS_DAY);
    const isCurrent = now >= start && now < end;
    const isPast    = now >= end;

    // Orders delivered in this window
    const delivered = DB.getOrdersByVendor(vendorId).filter(o => {
      if (o.status !== 'delivered') return false;
      const d = +new Date(o.deliveredAt || o.updatedAt || o.createdAt);
      return d >= +start && d < +end;
    });

    const revenue    = delivered.reduce((s, o) => s + parseFloat(o.total || 0), 0);
    const commission = parseFloat((revenue * COMMISSION_RATE).toFixed(2));

    // Look up any saved payment record for this cycle
    const saved      = savedCycles.find(c => c.cycleNum === num);
    const status     = saved?.status
      || (isPast && commission > 0 ? 'unpaid' : 'pending');

    cycles.push({
      id:         saved?.id || `${vendorId}_c${num}`,
      vendorId,
      cycleNum:   num,
      start:      start.toISOString(),
      end:        end.toISOString(),
      revenue:    +revenue.toFixed(2),
      commission,
      status,
      isCurrent,
      isPast,
      paidAt:     saved?.paidAt     || null,
      paymentRef: saved?.paymentRef || null,
      verifiedByAdmin: saved?.verifiedByAdmin || false,
      orderCount: delivered.length,
      orderIds:   delivered.map(o => o.id),
    });

    start = end;
    num++;
  }

  return cycles;
}

// ── Vendor submits a MoMo payment reference for a cycle ──────────────
export function submitPayment(cycleId, vendorId, cycleNum, amount, ref) {
  const existing = DB.getBillingCyclesByVendor(vendorId).find(c => c.cycleNum === cycleNum);
  const record = {
    id:              existing?.id || cycleId,
    vendorId,
    cycleNum,
    amount,
    paymentRef:      ref.trim(),
    status:          'pending_verification',
    paidAt:          new Date().toISOString(),
    verifiedByAdmin: false,
  };
  DB.saveBillingCycle(record);
  return record;
}

// ── Admin verifies or rejects a payment ──────────────────────────────
export function verifyPayment(cycleId, vendorId, cycleNum, approve) {
  const existing = DB.getBillingCyclesByVendor(vendorId).find(c => c.cycleNum === cycleNum);
  if (!existing) return;
  DB.saveBillingCycle({
    ...existing,
    status:          approve ? 'paid' : 'unpaid',
    verifiedByAdmin: approve,
    verifiedAt:      new Date().toISOString(),
  });
}

// ── Helper: human-friendly date range ────────────────────────────────
export function fmtCycleRange(cycle) {
  const fmt = d => new Date(d).toLocaleDateString('en-GH', { day:'numeric', month:'short', year:'numeric' });
  return `${fmt(cycle.start)} – ${fmt(cycle.end)}`;
}

// ── Helper: days string ───────────────────────────────────────────────
export function fmtDays(n) {
  if (n <= 0) return 'Today';
  return n === 1 ? '1 day' : `${n} days`;
}
