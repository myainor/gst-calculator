import { describe, it, expect } from 'vitest';
import { FAQ, EXAMPLES, ALL_QA } from '../src/data/faq.js';
import { SLABS } from '../src/data/rates.js';
import { CURRENT_RATES, LEGACY_RATES } from '../src/lib/gst.js';
import { structuredData, jsonLd, llmsTxt, llmsFullTxt, ratesJson, robotsTxt, sitemapXml, SITE } from '../scripts/site.mjs';

describe('FAQ data', () => {
  it('has unique ids and no empty answers', () => {
    const ids = FAQ.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of ALL_QA) {
      expect(f.q.length).toBeGreaterThan(8);
      expect(f.a.length).toBeGreaterThan(30);
    }
  });

  it('computes the worked examples with the calculator, not by hand', () => {
    const ex = EXAMPLES.find((e) => e.id === 'ex-1');
    expect(ex.answer).toContain('₹1,800.00');
    expect(ex.answer).toContain('₹11,800.00');
    const inc = EXAMPLES.find((e) => e.id === 'ex-3');
    expect(inc.answer).toContain('₹1,00,000.00');
    const inter = EXAMPLES.find((e) => e.id === 'ex-4');
    expect(inter.answer).toContain('IGST 5%');
  });

  it('never mentions a rate the calculator does not offer as current', () => {
    const rates = ratesJson().slabs.map((s) => s.rate);
    expect(rates).toEqual([...CURRENT_RATES, ...LEGACY_RATES]);
    expect(CURRENT_RATES).not.toContain(12);
    expect(CURRENT_RATES).not.toContain(28);
  });
});

describe('generated SEO files', () => {
  it('FAQPage covers every question and answer', () => {
    const faq = structuredData()['@graph'].find((n) => n['@type'] === 'FAQPage');
    expect(faq.mainEntity).toHaveLength(ALL_QA.length);
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(ALL_QA[0].a);
  });

  it('escapes "<" so JSON-LD cannot close its own script tag', () => {
    expect(jsonLd()).not.toContain('<');
    expect(JSON.parse(jsonLd())['@graph']).toBeTruthy();
  });

  it('gst-rates.json lists every slab with a CGST/SGST half', () => {
    const j = ratesJson();
    expect(j.slabs).toHaveLength(SLABS.length);
    expect(j.slabs.find((s) => s.rate === 18)).toMatchObject({ cgst: 9, sgst: 9, igst: 18 });
  });

  it('llms.txt and llms-full.txt follow the format and contain the content', () => {
    expect(llmsTxt().startsWith('# ')).toBe(true);
    expect(llmsTxt()).toContain('> ');
    const full = llmsFullTxt();
    for (const { q } of ALL_QA) expect(full).toContain(q);
  });

  it('robots.txt allows AI crawlers and points at the sitemap', () => {
    const r = robotsTxt();
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) expect(r).toContain(`User-agent: ${bot}`);
    expect(r).not.toMatch(/Disallow:\s*\//);
    expect(r).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  it('sitemap has absolute URLs and a lastmod', () => {
    const s = sitemapXml('2026-11-20');
    expect(s).toContain(`<loc>${SITE}/</loc><lastmod>2026-11-20</lastmod>`);
  });
});
