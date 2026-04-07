import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import AdCarousel from './AdCarousel'
import PretextEffect, { type TextZone } from './PretextEffect'

import davidImg from '../assets/images/david-inner-circle.png'
import emblemImg from '../assets/images/ai-age-emblem.png'
import postCodeImg from '../assets/images/post-code-report-image.png'
import roboticImg from '../assets/images/robotic-scriptures-image.png'
import roboticVertImg from '../assets/images/robotic-scriptures-image-vertical.png'
import scoutWalkingImg from '../assets/images/scout_walking_person.png'
import spotifyPurpImg from '../assets/images/spotify-purp-hi.png'
import rothschildImg from '../assets/images/robot-dropshop.png'
import pendulumImg from '../assets/images/pendulum.jpg'

const imageMap: Record<string, string> = {
  'david-inner-circle.png': davidImg,
  'post-code-report-image.png': postCodeImg,
  'robotic-scriptures-image.png': roboticImg,
  'robotic-scriptures-image-vertical.png': roboticVertImg,
  'scout_walking_person.png': scoutWalkingImg,
  'spotify-purp-hi.png': spotifyPurpImg,
  'robot-dropshop.png': rothschildImg,
  'pendulum.jpg': pendulumImg,
}

const BLUE = '#00529B'
const WARM_CREAM = '#ead7c8'

// Helper: hide text that pretext is rendering
const vis = (isActive: boolean): React.CSSProperties => ({
  visibility: isActive ? 'hidden' : 'visible',
})

interface CoverPageProps {
  content: any
  onSectionClick: (sectionId: string) => void
  isActive: boolean
}

