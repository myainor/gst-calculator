/**
 * GST rate slabs, in one place. The calculator, the rates table, the FAQ and
 * the published gst-rates.json all read from here.
 *
 * Sources:
 *  - CBIC Notification No. 9/2025-Integrated Tax (Rate), effective 22 Sep 2025
 *  - GST Council 56th meeting press release (PIB), September 2025
 * Rates change. Which one applies depends on what is supplied.
 */

export const RATES_EFFECTIVE = '2025-09-22';
export const RATES_EFFECTIVE_LABEL = '22 September 2025';
export const RATES_CHECKED = '2026-11-20';

export const SOURCES = [
  { label: 'CBIC Notification 9/2025-Integrated Tax (Rate)', url: 'https://courier.cbic.gov.in/ECCS/advisory/2025/NOTIFICATION%20NO.%209_2025-INTEGRATED%20TAX%20(RATE)%20-1759486719.pdf' },
  { label: 'GST Council press release, September 2025', url: 'https://gstcouncil.gov.in/sites/default/files/2025-09/press_release_press_information_bureau.pdf' },
  { label: 'PIB: GST Council 56th meeting', url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2164586&lang=2&reg=48' },
];

/**
 * status: 'current' rates get a main button. 'legacy' ones sit under "Older or rare".
 * `igst` is the same number as `rate`; CGST and SGST are each half of it.
 */
export const SLABS = [
  { rate: 0, status: 'current', name: 'Nil and exempt', appliesTo: 'Exempt and nil-rated supplies. The GST Council\'s September 2025 release lists Indian breads such as roti, chapati and paratha, UHT milk, pre-packaged and labelled paneer, individual life and health insurance, and 33 lifesaving drugs.' },
  { rate: 0.25, status: 'current', name: 'Special rate', appliesTo: 'Specified goods listed in Schedule V of Notification 9/2025-Integrated Tax (Rate).' },
  { rate: 1.5, status: 'current', name: 'Special rate', appliesTo: 'Specified goods listed in Schedule VI of Notification 9/2025-Integrated Tax (Rate).' },
  { rate: 3, status: 'current', name: 'Special rate', appliesTo: 'Specified goods listed in Schedule IV of Notification 9/2025-Integrated Tax (Rate).' },
  { rate: 5, status: 'current', name: 'Merit rate', appliesTo: 'Many everyday items. The release names hair oil, toilet soap bars, shampoo, toothpaste, bicycles, packaged namkeen, butter and ghee, and most medicines.' },
  { rate: 18, status: 'current', name: 'Standard rate', appliesTo: 'Most other goods and services. The release names cement, air conditioners, TVs, small cars and motorcycles up to 350 cc, which moved down from 28%.' },
  { rate: 40, status: 'current', name: 'De-merit rate', appliesTo: 'A select few sin and luxury goods and services. Some tobacco products stay on their old rates until a later date.' },
  { rate: 12, status: 'legacy', name: 'Abolished', appliesTo: 'The old 12% slab ended on 22 September 2025. Most goods moved to 5% or 18%. Still seen on invoices dated before then.' },
  { rate: 28, status: 'legacy', name: 'Now rare', appliesTo: 'The old 28% slab ended for most goods on 22 September 2025. It now applies only to a few specified goods in Schedule VII. Still seen on earlier invoices.' },
];
