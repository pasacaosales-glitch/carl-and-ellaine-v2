import Image from "next/image"
import "@/components/loader/loading-screen.css"

export type CornerDecos = {
  topLeft: string
  topRight: string
  bottomLeft: string
  bottomRight: string
}

/** Full-color florals in a section's four corners (shown as-is, not tinted); they sway gently.
 *  The parent must be positioned. Styles: .ls-corners in loader/loading-screen.css */
export function CornerFlorals({ decos, compact = false }: { decos: CornerDecos; compact?: boolean }) {
  return (
    <div className={`ls-corners${compact ? " ls-corners--compact" : ""}`} aria-hidden="true">
      {(
        [
          ["tl", decos.topLeft, 720, 584],
          ["tr", decos.topRight, 714, 615],
          ["bl", decos.bottomLeft, 733, 454],
          ["br", decos.bottomRight, 719, 439],
        ] as const
      ).map(([pos, src, w, h]) =>
        src ? (
          <div key={pos} className={`ls-corner ls-corner--${pos}`}>
            <Image src={src} alt="" width={w} height={h} sizes="(max-width: 640px) 46vw, 340px" className="ls-corner__img" />
          </div>
        ) : null,
      )}
    </div>
  )
}
