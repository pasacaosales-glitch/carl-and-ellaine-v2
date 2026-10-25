'use client';

import React, { useEffect, useRef } from 'react';
import './plain-bubbles.css';

// Pink motes rising through the navy: [x %, y % of the navy band, size px, drift px, duration s, delay s, peak opacity]
const MOTES: [number, number, number, number, number, number, number][] = [
  [12, 78, 4, 10, 16, 0, 0.75], [34, 52, 3, -8, 19, -7, 0.6], [57, 88, 5, 12, 17, -12, 0.8],
  [79, 64, 3, -10, 21, -4, 0.65], [91, 92, 4, 6, 18, -15, 0.7], [24, 96, 3, -6, 20, -10, 0.6],
  [68, 40, 4, 8, 22, -18, 0.6], [46, 72, 3, -12, 18, -2, 0.7],
];

type PlainBubblesProps = {
  /** Use fixed positioning (envelope hero covers the viewport). */
  fixed?: boolean;
  className?: string;
};

/** Dusk sky (plain mode backgrounds), plain CSS: deep navy at the top, a teal
 *  band, scalloped mauve/rose/blush cloud edges drifting through it, then blush
 *  fading to pale pink. Blooms breathe, clouds drift and swell, a horizon glow
 *  pulses and a few pink motes rise through the navy — all paused while the
 *  section is off screen. */
export function PlainBubbles({ fixed = false, className = '' }: PlainBubblesProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Only animate while visible (many sections share this backdrop).
  // Toggled straight on the DOM node — no re-renders.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.active = '';
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.dataset.active = '';
      else delete el.dataset.active;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`plain-sky${fixed ? ' plain-sky--fixed' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <span className="plain-sky__haze plain-sky__haze--teal" />
      <span className="plain-sky__glow" />
      <span className="plain-sky__haze plain-sky__haze--mauve" />
      <span className="plain-sky__cloud plain-sky__cloud--back" />
      <span className="plain-sky__cloud plain-sky__cloud--mid" />
      <span className="plain-sky__cloud plain-sky__cloud--front" />
      <span className="plain-sky__haze plain-sky__haze--rose" />
      <span className="plain-sky__haze plain-sky__haze--pale" />
      <span className="plain-sky__motes">
        {MOTES.map(([x, y, s, dx, dur, delay, o], i) => (
          <span
            key={i}
            className={`plain-sky__mote${i >= 5 ? ' plain-sky__mote--extra' : ''}`}
            style={
              {
                '--x': `${x}%`,
                '--y': `${y}%`,
                '--s': `${s}px`,
                '--dx': `${dx}px`,
                '--dur': `${dur}s`,
                '--delay': `${delay}s`,
                '--o': o,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
    </div>
  );
}
