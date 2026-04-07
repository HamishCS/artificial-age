import davidImg from '../assets/images/david-inner-circle.png'
import roboticImg from '../assets/images/robotic-scriptures-image.png'
import postCodeImg from '../assets/images/post-code-report-image.png'

const imageMap: Record<string, string> = {
  'david-inner-circle.png': davidImg,
  'robotic-scriptures-image.png': roboticImg,
  'post-code-report-image.png': postCodeImg,
}

const loremBody = `This application represents a new approach to building tools that serve specific professional needs. Rather than relying on expensive enterprise software or cobbling together solutions from multiple platforms, it was built from the ground up to solve one problem exceptionally well.

The interface is designed to be immediately intuitive. Users can get started without training or documentation — the workflows mirror how people naturally think about the task at hand.

Under the hood, the app leverages modern web technologies to deliver a fast, responsive experience. Data is stored securely in the cloud, syncs across devices, and can be exported at any time.

What sets this apart is its focus on the specific needs of Australian professionals. The terminology, workflows, and default configurations all reflect how work actually gets done here.`

interface ArticlePage2Props {
  section: any
  masthead: any
  onBack: () => void
}

export default function ArticlePage2({ section, masthead, onBack }: ArticlePage2Props) {
  const body = section.body || loremBody
  const paragraphs = body.split('\n\n')
  const hasImage = section.image && imageMap[section.image]

  return (
    <div style={{ width: 960, height: 1080, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#e8e4df' }}>
      {/* Back button */}
      <button className="back-btn" onClick={onBack} style={{ position: 'absolute', zIndex: 10 }}>
        ← Back
      </button>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 28px', borderBottom: '1px solid #333'
      }} className="font-franklin">
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1 }}>{masthead.date}</span>
        <span className="font-playfair" style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3 }}>
          THE ARTIFICIAL AGE
        </span>
      </div>

      {/* Main content: sidebar + article */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Editor's Letter sidebar */}
        <div style={{
          borderRight: '1px solid #333', padding: '20px 16px 20px 28px',
          display: 'flex', flexDirection: 'column'
        }}>
          <h3 className="font-oswald" style={{
            fontSize: 18, fontWeight: 700, letterSpacing: 3, marginBottom: 12,
            paddingBottom: 8, borderBottom: '2px solid #1a1a1a'
          }}>
            EDITOR'S LETTER
          </h3>
          <div className="font-lora" style={{ fontSize: 14, lineHeight: 1.55, color: '#333' }}>
            <p style={{ marginBottom: 10 }}>
              In this edition, we turn our attention to {section.articleTitle} — a tool that demonstrates how thoughtfully applied technology can transform everyday workflows.
            </p>
            <p style={{ marginBottom: 10 }}>
              What makes these projects noteworthy isn't their technical sophistication alone, but the way they address genuine friction points that existing solutions have long ignored.
            </p>
            <p style={{ fontStyle: 'italic', marginTop: 16 }}>
              — The Editors
            </p>
          </div>
        </div>

        {/* Main article area */}
        <div style={{ padding: '20px 28px 20px 20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Section label */}
          <span className="section-label" style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
            Interview
          </span>

          {/* Large name */}
          <h1 className="font-playfair" style={{
            fontSize: 56, fontWeight: 900, lineHeight: 1, marginBottom: 6
          }}>
            {section.articleTitle}
          </h1>
          <p className="font-franklin" style={{
            fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 12, letterSpacing: 0.5
          }}>
            {section.articleSubtitle}
          </p>

          {/* Image */}
          {hasImage ? (
            <img src={imageMap[section.image]} alt={section.articleTitle}
              style={{ width: '100%', height: 240, objectFit: 'cover', marginBottom: 12 }} />
          ) : (
            <div className="placeholder-img" style={{ width: '100%', height: 180, marginBottom: 12 }}>
              {section.articleTitle}
            </div>
          )}

          {/* Body in 2 columns */}
          <div className="columns-2 font-lora" style={{ flex: 1, overflow: 'hidden', fontSize: 15, lineHeight: 1.5 }}>
            {paragraphs.map((p: string, i: number) => (
              <p key={i} style={{ marginBottom: 12, textIndent: i > 0 ? 20 : 0 }}>
                {p}
              </p>
            ))}
          </div>

          {/* Credits */}
          <div className="font-franklin" style={{
            borderTop: '1px solid #333', padding: '8px 0', marginTop: 8,
            fontSize: 10, color: '#666', letterSpacing: 1
          }}>
            ARTIFICIAL AGE TECHNOLOGY DESK
          </div>
        </div>
      </div>
    </div>
  )
}
