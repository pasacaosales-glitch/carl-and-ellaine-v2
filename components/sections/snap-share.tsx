"use client"

import { useEffect, useState } from "react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { Share2, Copy, Download, Check } from "lucide-react"
import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeCanvas } from "qrcode.react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"

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

// Header + closing text sit on the dusty-blue page backdrop: white (script in butter)
// with a soft navy shadow.
const OUTSIDE_TEXT = "#FFFFFF"
const OUTSIDE_TEXT_MUTED = "rgba(255, 255, 255, 0.92)"
const OUTSIDE_SCRIPT = "var(--color-motif-silver)"
const OUTSIDE_TITLE_SHADOW =
  "0 1px 0 color-mix(in srgb, var(--color-welcome-navy) 45%, transparent), 0 2px 10px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent), 0 8px 28px color-mix(in srgb, var(--color-welcome-navy) 30%, transparent)"
const READABLE_SHADOW =
  "0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), 0 2px 10px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)"
// Card palette — white paper, navy headings, body-blue text, dusty-blue buttons.
const TEAL = "var(--color-welcome-navy)"
const BUTTON =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"
const BLUE = "var(--color-welcome-heading)"
const IVORY = "#FFFFFF"
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)"
const PALE = "color-mix(in srgb, var(--color-motif-medium) 16%, white)"
const BUTTON_SHADOW =
  "0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 22%, transparent), 0 12px 24px -12px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)"

const palette = {
  body: "var(--color-welcome-text)",
  heading: TEAL,
  label: BLUE,
} as const

const outsideDividerLineStyle = {
  background: "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.75), transparent)",
} as const

const insideDividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
} as const

const ct = {
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
  label: sectionType.label,
  btn: sectionType.label,
} as const

const cardStyle = {
  background:
    "radial-gradient(90% 35% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  border: `1px solid ${HAIRLINE}`,
  boxShadow:
    "0 0 0 5px rgb(255 255 255 / 25%), 0 24px 50px -28px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const


// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "#", "&", numbers) in Cinzel, keep letters in The Seasons.
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-6 sm:w-10" style={outsideDividerLineStyle} />
      <span className="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" style={{ background: "var(--color-motif-accent)" }} aria-hidden />
      <span className="h-px w-6 sm:w-10" style={outsideDividerLineStyle} />
    </div>
  )
}

function SnapShareTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
          "--script-overlap": layeredSectionTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", color: OUTSIDE_TEXT, textShadow: OUTSIDE_TITLE_SHADOW }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          marginTop: "var(--script-overlap)",
          fontSize: "var(--script-size)",
          color: OUTSIDE_SCRIPT,
          textShadow: OUTSIDE_TITLE_SHADOW,
        }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h2>
  )
}

function ContentCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] ${className}`} style={cardStyle}>
      <div className="relative z-20 flex flex-col gap-3 px-4 py-6 sm:gap-4 sm:px-6 sm:py-7 md:px-7">{children}</div>
    </div>
  )
}

function PrimaryButton({
  onClick,
  children,
  active = false,
}: {
  onClick?: () => void
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cinzel.className} inline-flex items-center justify-center gap-1.5 rounded-full border px-5 py-2.5 font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:px-6 ${ct.btn}`}
      style={{
        background: active ? TEAL : BUTTON,
        borderColor: "rgb(255 255 255 / 70%)",
        color: IVORY,
        boxShadow: BUTTON_SHADOW,
      }}
    >
      {children}
    </button>
  )
}

