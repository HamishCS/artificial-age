import roboticImg from '../assets/images/robotic-scriptures-image.png'

const imageMap: Record<string, string> = {
  'robotic-scriptures-image.png': roboticImg,
}

interface ArticleHeaderProps {
  section: any
  masthead: any
  onBack: () => void
  onClick: () => void
}

export default function ArticleHeader({ section, masthead, onBack, onClick }: ArticleHeaderProps) {
  const bgImage = section.image ? imageMap[section.image] : null

  return (
    <div
      className="clickable-section"
      onClick={onClick}
      style={{
        width: 960, height: 1080, position: 'relative', overflow: 'hidden',
        background: bgImage ? `url(${bgImage}) center/cover no-repeat` : '#2a2a2a',
      }}
    >
      {/* Back button */}
      <button className="back-btn" onClick={(e) => { e.stopPropagation(); onBack(); }}>
        ← Back
      </button>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px', zIndex: 10
      }}>
        <span className="font-playfair" style={{ color: '#fff', fontSize: 18, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          ARTIFICIAL AGE
        </span>
        <span className="font-franklin" style={{ color: '#fff', fontSize: 12, fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          {masthead.date}
        </span>
      </div>

      {/* Large vertical text */}
      <div style={{
        position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%) rotate(-90deg)',
        transformOrigin: 'center center',
      }}>
        <span className="font-oswald" style={{
          fontSize: 110, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
          letterSpacing: 12, textTransform: 'uppercase',
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap'
        }}>
          {section.articleTitle}
        </span>
      </div>

      {/* Bottom overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
        padding: '80px 40px 50px'
      }}>
        <h1 className="font-playfair" style={{
          color: '#fff', fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 8
        }}>
          {section.articleTitle}
        </h1>
        <p className="font-franklin" style={{
          color: '#ccc', fontSize: 18, fontWeight: 400, lineHeight: 1.4
        }}>
          {section.articleSubtitle}
        </p>
      </div>

      {/* Bottom navigation bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#1a1a1a', padding: '8px 28px',
        display: 'flex', gap: 20
      }} className="font-franklin">
        <span style={{ color: '#d4af37', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
          CLICK TO READ FULL ARTICLE →
        </span>
      </div>
    </div>
  )
}
