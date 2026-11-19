import { useId } from 'react';

/** Two-or-more option switch with a sliding thumb. Behaves as a radio group. */
export default function Segmented({ label, value, options, onChange }) {
  const id = useId();
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  const onKey = (e) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    document.getElementById(`${id}-${next.value}`)?.focus();
  };

  return (
    <div
      className="seg"
      role="radiogroup"
      aria-label={label}
      style={{ '--n': options.length, '--i': index }}
      onKeyDown={onKey}
    >
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          id={`${id}-${o.value}`}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          className="seg-opt"
          onClick={() => onChange(o.value)}
        >
          <span className="seg-main">{o.label}</span>
          {o.hint && <span className="seg-hint">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}
