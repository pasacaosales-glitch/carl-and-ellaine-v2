'use client';

import React from 'react';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';
import localFont from 'next/font/local';
import { NavyMarquee } from '@/components/loader/navy-marquee';
import { InfinityLoader } from '@/components/loader/InfinityLoader';
import './navy-invite.css';

// Same type system as the hero (components/sections/hero.tsx):
// Cinzel small caps · The Seasons display · Above the Beyond script · Sorts Mill Goudy italic (global @font-face)
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--nv-font-cinzel',
});

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
  variable: '--nv-font-seasons',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
  variable: '--nv-font-script',
});

export interface NavyInviteConfig {
  decos: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string };
  curtains?: boolean;
  backgroundMarquee?: boolean;
  linesAbove: string[];
  joiner: string;
  timeInWords: boolean;
  verse: string;
  verseCitation: string;
}

interface NavyInviteProps {
  invite: NavyInviteConfig;
  groom: string;
  bride: string;
  weddingDate: Date | null;
  ceremonyTime: string;
  venueName: string;
  venueAddress: string;
  countdownText: string;
  statusMessage?: string;
  statusKey: number;
  reduceMotion: boolean;
  /** Background marquee photos (already URL-encoded); empty = plain navy sky */
  photos?: readonly string[];
}

// Curtain opening, played before the card (skipped when invite.curtains is false)
const CURTAIN = {
  // A light leak glows through the seam first, then the folds are drawn to the wings
  open: 550,
  // Everything on the card is scheduled from this point (drapes are mostly open)
  stage: 1700,
};

// Card choreography (ms after the stage opens) — CSS-delay driven so it plays in sync before hydration:
// florals settle in → verse → invitation lines → names rise letter by letter → divider → date → time & venue → countdown
const T = {
  florals: 0,
  floralStagger: 160,
  frame: 300,
  verse: 500,
  lines: 650,
  lineStagger: 200,
  groom: 1300,
  letterStagger: 80,
  joiner: 2000,
  bride: 2350,
  divider: 3400,
  date: 3650,
  time: 4450,
  venue: 4750,
  status: 5600,
};

// Folds per drape. Index 0 hangs at the wall; the last fold is the leading edge at the centre seam.
const CURTAIN_FOLDS = 8;

const NUMBER_WORDS = [
  'twelve', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
];

// "2:00 PM" → "At two o'clock in the afternoon"; unparseable input is returned as-is
function timeToWords(time: string) {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?$/);
  if (!m) return time;
  const hour12 = Number(m[1]) % 12;
  const minutes = Number(m[2] ?? 0);
  const pm = m[3].toLowerCase() === 'p';
  const hour24 = hour12 + (pm ? 12 : 0);
  if (hour24 === 12 && minutes === 0) return 'At twelve noon';
  const period = hour24 < 12 ? 'in the morning' : hour24 < 17 ? 'in the afternoon' : 'in the evening';
  const hourWord = NUMBER_WORDS[hour12];
  const clock =
    minutes === 0
      ? `${hourWord} o'clock`
      : minutes === 30
        ? `half past ${hourWord}`
        : `${hourWord} ${m[2]}`;
  return `At ${clock} ${period}`;
}

// Blush dust drifting up through the navy sky
const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 11 + ((i * 5) % 9),
  delay: -((i * 2.7) % 16),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 13) % 26)),
}));

