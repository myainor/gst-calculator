import { SLABS, SOURCES, RATES_EFFECTIVE_LABEL } from '../data/rates.js';

export default function RatesTable() {
  return (
    <section className="rates" id="rates" aria-labelledby="rates-title">
      <h2 id="rates-title">GST rates in India</h2>
      <p className="section-lead">
        The rates in force since {RATES_EFFECTIVE_LABEL}, with the CGST and SGST halves for a same-state sale.
        The same data is available as <a href="/gst-rates.json">JSON</a>.
      </p>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">GST rate slabs in India with CGST, SGST and IGST, and what each applies to</caption>
          <thead>
            <tr><th scope="col">Rate (IGST)</th><th scope="col">CGST + SGST</th><th scope="col">Name</th><th scope="col">Applies to</th></tr>
          </thead>
          <tbody>
            {SLABS.map((s) => (
              <tr key={s.rate} className={s.status === 'legacy' ? 'is-legacy' : ''}>
                <th scope="row"><span className="rate-badge">{s.rate}%</span></th>
                <td>{s.rate === 0 ? '0% + 0%' : `${s.rate / 2}% + ${s.rate / 2}%`}</td>
                <td>{s.name}</td>
                <td>{s.appliesTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fine-print">
        Sources:{' '}
        {SOURCES.map((s, i) => (
          <span key={s.url}>{i > 0 && ', '}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></span>
        ))}
        . Which rate applies depends on what you supply. This is not tax advice.
      </p>
    </section>
  );
}
