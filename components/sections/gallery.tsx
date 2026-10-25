"use client"

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import localFont from "next/font/local"
import { X, ChevronLeft, ChevronRight, Camera, Maximize2 } from "lucide-react"
import { Cinzel } from "next/font/google"
import { Section } from "@/components/section"
import { sectionType } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { CornerFlorals } from "@/components/corner-florals"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Palette lives in globals.css → motif / welcome tokens.
// The header sits on the navy part of the sky (light ink); the footnote on the blush (navy ink).
const C = {
  title: "var(--color-motif-soft)",
  script: "var(--color-motif-accent)",
  eyebrow: "var(--color-motif-accent)",
  body: "color-mix(in srgb, var(--color-motif-soft) 92%, transparent)",
  soft: "var(--color-welcome-navy)",
  accent: "var(--color-motif-accent)",
  leaf: "var(--color-motif-yellow)",
  blue: "var(--color-welcome-heading)",
  deep: "var(--color-motif-deep)",
  paper: "var(--color-welcome-bg-soft)",
  light: "var(--color-motif-soft)",
} as const

// Same circle pattern as the video / love story / details sections (PlainBubbles paints the base)
const sectionBg = "var(--color-bg-pattern-base)"

// Navy edge so the light header text stays crisp over the navy sky
const onNavyGlow = "0 1px 2px rgb(1 46 75 / 85%), 0 0 18px rgb(1 46 75 / 60%)"

// Sage hairlines either side of a sunshine diamond
const lineRight = {
  background: "linear-gradient(to right, transparent, var(--color-motif-yellow))",
} as const
const lineLeft = {
  background: "linear-gradient(to left, transparent, var(--color-motif-yellow))",
} as const

const frameStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow: "0 14px 30px -18px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
}

const innerFrameStyle: React.CSSProperties = {
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-motif-soft) 70%, transparent)",
}

const badgeStyle: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--color-motif-deep) 75%, transparent)",
  color: C.light,
}

// Soft navy fade at the bottom of a photo so the number reads clearly
const photoShade: React.CSSProperties = {
  background:
    "linear-gradient(to top, color-mix(in srgb, var(--color-welcome-navy) 62%, transparent), transparent 38%)",
}

/** "No. 03 — of 12" lockup in the bottom-left corner of a photo */
function PhotoNumber({ index, total, visible }: { index: number; total: number; visible: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-7 left-5 flex items-end gap-2 text-left text-white transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className={`${cinzel.className} text-3xl font-semibold leading-none md:text-4xl`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className={`${cinzel.className} pb-0.5 text-[0.6rem] uppercase tracking-[0.25em] text-white/80`}>
        of {String(total).padStart(2, "0")}
      </span>
    </div>
  )
}

function DiamondDivider({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="h-px w-10 sm:w-16 md:w-20" style={lineRight} />
      {children ?? (
        <span className="h-1.5 w-1.5 rotate-45" style={{ background: C.accent }} aria-hidden />
      )}
      <span className="h-px w-10 sm:w-16 md:w-20" style={lineLeft} />
    </div>
  )
}

const galleryTitleSize = {
  main: "clamp(1.65rem, 8.5vw, 4.5rem)",
  script: "clamp(0.95rem, 4.8vw, 2.7rem)",
} as const

function GalleryTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": galleryTitleSize.main,
          "--script-size": galleryTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">{title} — {subtitle}</span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", color: C.title, textShadow: onNavyGlow }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: C.script,
          textShadow: onNavyGlow,
        }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

type GalleryItem = { image: string; text: string }

/**
 * Mobile carousel with endless swiping: the photos are rendered three times and,
 * once a swipe settles in the first or last copy, the strip jumps (invisibly) to
 * the same photo in the middle copy. Dots show and jump to the current photo.
 */
