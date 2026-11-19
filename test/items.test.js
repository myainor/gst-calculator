import { describe, it, expect } from 'vitest';
import { calculateItems, calculate, summarizeItems } from '../src/lib/gst.js';

const item = (rupees, rate) => ({ amount: Math.round(rupees * 100), rateBp: Math.round(rate * 100) });

describe('calculateItems', () => {
  it('rounds each line on its own, then adds, like an invoice', () => {
    // ₹0.30 at 5% is 1.5 paise, which rounds up to 2. Three lines: 6 paise.
    const res = calculateItems([item(0.3, 5), item(0.3, 5), item(0.3, 5)], { mode: 'exclusive', supply: 'intra' });
    expect(res.totals.gst).toBe(6);
    // The same ₹0.90 as one line is 4.5 paise, which rounds to 5. The two methods differ, which is why it is documented.
    const lump = calculate({ amount: 90, rateBp: 500, mode: 'exclusive', supply: 'intra' });
    expect(lump.gst).toBe(5);
  });

  it('keeps CGST + SGST equal to the total GST, and base + GST equal to the total', () => {
    const res = calculateItems([item(25000, 18), item(4999.5, 5), item(333.33, 12)], { mode: 'exclusive', supply: 'intra' });
    expect(res.totals.cgst + res.totals.sgst).toBe(res.totals.gst);
    expect(res.totals.base + res.totals.gst).toBe(res.totals.total);
  });

  it('groups by rate, sorted, with counts', () => {
    const res = calculateItems([item(100, 18), item(200, 5), item(300, 18)], { mode: 'exclusive', supply: 'inter' });
    expect(res.byRate.map((g) => [g.rateBp, g.count])).toEqual([[500, 1], [1800, 2]]);
    expect(res.byRate[1].base).toBe(40000);
    expect(res.totals.igst).toBe(res.totals.gst);
  });

  it('removes GST per line in inclusive mode', () => {
    const res = calculateItems([item(11800, 18), item(10500, 5)], { mode: 'inclusive', supply: 'intra' });
    expect(res.totals.base).toBe(2000000);
    expect(res.totals.total).toBe(2230000);
  });

  it('copes with a zero line', () => {
    const res = calculateItems([item(0, 18)], { mode: 'exclusive', supply: 'intra' });
    expect(res.totals.total).toBe(0);
  });

  it('writes a summary that names every rate', () => {
    const res = calculateItems([item(1000, 18), item(1000, 5)], { mode: 'exclusive', supply: 'intra' });
    const text = summarizeItems(res, { supply: 'intra' }, 'gst.freelysta.com');
    expect(text).toContain('At 5%');
    expect(text).toContain('At 18%');
    expect(text).toContain('Total with GST: ₹2,230.00');
  });
});