export default function CoverPage({ content, onSectionClick, isActive }: CoverPageProps) {
  const { masthead, sections } = content
  const s1 = sections['1']
  const s2 = sections['2']
  const s3 = sections['3']
  const s4 = sections['4_inside_top']
  const s5 = sections['5_inside_mid']
  const s6 = sections['6_inside_bot']
  const s7 = sections['7_main']
  const coverRef = useRef<HTMLDivElement>(null)
  const sidebarTextNodeRefs = useRef<Record<string, HTMLElement | null>>({})
  const [measuredSidebarZones, setMeasuredSidebarZones] = useState<TextZone[]>([])

  const setSidebarTextNode = (key: string) => (node: HTMLElement | null) => {
    sidebarTextNodeRefs.current[key] = node
  }

  const sidebarZoneDescriptors = useMemo(() => ([
    { id: 's7-line1', text: 'PALACE FORESHORE', font: '700 34px "EgyptianEF", "Oswald", sans-serif', lineHeight: 36, breakMode: 'word' as const, color: '#ffffff' },
    { id: 's7-line2', text: 'POSTCODE REPORT', font: '700 34px "EgyptianEF", "Oswald", sans-serif', lineHeight: 36, breakMode: 'word' as const, color: WARM_CREAM },
    { id: 's7-sub', text: s7.coverSubtitle, font: '14px "TT Regins Display", "Lora", serif', lineHeight: 15, breakMode: 'word' as const, color: '#dddddd' },
    { id: 's7-credit1', text: 'CODY DEX REPORTS', font: '800 10px "Libre Franklin", sans-serif', lineHeight: 10, color: '#f0f0f0' },
    { id: 's7-credit2', text: 'PAGE 4', font: '800 10px "Libre Franklin", sans-serif', lineHeight: 10, color: '#f0f0f0' },
    { id: 's4-title', text: s4.coverTitle, font: '700 15px "Compacta", "Oswald", sans-serif', lineHeight: 15 },
    { id: 's4-sub', text: s4.coverSubtitle.toUpperCase(), font: '700 15px "Compacta", "Oswald", sans-serif', lineHeight: 15 },
    { id: 's4-news', text: 'NEWS', font: 'italic 700 10px "Compacta", "Oswald", sans-serif', lineHeight: 10, color: BLUE },
    { id: 's4-page', text: 'PAGE 5', font: '400 10px "TT Regins Display", "Lora", serif', lineHeight: 10 },
    { id: 's5-title', text: s5.coverTitle, font: '700 15px "Compacta", "Oswald", sans-serif', lineHeight: 15 },
    { id: 's5-sub', text: s5.coverSubtitle.toUpperCase(), font: '700 15px "Compacta", "Oswald", sans-serif', lineHeight: 15 },
    { id: 's5-news', text: 'NEWS', font: 'italic 700 10px "Compacta", "Oswald", sans-serif', lineHeight: 10, color: BLUE },
    { id: 's5-page', text: 'PAGE 6', font: '400 10px "TT Regins Display", "Lora", serif', lineHeight: 10 },
    { id: 's6-title', text: s6.coverTitle, font: '700 14px "Compacta", "Oswald", sans-serif', lineHeight: 13 },
    { id: 's6-sub', text: s6.coverSubtitle.toUpperCase(), font: '700 14px "Compacta", "Oswald", sans-serif', lineHeight: 13 },
    { id: 's6-news', text: 'NEWS', font: 'italic 700 10px "Compacta", "Oswald", sans-serif', lineHeight: 10, color: BLUE },
    { id: 's6-page', text: 'PAGE 7', font: '400 10px "TT Regins Display", "Lora", serif', lineHeight: 10 },
  ]), [s7.coverSubtitle, s4.coverTitle, s4.coverSubtitle, s5.coverTitle, s5.coverSubtitle, s6.coverTitle, s6.coverSubtitle])

  useLayoutEffect(() => {
    const measure = () => {
      const coverNode = coverRef.current
      if (!coverNode) return

      const coverRect = coverNode.getBoundingClientRect()
      const scaleX = coverRect.width > 0 ? 960 / coverRect.width : 1
      const scaleY = coverRect.height > 0 ? 1080 / coverRect.height : 1
      const nextZones = sidebarZoneDescriptors.flatMap((descriptor) => {
        const node = sidebarTextNodeRefs.current[descriptor.id]
        if (!node) return []

        const rect = node.getBoundingClientRect()
        const measuredH = Math.round(rect.height * scaleY)
        return [{
          id: descriptor.id,
          text: descriptor.text,
          x: Math.round((rect.left - coverRect.left) * scaleX),
          y: Math.round((rect.top - coverRect.top) * scaleY),
          w: Math.max(1, Math.round(rect.width * scaleX)),
          // h must be >= lineHeight or pretext silently produces zero lines
          h: Math.max(descriptor.lineHeight, measuredH),
          columns: 1,
          font: descriptor.font,
          lineHeight: descriptor.lineHeight,
          breakMode: descriptor.breakMode,
          color: descriptor.color,
        }]
      })

      setMeasuredSidebarZones(nextZones)
    }

    measure()
    const frameId = window.requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    // Re-measure after fonts load (positions change when custom fonts render)
    document.fonts.ready.then(() => {
      requestAnimationFrame(measure)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', measure)
    }
  }, [sidebarZoneDescriptors])

  const renderInsideCard = (
    section: any,
    zonePrefix: 's4' | 's5' | 's6',
    options?: { imageSrc?: string; imageHeight?: number; compact?: boolean }
  ) => {
    const pageMatch = typeof section.coverLabel === 'string' ? section.coverLabel.match(/PAGE\s+(\d+)/i) : null
    const pageNumber = pageMatch?.[1] ?? ''
    const compact = options?.compact ?? false

    return (
      <div
        className="clickable-section"
        onClick={() => onSectionClick(section.id)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#f3f0eb',
        }}
      >
        {options?.imageSrc ? (
          <img
            src={options.imageSrc}
            alt={section.coverTitle}
            style={{ width: '100%', aspectRatio: '3/2', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div className="placeholder-img" style={{ width: '100%', aspectRatio: '3/2' }}>
            {section.coverTitle}
          </div>
        )}

        <div
          style={{
            padding: compact ? '6px 10px 7px' : '8px 10px 9px',
            background: '#f3f0eb',
            borderTop: '1px solid rgba(26, 26, 26, 0.18)',
            ...vis(isActive),
          }}
        >
          <div
            style={{
              fontFamily: "'Compacta', 'Oswald', sans-serif",
              fontSize: compact ? 14 : 15,
              fontWeight: 700,
              lineHeight: compact ? 0.92 : 0.98,
              textTransform: 'uppercase',
              color: '#1a1a1a',
              letterSpacing: 0.2,
            }}
          >
            <div ref={setSidebarTextNode(`${zonePrefix}-title`)}>{section.coverTitle}</div>
            {section.coverSubtitle && (
              <div ref={setSidebarTextNode(`${zonePrefix}-sub`)} style={{ marginTop: compact ? 1 : 3 }}>
                {section.coverSubtitle.toUpperCase()}
              </div>
            )}
          </div>

          <p style={{ fontSize: 10, marginTop: compact ? 4 : 6 }}>
            <span
              ref={setSidebarTextNode(`${zonePrefix}-news`)}
              style={{
                fontFamily: "'Compacta', 'Oswald', sans-serif",
                fontWeight: 700,
                color: BLUE,
                fontStyle: 'italic',
                textTransform: 'uppercase',
              }}
            >
              NEWS
            </span>
            {' '}
            <span
              ref={setSidebarTextNode(`${zonePrefix}-page`)}
              className="font-lora"
              style={{
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                color: '#1a1a1a',
              }}
            >
              PAGE {pageNumber}
            </span>
          </p>
        </div>
      </div>
    )
  }

  const housingText = 'This is just some holding text, you really shouldn\'t bother reading it. And the fact that you are reading it is actually making me kind of nervous. I really didn\'t think I would be under this much pressure and scrutiny over just a few words that were only in place to make this whole project look legitimate. But now you\'re this far, I might as well tell you a story...\n"I wonder if you\'ve got such a thing as a balloon about you?"\n"A balloon?"\n"Yes, I just said to myself coming along: \'I wonder if Charlie has such a thing as a balloon about him?\' I just said it to myself, thinking of balloons, and wondering."\n"What do you want a balloon for?" you said.\nTheodore looked round to see that nobody was listening, put his hand to his mouth, and said in a deep whisper: "Honey!"\n"But you don\'t get honey with balloons!"\n"I do," said Theodore.\nWell, it just happened that you had been to a party the day before at the house of your friend Martin, and you had balloons at the party. You had had a big green balloon; and one of Gilbert\'s relations had had a big blue one, and had left it behind, being really too young to go to a party at all; and so you had brought the green one and the blue one home with you.\n"Which one would you like?" you asked Theodore.\nHe put his head between his hands and thought very carefully.\n"It\'s like this," he said. "When you go after honey with a balloon, the great thing is not to let the bees know you\'re coming. Now, if you have a green balloon, they might think you were only part of the tree, and not notice you, and, if you have a blue balloon, they might think you were only part of the sky, and not notice you, and the question is: Which is most likely?"\n"Wouldn\'t they notice you underneath the balloon?" you asked.\n"They might or they might not," said Theodore. "You never can tell with bees." He thought for a moment and said: "I shall try to look like a small black cloud. That will deceive them."\n"Then you had better have the blue balloon," you said; and so it was decided.\nWell, you both went out with the blue balloon, and you took your gun with you, just in case, as you always did, and Theodore went to a very muddy place that he knew of, and rolled and rolled until he was black all over; and then, when the balloon was blown up as big as big, and you and Theodore were both holding on to the string, you let go suddenly, and Theodore floated gracefully up into the sky, and stayed there \u2014 level with the top of the tree and about twenty feet away from it.'

  // All text zones for pretext reflow.
  // Excludes: masthead title "ARTIFICIAL AGE", "INSIDE" header, ad carousel.
  const textZones: TextZone[] = useMemo(() => [
    // Section 1: title in Compacta, subtitle in body font
    { id: 's1-title', text: s1.coverTitle.toUpperCase(),
      x: 100, y: 156, w: 209, h: 28, columns: 1,
      font: '700 26px "Compacta", "Oswald", sans-serif', lineHeight: 28 },
    { id: 's1-sub', text: s1.coverSubtitle,
      x: 100, y: 187, w: 209, h: 40, columns: 1,
      font: '13px "TT Regins Display", "Lora", serif', lineHeight: 17 },
    // Section 2
    { id: 's2-title', text: s2.coverTitle.toUpperCase(),
      x: 420, y: 156, w: 210, h: 28, columns: 1,
      font: '700 26px "Compacta", "Oswald", sans-serif', lineHeight: 28, color: BLUE },
    { id: 's2-sub', text: s2.coverSubtitle,
      x: 420, y: 187, w: 210, h: 40, columns: 1,
      font: '13px "TT Regins Display", "Lora", serif', lineHeight: 17 },
    // Section 3 — width reduced to avoid Scout image on the right
    { id: 's3-title', text: s3.coverTitle.toUpperCase(),
      x: 653, y: 156, w: 155, h: 28, columns: 1,
      font: '700 26px "Compacta", "Oswald", sans-serif', lineHeight: 28 },
    { id: 's3-sub', text: s3.coverSubtitle,
      x: 653, y: 187, w: 155, h: 40, columns: 1,
      font: '13px "TT Regins Display", "Lora", serif', lineHeight: 17 },
    // Housing growth HEADLINE — large like reference
    { id: 'housing-headline', text: content.housingGrowthSection.headline,
      x: 20, y: 648, w: 655, h: 110, columns: 1,
      font: '900 52px "Playfair Display", Georgia, serif', lineHeight: 54, breakMode: 'word', justify: false },
    // EXCLUSIVE label — red, top of body area, first column only
    { id: 'housing-exclusive', text: 'EXCLUSIVE',
      x: 20, y: 766, w: 150, h: 14, columns: 1,
      font: '800 11px "Libre Franklin", sans-serif', lineHeight: 14, color: '#cc0000' },
    // Byline — first column only
    { id: 'housing-byline', text: 'Claudette Codilla',
      x: 20, y: 782, w: 150, h: 14, columns: 1,
      font: '700 11px "Libre Franklin", sans-serif', lineHeight: 14 },
    // Housing growth body text (4 columns) — cols 2-4 start at y:766, col 1 starts at y:800
    { id: 'housing', text: housingText,
      x: 20, y: 766, w: 655, h: 219, columns: 4,
      font: '11.5px "TT Regins Display", "Lora", "Palatino Linotype", Palatino, serif', lineHeight: 17,
      firstColumnYOffset: 34, breakMode: 'word' },
    ...measuredSidebarZones,
  ], [s1, s2, s3, s7, content.housingGrowthSection.headline, measuredSidebarZones])

  return (
    <div ref={coverRef} style={{
      width: 960, height: 1080, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative', background: '#e8e4df'
    }}>
      <PretextEffect
        active={isActive}
        textZones={textZones}
      />

      {/* David statue — smaller, head halfway up the ARTIFICIAL AGE title */}
      <img
        src={imageMap[s1.image]}
        alt={s1.coverTitle}
        style={{
          position: 'absolute',
          left: 2,
          top: 45,
          height: 200,
          objectFit: 'contain',
          zIndex: 15,
          pointerEvents: 'none',
        }}
      />

      {/* Scout walking person — mirroring David on the right side of the page */}
      <img
        src={imageMap[s3.image]}
        alt={s3.coverTitle}
        style={{
          position: 'absolute',
          right: -5,
          top: 40,
          height: 210,
          objectFit: 'contain',
          zIndex: 15,
          pointerEvents: 'none',
        }}
      />

      {/* ═══ Top bar ═══ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 28px', fontSize: 11, borderBottom: '1px solid #999',
        position: 'relative', zIndex: 5
      }} className="font-franklin">
        <span style={{ fontWeight: 700 }}>{masthead.price}</span>
        <span style={{ fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 10 }}>
          {masthead.date}
        </span>
        <div style={{ display: 'flex', gap: 20, fontSize: 10 }}>
          <span style={{ fontStyle: 'italic' }}>Published in Melbourne since 2024</span>
          <span style={{ fontWeight: 600 }}>{masthead.url}</span>
        </div>
      </div>

      {/* ═══ Masthead — tight spacing like reference ═══ */}
      <div style={{
        textAlign: 'center', padding: '2px 28px 2px',
        borderBottom: '4px solid #1a1a1a', position: 'relative', zIndex: 2,
        pointerEvents: 'none',
      }}>
        <img src={emblemImg} alt="Artificial Age emblem"
          style={{ height: 30, objectFit: 'contain', marginBottom: -2 }} />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12 }}>
          <span style={{
            fontFamily: "'BentonModDisp', 'Playfair Display', Georgia, serif",
            fontSize: 76, fontWeight: 700, letterSpacing: 1, lineHeight: 0.9, color: BLUE
          }}>
            ARTIFICIAL
          </span>
          <span style={{
            fontFamily: "'BentonModDisp', 'Playfair Display', Georgia, serif",
            fontSize: 76, fontWeight: 700, letterSpacing: 1, lineHeight: 0.9, color: '#1a1a1a'
          }}>
            AGE
          </span>
        </div>
        <div className="font-franklin" style={{
          fontSize: 9, letterSpacing: 5, fontWeight: 500, marginTop: -2, paddingBottom: 2
        }}>
          {masthead.tagline}
        </div>
      </div>

      {/* ═══ Thin blue rule below masthead ═══ */}
      <div style={{ height: 2, background: BLUE }} />

      {/* ═══ Top 3 sections row ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1fr',
        height: 100, borderBottom: '2px solid #1a1a1a',
        position: 'relative', zIndex: 1, overflow: 'hidden'
      }}>
        {/* Section 1 — Compacta title, body font subtitle, Compacta label */}
        <div className="clickable-section" onClick={() => onSectionClick(s1.id)}
          style={{ padding: '8px 10px 8px 100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={vis(isActive)}>
            <h3 style={{ fontFamily: "'Compacta', 'Oswald', sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase' }}>
              {s1.coverTitle}
            </h3>
            <p className="font-lora" style={{ fontSize: 13, marginTop: 3, lineHeight: 1.3 }}>
              {s1.coverSubtitle}
            </p>
          </div>
          <div style={{ ...vis(isActive) }}>
            <span style={{ fontFamily: "'Compacta', 'Oswald', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
              {s1.coverLabel}
            </span>
          </div>
        </div>

        <div style={{ background: '#999', width: 1 }} />

        {/* Section 2 — Robotic Scriptures: image left, text right (like reference middle) */}
        <div className="clickable-section" onClick={() => onSectionClick(s2.id)}
          style={{ display: 'flex', overflow: 'hidden' }}>
          <img src={imageMap[s2.image]} alt={s2.coverTitle}
            style={{ height: '100%', width: 80, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
            <div style={vis(isActive)}>
              <h3 style={{ fontFamily: "'Compacta', 'Oswald', sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase', color: BLUE }}>
                {s2.coverTitle}
              </h3>
              <p className="font-lora" style={{ fontSize: 13, marginTop: 3, lineHeight: 1.3 }}>
                {s2.coverSubtitle}
              </p>
            </div>
            <div style={{ ...vis(isActive) }}>
              <span style={{ fontFamily: "'Compacta', 'Oswald', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
                {s2.coverLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3 — text left, image overlaps from right (like David mirrored) */}
        <div className="clickable-section" onClick={() => onSectionClick(s3.id)}
          style={{ padding: '8px 140px 8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={vis(isActive)}>
            <h3 style={{ fontFamily: "'Compacta', 'Oswald', sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase' }}>
              {s3.coverTitle}
            </h3>
            <p className="font-lora" style={{ fontSize: 13, marginTop: 3, lineHeight: 1.3 }}>
              {s3.coverSubtitle}
            </p>
          </div>
          <div style={{ ...vis(isActive) }}>
            <span style={{ fontFamily: "'Compacta', 'Oswald', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
              {s3.coverLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Main content area: left content + right INSIDE sidebar ═══ */}
      {/* This grid spans from below top-3 sections all the way to the ad strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 260px',
        flex: 1, minHeight: 0
      }}>
        {/* ── Left column: hero image + headline + housing text ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #999'
        }}>
          {/* Main image - Section 7 */}
          <div className="clickable-section" onClick={() => onSectionClick(s7.id)}
            style={{ position: 'relative', overflow: 'hidden', flex: '0 0 auto', height: 400 }}>
            <div className="font-franklin" style={{
              position: 'absolute', top: 6, left: 8, fontSize: 9, color: '#666', zIndex: 2
            }}>
              Photo: Artificial Age
            </div>
            <img src={imageMap[s7.image]} alt={s7.coverTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Headline overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.95) 100%)',
              padding: '62px 20px 10px'
            }}>
              <h2 style={{
                fontFamily: "'EgyptianEF', 'Oswald', sans-serif",
                fontSize: 34, fontWeight: 700, lineHeight: 0.96,
                textTransform: 'uppercase', letterSpacing: 1,
                width: 560,
                marginBottom: 0,
                ...vis(isActive),
              }}>
                <span ref={setSidebarTextNode('s7-line1')} style={{ display: 'block', color: '#ffffff' }}>
                  PALACE FORESHORE
                </span>
                <span ref={setSidebarTextNode('s7-line2')} style={{ display: 'block', color: WARM_CREAM }}>
                  POSTCODE REPORT
                </span>
              </h2>
              <p ref={setSidebarTextNode('s7-sub')} className="font-lora" style={{
                color: '#ddd', fontSize: 14, marginTop: 2, lineHeight: 1.2,
                width: 560,
                marginBottom: 0,
                ...vis(isActive),
              }}>
                {s7.coverSubtitle}
              </p>
              <div className="font-franklin" style={{
                color: '#f0f0f0',
                fontSize: 10,
                marginTop: 6,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                fontWeight: 800,
                lineHeight: 1.05,
                ...vis(isActive),
              }}>
                <div ref={setSidebarTextNode('s7-credit1')}>Cody Dex Reports</div>
                <div ref={setSidebarTextNode('s7-credit2')} style={{ marginTop: 1 }}>Page 4</div>
              </div>
            </div>
          </div>

          {/* Housing growth section */}
          <div style={{ padding: '10px 24px 8px 20px', flex: 1 }}>
            <h2 className="font-playfair" style={{
              fontSize: 52, fontWeight: 900, lineHeight: 1.04, marginBottom: 8,
              borderBottom: '2px solid #1a1a1a', paddingBottom: 6,
              ...vis(isActive),
            }}>
              {content.housingGrowthSection.headline}
            </h2>
            {/* Housing body: EXCLUSIVE/byline float left in col 1, body text wraps around */}
            <div style={{
              flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative',
              visibility: isActive ? 'hidden' : 'visible',
            }}>
              <div style={{ columns: 4, columnGap: 20, fontSize: 11.5, lineHeight: 1.45, textAlign: 'justify' }} className="font-lora">
                <div style={{ float: 'left', width: '100%', marginBottom: 4 }}>
                  <span className="font-franklin" style={{
                    fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: 1.5, color: '#c00', display: 'block'
                  }}>
                    EXCLUSIVE
                  </span>
                  <span className="font-franklin" style={{
                    fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4
                  }}>
                    Claudette Codilla
                  </span>
                </div>
                <p>This is just some holding text, you really shouldn't bother reading it. And the fact that you are reading it is actually making me kind of nervous. I really didn't think I would be under this much pressure and scrutiny over just a few words that were only in place to make this whole project look legitimate. But now you're this far, I might as well tell you a story...</p>
                <p style={{ margin: 0 }}>"I wonder if you've got such a thing as a balloon about you?"</p>
                <p style={{ margin: 0 }}>"A balloon?"</p>
                <p style={{ margin: 0 }}>"Yes, I just said to myself coming along: 'I wonder if Charlie has such a thing as a balloon about him?' I just said it to myself, thinking of balloons, and wondering."</p>
                <p style={{ margin: 0 }}>"What do you want a balloon for?" you said.</p>
                <p style={{ margin: 0 }}>Theodore looked round to see that nobody was listening, put his hand to his mouth, and said in a deep whisper: "Honey!"</p>
                <p style={{ margin: 0 }}>"But you don't get honey with balloons!"</p>
                <p style={{ margin: 0 }}>"I do," said Theodore.</p>
                <p style={{ margin: 0 }}>Well, it just happened that you had been to a party the day before at the house of your friend Martin, and you had balloons at the party. You had had a big green balloon; and one of Gilbert's relations had had a big blue one, and had left it behind, being really too young to go to a party at all; and so you had brought the green one and the blue one home with you.</p>
                <p style={{ margin: 0 }}>"Which one would you like?" you asked Theodore.</p>
                <p style={{ margin: 0 }}>He put his head between his hands and thought very carefully.</p>
                <p style={{ margin: 0 }}>"It's like this," he said. "When you go after honey with a balloon, the great thing is not to let the bees know you're coming. Now, if you have a green balloon, they might think you were only part of the tree, and not notice you, and, if you have a blue balloon, they might think you were only part of the sky, and not notice you, and the question is: Which is most likely?"</p>
                <p style={{ margin: 0 }}>"Wouldn't they notice you underneath the balloon?" you asked.</p>
                <p style={{ margin: 0 }}>"They might or they might not," said Theodore. "You never can tell with bees." He thought for a moment and said: "I shall try to look like a small black cloud. That will deceive them."</p>
                <p style={{ margin: 0 }}>"Then you had better have the blue balloon," you said; and so it was decided.</p>
                <p style={{ margin: 0 }}>Well, you both went out with the blue balloon, and you took your gun with you, just in case, as you always did, and Theodore went to a very muddy place that he knew of, and rolled and rolled until he was black all over; and then, when the balloon was blown up as big as big, and you and Theodore were both holding on to the string, you let go suddenly, and Theodore floated gracefully up into the sky, and stayed there — level with the top of the tree and about twenty feet away from it.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: INSIDE sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '3px solid #c8c0f0' }}>
          {/* INSIDE header */}
          <div style={{ background: BLUE, padding: '5px 12px', textAlign: 'center' }}>
            <span className="font-oswald" style={{ fontSize: 16, fontWeight: 700, letterSpacing: 5, color: '#fff' }}>
              INSIDE
            </span>
          </div>

          {/* Section 4 (INSIDE pos 5) - Soundscape */}
          <div style={{ borderBottom: '1px dotted #999' }}>
            {renderInsideCard(s4, 's4', { imageSrc: imageMap[s4.image] })}
          </div>

          {/* Section 5 (INSIDE pos 6) - Drop Shop Image Editor */}
          <div style={{ borderBottom: '1px dotted #999' }}>
            {renderInsideCard(s5, 's5', { imageSrc: imageMap[s5.image] })}
          </div>

          {/* Section 6 (INSIDE pos 7) - Ticketing Report */}
          <div>
            {renderInsideCard(s6, 's6', { imageSrc: imageMap[s6.image], compact: true })}
          </div>
        </div>
      </div>

      {/* ═══ Ad carousel strip ═══ */}
      <AdCarousel sections={content.sections} onSectionClick={onSectionClick} />
    </div>
  )
}
