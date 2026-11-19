import { EXAMPLES } from '../data/faq.js';
import { formatPaise } from '../lib/gst.js';

const inr = (p) => `₹${formatPaise(p)}`;

/** Worked examples, computed by the same maths as the calculator. "Try it" loads one into the calculator. */
export default function Examples({ onTry }) {
  return (
    <section className="examples" id="examples" aria-labelledby="examples-title">
      <h2 id="examples-title">GST examples, worked out</h2>
      <p className="section-lead">Common questions with the answer already calculated. Tap one to open it in the calculator.</p>
      <div className="ex-grid">
        {EXAMPLES.map((e) => (
          <article key={e.id} className="ex-card">
            <h3>{e.question}</h3>
            <dl>
              <div><dt>Before GST</dt><dd>{inr(e.result.base)}</dd></div>
              <div><dt>{e.supply === 'intra' ? 'CGST + SGST' : 'IGST'}</dt><dd>{inr(e.result.gst)}</dd></div>
              <div className="ex-total"><dt>With GST</dt><dd>{inr(e.result.total)}</dd></div>
            </dl>
            <button type="button" className="ex-try" onClick={() => onTry(e)}>Try it in the calculator</button>
          </article>
        ))}
      </div>
    </section>
  );
}
