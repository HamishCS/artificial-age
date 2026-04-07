import { useState, useEffect, useCallback, useRef } from 'react'
import content from './data/content.json'
import CoverPage from './components/CoverPage'
import ArticleHeader from './components/ArticleHeader'
import ArticlePage1 from './components/ArticlePage1'
import ArticlePage2 from './components/ArticlePage2'

type ViewState = 'cover' | 'cover+header' | 'cover+article' | 'header+article'

function useViewportScale() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const update = () => {
      const sx = window.innerWidth / 1920
      const sy = window.innerHeight / 1080
      setScale(Math.min(sx, sy))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return scale
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('cover')
  const rootRef = useRef<HTMLDivElement>(null)
  const scale = useViewportScale()

  // Apply scale to #root
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.style.transform = `scale(${scale})`
      root.style.transformOrigin = 'top left'
      root.style.width = '1920px'
      root.style.height = '1080px'
    }
  }, [scale])

  const getSectionData = (id: string) => {
    const entries = Object.values(content.sections)
    return entries.find((s: any) => s.id === id) as any
  }

  const handleSectionClick = useCallback((sectionId: string) => {
    const section = getSectionData(sectionId)
    if (!section) return
    if (section.externalUrl) {
      window.open(section.externalUrl, '_blank')
      return
    }
    setActiveSection(sectionId)
    if (section.articleHeaderTemplate) {
      setViewState('cover+header')
    } else {
      setViewState('cover+article')
    }
  }, [])

  const handleHeaderClick = useCallback(() => {
    setViewState('header+article')
  }, [])

  const handleBack = useCallback(() => {
    if (viewState === 'header+article') {
      setViewState('cover+header')
    } else {
      setViewState('cover')
      setTimeout(() => setActiveSection(null), 500)
    }
  }, [viewState])

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewState !== 'cover') {
        e.preventDefault()
        setViewState('cover')
        setTimeout(() => setActiveSection(null), 500)
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey) handleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewState, handleFullscreen])

  let translateX = 480
  if (viewState === 'cover+article' || viewState === 'cover+header') {
    translateX = 0
  } else if (viewState === 'header+article') {
    translateX = -960
  }

  const section = activeSection ? getSectionData(activeSection) : null
  const articleTemplate = section?.articleTemplate || 'article-1'

  const renderArticle = () => {
    if (!section) return null
    if (articleTemplate === 'article-2') {
      return <ArticlePage2 section={section} masthead={content.masthead} onBack={handleBack} />
    }
    return <ArticlePage1 section={section} masthead={content.masthead} onBack={handleBack} />
  }

  return (
    <>
      <div className="stage" ref={rootRef}>
        <div
          className="slide-container"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          <div className="page" style={{ left: 0 }}>
            <CoverPage
              content={content}
              onSectionClick={handleSectionClick}
              isActive={viewState === 'cover'}
            />
          </div>

          {activeSection && section?.articleHeaderTemplate && (
            <div className="page" style={{ left: 960 }}>
              <ArticleHeader
                section={section}
                masthead={content.masthead}
                onBack={handleBack}
                onClick={handleHeaderClick}
              />
            </div>
          )}

          {activeSection && (
            <div
              className="page"
              style={{ left: section?.articleHeaderTemplate ? 1920 : 960 }}
            >
              {renderArticle()}
            </div>
          )}
        </div>
      </div>
      <button className="fullscreen-btn" onClick={handleFullscreen}>
        Fullscreen (F)
      </button>
    </>
  )
}
