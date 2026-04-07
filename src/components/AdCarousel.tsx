import { useState, useEffect } from 'react'
import castleImg from '../assets/images/castle-of-finacnce_logo.png'
import castleAdBanner from '../assets/images/castle-of-finance-ad.png'
import csBillsAdBanner from '../assets/images/cs-bills-ad.png'
import dropShopAdBanner from '../assets/images/drop-shop-ad.png'
import rfpAdBanner from '../assets/images/rfp-ad.png'

const adSections = ['8_ad', '9_ad', '10_ad', '11_ad']

interface AdConfig {
  bg: string
  logoColor: string
  mainText: string
  mainTextColor: string
  badgeText: string
  badgeNumber: string
  badgeSub: string
  badgeBg: string
  badgeTextColor: string
  banner?: string
}

const adConfigs: Record<string, AdConfig> = {
  '8_ad': {
    bg: 'linear-gradient(135deg, #1a5c2a 0%, #2d7a3d 50%, #3d9a4d 100%)',
    logoColor: '#d4af37',
    mainText: 'IF BUFFETT BUILT AN APP',
    mainTextColor: '#fff',
    badgeText: 'YEARS OF',
    badgeNumber: '5',
    badgeSub: 'FINANCE',
    badgeBg: '#d4af37',
    badgeTextColor: '#1a1a1a',
    banner: castleAdBanner,
  },
  '9_ad': {
    bg: 'linear-gradient(135deg, #1a1a5a 0%, #2a2a8a 50%, #4040aa 100%)',
    logoColor: '#ff6b6b',
    mainText: 'BUILD PROPOSALS THAT WIN',
    mainTextColor: '#fff',
    badgeText: 'POWERED',
    badgeNumber: 'AI',
    badgeSub: 'DRIVEN',
    badgeBg: '#ff6b6b',
    badgeTextColor: '#fff',
    banner: rfpAdBanner,
  },
  '10_ad': {
    bg: 'linear-gradient(135deg, #5a1a4a 0%, #8a2a6a 50%, #aa3a8a 100%)',
    logoColor: '#ff9f43',
    mainText: 'STUDIO-QUALITY PRODUCT SHOTS',
    mainTextColor: '#fff',
    badgeText: 'ONE',
    badgeNumber: '1',
    badgeSub: 'CLICK',
    badgeBg: '#ff9f43',
    badgeTextColor: '#1a1a1a',
    banner: dropShopAdBanner,
  },
  '11_ad': {
    bg: 'linear-gradient(135deg, #0a3a4a 0%, #1a5a6a 50%, #2a7a8a 100%)',
    logoColor: '#54e6af',
    mainText: 'DEEP WORK. NO DISTRACTIONS.',
    mainTextColor: '#fff',
    badgeText: 'FOCUS',
    badgeNumber: '∞',
    badgeSub: 'MODE',
    badgeBg: '#54e6af',
    badgeTextColor: '#1a1a1a',
    banner: csBillsAdBanner,
  },
}

interface AdCarouselProps {
  sections: any
  onSectionClick: (id: string) => void
}

export default function AdCarousel({ sections, onSectionClick }: AdCarouselProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % adSections.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const key = adSections[current]
  const section = sections[key]
  const config = adConfigs[key]

  return (
    <div
      className="clickable-section"
      onClick={() => onSectionClick(section.id)}
      style={{
        background: config.bg,
        height: 92,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginTop: 'auto',
      }}
    >
      {/* Banner image mode */}
      {config.banner ? (
        <img src={config.banner} alt={section.articleTitle}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <>
          {/* Main content area - mimicking Comedy Festival strip layout */}
          <div style={{
            display: 'flex', alignItems: 'center', width: '100%',
            padding: '0 50px', gap: 0
          }}>
            {/* Left: Logo area */}
            <div style={{
              width: 80, height: 80, flexShrink: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              {section.image ? (
                <img src={castleImg} alt={section.articleTitle}
                  style={{ height: 70, width: 70, objectFit: 'contain' }} />
              ) : (
                <div style={{
                  width: 65, height: 65, borderRadius: '50%',
                  background: `rgba(255,255,255,0.15)`, border: `2px solid ${config.logoColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: config.logoColor, fontSize: 28, fontWeight: 900
                }} className="font-playfair">
                  {section.articleTitle.charAt(0)}
                </div>
              )}
            </div>

            {/* Center-left: Title */}
            <div style={{ padding: '0 16px', flex: '0 0 auto' }}>
              <h3 className="font-oswald" style={{
                color: config.logoColor, fontSize: 22, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.1
              }}>
                {section.articleTitle}
              </h3>
              <p className="font-franklin" style={{
                color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 600,
                marginTop: 2, letterSpacing: 1, textTransform: 'uppercase'
              }}>
                {section.articleSubtitle}
              </p>
            </div>

            {/* Center: Big tagline text */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 10px' }}>
              <span className="font-oswald" style={{
                color: config.mainTextColor, fontSize: 32, fontWeight: 700,
                letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1.1,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {config.mainText}
              </span>
            </div>

            {/* Right: Badge (like the "40 FUNNY" circle) */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: config.badgeBg, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              <span className="font-franklin" style={{
                fontSize: 8, fontWeight: 700, color: config.badgeTextColor,
                letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1
              }}>
                {config.badgeText}
              </span>
              <span className="font-oswald" style={{
                fontSize: 32, fontWeight: 700, color: config.badgeTextColor,
                lineHeight: 1
              }}>
                {config.badgeNumber}
              </span>
              <span className="font-franklin" style={{
                fontSize: 8, fontWeight: 700, color: config.badgeTextColor,
                letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1
              }}>
                {config.badgeSub}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Left arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); setCurrent(c => (c - 1 + adSections.length) % adSections.length) }}
        style={{
          background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff',
          fontSize: 24, cursor: 'pointer', padding: '8px 12px',
          position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2,
          display: 'flex', alignItems: 'center'
        }}
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); setCurrent(c => (c + 1) % adSections.length) }}
        style={{
          background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff',
          fontSize: 24, cursor: 'pointer', padding: '8px 12px',
          position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 2,
          display: 'flex', alignItems: 'center'
        }}
      >
        ›
      </button>

      {/* Dots indicator */}
      <div style={{
        position: 'absolute', bottom: 4, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 5
      }}>
        {adSections.map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: i === current ? '#fff' : 'rgba(255,255,255,0.3)',
            cursor: 'pointer'
          }} onClick={(e) => { e.stopPropagation(); setCurrent(i) }} />
        ))}
      </div>
    </div>
  )
}