// Upload your photos & videos: section heading + one card with the shared-album QR and links
export function SnapShare() {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  const siteConfig = useSiteConfig()
  const content = siteConfig.snapShare
  const [copiedDriveLink, setCopiedDriveLink] = useState(false)
  // Index of the hashtag just copied, or "all" for Copy All
  const [copiedTag, setCopiedTag] = useState<number | "all" | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const { groomNickname, brideNickname } = siteConfig.couple
  const coupleDisplayName = `${groomNickname} & ${brideNickname}`
  const fill = (text: string) => text.split("{couple}").join(coupleDisplayName)
  const uploadLink = content.googleDriveLink

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const downloadCanvas = (id: string, filename: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement("a")
    link.download = filename
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const copyText = async (text: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(text)
      onDone()
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const hashtags = content.hashtags.show ? content.hashtag.filter((tag) => tag.trim()) : []
  const copyTag = (text: string, key: number | "all") =>
    copyText(text, () => {
      setCopiedTag(key)
      setTimeout(() => setCopiedTag((prev) => (prev === key ? null : prev)), 2000)
    })

  if (!uploadLink) return null

  return (
    <section
      id="snap-share"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative z-10 bg-transparent pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14`}
    >
      <div className="relative z-20 mx-auto max-w-6xl px-4 @container/snap-share sm:px-6 md:px-8">
        <div className="relative z-20 px-6 text-center sm:px-10 md:px-12">
          <div className="mx-auto mb-5 sm:mb-6 md:mb-7">
            <OutsideDivider />
          </div>
          <div className="mx-auto mt-2 sm:mt-3 md:mt-4">
            <SnapShareTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-2xl px-2 sm:mt-5 md:mt-6 ${ct.bodyLg}`}
            style={{ color: OUTSIDE_TEXT_MUTED, textShadow: READABLE_SHADOW }}
          >
            {fill(content.description)}
          </p>
          <div className="flex items-center justify-center pt-3 sm:pt-4">
            <span className="h-px w-16 sm:w-24 md:w-32" style={outsideDividerLineStyle} />
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-lg sm:mt-8 md:mt-10">
          <ContentCard>
            <p
              className={`${cinzel.className} ${ct.label} mx-auto w-full rounded-full px-3 py-1.5 text-center uppercase leading-snug tracking-[0.16em] break-words`}
              style={{ color: palette.heading, background: PALE, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
            >
              {content.upload.badge}
            </p>
            <p className={`font-goudy-italic ${ct.body} break-words text-center`} style={{ color: palette.body }}>
              {content.instructions}
            </p>
            <div
              className="mx-auto flex w-full max-w-[240px] flex-col items-center rounded-2xl p-3 sm:p-4"
              style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 0 0 5px color-mix(in srgb, var(--color-motif-medium) 12%, transparent), 0 14px 28px -20px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)` }}
            >
              <div className="flex w-full max-w-full justify-center overflow-hidden rounded-xl bg-white">
                <QRCodeCanvas
                  id="album-qr"
                  value={uploadLink}
                  size={isMobile ? 160 : 200}
                  level="H"
                  includeMargin
                  className="h-auto max-w-full"
                  fgColor={qrFg}
                  bgColor={qrBg}
                />
              </div>
              {content.upload.scanNote ? (
                <p className={`font-goudy-italic ${ct.body} mt-2 text-center sm:mt-3`} style={{ color: palette.label }}>
                  {content.upload.scanNote}
                </p>
              ) : null}
            </div>
            <span className="mx-auto block h-px w-24 sm:w-32" style={insideDividerLineStyle} aria-hidden />
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <PrimaryButton
                onClick={() =>
                  copyText(uploadLink, () => {
                    setCopiedDriveLink(true)
                    setTimeout(() => setCopiedDriveLink(false), 2000)
                  })
                }
                active={copiedDriveLink}
              >
                {copiedDriveLink ? <Check className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" /> : <Copy className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />}
                {copiedDriveLink ? content.upload.copied : content.upload.copyLink}
              </PrimaryButton>
              <PrimaryButton onClick={() => downloadCanvas("album-qr", "album-qr.png")}>
                <Download className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                {content.upload.downloadQr}
              </PrimaryButton>
              <a
                href={uploadLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:px-6 ${ct.btn}`}
                style={{ background: BUTTON, color: IVORY, boxShadow: BUTTON_SHADOW, border: "1px solid rgb(255 255 255 / 70%)" }}
              >
                <Share2 className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                {content.upload.uploadButton}
              </a>
            </div>
          </ContentCard>

          {/* Wedding hashtags — tap one to copy it, or copy them all */}
          {hashtags.length > 0 && (
            <ContentCard className="mt-5 sm:mt-6">
              <p
                className={`${cinzel.className} ${ct.label} mx-auto w-full rounded-full px-3 py-1.5 text-center uppercase leading-snug tracking-[0.16em] break-words`}
                style={{ color: palette.heading, background: PALE, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
              >
                {content.hashtags.title}
              </p>
              <ul className="flex flex-col gap-2 sm:gap-2.5">
                {hashtags.map((tag, i) => {
                  const copied = copiedTag === i || copiedTag === "all"
                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => copyTag(tag, i)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:px-4 sm:py-3"
                        style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 10px 20px -16px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)` }}
                        aria-label={`${copied ? content.hashtags.copied : content.hashtags.copy} ${tag}`}
                      >
                        <span
                          className={`${theSeasons.className} min-w-0 flex-1 break-all text-[0.95rem] leading-snug tracking-[0.03em] sm:text-lg`}
                          style={{ color: palette.heading }}
                        >
                          <SpecialCharFont text={tag} />
                        </span>
                        <span
                          className={`${cinzel.className} flex flex-shrink-0 items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] sm:text-[0.65rem]`}
                          style={{ color: copied ? TEAL : BLUE }}
                          aria-hidden
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          <span className="hidden min-[400px]:inline">{copied ? content.hashtags.copied : content.hashtags.copy}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {hashtags.length > 1 && (
                <div className="flex justify-center pt-1">
                  <PrimaryButton onClick={() => copyTag(hashtags.join(" "), "all")} active={copiedTag === "all"}>
                    {copiedTag === "all" ? <Check className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" /> : <Copy className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />}
                    {copiedTag === "all" ? content.hashtags.allCopied : content.hashtags.copyAll}
                  </PrimaryButton>
                </div>
              )}
            </ContentCard>
          )}
        </div>
      </div>
    </section>
  )
}
