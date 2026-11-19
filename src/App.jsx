import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CURRENT_RATES, LEGACY_RATES, DEFAULTS, parseAmount, parseRate, calculate, groupIndian,
  amountInWords, toQuery, fromQuery,
} from './lib/gst.js';
import Segmented from './components/Segmented.jsx';
import Result from './components/Result.jsx';
import Faq from './components/Faq.jsx';
import { Sun, Moon, Github, Shield, Mark } from './components/Icons.jsx';

const MODES = [
  { value: 'exclusive', label: 'Add GST', hint: 'Price is before GST' },
  { value: 'inclusive', label: 'Remove GST', hint: 'Price includes GST' },
];
const SUPPLY = [
  { value: 'intra', label: 'Same state', hint: 'CGST + SGST' },
  { value: 'inter', label: 'Other state', hint: 'IGST' },
];

/** "118000.5" → "1,18,000.5": group the whole part, keep the decimals the way they were typed. */
function tidy(raw) {
  const s = String(raw).replace(/[₹,\s]/g, '');
  if (!s) return '';
  const [whole, frac] = s.split('.');
  const grouped = groupIndian(String(Number(whole || '0')));
  return frac === undefined ? grouped : `${grouped}.${frac}`;
}

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0a0b10' : '#f4f6fb');
    try { localStorage.setItem('gst-theme', next); } catch { /* private mode: the choice just won't persist */ }
    setTheme(next);
  };
  return [theme, toggle];
}

