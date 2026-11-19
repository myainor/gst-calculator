import { useMemo, useState } from 'react';
import {
  CURRENT_RATES, LEGACY_RATES, MAX_ITEMS, parseAmount, calculateItems, summarizeItems,
  formatPaise, formatRate, amountInWords,
} from '../lib/gst.js';
import Segmented from './Segmented.jsx';
import { MODES, SUPPLY } from '../data/options.js';
import AnimatedAmount from './AnimatedAmount.jsx';
import { Copy, Check, Reset } from './Icons.jsx';

const RATES = [...CURRENT_RATES, ...LEGACY_RATES];
const newItem = (n) => ({ id: n, name: '', amount: '', rate: '18' });
const rupee = (p) => formatPaise(p);

/** Several lines, each with its own rate. Mode and supply are shared with the single calculator. */
export default function Multi({ mode, supply, onMode, onSupply }) {
  const [items, setItems] = useState([newItem(1), newItem(2)]);
  const [nextId, setNextId] = useState(3);
  const [copied, setCopied] = useState('');

  const parsed = items.map((it) => ({ ...it, paise: parseAmount(it.amount) }));
  const result = useMemo(
    () => calculateItems(
      parsed.map((it) => ({ amount: it.paise ?? 0, rateBp: Math.round(Number(it.rate) * 100) })),
      { mode, supply },
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(parsed.map((p) => [p.paise, p.rate])), mode, supply],
  );

  const update = (id, patch) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const onAmount = (id, v) => { if (v === '' || parseAmount(v) !== null) update(id, { amount: v }); };
  const add = () => { if (items.length < MAX_ITEMS) { setItems((xs) => [...xs, newItem(nextId)]); setNextId((n) => n + 1); } };
  const remove = (id) => setItems((xs) => (xs.length > 1 ? xs.filter((x) => x.id !== id) : xs));
  const reset = () => { setItems([newItem(nextId), newItem(nextId + 1)]); setNextId((n) => n + 2); };

  const t = result.totals;
  const has = t.total > 0;
  const removing = mode === 'inclusive';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summarizeItems(result, { supply }, 'gst.freelysta.com'));
      setCopied('ok');
      window.setTimeout(() => setCopied(''), 1800);
    } catch { setCopied('failed'); }
  };

  return (
    <>
      <section className="card form" aria-labelledby="items-title">
        <h2 id="items-title" className="sr-only">Items</h2>
        <div className="field">
          <span className="label">What do the amounts include?</span>
          <Segmented label="What do the amounts include?" value={mode} options={MODES} onChange={onMode} />
        </div>
        <div className="field">
          <span className="label">Where is the sale?</span>
          <Segmented label="Where is the sale?" value={supply} options={SUPPLY} onChange={onSupply} />
        </div>
        <div className="items">
          <div className="items-head" aria-hidden="true"><span>Item</span><span>{removing ? 'Amount with GST' : 'Amount'}</span><span>GST</span><span /></div>
          {parsed.map((it, i) => (
            <div className="item" key={it.id}>
              <input
                className="item-name" type="text" placeholder={`Item ${i + 1}`} value={it.name} maxLength={60}
                aria-label={`Item ${i + 1} description`} onChange={(e) => update(it.id, { name: e.target.value })}
              />
              <div className={`item-amt${it.paise === null ? ' has-error' : ''}`}>
                <span aria-hidden="true">₹</span>
                <input
                  type="text" inputMode="decimal" autoComplete="off" placeholder="0.00" value={it.amount}
                  aria-label={`Item ${i + 1} ${removing ? 'amount including GST' : 'amount before GST'}`}
                  onChange={(e) => onAmount(it.id, e.target.value)}
                />
              </div>
              <select className="item-rate" value={it.rate} aria-label={`Item ${i + 1} GST rate`} onChange={(e) => update(it.id, { rate: e.target.value })}>
                {RATES.map((r) => <option key={r} value={String(r)}>{r}%</option>)}
              </select>
              <button type="button" className="icon-btn item-x" onClick={() => remove(it.id)} disabled={items.length === 1} aria-label={`Remove item ${i + 1}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="items-foot">
          <button type="button" className="btn" onClick={add} disabled={items.length >= MAX_ITEMS}>Add item</button>
          <span className="help">{items.length} of {MAX_ITEMS} items. Each line is rounded on its own, like an invoice.</span>
        </div>
      </section>

      <section className="card result" aria-labelledby="items-result-title">
        <h2 id="items-result-title" className="sr-only">Result</h2>
        <div className="hero">
          <span className="hero-label">Total with GST</span>
          <output className={`hero-num${has ? '' : ' is-empty'}`} aria-live="polite"><AnimatedAmount paise={t.total} /></output>
          <span className="hero-words">{has ? amountInWords(t.total) : 'Add an amount to see the breakdown'}</span>
        </div>

        <dl className="rows">
          <div className="row"><dt><i className="dot" style={{ background: 'var(--seg-base)' }} aria-hidden="true" /><span>Before GST</span></dt><dd><span className="cur">₹</span>{rupee(t.base)}</dd></div>
          {supply === 'intra' ? (
            <>
              <div className="row"><dt><i className="dot" style={{ background: 'var(--seg-cgst)' }} aria-hidden="true" /><span>CGST</span></dt><dd><span className="cur">₹</span>{rupee(t.cgst)}</dd></div>
              <div className="row"><dt><i className="dot" style={{ background: 'var(--seg-sgst)' }} aria-hidden="true" /><span>SGST</span></dt><dd><span className="cur">₹</span>{rupee(t.sgst)}</dd></div>
            </>
          ) : (
            <div className="row"><dt><i className="dot" style={{ background: 'var(--seg-igst)' }} aria-hidden="true" /><span>IGST</span></dt><dd><span className="cur">₹</span>{rupee(t.igst)}</dd></div>
          )}
          <div className="row"><dt><span>Total GST</span></dt><dd><span className="cur">₹</span>{rupee(t.gst)}</dd></div>
          <div className="row row-strong"><dt><span>Total with GST</span></dt><dd><span className="cur">₹</span>{rupee(t.total)}</dd></div>
        </dl>

        {has && result.byRate.length > 0 && (
          <div className="by-rate">
            <h3>By rate</h3>
            <table>
              <thead><tr><th scope="col">Rate</th><th scope="col">Items</th><th scope="col">Before GST</th><th scope="col">GST</th></tr></thead>
              <tbody>
                {result.byRate.filter((g) => g.total > 0).map((g) => (
                  <tr key={g.rateBp}><th scope="row">{formatRate(g.rateBp)}%</th><td>{g.count}</td><td>₹{rupee(g.base)}</td><td>₹{rupee(g.gst)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={!has} onClick={copy}>
            {copied === 'ok' ? <Check /> : <Copy />}{copied === 'ok' ? 'Copied' : 'Copy summary'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}><Reset />Reset</button>
        </div>
        <p className="copy-note" role="status">{copied === 'failed' ? 'Your browser blocked copying. Select the numbers and copy them by hand.' : ''}</p>
      </section>
    </>
  );
}