// One name as individually animated letters: each rises into place, then a slow light wave runs across them
function NameLetters({ name, start, at }: { name: string; start: number; at: (ms: number) => React.CSSProperties }) {
  const letters = Array.from(name);
  return (
    <span className={`${theSeasons.className} nv-names__name`} aria-hidden="true">
      {letters.map((ch, i) => (
        <span
          key={i}
          className="nv-letter"
          style={
            {
              ...at(start + i * T.letterStagger),
              '--i': i,
              '--n': letters.length,
            } as React.CSSProperties
          }
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

export function NavyInvite({
  invite,
  groom,
  bride,
  weddingDate,
  ceremonyTime,
  venueName,
  venueAddress,
  countdownText,
  statusMessage,
  statusKey,
  reduceMotion,
  photos = [],
}: NavyInviteProps) {
  const curtains = invite.curtains !== false;
  const stage = curtains ? CURTAIN.stage : 0;
  const at = (ms: number) => ({ '--nv-d': `${stage + ms}ms` }) as React.CSSProperties;

  const date = weddingDate
    ? {
        month: weddingDate.toLocaleString('en-US', { month: 'long' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;
  const timeLine = ceremonyTime && invite.timeInWords ? timeToWords(ceremonyTime) : ceremonyTime;
  const lines = invite.linesAbove.filter(Boolean);

  return (
    <div
      className={`nv-root ${cinzel.variable} ${theSeasons.variable} ${aboveTheBeyond.variable}${curtains ? ' has-curtains' : ''}${photos.length ? ' has-marquee' : ''}`}
    >
      <NavyMarquee photos={photos} reduceMotion={reduceMotion} />

      <div className="nv-sky" aria-hidden="true">
        <div className="nv-sky__stars" />
        <div className="nv-sky__stars nv-sky__stars--slow" />
        <div className="nv-sky__spot" style={at(-700)} />
      </div>

      {!reduceMotion && (
        <div className="nv-dust" aria-hidden="true">
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="nv-dust__mote"
              style={
                {
                  '--x': `${s.x}%`,
                  '--size': `${s.size}px`,
                  '--dur': `${s.dur}s`,
                  '--delay': `${s.delay}s`,
                  '--drift': `${s.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {curtains && (
        <div className="nv-curtains" aria-hidden="true" style={{ '--nv-d': `${CURTAIN.open}ms` } as React.CSSProperties}>
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className={`nv-curtain nv-curtain--${side}`}>
              {Array.from({ length: CURTAIN_FOLDS }, (_, i) => (
                <span
                  key={i}
                  className="nv-curtain__fold"
                  style={
                    {
                      '--i': i,
                      // Folds nearest the seam are pulled first; the rest follow like real fabric
                      '--inner': CURTAIN_FOLDS - 1 - i,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ))}
          <span className="nv-seam" />
        </div>
      )}

      <div className="nv-frame" style={at(T.frame)} aria-hidden="true" />

      <div className="nv-corners" aria-hidden="true">
        {(
          [
            ['tl', invite.decos.topLeft, 720, 584],
            ['tr', invite.decos.topRight, 714, 615],
            ['bl', invite.decos.bottomLeft, 733, 454],
            ['br', invite.decos.bottomRight, 719, 439],
          ] as const
        ).map(([pos, src, w, h], i) =>
          src ? (
            <div key={pos} className={`nv-corner nv-corner--${pos}`} style={at(T.florals + i * T.floralStagger)}>
              <div className="nv-corner__bloom">
                <Image src={src} alt="" width={w} height={h} priority className="nv-corner__img" />
              </div>
            </div>
          ) : null,
        )}
      </div>

      <main className="nv-card">
        {invite.verse && (
          <figure className="nv-verse nv-verse--top nv-in" style={at(T.verse)}>
            {invite.verseCitation && <figcaption className="nv-verse__cite">{invite.verseCitation}</figcaption>}
            <blockquote className="nv-verse__text">“{invite.verse}”</blockquote>
          </figure>
        )}

        {lines.length > 0 && (
          <div className="nv-lines">
            {lines.map((line, i) => (
              <p key={i} className="nv-line nv-track-in" style={at(T.lines + i * T.lineStagger)}>
                {line}
              </p>
            ))}
          </div>
        )}

        <h1 className="nv-names" aria-label={`${groom} ${invite.joiner} ${bride}`}>
          <NameLetters name={groom} start={T.groom} at={at} />
          {invite.joiner && (
            // "and" sits on its own row, with rose-gold hairlines drawing out to either side once it is written
            <span className="nv-names__joiner-row" style={at(T.joiner)} aria-hidden="true">
              <span className="nv-names__flourish nv-names__flourish--left" />
              <span className={`${aboveTheBeyond.className} nv-names__joiner`}>{invite.joiner}</span>
              <span className="nv-names__flourish nv-names__flourish--right" />
            </span>
          )}
          <NameLetters name={bride} start={T.bride} at={at} />
        </h1>

        <div className="nv-divider" style={at(T.divider)} aria-hidden="true">
          <span className="nv-divider__line" />
          <span className="nv-divider__gem" />
          <span className="nv-divider__line" />
        </div>

        {date && (
          <div className="nv-date" role="img" aria-label={date.label}>
            <div className="nv-date__row">
              <span className="nv-date__side nv-date__side--month" style={at(T.date + 350)}>
                {date.month}
              </span>
              <span className="nv-date__rule" style={at(T.date + 150)} />
              <span className={`${theSeasons.className} nv-date__day`}>
                {Array.from(date.day).map((digit, i) => (
                  <span key={i} className="nv-date__digit">
                    <span className="nv-date__digit-inner" style={at(T.date + 150 + i * 150)}>
                      {digit}
                    </span>
                  </span>
                ))}
              </span>
              <span className="nv-date__rule" style={at(T.date + 150)} />
              <span className="nv-date__side nv-date__side--year" style={at(T.date + 350)}>
                {date.year}
              </span>
            </div>
          </div>
        )}

        {timeLine && (
          <p className="nv-time nv-wipe" style={at(T.time)}>
            {timeLine}
          </p>
        )}

        {(venueName || venueAddress) && (
          <div className="nv-venue" style={at(T.venue)}>
            {venueName && <p className="nv-venue__name nv-wipe">{venueName}</p>}
            {venueAddress && (
              <p className="nv-venue__address nv-in" style={at(T.venue + 300)}>
                {venueAddress}
              </p>
            )}
          </div>
        )}

      </main>

      {/* Loading progress, anchored to the bottom of the screen below the card */}
      <div className="nv-status nv-in" style={at(T.status)}>
        {countdownText && <p className="nv-status__countdown">{countdownText}</p>}
        <InfinityLoader className="nv-loader" label="Loading invitation" />
        {statusMessage && (
          <p key={statusKey} className="nv-status__message">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