function MobileInfiniteCarousel({
  items,
  onOpen,
  onPointerDown,
  onPointerMove,
}: {
  items: GalleryItem[]
  onOpen: (item: GalleryItem, index: number) => void
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const n = items.length
  const loop = n > 1
  const slides = loop ? [...items, ...items, ...items] : items
  const [active, setActive] = useState(0)

  const slideAt = (i: number) => stripRef.current?.children[i] as HTMLElement | undefined

  const centerOn = useCallback((i: number, behavior: ScrollBehavior) => {
    const strip = stripRef.current
    const slide = strip?.children[i] as HTMLElement | undefined
    if (!strip || !slide) return
    strip.scrollTo({ left: slide.offsetLeft - (strip.clientWidth - slide.clientWidth) / 2, behavior })
  }, [])

  // Index of the slide nearest the centre
  const nearest = () => {
    const strip = stripRef.current
    const first = slideAt(0)
    const second = slideAt(1)
    if (!strip || !first) return 0
    const step = second ? second.offsetLeft - first.offsetLeft : first.clientWidth
    const offset = first.offsetLeft - (strip.clientWidth - first.clientWidth) / 2
    return Math.max(0, Math.min(slides.length - 1, Math.round((strip.scrollLeft - offset) / step)))
  }

  // Start on the first photo of the middle copy
  useLayoutEffect(() => {
    if (loop) centerOn(n, "auto")
  }, [loop, n, centerOn])

  const handleScroll = () => {
    const i = nearest()
    setActive(i % n)
    if (!loop) return
    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      const j = nearest()
      if (j < n) centerOn(j + n, "auto")
      else if (j >= 2 * n) centerOn(j - n, "auto")
    }, 140)
  }

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current)
  }, [])

  // Keep the active thumbnail in view inside the rail (without scrolling the page)
  useEffect(() => {
    const rail = railRef.current
    const thumb = rail?.children[active] as HTMLElement | undefined
    if (!rail || !thumb) return
    rail.scrollTo({ left: thumb.offsetLeft - (rail.clientWidth - thumb.clientWidth) / 2, behavior: "smooth" })
  }, [active])

  return (
    <div className="md:hidden">
      <div
        ref={stripRef}
        onScroll={handleScroll}
        className="relative flex gap-3 overflow-x-auto pt-2 pb-6 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: "10%" }}
        aria-label="Gallery carousel"
      >
        {slides.map((item, i) => {
          const index = i % n
          const isActive = index === active
          return (
            <button
              key={`${item.image}-${i}`}
              type="button"
              className={`group relative snap-center shrink-0 w-[80%] max-w-[360px] rounded-2xl p-1.5 transition-[transform,opacity] duration-500 ${
                isActive ? "scale-100 opacity-100" : "scale-[0.9] opacity-60"
              }`}
              style={frameStyle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onClick={() => onOpen(item, index)}
              aria-label={`Open image ${index + 1}`}
              tabIndex={loop && (i < n || i >= 2 * n) ? -1 : 0}
              aria-hidden={loop && (i < n || i >= 2 * n) ? true : undefined}
            >
              <div className="relative aspect-[3/5] overflow-hidden rounded-xl">
                <Image
                  src={encodeURI(item.image)}
                  alt={item.text || `Gallery image ${index + 1}`}
                  fill
                  sizes="(max-width: 480px) 80vw, 360px"
                  className={`object-cover ${isActive ? "gallery-kenburns" : ""}`}
                  priority={i === n}
                />
                <div className="pointer-events-none absolute inset-0" style={photoShade} />
                <div className="pointer-events-none absolute inset-0 rounded-xl" style={innerFrameStyle} />
                <PhotoNumber index={index} total={n} visible={isActive} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Swipe hint + a rail of thumbnails to jump straight to any photo */}
      {loop && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3" style={{ color: C.blue }}>
            <ChevronLeft className="gallery-swipe-arrow gallery-swipe-arrow--left h-4 w-4" aria-hidden />
            <span
              className={`${cinzel.className} text-[0.62rem] font-semibold uppercase tracking-[0.3em]`}
            >
              Swipe to explore
            </span>
            <ChevronRight className="gallery-swipe-arrow gallery-swipe-arrow--right h-4 w-4" aria-hidden />
          </div>
          <div
            ref={railRef}
            className="flex w-full gap-2 overflow-x-auto px-[calc(50%-1.375rem)] py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Choose a photo"
          >
            {items.map((item, idx) => {
              const isActive = idx === active
              return (
                <button
                  key={item.image + idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Show photo ${idx + 1}`}
                  onClick={() => centerOn(n + idx, "smooth")}
                  className={`relative h-14 w-11 shrink-0 overflow-hidden rounded-md transition-all duration-300 ${
                    isActive ? "scale-110 opacity-100" : "opacity-55"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? `0 0 0 2px #FFFFFF, 0 0 0 3.5px ${C.accent}`
                      : "0 0 0 1px rgb(255 255 255 / 80%)",
                  }}
                >
                  <Image src={encodeURI(item.image)} alt="" fill sizes="44px" className="object-cover" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const SPOTLIGHT_MS = 5000

/**
 * Tablet/desktop spotlight: one large featured portrait that slowly drifts and
 * cross-fades to the next photo, beside a grid of every photo. Hovering a thumbnail
 * features it; hovering anywhere pauses the slideshow; clicking opens the lightbox.
 */
function DesktopSpotlight({
  items,
  onOpen,
}: {
  items: GalleryItem[]
  onOpen: (item: GalleryItem, index: number) => void
}) {
  const n = items.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  // Only mount large images once they've been (or are about to be) featured
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1]))
  const autoplay = n > 1 && !paused && !reduceMotion

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    setSeen((prev) => {
      const next = (active + 1) % n
      if (prev.has(active) && prev.has(next)) return prev
      return new Set(prev).add(active).add(next)
    })
  }, [active, n])

  useEffect(() => {
    if (!autoplay) return
    const timer = setTimeout(() => setActive((a) => (a + 1) % n), SPOTLIGHT_MS)
    return () => clearTimeout(timer)
  }, [active, autoplay, n])

  return (
    <div
      className="hidden md:grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-stretch gap-5 lg:gap-7"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Featured photo */}
      <button
        type="button"
        className="group relative rounded-2xl p-2 transition-shadow duration-300"
        style={frameStyle}
        onClick={() => onOpen(items[active], active)}
        aria-label={`Open image ${active + 1}`}
      >
        <div className="relative h-full min-h-[26rem] overflow-hidden rounded-xl">
          {items.map((item, i) =>
            seen.has(i) ? (
              <Image
                key={item.image + i}
                src={encodeURI(item.image)}
                alt={i === active ? item.text || `Gallery image ${i + 1}` : ""}
                fill
                sizes="(max-width: 1024px) 40vw, 460px"
                priority={i === 0}
                className={`object-cover transition-opacity duration-[1200ms] ease-out ${
                  i === active ? `opacity-100 ${reduceMotion ? "" : "gallery-kenburns"}` : "opacity-0"
                }`}
              />
            ) : null,
          )}
          <div className="pointer-events-none absolute inset-0" style={photoShade} />
          <div className="pointer-events-none absolute inset-0 rounded-xl" style={innerFrameStyle} />

          <span
            className={`${cinzel.className} absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100`}
            style={badgeStyle}
          >
            <Maximize2 className="h-3 w-3" aria-hidden />
            View
          </span>

          <PhotoNumber index={active} total={n} visible />

          {/* Slideshow progress */}
          <div className="absolute inset-x-5 bottom-4 h-[2px] overflow-hidden rounded-full bg-white/25">
            {autoplay && (
              <span
                key={active}
                className="gallery-progress block h-full w-full rounded-full"
                style={{ background: C.accent, "--gallery-progress-ms": `${SPOTLIGHT_MS}ms` } as React.CSSProperties}
              />
            )}
          </div>
        </div>
      </button>

      {/* Every photo */}
      <div className="grid grid-cols-4 content-start gap-3 lg:gap-4">
        {items.map((item, i) => {
          const isActive = i === active
          return (
            <button
              key={item.image + i}
              type="button"
              className={`group relative rounded-lg p-1 transition-all duration-300 hover:-translate-y-0.5 ${
                isActive ? "opacity-100" : "opacity-75 hover:opacity-100"
              }`}
              style={{
                ...frameStyle,
                boxShadow: isActive
                  ? `0 0 0 2px ${C.accent}, ${frameStyle.boxShadow}`
                  : frameStyle.boxShadow,
              }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => onOpen(item, i)}
              aria-label={`Open image ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md">
                <Image
                  src={encodeURI(item.image)}
                  alt={item.text || `Gallery thumbnail ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 18vw, 150px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 rounded-md" style={innerFrameStyle} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Gallery() {
  const { gallery } = useSiteConfig()
  const galleryItems: GalleryItem[] = gallery.images
  const cornerDecos = gallery.cornerDecos

  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchDeltaX, setTouchDeltaX] = useState(0)
  const [zoomScale, setZoomScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null)
  const [pinchStartScale, setPinchStartScale] = useState(1)
  const [lastTap, setLastTap] = useState(0)
  const [panStart, setPanStart] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const pointerStart = useRef({ x: 0, y: 0, dragging: false })
  const swipeConsumed = useRef(false)

  const resetZoom = useCallback(() => {
    setZoomScale(1)
    setPan({ x: 0, y: 0 })
    setPanStart(null)
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedImage(null)
    resetZoom()
  }, [resetZoom])

  const openLightbox = useCallback((item: GalleryItem, index: number) => {
    if (pointerStart.current.dragging) return
    setSelectedImage(item)
    setCurrentIndex(index)
    resetZoom()
  }, [resetZoom])

  const handleThumbPointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY, dragging: false }
  }

  const handleThumbPointerMove = (event: React.PointerEvent) => {
    const dx = event.clientX - pointerStart.current.x
    const dy = event.clientY - pointerStart.current.y
    if (dx * dx + dy * dy > 64) pointerStart.current.dragging = true
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    setCurrentIndex((prevIndex) => {
      const newIndex =
        direction === 'next'
          ? (prevIndex + 1) % galleryItems.length
          : (prevIndex - 1 + galleryItems.length) % galleryItems.length
      setSelectedImage(galleryItems[newIndex])
      return newIndex
    })
    resetZoom()
  }, [resetZoom, galleryItems])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedImage) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateImage('prev')
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateImage('next')
      }
      if (e.key === 'Escape') closeLightbox()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedImage, navigateImage, closeLightbox])

  useEffect(() => {
    if (!selectedImage) return
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [selectedImage])

  // Preload adjacent images for smoother nav
  useEffect(() => {
    if (selectedImage) {
      const next = new window.Image()
      next.src = encodeURI(galleryItems[(currentIndex + 1) % galleryItems.length].image)
      const prev = new window.Image()
      prev.src = encodeURI(galleryItems[(currentIndex - 1 + galleryItems.length) % galleryItems.length].image)
    }
  }, [selectedImage, currentIndex, galleryItems])

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBg }}
    >
      <PlainBubbles />
      <Section
        id="gallery"
        // Extra top / bottom room so the corner florals clear the header and footnote
        className="relative z-10 overflow-hidden pt-24 pb-28 sm:pt-28 sm:pb-36 md:pt-32 md:pb-44 lg:pt-36 lg:pb-52"
      >
        <CornerFlorals decos={cornerDecos} compact />

      {/* Header */}
      <div className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center sm:mb-10 sm:px-4 md:mb-12">
        <DiamondDivider />
        <p
          className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold leading-snug tracking-[0.12em] uppercase min-[400px]:max-w-none min-[400px]:text-[0.75rem] min-[400px]:tracking-[0.16em] sm:mt-5 sm:text-[0.9375rem] sm:tracking-[0.2em] md:text-base md:tracking-[0.22em]`}
          style={{ color: C.eyebrow, textShadow: onNavyGlow }}
        >
          {gallery.eyebrow}
        </p>
        <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
          <GalleryTitle title={gallery.title} subtitle={gallery.subtitle} />
        </div>
        <p
          className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${sectionType.textRelaxed}`}
          style={{ color: C.body, textShadow: onNavyGlow }}
        >
          {gallery.description}
        </p>

        <div className="mt-5 sm:mt-6">
          <DiamondDivider>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8"
              style={{
                border: "1px solid color-mix(in srgb, var(--color-motif-yellow) 70%, transparent)",
                background: "#FFFFFF",
              }}
            >
              <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />
            </span>
          </DiamondDivider>
        </div>
      </div>

      {/* Gallery content */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 sm:px-10 md:px-12 pb-2 sm:pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 sm:h-80 md:h-96">
            <div
              className="h-12 w-12 animate-spin rounded-full border-[3px]"
              style={{
                borderColor: "color-mix(in srgb, var(--color-motif-medium) 35%, transparent)",
                borderTopColor: C.blue,
              }}
            />
          </div>
        ) : (
          <>
            {/* Mobile: endless swipe carousel; bleeds past the side padding for slimmer margins */}
            <div className="-mx-6 sm:-mx-10">
              <MobileInfiniteCarousel
                items={galleryItems}
                onOpen={openLightbox}
                onPointerDown={handleThumbPointerDown}
                onPointerMove={handleThumbPointerMove}
              />
            </div>

            {/* Tablet/Desktop: featured slideshow beside the full photo grid */}
            <DesktopSpotlight items={galleryItems} onOpen={openLightbox} />


            <p
              className={`font-goudy-italic mx-auto mt-8 max-w-lg px-2 text-center leading-relaxed sm:mt-10 ${sectionType.textRelaxed}`}
              style={{ color: C.soft }}
            >
              {gallery.footnote}
            </p>
          </>
        )}
      </div>
      </Section>

      {isMounted && selectedImage && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6"
          style={{ background: "color-mix(in srgb, var(--color-welcome-navy) 35%, black 65%)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery lightbox"
          onClick={() => {
            if (swipeConsumed.current) {
              swipeConsumed.current = false
              return
            }
            closeLightbox()
          }}
        >
          <div
            className="relative flex h-full w-full items-center justify-center"
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                const now = Date.now()
                if (now - lastTap < 300) {
                  e.preventDefault()
                  setZoomScale((s) => (s > 1 ? 1 : 2))
                  setPan({ x: 0, y: 0 })
                }
                setLastTap(now)
                const t = e.touches[0]
                setTouchStartX(t.clientX)
                setTouchDeltaX(0)
                if (zoomScale > 1) {
                  setPanStart({ x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y })
                }
              }
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                setPinchStartDist(Math.hypot(dx, dy))
                setPinchStartScale(zoomScale)
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && pinchStartDist) {
                e.preventDefault()
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const dist = Math.hypot(dx, dy)
                setZoomScale(clamp((dist / pinchStartDist) * pinchStartScale, 1, 3))
              } else if (e.touches.length === 1) {
                const t = e.touches[0]
                if (zoomScale > 1 && panStart) {
                  e.preventDefault()
                  setPan({ x: panStart.panX + (t.clientX - panStart.x), y: panStart.panY + (t.clientY - panStart.y) })
                } else if (touchStartX !== null) {
                  setTouchDeltaX(t.clientX - touchStartX)
                }
              }
            }}
            onTouchEnd={() => {
              setPinchStartDist(null)
              setPanStart(null)
              if (zoomScale === 1 && Math.abs(touchDeltaX) > 50) {
                swipeConsumed.current = true
                navigateImage(touchDeltaX > 0 ? "prev" : "next")
              }
              setTouchStartX(null)
              setTouchDeltaX(0)
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4 sm:p-6">
              <div
                className="pointer-events-auto rounded-full border px-4 py-2 backdrop-blur-md"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-motif-deep) 55%, transparent)",
                  borderColor: "color-mix(in srgb, var(--color-motif-silver) 50%, transparent)",
                }}
              >
                <span className="text-sm font-medium sm:text-base" style={{ color: C.light }}>
                  {currentIndex + 1} / {galleryItems.length}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
                className="pointer-events-auto rounded-full border border-white/20 bg-black/40 p-2 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/60 sm:p-3"
                aria-label="Close lightbox"
              >
                <X size={20} className="text-white sm:h-6 sm:w-6" />
              </button>
            </div>

            {galleryItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage("prev")
                  }}
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/60 sm:left-4 sm:p-4"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} className="text-white sm:h-7 sm:w-7" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateImage("next")
                  }}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 backdrop-blur-md transition-all duration-200 hover:border-white/40 hover:bg-black/60 sm:right-4 sm:p-4"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} className="text-white sm:h-7 sm:w-7" />
                </button>
              </>
            )}

            <div
              className="relative flex max-h-[82dvh] max-w-[92vw] items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={encodeURI(selectedImage.image)}
                alt={selectedImage.text.trim() || `Gallery image ${currentIndex + 1}`}
                width={1600}
                height={2000}
                sizes="100vw"
                priority
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomScale})`,
                  transition: pinchStartDist ? "none" : "transform 200ms ease-out",
                }}
                className="h-auto max-h-[82dvh] w-auto max-w-[92vw] rounded-lg object-contain shadow-2xl will-change-transform"
              />
              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetZoom()
                  }}
                  className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all duration-200 hover:bg-black/80"
                >
                  Reset Zoom
                </button>
              )}
            </div>

            {galleryItems.length > 1 && (
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 sm:hidden">
                <p className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
                  Swipe to navigate
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}