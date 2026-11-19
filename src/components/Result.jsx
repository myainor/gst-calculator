import { useState } from 'react';
import { formatPaise, formatRate, amountInWords, summarize, toQuery } from '../lib/gst.js';
import { Copy, Link, Reset, Check } from './Icons.jsx';

const rupee = (p) => formatPaise(p);

function Row({ label, hint, value, dot, strong }) {
  return (
    <div className={`row${strong ? ' row-strong' : ''}`}>
      <dt>
        {dot && <i className="dot" style={{ background: dot }} aria-hidden="true" />}
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </dt>
      <dd><span className="cur">₹</span>{rupee(value)}</dd>
    </div>
  );
}

/** What each segment of the split bar means, and its colour. */
function segments(r) {
  const out = [{ key: 'base', label: 'Before GST', value: r.base, color: 'var(--seg-base)' }];
  if (r.supply === 'intra') {
    out.push({ key: 'cgst', label: 'CGST', value: r.cgst, color: 'var(--seg-cgst)' });
    out.push({ key: 'sgst', label: 'SGST', value: r.sgst, color: 'var(--seg-sgst)' });
  } else {
    out.push({ key: 'igst', label: 'IGST', value: r.igst, color: 'var(--seg-igst)' });
  }
  return out;
}

export default function Result({ result, state, onReset }) {
  const [copied, setCopied] = useState('');
  const hasValue = result.total > 0;
  const rate = formatRate(result.rateBp);
  const half = formatRate(result.rateBp / 2);
  const words = amountInWords(result.total);
  const wordsBase = amountInWords(result.base);
  const removing = result.mode === 'inclusive';
  const segs = segments(result);
  const sum = segs.reduce((n, s) => n + s.value, 0) || 1;

  const flash = (what) => {
    setCopied(what);
    window.setTimeout(() => setCopied((c) => (c === what ? '' : c)), 1800);
  };

  const copy = async (what, text) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(what);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). Select-and-copy still works.
      flash('failed');
    }
  };

  const shareUrl = () => `${window.location.origin}${window.location.pathname}${toQuery(state)}`;

  return (
    <section className="card result" aria-labelledby="result-title">
      <h2 id="result-title" className="sr-only">Result</h2>

      <div className="hero">
        <span className="hero-label">{removing ? 'Amount before GST' : 'Total with GST'}</span>
        <output className={`hero-num${hasValue ? '' : ' is-empty'}`} aria-live="polite">
          <span className="cur">₹</span>{rupee(removing ? result.base : result.total)}
        </output>
        <span className="hero-words">{hasValue ? (removing ? wordsBase : words) : 'Enter an amount to see the breakdown'}</span>
      </div>

      <div className="split" role="img" aria-label={`Split: ${segs.map((s) => `${s.label} ₹${rupee(s.value)}`).join(', ')}`}>
        {segs.map((s) => (
          <span key={s.key} className="split-seg" style={{ flexGrow: hasValue ? s.value : 1, background: s.color, opacity: hasValue ? 1 : 0.28 }} />
        ))}
      </div>

      <dl className="rows">
        <Row label="Before GST" value={result.base} dot="var(--seg-base)" />
        {result.supply === 'intra' ? (
          <>
            <Row label="CGST" hint={`${half}%`} value={result.cgst} dot="var(--seg-cgst)" />
            <Row label="SGST" hint={`${half}%`} value={result.sgst} dot="var(--seg-sgst)" />
          </>
        ) : (
          <Row label="IGST" hint={`${rate}%`} value={result.igst} dot="var(--seg-igst)" />
        )}
        <Row label="Total GST" hint={`${rate}%`} value={result.gst} />
        <Row label="Total with GST" value={result.total} strong />
      </dl>

      <div className="actions">
        <button type="button" className="btn btn-primary" disabled={!hasValue}
          onClick={() => copy('summary', summarize(result, 'gst.freelysta.com'))}>
          {copied === 'summary' ? <Check /> : <Copy />}{copied === 'summary' ? 'Copied' : 'Copy summary'}
        </button>
        <button type="button" className="btn" disabled={!hasValue} onClick={() => copy('link', shareUrl())}>
          {copied === 'link' ? <Check /> : <Link />}{copied === 'link' ? 'Link copied' : 'Copy link'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          <Reset />Reset
        </button>
      </div>
      <p className="copy-note" role="status">{copied === 'failed' ? 'Your browser blocked copying. Select the numbers and copy them by hand.' : ''}</p>
    </section>
  );
}
