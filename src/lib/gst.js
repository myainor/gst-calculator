/**
 * GST maths, in integers.
 *
 * Money is held in paise (1 rupee = 100 paise) and rates in basis points
 * (1% = 100 bp), so 0.25% is 25 bp. Nothing here uses floating point for
 * money, which is how a calculator ends up showing ₹99.99999999.
 *
 * Products are done in BigInt because ₹10,000 crore in paise times 40% in
 * basis points is larger than Number.MAX_SAFE_INTEGER.
 */

export const MAX_RUPEES = 100_000_000_000; // ₹10,000 crore, far above any real invoice
export const MAX_PAISE = MAX_RUPEES * 100;

/** Common GST slabs. 12% and 28% were replaced on 22 Sep 2025 but still appear on older invoices. */
export const CURRENT_RATES = [0, 0.25, 3, 5, 18, 40];
export const LEGACY_RATES = [12, 28];

/** Divide and round half up, for non-negative BigInts. */
function divRound(numerator, denominator) {
  return (numerator * 2n + denominator) / (denominator * 2n);
}

/** "1,23,456.5" → 12345650. Returns null for anything that is not a plain amount. */
export function parseAmount(input) {
  const s = String(input ?? '').replace(/[₹,\s]/g, '');
  if (s === '' || s === '.') return 0;
  if (!/^\d*\.?\d{0,2}$/.test(s)) return null;
  const [whole = '0', frac = ''] = s.split('.');
  const rupees = Number(whole || '0');
  if (rupees > MAX_RUPEES) return null;
  return rupees * 100 + Number(frac.padEnd(2, '0'));
}

/** A percentage typed by a person → basis points. Null if out of range or malformed. */
export function parseRate(input) {
  const s = String(input ?? '').replace(/[%\s]/g, '');
  if (s === '' || s === '.') return null;
  if (!/^\d*\.?\d{0,2}$/.test(s)) return null;
  const pct = Number(s);
  if (!Number.isFinite(pct) || pct > 100) return null;
  return Math.round(pct * 100);
}

/**
 * @param {object} p
 * @param {number} p.amount    paise
 * @param {number} p.rateBp    basis points
 * @param {'exclusive'|'inclusive'} p.mode  exclusive: amount is before GST. inclusive: amount already has GST in it.
 * @param {'intra'|'inter'} p.supply  intra: same state (CGST + SGST). inter: other state or import (IGST).
 */
export function calculate({ amount, rateBp, mode, supply }) {
  const amt = BigInt(amount);
  const bp = BigInt(rateBp);
  let base;
  let gst;
  let total;

  if (mode === 'inclusive') {
    total = amt;
    base = divRound(total * 10000n, 10000n + bp);
    gst = total - base;
  } else {
    base = amt;
    gst = divRound(base * bp, 10000n);
    total = base + gst;
  }

  // Half the tax each way. When the tax is an odd number of paise, the spare paisa goes to SGST.
  const cgst = supply === 'intra' ? gst / 2n : 0n;
  const sgst = supply === 'intra' ? gst - cgst : 0n;
  const igst = supply === 'inter' ? gst : 0n;

  return {
    base: Number(base),
    gst: Number(gst),
    cgst: Number(cgst),
    sgst: Number(sgst),
    igst: Number(igst),
    total: Number(total),
    rateBp,
    mode,
    supply,
  };
}

/* ---------- formatting ---------- */

/** 1234567 → "12,34,567" (lakh and crore grouping). */
export function groupIndian(digits) {
  const s = String(digits);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

/** 12345650 → "1,23,456.50" */
export function formatPaise(paise) {
  const p = Math.round(paise);
  const rupees = Math.floor(p / 100);
  const frac = String(p % 100).padStart(2, '0');
  return `${groupIndian(rupees)}.${frac}`;
}

/** 18 → "18", 0.25 → "0.25", 1850 bp → "18.5" */
export function formatRate(bp) {
  return String(bp / 100);
}

/* ---------- amount in words ---------- */

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function underThousand(n) {
  const out = [];
  if (n >= 100) {
    out.push(ONES[Math.floor(n / 100)], 'Hundred');
    n %= 100;
    if (n) out.push('and');
  }
  if (n >= 20) {
    out.push(TENS[Math.floor(n / 10)]);
    n %= 10;
  }
  if (n) out.push(ONES[n]);
  return out.join(' ');
}

function indianWords(n) {
  if (n === 0) return 'Zero';
  const parts = [];
  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (crore) parts.push(`${indianWords(crore)} Crore`);
  if (lakh) parts.push(`${underThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${underThousand(thousand)} Thousand`);
  if (n) parts.push(underThousand(n));
  return parts.join(' ');
}

/** 12345650 → "Rupees One Lakh Twenty Three Thousand Four Hundred and Fifty Six and Fifty Paise Only" */
export function amountInWords(paise) {
  const p = Math.round(paise);
  if (!p) return '';
  const rupees = Math.floor(p / 100);
  const minor = p % 100;
  const head = `Rupees ${indianWords(rupees)}`;
  const tail = minor ? ` and ${indianWords(minor)} Paise` : '';
  return `${head}${tail} Only`;
}

/* ---------- shareable state (URL) ---------- */

export const DEFAULTS = { amount: '', rate: '18', mode: 'exclusive', supply: 'intra' };

/** state → "?a=118000&r=18&m=inc&s=inter". Defaults are left out to keep links short. */
export function toQuery(state) {
  const q = new URLSearchParams();
  const amt = String(state.amount ?? '').replace(/[₹,\s]/g, '');
  if (amt) q.set('a', amt);
  if (state.rate !== DEFAULTS.rate) q.set('r', String(state.rate));
  if (state.mode === 'inclusive') q.set('m', 'inc');
  if (state.supply === 'inter') q.set('s', 'inter');
  const out = q.toString();
  return out ? `?${out}` : '';
}

/** "?a=…" → state. Invalid or hostile values fall back to the defaults. */
export function fromQuery(search) {
  const q = new URLSearchParams(search);
  const state = { ...DEFAULTS };
  const a = q.get('a');
  if (a !== null && parseAmount(a) !== null) state.amount = a.replace(/[₹,\s]/g, '');
  const r = q.get('r');
  if (r !== null && parseRate(r) !== null) state.rate = r.replace(/[%\s]/g, '');
  if (q.get('m') === 'inc') state.mode = 'inclusive';
  if (q.get('s') === 'inter') state.supply = 'inter';
  return state;
}

/** Plain-text summary for pasting into a chat or email. */
export function summarize(result, url = '') {
  const rate = formatRate(result.rateBp);
  const half = formatRate(result.rateBp / 2);
  const rupee = (p) => `₹${formatPaise(p)}`;
  const split = result.supply === 'intra'
    ? `CGST ${half}% ${rupee(result.cgst)} + SGST ${half}% ${rupee(result.sgst)}`
    : `IGST ${rate}% ${rupee(result.igst)}`;
  const lines = [
    'GST calculation',
    `Amount before GST: ${rupee(result.base)}`,
    `GST at ${rate}%: ${rupee(result.gst)} (${split})`,
    `Total with GST: ${rupee(result.total)}`,
  ];
  const words = amountInWords(result.total);
  if (words) lines.push(words);
  if (url) lines.push('', `Calculated on ${url}`);
  return lines.join('\n');
}
