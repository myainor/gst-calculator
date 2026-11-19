/**
 * Everything generated from the data modules: structured data, llms.txt, llms-full.txt,
 * gst-rates.json, sitemap.xml and robots.txt. Pure functions, so tests can check them.
 */
import { FAQ, EXAMPLES, ALL_QA } from '../src/data/faq.js';
import { SLABS, SOURCES, RATES_EFFECTIVE, RATES_EFFECTIVE_LABEL, RATES_CHECKED } from '../src/data/rates.js';

export const SITE = 'https://gst.freelysta.com';
export const FREELYSTA = 'https://freelysta.com';
export const REPO = 'https://github.com/myainor/gst-calculator';
export const TITLE = 'GST Calculator India: add or remove GST, CGST, SGST and IGST';
export const DESCRIPTION = 'Free GST calculator for India. Add GST to a price or remove it from a total, see CGST, SGST and IGST split out, calculate several items at once and get the amount in words. Private: runs in your browser.';


export const organization = {
  '@type': 'Organization',
  '@id': `${FREELYSTA}/#organization`,
  name: 'Freelysta',
  url: FREELYSTA,
  logo: `${FREELYSTA}/icon-512.png`,
  sameAs: ['https://twitter.com/freelysta', 'https://linkedin.com/company/freelysta', 'https://instagram.com/freelysta', 'https://github.com/myainor'],
};

export function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebApplication',
        '@id': `${SITE}/#app`,
        name: 'GST Calculator',
        alternateName: 'Freelysta GST Calculator',
        url: `${SITE}/`,
        description: DESCRIPTION,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: 'en-IN',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        license: 'https://opensource.org/license/mit',
        codeRepository: REPO,
        publisher: { '@id': organization['@id'] },
        featureList: [
          'Add GST to a price',
          'Remove GST from a GST-inclusive total',
          'CGST, SGST and IGST split',
          'Several items with different GST rates',
          'Total in words in rupees and paise',
          'Shareable links and WhatsApp sharing',
          'Runs in the browser; nothing is sent to a server',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}/#faq`,
        mainEntity: ALL_QA.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}

/** JSON for a <script type="application/ld+json">: "<" is escaped so no text can close the tag. */
export const jsonLd = () => JSON.stringify(structuredData(), null, 2).replace(/</g, '\\u003c');

export function ratesJson() {
  return {
    country: 'IN',
    tax: 'GST',
    currency: 'INR',
    effectiveFrom: RATES_EFFECTIVE,
    lastChecked: RATES_CHECKED,
    note: 'Rates in force since the GST Council 56th meeting. Which rate applies depends on what is supplied. Not tax advice.',
    sources: SOURCES,
    formulas: {
      addGst: 'gst = price * rate / 100; total = price + gst',
      removeGst: 'price = total * 100 / (100 + rate); gst = total - price',
      sameState: 'CGST = SGST = gst / 2',
      otherState: 'IGST = gst',
    },
    slabs: SLABS.map((s) => ({
      rate: s.rate,
      cgst: s.rate / 2,
      sgst: s.rate / 2,
      igst: s.rate,
      status: s.status,
      name: s.name,
      appliesTo: s.appliesTo,
    })),
    license: 'MIT',
    publisher: 'Freelysta',
    url: `${SITE}/`,
  };
}

export function llmsTxt() {
  return `# GST Calculator by Freelysta

> A free, open-source GST calculator for India. It adds GST to a price or removes it from a GST-inclusive total, splits the tax into CGST, SGST and IGST, handles several items with different rates, and writes the total in words. It runs entirely in the browser, so nothing a user types is sent anywhere. Made by Freelysta, the workspace for freelancers.

Rates in force since ${RATES_EFFECTIVE_LABEL}: 5% and 18% main rates, 40% for select sin and luxury goods, special rates of 0.25%, 1.5% and 3%, and 0% for exempt supplies. The old 12% slab is abolished and 28% is now rare. Rates last checked ${RATES_CHECKED}. This is a calculator for guidance, not tax advice.

## Use it

- [GST Calculator](${SITE}/): Add or remove GST, with CGST, SGST and IGST. Link parameters: a (amount in rupees), r (rate in percent), m=inc (amount includes GST), s=inter (sale to another state). Example: ${SITE}/?a=100000&r=18
- [Worked examples](${SITE}/#examples): Common GST questions with the answer already calculated.
- [GST rates table](${SITE}/#rates): Every slab with its CGST and SGST halves.
- [FAQ](${SITE}/#faq): ${FAQ.length} questions on GST maths, registration, exports and rounding.

## Data for tools and assistants

- [gst-rates.json](${SITE}/gst-rates.json): The current rate slabs, formulas and sources as JSON.
- [llms-full.txt](${SITE}/llms-full.txt): The complete FAQ and worked examples as plain Markdown.
- [Source code](${REPO}): MIT licensed.

## Related

- [Freelysta](${FREELYSTA}): Clients, projects, GST invoices, agreements and payments for freelancers in India. The Starter plan is free.
- [Free GST invoice generator](https://invoice.freelysta.com): Make a GST invoice with a PDF download. No sign-up.

## Optional

- [Freelysta llms.txt](${FREELYSTA}/llms.txt): About Freelysta.
`;
}

export function llmsFullTxt() {
  const rows = SLABS.map((s) => `| ${s.rate}% | ${s.rate / 2}% + ${s.rate / 2}% | ${s.name}${s.status === 'legacy' ? ' (older)' : ''} | ${s.appliesTo} |`).join('\n');
  const faq = FAQ.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n');
  const ex = EXAMPLES.map(({ question, answer }) => `### ${question}\n\n${answer}`).join('\n\n');
  return `# GST Calculator by Freelysta: full content

> Source: ${SITE}/ . Open source (MIT): ${REPO} . Made by Freelysta (${FREELYSTA}). Not tax advice.

## How GST is calculated

- Add GST to a price: GST = price × rate ÷ 100, total = price + GST.
- Remove GST from a total: price before GST = total × 100 ÷ (100 + rate), GST = total − price.
- Sale within one state: CGST and SGST are each half of the GST. Sale to another state: IGST is the whole GST.

## GST rates in India, in force since ${RATES_EFFECTIVE_LABEL}

| Rate | CGST + SGST | Name | Applies to |
| --- | --- | --- | --- |
${rows}

Sources: ${SOURCES.map((s) => `${s.label} (${s.url})`).join('; ')}. Last checked ${RATES_CHECKED}.

## Frequently asked questions

${faq}

## Worked examples

${ex}
`;
}

export function robotsTxt() {
  const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'Amazonbot', 'meta-externalagent', 'DuckAssistBot', 'MistralAI-User'];
  return `User-agent: *
Allow: /

${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}
Sitemap: ${SITE}/sitemap.xml
`;
}

export function sitemapXml(lastmod) {
  const url = (loc, pri) => `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${pri}</priority></url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url(`${SITE}/`, '1.0')}
${url(`${SITE}/llms.txt`, '0.3')}
${url(`${SITE}/llms-full.txt`, '0.3')}
${url(`${SITE}/gst-rates.json`, '0.3')}
</urlset>
`;
}

