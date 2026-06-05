import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Stage, Layer, Rect, Line, Text } from 'react-konva'
import { useStore } from '@/store'
import WireframeElement from './WireframeElement'
import { ElementType } from '@/types'
import type { CanvasElement } from '@/types'

export interface CanvasHandle {
  getStage: () => any
}

interface CanvasProps {
  onDropComponent: (type: ElementType, x: number, y: number) => void
}

const GRID_SIZE = 20

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ onDropComponent }, ref) => {
  const stageRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
  }))
  const containerRef = useRef<HTMLDivElement>(null)

  const elements = useStore((s) => s.elements)
  const currentPageId = useStore((s) => s.currentPageId)
  const selectedElementIds = useStore((s) => s.selectedElementIds)
  const zoom = useStore((s) => s.zoom)
  const panX = useStore((s) => s.panX)
  const panY = useStore((s) => s.panY)
  const selectElement = useStore((s) => s.selectElement)
  const deselectAll = useStore((s) => s.deselectAll)
  const updateElement = useStore((s) => s.updateElement)
  const interactions = useStore((s) => s.interactions)
  const pages = useStore((s) => s.pages)
  const setZoom = useStore((s) => s.setZoom)
  const setPan = useStore((s) => s.setPan)

  const currentPageElements: CanvasElement[] = React.useMemo(() => {
    if (!currentPageId) return []
    return (elements[currentPageId] ?? [])
      .filter((el) => el.visible !== false)
      .sort((a, b) => a.zIndex - b.zIndex)
  }, [elements, currentPageId])

  const elementMap = React.useMemo(() => {
    const map: Record<string, CanvasElement> = {}
    for (const el of currentPageElements) {
      map[el.id] = el
    }
    return map
  }, [currentPageElements])

  const stageWidth = containerRef.current?.clientWidth ?? 800
  const stageHeight = containerRef.current?.clientHeight ?? 600

  const handleStageClick = useCallback(
    (e: any) => {
      if (e.target === e.target.getStage()) {
        deselectAll()
      }
    },
    [deselectAll],
  )

  const handleWheel = useCallback(
    (e: any) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return

      if (e.evt.ctrlKey || e.evt.metaKey) {
        const scaleBy = 1.05
        const oldScale = zoom
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
        const clamped = Math.min(3, Math.max(0.25, newScale))

        const pointer = stage.getPointerPosition()
        if (!pointer) return
        const mousePointTo = {
          x: (pointer.x - panX) / oldScale,
          y: (pointer.y - panY) / oldScale,
        }
        setZoom(clamped)
        setPan(
          pointer.x - mousePointTo.x * clamped,
          pointer.y - mousePointTo.y * clamped,
        )
      } else {
        setPan(panX - e.evt.deltaX, panY - e.evt.deltaY)
      }
    },
    [zoom, panX, panY, setZoom, setPan],
  )

  const handleDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      updateElement(id, { x, y })
    },
    [updateElement],
  )

  const handleTransformEnd = useCallback(
    (id: string, props: Partial<CanvasElement>) => {
      updateElement(id, props)
    },
    [updateElement],
  )

  const handleDoubleClick = useCallback((_id: string) => {}, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'copy'
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer!.getData('componentType') as ElementType
      if (!type) return

      const stage = stageRef.current
      if (!stage) return

      const stageBox = stage.container().getBoundingClientRect()
      const x = (e.clientX - stageBox.left - panX) / zoom
      const y = (e.clientY - stageBox.top - panY) / zoom

      onDropComponent(type, x, y)
    }

    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('drop', handleDrop)

    return () => {
      container.removeEventListener('dragover', handleDragOver)
      container.removeEventListener('drop', handleDrop)
    }
  }, [onDropComponent, panX, panY, zoom])

  const gridLines = React.useMemo(() => {
    const lines: { key: string; points: number[] }[] = []
    const visibleW = stageWidth / zoom
    const visibleH = stageHeight / zoom
    const startX = Math.floor(-panX / zoom / GRID_SIZE) * GRID_SIZE
    const startY = Math.floor(-panY / zoom / GRID_SIZE) * GRID_SIZE
    const endX = startX + visibleW + GRID_SIZE
    const endY = startY + visibleH + GRID_SIZE

    for (let x = startX; x <= endX; x += GRID_SIZE) {
      lines.push({ key: `v${x}`, points: [x, startY, x, endY] })
    }
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      lines.push({ key: `h${y}`, points: [startX, y, endX, y] })
    }
    return lines
  }, [stageWidth, stageHeight, zoom, panX, panY])

  const interactionArrows = React.useMemo(() => {
    return interactions
      .filter((interaction) => {
        const srcEl = elementMap[interaction.elementId]
        return srcEl && srcEl.pageId === currentPageId
      })
      .map((interaction) => {
        const srcEl = elementMap[interaction.elementId]
        const cx = srcEl.x + srcEl.width / 2
        const cy = srcEl.y + srcEl.height / 2
        const targetPage = pages.find((p) => p.id === interaction.targetPageId)
        const label = targetPage?.name ?? interaction.targetPageId

        const edgeX = cx
        const edgeY = cy - srcEl.height / 2 - 10
        const arrowEndY = edgeY - 30

        return {
          id: interaction.id,
          startX: cx,
          startY: cy,
          endX: edgeX,
          endY: arrowEndY,
          label,
        }
      })
  }, [interactions, elementMap, currentPageId, pages])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#fafafa' }}
    >
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onWheel={handleWheel}
        draggable
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setPan(e.target.x(), e.target.y())
          }
        }}
      >
        <Layer>
          {gridLines.map((l) => (
            <Line
              key={l.key}
              points={l.points}
              stroke="#e8e8e8"
              strokeWidth={0.5}
              listening={false}
            />
          ))}
        </Layer>

        <Layer>
          {currentPageElements.map((el) => (
            <WireframeElement
              key={el.id}
              element={el}
              isSelected={selectedElementIds.includes(el.id)}
              onSelect={() => selectElement(el.id)}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              onDoubleClick={handleDoubleClick}
            />
          ))}
        </Layer>

        <Layer>
          {interactionArrows.map((arrow) => (
            <React.Fragment key={arrow.id}>
              <Line
                points={[arrow.startX, arrow.startY, arrow.endX, arrow.endY]}
                stroke="#4A90D9"
                strokeWidth={1.5}
                dash={[6, 3]}
                listening={false}
              />
              <Line
                points={[
                  arrow.endX,
                  arrow.endY,
                  arrow.endX - 5,
                  arrow.endY + 8,
                  arrow.endX + 5,
                  arrow.endY + 8,
                ]}
                fill="#4A90D9"
                closed
                listening={false}
              />
              <Rect
                x={arrow.endX - 30}
                y={arrow.endY - 18}
                width={60}
                height={14}
                fill="#4A90D9"
                cornerRadius={3}
                listening={false}
              />
              <Text
                text={arrow.label}
                x={arrow.endX - 30}
                y={arrow.endY - 17}
                width={60}
                height={14}
                align="center"
                verticalAlign="middle"
                fontSize={9}
                fontFamily="-apple-system, sans-serif"
                fill="#ffffff"
                listening={false}
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
