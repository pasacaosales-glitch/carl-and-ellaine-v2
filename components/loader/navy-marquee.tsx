'use client';

import React from 'react';
import { PhotoMarquee } from '@/components/loader/invite-photo-backdrop';
import './navy-invite.css';

/**
 * Navy-tinted couple-photo marquee from the navy loader (loadingScreen.plainLayout "navy").
 * Shared by the loader, the envelope and the home hero so the background carries straight through.
 */
export function NavyMarquee({
  photos,
  reduceMotion,
  className = '',
}: {
  photos: readonly string[];
  reduceMotion: boolean;
  className?: string;
}) {
  if (!photos.length) return null;
  return (
    <div className={`nv-marquee ${className}`.trim()} aria-hidden="true">
      <PhotoMarquee photos={photos} copies={reduceMotion ? 1 : 2} variant="loader" shuffle={false} />
      <div className="nv-marquee__tint" />
    </div>
  );
}
