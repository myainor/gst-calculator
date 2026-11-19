import { describe, it, expect } from 'vitest';
import {
  MAX_RUPEES, parseAmount, parseRate, calculate, groupIndian, formatPaise, formatRate,
  amountInWords, toQuery, fromQuery, summarize, DEFAULTS, CURRENT_RATES, LEGACY_RATES,
} from '../src/lib/gst.js';

const calc = (amountRupees, rate, mode = 'exclusive', supply = 'intra') =>
  calculate({ amount: parseAmount(String(amountRupees)), rateBp: parseRate(String(rate)), mode, supply });

describe('parseAmount', () => {
  it('reads plain, grouped and rupee-prefixed amounts into paise', () => {
    expect(parseAmount('100')).toBe(10000);
    expect(parseAmount('1,23,456.5')).toBe(12345650);
    expect(parseAmount('₹ 99.99')).toBe(9999);
    expect(parseAmount('.5')).toBe(50);
  });
  it('treats empty input as zero', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('   ')).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
  });
  it('rejects negatives, letters, extra decimals and absurd sizes', () => {
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('12abc')).toBeNull();
    expect(parseAmount('1.234')).toBeNull();
    expect(parseAmount('1.2.3')).toBeNull();
    expect(parseAmount(String(MAX_RUPEES + 1))).toBeNull();
    expect(parseAmount(String(MAX_RUPEES))).toBe(MAX_RUPEES * 100);
  });
});

describe('parseRate', () => {
  it('turns percentages into basis points', () => {
    expect(parseRate('18')).toBe(1800);
    expect(parseRate('0.25')).toBe(25);
    expect(parseRate('5%')).toBe(500);
    expect(parseRate('12.5')).toBe(1250);
  });
  it('rejects empty, negative, over 100 and malformed rates', () => {
    expect(parseRate('')).toBeNull();
    expect(parseRate('-1')).toBeNull();
    expect(parseRate('101')).toBeNull();
    expect(parseRate('abc')).toBeNull();
    expect(parseRate('1.234')).toBeNull();
  });
});

describe('calculate: GST added on top (exclusive)', () => {
  it('₹1,00,000 at 18% in the same state', () => {
    const r = calc(100000, 18);
    expect(r).toMatchObject({ base: 10000000, gst: 1800000, cgst: 900000, sgst: 900000, igst: 0, total: 11800000 });
  });
  it('uses IGST for other-state supply', () => {
    const r = calc(100000, 18, 'exclusive', 'inter');
    expect(r).toMatchObject({ gst: 1800000, cgst: 0, sgst: 0, igst: 1800000, total: 11800000 });
  });
  it('handles the 0.25% and 3% special rates', () => {
    expect(calc(100000, 0.25).gst).toBe(25000);
    expect(calc(100000, 3).gst).toBe(300000);
  });
  it('zero rate and zero amount are clean', () => {
    expect(calc(500, 0)).toMatchObject({ gst: 0, total: 50000 });
    expect(calc(0, 18)).toMatchObject({ base: 0, gst: 0, total: 0 });
  });
  it('rounds to the nearest paisa, half up', () => {
    // 5% of ₹0.10 = 0.5 paise → rounds up to 1 paisa
    expect(calc('0.10', 5).gst).toBe(1);
    // 18% of ₹0.02 = 0.36 paise → rounds down to 0
    expect(calc('0.02', 18).gst).toBe(0);
  });
});

describe('calculate: GST taken out (inclusive)', () => {
  it('₹1,18,000 at 18% gives back ₹1,00,000', () => {
    const r = calc(118000, 18, 'inclusive');
    expect(r).toMatchObject({ base: 10000000, gst: 1800000, total: 11800000 });
  });
  it('base plus GST always equals the amount typed in', () => {
    for (const [amt, rate] of [['999.99', 18], ['1', 5], ['12345.67', 40], ['0.01', 3], ['7.77', 0.25], ['100', 12]]) {
      const r = calc(amt, rate, 'inclusive');
      expect(r.base + r.gst).toBe(r.total);
      expect(r.total).toBe(parseAmount(amt));
    }
  });
  it('round trips: remove GST from a total made by adding it', () => {
    const added = calc('4567.89', 18);
    const removed = calculate({ amount: added.total, rateBp: 1800, mode: 'inclusive', supply: 'intra' });
    expect(Math.abs(removed.base - 456789)).toBeLessThanOrEqual(1);
  });
});

