import { Chevron } from './Icons.jsx';

const ITEMS = [
  {
    q: 'How do I calculate GST on a price?',
    a: 'Multiply the price by the GST rate and divide by 100. For ₹10,000 at 18%, GST is ₹10,000 × 18 ÷ 100 = ₹1,800, so the total is ₹11,800. Pick "Add GST" in the calculator and it does this for you.',
  },
  {
    q: 'How do I take GST out of a total that already includes it?',
    a: 'Divide the total by (100 + rate) and multiply by 100 to get the price before GST. For ₹11,800 at 18%, that is ₹11,800 × 100 ÷ 118 = ₹10,000, so GST is ₹1,800. Pick "Remove GST" in the calculator.',
  },
  {
    q: 'What is the difference between CGST, SGST and IGST?',
    a: 'When you sell within one state, the tax is split in two: half goes to the Centre (CGST) and half to the state (SGST). When you sell to another state, or it is an import or export, the whole tax is charged as IGST. The total GST is the same either way.',
  },
  {
    q: 'Which GST rates does it offer?',
    a: 'Since 22 September 2025 the main rates are 5% and 18%, with 40% for select sin and luxury goods, and special rates of 0.25%, 1.5% and 3% for specified goods, plus 0% for exempt supplies. The old 12% slab was abolished and 28% now applies only to a few specified goods. Both are under "Older or rare" for earlier invoices, and you can type any other rate. Which rate applies depends on what you sell, so confirm it for your goods or service on the CBIC website or with your chartered accountant.',
  },
  {
    q: 'How is the amount rounded?',
    a: 'Everything is worked out in paise, so there are no floating-point errors. GST is rounded to the nearest paisa (half rounds up). If the tax is an odd number of paise, the spare paisa goes to SGST so that CGST and SGST always add up to the total.',
  },
  {
    q: 'Is my data sent anywhere?',
    a: 'No. The calculation happens in your browser and nothing you type is sent to a server or stored. "Copy link" puts your numbers in the web address so you can share them, and that only happens when you press it.',
  },
  {
    q: 'Can I use it for a GST invoice?',
    a: 'This is a calculator. For a full GST invoice with PDF output, use the free invoice generator at invoice.freelysta.com. This tool is for guidance and is not tax advice.',
  },
];

export default function Faq() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">Questions, answered</h2>
      <div className="faq-list">
        {ITEMS.map((it) => (
          <details key={it.q} className="faq-item">
            <summary><span>{it.q}</span><Chevron className="faq-chev" /></summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
