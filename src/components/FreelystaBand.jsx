import { FreelystaMark, FreelystaWordmark } from './Brand.jsx';

export const FREELYSTA_URL = 'https://freelysta.com/?utm_source=gst-calculator&utm_medium=referral&utm_campaign=tool';

const POINTS = [
  ['Clients and projects', 'Every client, project and deadline in one place.'],
  ['Invoices and payments', 'Send GST-ready invoices and see who has paid.'],
  ['Agreements', 'Get scope, payment terms and sign-off agreed before work starts.'],
  ['Meetings and notes', 'Keep calls, notes and decisions with the project they belong to.'],
];

/** The Freelysta pitch, between the content and the footer. */
export default function FreelystaBand() {
  return (
    <section className="fl-band" aria-labelledby="fl-title">
      <div className="fl-band-copy">
        <div className="fl-band-brand"><FreelystaMark size={34} /><FreelystaWordmark height={15} /></div>
        <h2 id="fl-title">Done with the GST maths? Run the rest of your freelance work in one place.</h2>
        <p>Freelysta is the workspace for freelancers. This calculator is one of the free tools we build and open-source for people who work for themselves.</p>
        <div className="fl-band-cta">
          <a className="btn btn-primary" href={FREELYSTA_URL} target="_blank" rel="noopener noreferrer">Try Freelysta free</a>
          <a className="btn" href="https://invoice.freelysta.com" target="_blank" rel="noopener noreferrer">Free invoice generator</a>
        </div>
      </div>
      <ul className="fl-points">
        {POINTS.map(([t, d]) => (
          <li key={t}><strong>{t}</strong><span>{d}</span></li>
        ))}
      </ul>
    </section>
  );
}
