import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import {
  loadPages,
  loadElementsByProject,
  loadInteractions,
  loadCustomComponents,
} from '@/utils/db'
import WireframeElement from '@/components/WireframeElement'
import { Stage, Layer, Rect } from 'react-konva'
import { ArrowLeft } from 'lucide-react'
import type { CanvasElement, Interaction } from '@/types'
import { ElementType } from '@/types'

const Preview: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const pages = useStore((s: any) => s.pages)
  const elements = useStore((s: any) => s.elements)
  const interactions = useStore((s: any) => s.interactions)
  const theme = useStore((s: any) => s.theme)
  const loadProject = useStore((s: any) => s.loadProject)

  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [showExitHint, setShowExitHint] = useState(true)
  const [fadeKey, setFadeKey] = useState(0)
  const [stageSize, setStageSize] = useState({ width: 375, height: 667 })

  useEffect(() => {
    if (!projectId) return

    const load = async () => {
      const pagesData = await loadPages(projectId)
      const elementsData = await loadElementsByProject(projectId)
      const interactionsData = await loadInteractions(projectId)
      const customComponentsData = await loadCustomComponents(projectId)

      loadProject(projectId, pagesData, elementsData, interactionsData, customComponentsData)

      if (pagesData.length > 0) {
        setCurrentPageId(pagesData[0].id)
      }
    }

    load()
  }, [projectId])

  useEffect(() => {
    const timer = setTimeout(() => setShowExitHint(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(`/editor/${projectId}`)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, projectId])

  const handleElementClick = useCallback(
    (elementId: string) => {
      const interaction = interactions.find(
        (i: any) => i.elementId === elementId && i.trigger === 'onClick'
      )
      if (interaction) {
        setFadeKey((k) => k + 1)
        setCurrentPageId(interaction.targetPageId)
      }
    },
    [interactions]
  )

  const currentPageElements: CanvasElement[] = currentPageId
    ? (elements[currentPageId] ?? [])
    : []

  const noOp = () => {}
  const noOpTransform = () => {}

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: theme === 'dark' ? '#1a1a2e' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.5)',
          color: '#fff',
          cursor: 'pointer',
          opacity: showExitHint ? 1 : 0.3,
          transition: 'opacity 0.3s',
        }}
        onClick={() => navigate(`/editor/${projectId}`)}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = showExitHint ? '1' : '0.3')}
      >
        <ArrowLeft size={18} />
        <span style={{ fontSize: 14 }}>Exit Preview</span>
      </div>

      <div
        key={fadeKey}
        style={{
          background: theme === 'dark' ? '#2d2d44' : '#ffffff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          borderRadius: 4,
          overflow: 'hidden',
          transition: 'opacity 0.25s ease-in-out',
          animation: 'fadeIn 0.25s ease-in-out',
        }}
      >
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        <Stage width={stageSize.width * 0.85} height={stageSize.height * 0.85}>
          <Layer>
            <Rect
              width={stageSize.width * 0.85}
              height={stageSize.height * 0.85}
              fill={theme === 'dark' ? '#2d2d44' : '#ffffff'}
            />
            {currentPageElements
              .filter((el) => el.visible)
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((el) => (
                <WireframeElement
                  key={el.id}
                  element={el}
                  isSelected={false}
                  onSelect={() => handleElementClick(el.id)}
                  onDragEnd={noOp}
                  onTransformEnd={noOpTransform}
                  onDoubleClick={noOp}
                />
              ))}
          </Layer>
        </Stage>
      </div>

      {pages.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
          }}
        >
          {pages.map((page: any) => (
            <div
              key={page.id}
              onClick={() => {
                setFadeKey((k) => k + 1)
                setCurrentPageId(page.id)
              }}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: page.id === currentPageId ? '#4A90D9' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Preview
