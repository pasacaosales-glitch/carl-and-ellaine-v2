"use client"

import Image from "next/image"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Section } from "@/components/section"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"

// Verse & invitation: monogram → Ecclesiastes 3:11 → invitation message → couple's names.
// (File and section id keep the old "countdown" name so existing #countdown links still work.)

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
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

// Palette lives in globals.css → motif / welcome tokens. Text sits on a white card in navy ink,
// so it stays readable where the sky behind fades from navy to blush.
const C = {
  title: "var(--color-welcome-navy)",
  body: "color-mix(in srgb, var(--color-welcome-navy) 88%, white)",
  // Deeper rose than the motif accent so small text holds contrast on white
  cite: "color-mix(in srgb, var(--color-motif-accent) 55%, var(--color-welcome-navy))",
  script: "var(--color-motif-accent)",
  accent: "var(--color-motif-accent)",
} as const

// Same circle pattern as the other sections (PlainBubbles paints the base)
const sectionBg = "var(--color-bg-pattern-base)"

// Same paper card as the FAQ / details sections
const cardStyle = {
  background:
    "radial-gradient(90% 30% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  border: "1px solid color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow:
    "0 0 0 6px rgb(255 255 255 / 45%), 0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

// Hairline frame just inside the card edge
const innerFrameStyle = {
  boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-motif-medium) 55%, transparent)",
} as const

const lineRight = {
  background: "linear-gradient(to right, transparent, var(--color-motif-accent))",
} as const
const lineLeft = {
  background: "linear-gradient(to left, transparent, var(--color-motif-accent))",
} as const

function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16 md:w-20" style={lineRight} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: C.accent }} />
      <span className="h-px w-10 sm:w-16 md:w-20" style={lineLeft} />
    </div>
  )
}

const ease = [0.22, 1, 0.36, 1] as const

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease } },
}

export function Countdown() {
  const siteConfig = useSiteConfig()
  const reduceMotion = useReducedMotion()
  const content = siteConfig.invitationVerse ?? defaultSiteConfig.invitationVerse
  const { brideNickname, groomNickname, monogram } = siteConfig.couple
  const initial = reduceMotion ? "show" : "hidden"

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBg }}
    >
      <PlainBubbles />
      <Section id="countdown" className="relative z-10 overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28">
        <motion.div
          className="relative z-20 mx-auto flex max-w-2xl flex-col items-center px-3 text-center sm:px-4"
          variants={stagger}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* Monogram */}
          <motion.div
            variants={rise}
            className="relative h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96"
          >
            <Image
              src={monogram}
              alt={`${groomNickname} & ${brideNickname} Monogram`}
              fill
              sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, (min-width: 640px) 288px, 224px"
              className="object-contain drop-shadow-[0_10px_24px_rgb(1_46_75_/_35%)]"
            />
          </motion.div>

          {/* Paper card holding the verse, message and names */}
          <motion.div
            variants={rise}
            className="relative mt-6 w-full max-w-xl rounded-[1.75rem] px-6 py-9 sm:mt-8 sm:px-10 sm:py-12 md:px-14"
            style={cardStyle}
          >
            <span className="pointer-events-none absolute inset-2.5 rounded-[1.4rem] sm:inset-3" style={innerFrameStyle} aria-hidden />

            {/* Verse */}
            <figure className="relative">
              <DiamondDivider />
              <blockquote
                className={`${theSeasons.className} mx-auto mt-5 max-w-[22rem] text-[clamp(1.35rem,6.2vw,2.4rem)] leading-[1.2] sm:mt-6 sm:max-w-xl`}
                style={{ color: C.title }}
              >
                “{content.verse}”
              </blockquote>
              <figcaption
                className={`${cinzel.className} mt-3 font-semibold uppercase tracking-[0.28em] sm:mt-4 text-[0.72rem] sm:text-xs md:text-sm`}
                style={{ color: C.cite }}
              >
                {content.citation}
              </figcaption>
            </figure>

            {/* Invitation message */}
            <p
              className="font-goudy-italic relative mx-auto mt-7 max-w-md text-[0.95rem] leading-[1.7] sm:mt-9 sm:text-[1.05rem] md:text-lg"
              style={{ color: C.body }}
            >
              {content.message.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </p>

            {/* Sign-off */}
            <div className="relative mt-7 flex flex-col items-center sm:mt-9">
              <DiamondDivider />
              <p
                className="mt-4 flex items-baseline justify-center gap-3 sm:mt-5 sm:gap-4"
                aria-label={`${groomNickname} ${content.signOffJoiner} ${brideNickname}`}
              >
                <span
                  aria-hidden
                  className={`${theSeasons.className} text-[clamp(1.6rem,7vw,2.75rem)] uppercase leading-none tracking-[0.12em]`}
                  style={{ color: C.title }}
                >
                  {groomNickname}
                </span>
                <span
                  aria-hidden
                  className={`${aboveTheBeyond.className} text-[clamp(1.4rem,6vw,2.4rem)] leading-none`}
                  style={{ color: C.script }}
                >
                  {content.signOffJoiner}
                </span>
                <span
                  aria-hidden
                  className={`${theSeasons.className} text-[clamp(1.6rem,7vw,2.75rem)] uppercase leading-none tracking-[0.12em]`}
                  style={{ color: C.title }}
                >
                  {brideNickname}
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </Section>
    </div>
  )
}
