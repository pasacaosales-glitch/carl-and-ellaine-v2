'use client';

import React, { useId } from 'react';
import { useReducedMotion } from 'motion/react';
import './infinity-loader.css';

interface InfinityLoaderProps {
  className?: string;
  label?: string;
}

// Two-lobed infinity curve crossing at the centre (viewBox 100 × 50)
const INFINITY_PATH =
  'M50 25 C38 9 14 9 14 25 C14 41 38 41 50 25 C62 9 86 9 86 25 C86 41 62 41 50 25 Z';

// Hairline infinity symbol: a stroke slowly draws in and lets go, while a glowing comet
// with a short tail laps the curve and the crossing point glints as it passes.
// Colors: --infinity-from / --infinity-to (default: text color). Speed: --infinity-duration
// for the draw; the comet laps twice per draw cycle (LAP_SECONDS keeps the SVG motion in step).
const LAP_SECONDS = 2.25;

export function InfinityLoader({ className = '', label = 'Loading' }: InfinityLoaderProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const gradientId = `infinity-grad-${uid}`;
  const glowId = `infinity-glow-${uid}`;
  const pathId = `infinity-path-${uid}`;

  return (
    <div className={`infinity-loader ${className}`.trim()} role="status" aria-label={label}>
      <svg viewBox="0 0 100 50" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" className="infinity-loader__stop-from" />
            <stop offset="50%" className="infinity-loader__stop-to" />
            <stop offset="100%" className="infinity-loader__stop-from" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path id={pathId} className="infinity-loader__track" d={INFINITY_PATH} />
        <path
          className="infinity-loader__line"
          d={INFINITY_PATH}
          pathLength={100}
          stroke={`url(#${gradientId})`}
        />

        {!reduceMotion && (
          <g className="infinity-loader__comet" filter={`url(#${glowId})`}>
            <path className="infinity-loader__tail" d={INFINITY_PATH} pathLength={100} />
            <circle className="infinity-loader__head" r="1.5">
              <animateMotion dur={`${LAP_SECONDS}s`} repeatCount="indefinite" rotate="auto">
                <mpath href={`#${pathId}`} />
              </animateMotion>
            </circle>
          </g>
        )}

        <g className="infinity-loader__glint" transform="translate(50 25)">
          <path d="M0 -3.2 L0.7 -0.7 L3.2 0 L0.7 0.7 L0 3.2 L-0.7 0.7 L-3.2 0 L-0.7 -0.7 Z" />
        </g>
      </svg>
    </div>
  );
}
