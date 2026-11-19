/**
 * Everything the page says in question-and-answer form. One source feeds the
 * visible FAQ, the FAQPage structured data and llms-full.txt, so they cannot drift.
 *
 * Answers are written to stand alone: each one names the thing it answers, so
 * it still makes sense when quoted by a search engine or an AI assistant.
 * Facts about the law carry their source; the worked examples are computed by
 * the same code the calculator runs.
 */
import { calculate, formatPaise, formatRate } from '../lib/gst.js';

const inr = (p) => `₹${formatPaise(p)}`;
const rs = (n) => `₹${n.toLocaleString('en-IN')}`;

/** Worked examples. `exclusive` = GST added on top, `inclusive` = GST taken out of a total. */
export const EXAMPLES = [
  { id: 'ex-1', amount: 10000, rate: 18, mode: 'exclusive', supply: 'intra' },
  { id: 'ex-2', amount: 100000, rate: 18, mode: 'exclusive', supply: 'intra' },
  { id: 'ex-3', amount: 118000, rate: 18, mode: 'inclusive', supply: 'intra' },
  { id: 'ex-4', amount: 100000, rate: 5, mode: 'exclusive', supply: 'inter' },
  { id: 'ex-5', amount: 105000, rate: 5, mode: 'inclusive', supply: 'intra' },
  { id: 'ex-6', amount: 50000, rate: 40, mode: 'exclusive', supply: 'intra' },
].map((e) => {
  const r = calculate({ amount: e.amount * 100, rateBp: Math.round(e.rate * 100), mode: e.mode, supply: e.supply });
  const half = formatRate(r.rateBp / 2);
  const split = e.supply === 'intra'
    ? `CGST ${half}% (${inr(r.cgst)}) plus SGST ${half}% (${inr(r.sgst)})`
    : `IGST ${e.rate}% (${inr(r.igst)})`;
  const where = e.supply === 'intra' ? 'within one state' : 'to another state';
  const question = e.mode === 'exclusive'
    ? `How much is ${e.rate}% GST on ${rs(e.amount)}${e.supply === 'inter' ? ' for a sale to another state' : ''}?`
    : `What is the price before GST if ${rs(e.amount)} includes ${e.rate}% GST?`;
  const answer = e.mode === 'exclusive'
    ? `${e.rate}% GST on ${rs(e.amount)} is ${inr(r.gst)}, so the total with GST is ${inr(r.total)}. For a sale ${where} that GST is ${split}.`
    : `If ${rs(e.amount)} already includes ${e.rate}% GST, the price before GST is ${inr(r.base)} and the GST inside it is ${inr(r.gst)}. For a sale ${where} that GST is ${split}.`;
  return { ...e, result: r, question, answer, split };
});

