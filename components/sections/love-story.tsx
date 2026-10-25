"use client"

import React, { useLayoutEffect, useMemo, useRef } from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import { StorySection } from "@/components/StorySection"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import "@/components/loader/loading-screen.css"
import { TintedDeco } from "@/components/tinted-deco"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { CornerFlorals } from "@/components/corner-florals"

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

const revealEase = [0.22, 1, 0.36, 1] as const

// Share of the chapters that sit on the navy part of the sky (the rest sit on blush)
const NAVY_CHAPTER_SHARE = 0.6

// Soft white edge so text stays crisp over the blush part of the sky
const onBgGlow = "0 1px 0 rgb(255 255 255 / 85%), 0 0 12px rgb(255 255 255 / 70%)"
// Navy edge for the light title over the navy band at the top
const onNavyGlow = "0 1px 2px rgb(1 46 75 / 85%), 0 0 18px rgb(1 46 75 / 60%)"

function formatStoryParagraph(
  paragraph: string,
  groom: string,
  bride: string,
): string {
  return paragraph
    .replace(/\{groom\}/g, groom)
    .replace(/\{bride\}/g, bride)
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className="h-px w-10 sm:w-16"
        style={{ background: "linear-gradient(to right, transparent, var(--color-motif-yellow))" }}
      />
      <span className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" style={{ background: "var(--color-motif-accent)" }} aria-hidden />
      <span
        className="h-px w-10 sm:w-16"
        style={{ background: "linear-gradient(to left, transparent, var(--color-motif-yellow))" }}
      />
    </div>
  )
}

function LoveStoryTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <h1
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block pb-1 uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: "var(--color-motif-soft)",
          textShadow: onNavyGlow,
        }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2.5 sm:leading-[0.9] md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: "var(--color-motif-accent)",
          textShadow: onNavyGlow,
        }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h1>
  )
}

function chapterTextFromParagraphs(
  paragraphs: readonly string[],
  groom: string,
  bride: string,
) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={
            paragraphs.length > 1 && index < paragraphs.length - 1 ? "mb-4" : undefined
          }
        >
          {formatStoryParagraph(paragraph, groom, bride)}
        </p>
      ))}
    </>
  )
}

export function LoveStory() {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const loveStory = siteConfig.loveStory ?? defaultSiteConfig.loveStory
  const isPlain = loading.display === "plain"
  const reduceMotion = useReducedMotion()

  const groom =
    siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride =
    siteConfig.couple.brideNickname || siteConfig.couple.bride

  const chapters = useMemo(
    () => loveStory.chapters ?? defaultSiteConfig.loveStory.chapters,
    [loveStory.chapters],
  )
  const eucalyptusDecos =
    loveStory.eucalyptusDecos ?? defaultSiteConfig.loveStory.eucalyptusDecos
  const cornerDecos = loveStory.cornerDecos ?? defaultSiteConfig.loveStory.cornerDecos
  const intro = loveStory.intro ?? defaultSiteConfig.loveStory.intro

  // First chapter on blush; everything above it sits on navy
  const firstBlushChapter = isPlain ? Math.round(chapters.length * NAVY_CHAPTER_SHARE) : 0
  const rootRef = useRef<HTMLDivElement>(null)

  // End the sky's navy inside the first blush chapter's extra top space (CSS gives
  // it 10rem), so the cloud edge clears the text on both sides. Re-measured as
  // images load / resize.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || firstBlushChapter <= 0) return
    const measure = () => {
      const chapter = root.querySelectorAll<HTMLElement>(".story-open")[firstBlushChapter]
      if (!chapter) return
      const rem = parseFloat(getComputedStyle(root).fontSize) || 16
      root.style.setProperty("--ls-sky-band", `${Math.max(0, chapter.offsetTop + 3 * rem)}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [firstBlushChapter, chapters.length])

  return (
    <div
      id="love-story"
      ref={rootRef}
      className={`love-story-root love-story-root--sky ${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-screen w-full overflow-hidden`}
    >
      <PlainBubbles className="ls-plain-sky" />
      <CornerFlorals decos={cornerDecos} />

      <header className="ls-sky-header relative z-20 px-4 text-center sm:px-6 md:px-8">
        <motion.div
          className="relative mx-auto w-full max-w-5xl @container/love-story"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: revealEase }}
        >
          <LoveStoryTitle title={loveStory.title} subtitle={loveStory.subtitle} />
          {intro ? (
            <p
              className={`font-goudy-italic ls-sky-intro mx-auto mt-5 max-w-md sm:mt-7 sm:max-w-lg ${sectionType.textRelaxed}`}
            >
              {intro}
            </p>
          ) : null}
        </motion.div>
      </header>

      {chapters.map((chapter, index) => (
        <StorySection
          key={`${chapter.image}-${index}`}
          title={chapter.title}
          theme={chapter.theme}
          layout={chapter.layout}
          imageSrc={chapter.image}
          imageAlt={formatStoryParagraph(chapter.imageAlt ?? "", groom, bride)}
          date={chapter.date}
          text={chapterTextFromParagraphs(chapter.paragraphs, groom, bride)}
          plain={isPlain}
          chapterIndex={index}
          isFirst={index === 0}
          isLast={index === chapters.length - 1}
          eucalyptusDecos={isPlain ? eucalyptusDecos : undefined}
          chapterLabelText={loveStory.chapterLabel}
          onNavy={index < firstBlushChapter}
        />
      ))}

      <footer
        className="ls-sky-footer relative z-20 px-4 pt-8 text-center sm:px-6 sm:pt-10 md:px-8 md:pt-12"
      >
        <motion.div
          className="relative mx-auto max-w-xl px-2"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, delay: 0.08, ease: revealEase }}
        >
          <OrnamentalDivider />
          <blockquote className="mt-5 sm:mt-6">
            <p
              className={`font-goudy-italic ${sectionType.textRelaxed} italic leading-relaxed`}
              style={{ color: "var(--color-welcome-navy)", textShadow: onBgGlow }}
            >
              &ldquo;{loveStory.closingQuote}&rdquo;
            </p>
            <footer
              className={`font-goudy-italic mt-2 sm:mt-3 ${sectionType.label} not-italic tracking-wide`}
              style={{ color: "var(--color-welcome-heading)", textShadow: onBgGlow }}
            >
              — {loveStory.closingCitation}
            </footer>
          </blockquote>
          {isPlain && eucalyptusDecos.sectionBottom ? (
            <TintedDeco src={eucalyptusDecos.sectionBottom} className="love-story-footer-euc mx-auto mt-8 sm:mt-10" />
          ) : null}
        </motion.div>
      </footer>
    </div>
  )
}
