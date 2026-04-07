import davidImg from '../assets/images/david-inner-circle.png'
import roboticImg from '../assets/images/robotic-scriptures-image.png'
import postCodeImg from '../assets/images/post-code-report-image.png'

const imageMap: Record<string, string> = {
  'david-inner-circle.png': davidImg,
  'robotic-scriptures-image.png': roboticImg,
  'post-code-report-image.png': postCodeImg,
}

const loremBody = `This application represents a new approach to building tools that serve specific professional needs. Rather than relying on expensive enterprise software or cobbling together solutions from multiple platforms, it was built from the ground up to solve one problem exceptionally well.

The interface is designed to be immediately intuitive. Users can get started without training or documentation — the workflows mirror how people naturally think about the task at hand. Every interaction has been refined through real-world usage and feedback from the people who rely on it daily.

Under the hood, the app leverages modern web technologies to deliver a fast, responsive experience. Data is stored securely in the cloud, syncs across devices, and can be exported at any time. There are no lock-in contracts or per-seat pricing structures that penalise growing teams.

What sets this apart from existing solutions is its focus on the specific needs of Australian professionals. The terminology, the workflows, and the default configurations all reflect how work actually gets done here — not how a Silicon Valley product manager imagines it might.`

interface ArticlePage1Props {
  section: any
  masthead: any
  onBack: () => void
}

export default function ArticlePage1({ section, masthead, onBack }: ArticlePage1Props) {
  const body = section.body || loremBody
  const paragraphs = body.split('\n\n')
  const hasImage = section.image && imageMap[section.image]
  const keyFeatures = section.keyFeatures || []

  // Build the full article text
  let articleText = ''
  paragraphs.forEach((p: string) => {
    articleText += p + '\n\n'
  })
  if (keyFeatures.length > 0) {
    articleText += 'Key features of the platform include: '
    keyFeatures.forEach((f: string, i: number) => {
      articleText += f + (i < keyFeatures.length - 1 ? ' ' : '')
    })
  }
  if (section.plannedFeatures) {
    articleText += '\n\nLooking ahead, the development roadmap includes several planned enhancements: '
    section.plannedFeatures.forEach((f: string, i: number) => {
      articleText += f + (i < section.plannedFeatures.length - 1 ? ' ' : '')
    })
  }
  if (section.techNote) {
    articleText += '\n\n' + section.techNote
  }

  return (
    <div style={{ width: 960, height: 1080, padding: '0 28px', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e8e4df' }}>
      {/* Back button */}
      <button className="back-btn" onClick={onBack} style={{ position: 'absolute', zIndex: 10 }}>
        ← Back
      </button>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 0', borderBottom: '1px solid #333'
      }} className="font-franklin">
        <span style={{ fontSize: 11, fontWeight: 600 }}>PAGE 3</span>
        <span className="font-playfair" style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>
          ARTIFICIAL AGE
        </span>
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1 }}>{masthead.date}</span>
      </div>

      {/* Section label bar */}
      <div style={{
        background: '#1a1a1a', padding: '5px 12px', margin: '0 -28px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span className="font-oswald" style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>
          NEWS
        </span>
      </div>

      {/* Image */}
      {hasImage ? (
        <div style={{ margin: '12px 0 8px', position: 'relative' }}>
          <img src={imageMap[section.image]} alt={section.articleTitle}
            style={{ width: '100%', height: 280, objectFit: 'cover' }} />
          <p className="font-franklin" style={{ fontSize: 10, color: '#666', marginTop: 3, fontStyle: 'italic' }}>
            {section.articleTitle} — {section.articleSubtitle}
          </p>
        </div>
      ) : (
        <div className="placeholder-img" style={{ height: 200, margin: '12px 0 8px' }}>
          {section.articleTitle}
        </div>
      )}

      {/* Headline */}
      <h1 className="font-playfair" style={{
        fontSize: 40, fontWeight: 900, lineHeight: 1.05, marginBottom: 6
      }}>
        {section.articleTitle}
      </h1>
      {section.articleTagline && (
        <p className="font-lora" style={{ fontSize: 18, fontStyle: 'italic', color: '#444', lineHeight: 1.3, marginBottom: 6 }}>
          {section.articleTagline}
        </p>
      )}

      {/* Byline */}
      <div className="font-franklin" style={{
        fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
        paddingBottom: 8, borderBottom: '2px solid #1a1a1a', marginBottom: 10
      }}>
        Artificial Age Technology Desk
      </div>

      {/* Body text in 3 columns */}
      <div className="columns-3 font-lora" style={{ flex: 1, overflow: 'hidden', fontSize: 15, lineHeight: 1.5 }}>
        {articleText.split('\n\n').map((p, i) => (
          <p key={i} style={{ marginBottom: 12, textIndent: i > 0 ? 20 : 0 }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
