import { FAQ } from '../data/faq.js';
import { Chevron } from './Icons.jsx';

export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">GST calculator FAQ</h2>
      <p className="section-lead">Straight answers on how GST is worked out, with sources where the law is involved.</p>
      <div className="faq-list">
        {FAQ.map((it) => (
          <details key={it.id} id={it.id} className="faq-item">
            <summary><span>{it.q}</span><Chevron className="faq-chev" /></summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