describe('CGST and SGST split', () => {
  it('splits evenly when the tax is an even number of paise', () => {
    const r = calc(100, 18);
    expect(r.cgst).toBe(900);
    expect(r.sgst).toBe(900);
  });
  it('gives the spare paisa to SGST so the halves always add up', () => {
    const r = calc('0.10', 5); // 1 paisa of tax
    expect(r.gst).toBe(1);
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(1);
    for (const [amt, rate] of [['33.33', 18], ['1.01', 5], ['999.99', 3]]) {
      const x = calc(amt, rate);
      expect(x.cgst + x.sgst).toBe(x.gst);
      expect(x.sgst - x.cgst).toBeLessThanOrEqual(1);
    }
  });
});

describe('very large amounts stay exact', () => {
  it('₹10,000 crore at 40% does not lose precision', () => {
    const r = calc(MAX_RUPEES, 40);
    expect(r.gst).toBe(MAX_RUPEES * 100 * 0.4);
    expect(r.total).toBe(MAX_RUPEES * 100 + r.gst);
    expect(Number.isSafeInteger(r.total)).toBe(true);
  });
});

describe('formatting', () => {
  it('groups digits the Indian way', () => {
    expect(groupIndian('0')).toBe('0');
    expect(groupIndian('999')).toBe('999');
    expect(groupIndian('1000')).toBe('1,000');
    expect(groupIndian('100000')).toBe('1,00,000');
    expect(groupIndian('12345678')).toBe('1,23,45,678');
    expect(groupIndian('1000000000')).toBe('1,00,00,00,000');
  });
  it('formats paise with two decimals', () => {
    expect(formatPaise(0)).toBe('0.00');
    expect(formatPaise(5)).toBe('0.05');
    expect(formatPaise(12345650)).toBe('1,23,456.50');
    expect(formatPaise(11800000)).toBe('1,18,000.00');
  });
  it('shows rates without trailing noise', () => {
    expect(formatRate(1800)).toBe('18');
    expect(formatRate(25)).toBe('0.25');
    expect(formatRate(900)).toBe('9');
    expect(formatRate(125)).toBe('1.25');
  });
});

describe('amountInWords', () => {
  it('uses lakh and crore', () => {
    expect(amountInWords(11800000)).toBe('Rupees One Lakh Eighteen Thousand Only');
    expect(amountInWords(1234567800)).toBe('Rupees One Crore Twenty Three Lakh Forty Five Thousand Six Hundred and Seventy Eight Only');
  });
  it('adds paise', () => {
    expect(amountInWords(12345)).toBe('Rupees One Hundred and Twenty Three and Forty Five Paise Only');
    expect(amountInWords(50)).toBe('Rupees Zero and Fifty Paise Only');
  });
  it('is empty for zero', () => {
    expect(amountInWords(0)).toBe('');
  });
  it('reads very large amounts', () => {
    expect(amountInWords(MAX_RUPEES * 100)).toBe('Rupees Ten Thousand Crore Only');
  });
});

describe('shareable links', () => {
  it('leaves defaults out', () => {
    expect(toQuery(DEFAULTS)).toBe('');
    expect(toQuery({ ...DEFAULTS, amount: '1,18,000' })).toBe('?a=118000');
  });
  it('round trips every field', () => {
    const state = { amount: '118000.5', rate: '5', mode: 'inclusive', supply: 'inter' };
    expect(fromQuery(toQuery(state))).toEqual(state);
  });
  it('ignores junk and hostile values', () => {
    expect(fromQuery('?a=<script>&r=999&m=x&s=y')).toEqual(DEFAULTS);
    expect(fromQuery('?a=-5&r=abc')).toEqual(DEFAULTS);
    expect(fromQuery('')).toEqual(DEFAULTS);
  });
});

describe('summarize', () => {
  it('writes a readable summary', () => {
    const text = summarize(calc(100000, 18), 'gst.freelysta.com');
    expect(text).toContain('Amount before GST: ₹1,00,000.00');
    expect(text).toContain('GST at 18%: ₹18,000.00 (CGST 9% ₹9,000.00 + SGST 9% ₹9,000.00)');
    expect(text).toContain('Total with GST: ₹1,18,000.00');
    expect(text).toContain('Rupees One Lakh Eighteen Thousand Only');
    expect(text).toContain('Calculated on gst.freelysta.com');
  });
  it('names IGST for other-state supply', () => {
    expect(summarize(calc(100, 5, 'exclusive', 'inter'))).toContain('(IGST 5% ₹5.00)');
  });
});

describe('rate presets', () => {
  it('every preset is a valid whole number of basis points', () => {
    for (const r of [...CURRENT_RATES, ...LEGACY_RATES]) {
      const bp = parseRate(String(r));
      expect(bp).not.toBeNull();
      expect(bp / 100).toBe(r);
    }
  });
  it('no preset appears twice', () => {
    const all = [...CURRENT_RATES, ...LEGACY_RATES];
    expect(new Set(all).size).toBe(all.length);
  });
});