export const FAQ = [
  {
    id: 'what-is-gst',
    q: 'What is GST?',
    a: 'GST, the Goods and Services Tax, is the indirect tax charged in India on the supply of goods and services. It replaced most earlier central and state indirect taxes on 1 July 2017. A business collects it from its customer and pays it to the government, after claiming credit for the GST it paid on its own purchases.',
  },
  {
    id: 'formula',
    q: 'What is the GST formula?',
    a: 'To add GST to a price: GST = price × rate ÷ 100, and total = price + GST. To take GST out of a total that already includes it: price before GST = total × 100 ÷ (100 + rate), and GST = total − price. For example, at 18%, GST on ₹10,000 is ₹1,800, and the price before GST in ₹11,800 is ₹10,000.',
  },
  {
    id: 'add-gst',
    q: 'How do I calculate GST on a price?',
    a: 'Multiply the price by the GST rate and divide by 100. For ₹10,000 at 18%, GST is ₹10,000 × 18 ÷ 100 = ₹1,800, so the total is ₹11,800. In this calculator, choose "Add GST", type the price and pick the rate.',
  },
  {
    id: 'remove-gst',
    q: 'How do I calculate the price before GST from a GST-inclusive total?',
    a: 'Divide the total by (100 + rate) and multiply by 100. For ₹11,800 at 18%, that is ₹11,800 × 100 ÷ 118 = ₹10,000, so the GST inside it is ₹1,800. In this calculator, choose "Remove GST". Do not subtract 18% from the total: 18% of ₹11,800 is ₹2,124, which is wrong.',
  },
  {
    id: 'inclusive-exclusive',
    q: 'What is the difference between a GST-inclusive and a GST-exclusive price?',
    a: 'A GST-exclusive price is before GST, and the tax is added on top. A GST-inclusive price already contains the tax. The same ₹11,800 total is ₹10,000 exclusive of 18% GST, and ₹11,800 inclusive of it.',
  },
  {
    id: 'cgst-sgst-igst',
    q: 'What is the difference between CGST, SGST and IGST?',
    a: 'CGST is the Central GST and SGST is the State GST. When a sale is within one state, the total GST is split equally between them, so 18% GST is 9% CGST plus 9% SGST. IGST is the Integrated GST, charged in full on sales to another state and on imports. The total tax is the same either way.',
  },
  {
    id: 'cgst-or-igst',
    q: 'When do I charge CGST and SGST, and when do I charge IGST?',
    a: 'It depends on the place of supply, not on where the money is paid. If your state and the place of supply are the same state, charge CGST plus SGST. If they are different states, charge IGST. For most services to a business client, the place of supply is where the client is located, so a Delhi freelancer billing a Mumbai company charges IGST. Special cases exist, so confirm unusual ones with a chartered accountant.',
  },
  {
    id: 'rates',
    q: 'What are the GST rates in India now?',
    a: 'Since 22 September 2025 the main GST rates are 5% (merit rate) and 18% (standard rate), with 40% for a select few sin and luxury goods and services. There are also special rates of 0.25%, 1.5% and 3% for specified goods, and 0% for exempt supplies. Which rate applies depends on what is supplied, so check the rate for your goods or service on the CBIC website or with your chartered accountant.',
  },
  {
    id: 'rate-change',
    q: 'What happened to the 12% and 28% GST rates?',
    a: 'On 22 September 2025, following the GST Council\'s 56th meeting, India moved from four main slabs (5%, 12%, 18%, 28%) to two main rates, 5% and 18%, plus 40% for a select few goods. The 12% slab was abolished, with most of its goods moving to 5% or 18%. The 28% slab now applies only to a few specified goods. This calculator still lists 12% and 28% under "Older or rare" for invoices dated before the change.',
  },
  {
    id: 'freelance-rate',
    q: 'What GST rate do freelancers charge?',
    a: 'Most professional, consulting and IT services have been taxed at the standard 18% rate, but the rate depends on the exact service, which has an SAC (Services Accounting Code). Check the SAC code for what you do before you invoice. A freelancer who is not registered for GST cannot charge it.',
  },
  {
    id: 'registration',
    q: 'Does a freelancer need to register for GST?',
    a: 'A supplier of services must register when aggregate turnover in a financial year exceeds ₹20 lakh, or ₹10 lakh in Manipur, Mizoram, Nagaland and Tripura (Section 22 of the CGST Act). Service providers whose supplies are inter-state are exempt from registration below the same limits (Notification 10/2017-Integrated Tax). Some cases need registration at any turnover, such as supplying through an e-commerce operator, so check your situation. A supplier that deals only in goods can use a ₹40 lakh limit in many states, subject to conditions.',
  },
  {
    id: 'exports',
    q: 'Do I charge GST on services I export to a client abroad?',
    a: 'Exports of services are zero-rated under the IGST Act. A supply counts as an export when the supplier is in India, the client is outside India, the place of supply is outside India, payment comes in convertible foreign exchange (or Indian rupees where the RBI permits), and the two are not merely establishments of the same person. A registered supplier can export without paying IGST by furnishing a Letter of Undertaking (Form GST RFD-11) before the supply, or pay IGST and claim a refund. Use 0% in this calculator for such an invoice.',
  },
  {
    id: 'discount',
    q: 'Is GST calculated before or after a discount?',
    a: 'GST is generally charged on the transaction value after a trade discount that is allowed at or before the supply and shown on the invoice (Section 15 of the CGST Act). Enter the discounted price in the calculator. Discounts given after the supply have different rules, so confirm those with a chartered accountant.',
  },
  {
    id: 'rounding',
    q: 'How does this calculator round GST?',
    a: 'Every amount is worked out in paise, so there are no floating-point errors. GST is rounded once, to the nearest paisa, with half rounding up. If it comes to an odd number of paise, the spare paisa goes to SGST, so CGST and SGST always add up to the total. In the multiple-items mode each line is rounded on its own and the lines are then added, as an invoice does.',
  },
  {
    id: 'multiple-items',
    q: 'Can I calculate GST for several items with different rates?',
    a: 'Yes. Open the "Multiple items" tab, add a line for each item with its amount and rate, and the calculator totals the GST, shows a breakdown for each rate, and writes the grand total in words. You can add up to 25 items.',
  },
  {
    id: 'amount-in-words',
    q: 'Can it write the amount in words?',
    a: 'Yes. The result is written in rupees and paise with Indian grouping, for example "Rupees One Lakh Eighteen Thousand Only" for ₹1,18,000. A GST tax invoice is conventionally expected to show the total in words.',
  },
  {
    id: 'share',
    q: 'Can I share or save a calculation?',
    a: '"Copy link" puts the amount, rate and options in the web address so the same result opens for anyone you send it to. "Copy summary" gives plain text for an email or chat, and the WhatsApp button opens WhatsApp with the summary filled in. Nothing is stored on a server.',
  },
  {
    id: 'privacy',
    q: 'Is my data sent anywhere?',
    a: 'No. The calculation runs in your browser. Nothing you type is sent to a server, stored or tracked, and the site sets no cookies and uses no analytics. The only thing remembered is your light or dark theme choice, in your own browser. The numbers go into the web address only when you press "Copy link".',
  },
  {
    id: 'open-source',
    q: 'Is this GST calculator free and open source?',
    a: 'Yes. It is free to use with no sign-up, and the code is open source under the MIT license at github.com/myainor/gst-calculator. You can read how the maths works, run it yourself or host your own copy. It is made by Freelysta, the workspace for freelancers.',
  },
  {
    id: 'accuracy',
    q: 'Can I rely on this calculator for filing or tax advice?',
    a: 'It is built to be exact arithmetic, with tests for the maths, but it is a calculator for guidance and not tax advice. It cannot know which rate applies to your supply, whether you are registered, or the place of supply. Rates and rules change, so confirm them with the CBIC or your chartered accountant before you file.',
  },
  {
    id: 'invoice',
    q: 'Can I make a GST invoice with it?',
    a: 'This tool only calculates. For a full GST invoice with CGST, SGST or IGST, the amount in words and PDF download, use the free invoice generator at invoice.freelysta.com, which is also open source and runs in your browser.',
  },
];

/** Examples first, as direct answers. Used by the page, structured data and llms-full.txt. */
export const ALL_QA = [
  ...FAQ.map(({ q, a }) => ({ q, a })),
  ...EXAMPLES.map(({ question, answer }) => ({ q: question, a: answer })),
];
