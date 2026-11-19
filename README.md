# GST Calculator

[![CI](https://github.com/myainor/gst-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/myainor/gst-calculator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A free, private GST calculator for India. Add GST to a price or take it out of a total, see CGST, SGST and IGST split out, and get the amount in words. It runs entirely in your browser, so nothing you type is sent anywhere.

**Use it: [gst.freelysta.com](https://gst.freelysta.com)**

![GST Calculator](docs/screenshot.png)

## Features

- **Add or remove GST.** Price before GST, or a total that already includes it.
- **CGST + SGST or IGST.** Same-state sales split the tax in two; other-state sales show IGST.
- **Every slab.** 0%, 0.25%, 3%, 5%, 18% and 40%, the older 12% and 28% for earlier invoices, and any custom rate.
- **Amount in words**, with lakh and crore, for tax invoices.
- **Exact maths.** Money is held in paise and rates in basis points, with `BigInt` for the products, so there are no floating-point errors even at ₹10,000 crore.
- **Shareable.** "Copy link" puts the inputs in the URL; "Copy summary" gives plain text for a chat or email.
- **Private.** No server, no accounts, no cookies, no analytics. Your amounts are never stored.
- **Light and dark themes**, keyboard friendly, and works on a phone.

## How it calculates

| | Formula |
| --- | --- |
| Add GST | `GST = price × rate ÷ 100`, `total = price + GST` |
| Remove GST | `price = total × 100 ÷ (100 + rate)`, `GST = total − price` |
| Same state | `CGST = GST ÷ 2` (rounded down), `SGST = GST − CGST` |
| Other state | `IGST = GST` |

GST is rounded once, to the nearest paisa (half rounds up). If it comes to an odd number of paise, the spare paisa goes to SGST so CGST and SGST always add up. A GST invoice that rounds each line separately can differ from this by a paisa or two.

## About the rates

The slabs follow the GST rate rationalisation that took effect on 22 September 2025, when 12% and 28% were replaced for most goods. Which rate applies depends on what you sell, and rates change, so the calculator never picks one for you. Confirm the rate with the [CBIC](https://cbic-gst.gov.in) or your chartered accountant. This is a calculator for guidance, not tax advice.

Rates live in [`src/lib/gst.js`](src/lib/gst.js) (`CURRENT_RATES`, `LEGACY_RATES`). If a slab changes, that is the one place to edit.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 28 tests for the maths, formatting and share links
npm run build      # static site in dist/
```

Requires Node 20 or newer.

## Host it yourself

`npm run build` produces a plain static site in `dist/`. Put it on any static host or web server. It makes no network requests, fonts are bundled, and it needs no server-side code. If you serve it from a path other than `/`, set `base` in `vite.config.js`.

## Project layout

```
src/lib/gst.js          the maths, formatting, amount in words and URL state (no UI code)
src/App.jsx             the calculator
src/components/         result card, segmented control, FAQ, icons
src/styles.css          all styling, themes are custom properties
test/gst.test.js        tests for src/lib/gst.js
scripts/og/og.html      source for the social preview image
```

## Contributing

Bug reports and pull requests are welcome. Please add a test for any change to the maths. Rate changes only need an edit to `src/lib/gst.js` and its tests.

## License

[MIT](LICENSE). Made by [Freelysta](https://freelysta.com). Looking for a full invoice? Try the free, open-source [invoice generator](https://github.com/myainor/invoice-generator).
