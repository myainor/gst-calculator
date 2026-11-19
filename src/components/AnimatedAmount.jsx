import { useEffect, useRef, useState } from 'react';
import { formatPaise } from '../lib/gst.js';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * A rupee figure that counts to its new value. The animated digits are hidden from
 * assistive technology; a plain copy of the final value is what gets read out.
 */
export default function AnimatedAmount({ paise }) {
  const [shown, setShown] = useState(paise);
  const from = useRef(paise);

  useEffect(() => {
    if (prefersReducedMotion() || from.current === paise) {
      from.current = paise;
      setShown(paise);
      return undefined;
    }
    const start = from.current;
    const t0 = performance.now();
    const DURATION = 380;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / DURATION);
      const eased = 1 - (1 - t) ** 3;
      from.current = Math.round(start + (paise - start) * eased);
      setShown(from.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paise]);

  return (
    <>
      <span aria-hidden="true"><span className="cur">₹</span>{formatPaise(shown)}</span>
      <span className="sr-only">₹{formatPaise(paise)}</span>
    </>
  );
}