export default function App() {
  const [state, setState] = useState(() => fromQuery(window.location.search));
  // True while the rate comes from the free-text box rather than one of the buttons.
  const [custom, setCustom] = useState(() => {
    const bp = parseRate(fromQuery(window.location.search).rate);
    return ![...CURRENT_RATES, ...LEGACY_RATES].some((r) => Math.round(r * 100) === bp);
  });
  const [theme, toggleTheme] = useTheme();
  const amountRef = useRef(null);
  const set = (patch) => setState((s) => ({ ...s, ...patch }));

  const amount = parseAmount(state.amount);
  const rateBp = parseRate(state.rate);
  const rateOk = rateBp !== null;

  const result = useMemo(
    // Until both inputs are valid there is nothing honest to show, so show zeros rather than a half answer.
    () => calculate({ amount: amount !== null && rateOk ? amount : 0, rateBp: rateOk ? rateBp : 0, mode: state.mode, supply: state.supply }),
    [amount, rateBp, rateOk, state.mode, state.supply],
  );

  // Keep the address bar in step so any state can be bookmarked or shared.
  useEffect(() => {
    const next = `${window.location.pathname}${toQuery(state)}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, '', next);
  }, [state]);

  const onAmount = (e) => {
    const v = e.target.value;
    if (v === '' || parseAmount(v) !== null) set({ amount: v });
  };

  const isChip = (r) => !custom && rateOk && rateBp === Math.round(r * 100);
  const pickRate = (r) => { setCustom(false); set({ rate: String(r) }); };
  const onCustom = (e) => {
    const v = e.target.value.replace('%', '');
    if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) { setCustom(true); set({ rate: v }); }
  };

  const reset = () => {
    setCustom(false);
    setState({ ...DEFAULTS });
    amountRef.current?.focus();
  };

  const words = amount ? amountInWords(amount) : '';

  return (
    <>
      <a className="skip" href="#calc">Skip to the calculator</a>
      <div className="bg" aria-hidden="true"><i className="bg-a" /><i className="bg-b" /><i className="bg-grid" /></div>

      <header className="bar">
        <div className="wrap bar-in">
          <a className="brand" href="/" aria-label="GST Calculator home">
            <Mark /><span>GST<b>calc</b></span>
          </a>
          <nav className="bar-nav" aria-label="Site">
            <a className="bar-link" href="https://invoice.freelysta.com" target="_blank" rel="noopener noreferrer">Invoice generator</a>
            <a className="icon-btn" href="https://github.com/myainor/gst-calculator" target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub"><Github /></a>
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
          </nav>
        </div>
      </header>

      <main className="wrap">
        <section className="intro">
          <span className="pill"><Shield />Free · Private · Runs in your browser</span>
          <h1>Add or remove <span className="grad">GST</span> in a second.</h1>
          <p>CGST, SGST and IGST split out, with the amount in words. Nothing you type leaves your device.</p>
        </section>

        <div className="grid" id="calc">
          <section className="card form" aria-labelledby="form-title">
            <h2 id="form-title" className="sr-only">Inputs</h2>

            <div className="field">
              <label htmlFor="amount">{state.mode === 'inclusive' ? 'Amount including GST' : 'Amount before GST'}</label>
              <div className={`amount${amount === null ? ' has-error' : ''}`}>
                <span className="amount-cur" aria-hidden="true">₹</span>
                <input
                  id="amount"
                  ref={amountRef}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  autoFocus
                  placeholder="0.00"
                  value={state.amount}
                  onChange={onAmount}
                  onBlur={() => set({ amount: tidy(state.amount) })}
                  aria-describedby="amount-words"
                />
              </div>
              <p id="amount-words" className="help">{words || 'Type a number, like 1,00,000'}</p>
            </div>

            <div className="field">
              <span className="label" id="mode-label">What does the amount include?</span>
              <Segmented label="What does the amount include?" value={state.mode} options={MODES} onChange={(mode) => set({ mode })} />
            </div>

            <div className="field">
              <span className="label" id="rate-label">GST rate</span>
              <div className="chips chips-main" role="group" aria-labelledby="rate-label">
                {CURRENT_RATES.map((r) => (
                  <button key={r} type="button" className="chip" aria-pressed={isChip(r)} onClick={() => pickRate(r)}>
                    {r}%
                  </button>
                ))}
              </div>
              <div className="chips chips-legacy" role="group" aria-label="Older or rarely used GST rates">
                <span className="chips-tag">Older or rare</span>
                {LEGACY_RATES.map((r) => (
                  <button key={r} type="button" className="chip chip-sm" aria-pressed={isChip(r)} onClick={() => pickRate(r)}>
                    {r}%
                  </button>
                ))}
                <label className={`custom${custom ? ' is-active' : ''}${!rateOk && state.rate !== '' ? ' has-error' : ''}`}>
                  <span className="sr-only">Custom GST rate in percent</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Other"
                    value={custom ? state.rate : ''}
                    onChange={onCustom}
                    aria-invalid={!rateOk}
                  />
                  <span aria-hidden="true">%</span>
                </label>
              </div>
              {!rateOk && <p className="help help-error" role="alert">Enter a rate between 0 and 100.</p>}
            </div>

            <div className="field">
              <span className="label" id="supply-label">Where is the sale?</span>
              <Segmented label="Where is the sale?" value={state.supply} options={SUPPLY} onChange={(supply) => set({ supply })} />
            </div>
          </section>

          <Result result={result} state={state} onReset={reset} />
        </div>

        <aside className="cta" aria-label="Related tool">
          <div>
            <strong>Need a full GST invoice?</strong>
            <span>Make one free with PDF output, GST built in and no watermark.</span>
          </div>
          <a className="btn btn-primary" href="https://invoice.freelysta.com" target="_blank" rel="noopener noreferrer">Open the invoice generator</a>
        </aside>

        <Faq />
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <p>
            Made by <a href="https://freelysta.com" target="_blank" rel="noopener noreferrer">Freelysta</a>, the workspace for freelancers.
            Open source under the MIT license on <a href="https://github.com/myainor/gst-calculator" target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
          <p className="fine">A calculator for guidance, not tax advice. GST rates depend on what you sell and change over time, so check the current rate with the CBIC or your chartered accountant.</p>
        </div>
      </footer>
    </>
  );
}
