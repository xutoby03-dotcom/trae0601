import React from 'react'
import { Rect, Circle, Group, Text, Line, Ellipse, RegularPolygon } from 'react-konva'
import { ElementType } from '@/types'
import type { CanvasElement } from '@/types'

interface WireframeElementProps {
  element: CanvasElement
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (id: string, x: number, y: number) => void
  onTransformEnd: (id: string, props: Partial<CanvasElement>) => void
  onDoubleClick: (id: string) => void
}

const WIRE_FONT = 'Comic Sans MS, cursive'

const renderElement = (el: CanvasElement) => {
  switch (el.type) {
    case ElementType.RECT:
      return (
        <Rect
          width={el.width}
          height={el.height}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          cornerRadius={el.cornerRadius}
        />
      )

    case ElementType.CIRCLE:
      return (
        <Ellipse
          radiusX={el.width / 2}
          radiusY={el.height / 2}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
        />
      )

    case ElementType.TRIANGLE: {
      const radius = Math.min(el.width, el.height) / 2
      return (
        <RegularPolygon
          sides={3}
          radius={radius}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          offsetX={0}
          offsetY={-radius * 0.15}
        />
      )
    }

    case ElementType.LINE:
      return (
        <Line
          points={[0, 0, el.width, 0]}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth || 2}
        />
      )

    case ElementType.INPUT:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            cornerRadius={el.cornerRadius}
          />
          <Text
            text={el.text || 'Input'}
            x={8}
            y={(el.height - 14) / 2}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#666"
            width={el.width - 28}
            height={el.height}
          />
          <Line
            points={[el.width - 18, el.height / 2 - 3, el.width - 12, el.height / 2, el.width - 18, el.height / 2 + 3]}
            stroke="#999"
            strokeWidth={1.5}
            closed={false}
          />
        </>
      )

    case ElementType.BUTTON:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#4A90D9'}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            cornerRadius={el.cornerRadius || 4}
          />
          <Text
            text={el.text || 'Button'}
            x={0}
            y={(el.height - 14) / 2}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#fff"
            width={el.width}
            align="center"
          />
        </>
      )

    case ElementType.DROPDOWN:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            cornerRadius={el.cornerRadius}
          />
          <Text
            text={el.text || 'Select...'}
            x={8}
            y={(el.height - 14) / 2}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#666"
            width={el.width - 28}
          />
          <Line
            points={[el.width - 20, el.height / 2 - 3, el.width - 14, el.height / 2 + 3, el.width - 8, el.height / 2 - 3]}
            stroke="#666"
            strokeWidth={1.5}
            closed={false}
          />
        </>
      )

    case ElementType.CHECKBOX:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke || '#333'}
            strokeWidth={el.strokeWidth || 1.5}
            cornerRadius={2}
          />
          {el.text && (
            <Text
              text={el.text}
              x={el.width + 6}
              y={(el.height - 13) / 2}
              fontSize={13}
              fontFamily={WIRE_FONT}
              fill="#333"
            />
          )}
        </>
      )

    case ElementType.RADIO:
      return (
        <>
          <Ellipse
            radiusX={el.width / 2}
            radiusY={el.height / 2}
            fill={el.fill || '#fff'}
            stroke={el.stroke || '#333'}
            strokeWidth={el.strokeWidth || 1.5}
          />
          <Ellipse
            radiusX={el.width / 5}
            radiusY={el.height / 5}
            fill="#333"
            stroke=""
            strokeWidth={0}
          />
          {el.text && (
            <Text
              text={el.text}
              x={el.width + 6}
              y={(el.height - 13) / 2}
              fontSize={13}
              fontFamily={WIRE_FONT}
              fill="#333"
            />
          )}
        </>
      )

    case ElementType.SWITCH:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            cornerRadius={el.height / 2}
            fill={el.fill || '#ccc'}
            stroke="none"
          />
          <Circle
            x={el.width - el.height / 2}
            y={el.height / 2}
            radius={el.height / 2 - 2}
            fill="white"
            stroke="#999"
            strokeWidth={1}
          />
        </>
      )

    case ElementType.SLIDER:
      return (
        <>
          <Line
            points={[0, el.height / 2, el.width, el.height / 2]}
            stroke="#ccc"
            strokeWidth={4}
          />
          <Circle
            x={el.width * 0.6}
            y={el.height / 2}
            radius={8}
            fill="white"
            stroke="#333"
            strokeWidth={1.5}
          />
        </>
      )

    case ElementType.RATING:
      return (
        <Text
          text="★★★★★"
          x={0}
          y={(el.height - el.height * 0.7) / 2}
          fontSize={el.height * 0.7}
          fontFamily={WIRE_FONT}
          fill="#999"
        />
      )

    case ElementType.FILE_UPLOAD:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#f5f5f5'}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            cornerRadius={el.cornerRadius}
            dash={[5, 5]}
          />
          <Line
            points={[el.width / 2, el.height / 2 - 18, el.width / 2, el.height / 2 + 2]}
            stroke="#999"
            strokeWidth={2}
          />
          <Line
            points={[el.width / 2 - 8, el.height / 2 - 10, el.width / 2, el.height / 2 - 18, el.width / 2 + 8, el.height / 2 - 10]}
            stroke="#999"
            strokeWidth={2}
          />
          <Text
            text={el.text || 'Upload File'}
            x={0}
            y={el.height / 2 + 6}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#999"
            width={el.width}
            align="center"
          />
        </>
      )

    case ElementType.TABLE: {
      const rows = 4
      const cols = 3
      const rowH = el.height / rows
      const colW = el.width / cols
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
          {Array.from({ length: rows - 1 }, (_, i) => (
            <Line
              key={`h${i}`}
              points={[0, rowH * (i + 1), el.width, rowH * (i + 1)]}
              stroke={el.stroke || '#ccc'}
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: cols - 1 }, (_, i) => (
            <Line
              key={`v${i}`}
              points={[colW * (i + 1), 0, colW * (i + 1), el.height]}
              stroke={el.stroke || '#ccc'}
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: cols }, (_, i) => (
            <Text
              key={`th${i}`}
              text="Header"
              x={colW * i + 6}
              y={4}
              fontSize={12}
              fontFamily={WIRE_FONT}
              fill="#333"
            />
          ))}
        </>
      )
    }

    case ElementType.FORM_LABEL:
      return (
        <Text
          text={el.text || 'Label'}
          x={0}
          y={0}
          fontSize={13}
          fontFamily={WIRE_FONT}
          fill="#333"
        />
      )

    case ElementType.STATUS_BAR:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
          <Text
            text="9:41"
            x={12}
            y={(el.height - 14) / 2}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#333"
          />
          <Rect
            x={el.width - 30}
            y={(el.height - 8) / 2}
            width={20}
            height={8}
            fill="#333"
            cornerRadius={1}
          />
          <Rect
            x={el.width - 32}
            y={(el.height - 4) / 2}
            width={2}
            height={4}
            fill="#333"
          />
          <Line
            points={[el.width - 56, el.height / 2, el.width - 52, el.height / 2 - 6, el.width - 48, el.height / 2, el.width - 44, el.height / 2 - 6, el.width - 40, el.height / 2]}
            stroke="#333"
            strokeWidth={2}
          />
        </>
      )

    case ElementType.NAV_BAR:
    case ElementType.TOP_BAR:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
          <Line
            points={[12, el.height / 2 - 6, 6, el.height / 2, 12, el.height / 2 + 6]}
            stroke="#333"
            strokeWidth={2}
          />
          <Text
            text={el.text || 'Title'}
            x={0}
            y={(el.height - 14) / 2}
            fontSize={16}
            fontFamily={WIRE_FONT}
            fill="#333"
            width={el.width}
            align="center"
          />
          <Text
            text="Action"
            x={el.width - 54}
            y={(el.height - 14) / 2}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#4A90D9"
          />
        </>
      )

    case ElementType.BOTTOM_BAR: {
      const spacing = el.width / 4
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
          />
          {Array.from({ length: 4 }, (_, i) => (
            <Rect
              key={i}
              x={spacing * i + spacing / 2 - 8}
              y={el.height / 2 - 8}
              width={16}
              height={16}
              fill="#ddd"
              cornerRadius={2}
            />
          ))}
        </>
      )
    }

    case ElementType.CARD:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke || '#e0e0e0'}
            strokeWidth={el.strokeWidth || 1}
            cornerRadius={el.cornerRadius || 8}
          />
          <Line
            points={[0, 36, el.width, 36]}
            stroke="#e0e0e0"
            strokeWidth={0.5}
          />
          <Rect
            x={12}
            y={12}
            width={el.width * 0.4}
            height={8}
            fill="#ddd"
            cornerRadius={2}
          />
        </>
      )

    case ElementType.LIST_ITEM:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke}
            strokeWidth={0}
          />
          <Line
            points={[0, el.height, el.width, el.height]}
            stroke={el.stroke || '#e0e0e0'}
            strokeWidth={0.5}
          />
          <Rect
            x={12}
            y={(el.height - 16) / 2}
            width={16}
            height={16}
            fill="#ddd"
            cornerRadius={2}
          />
          <Rect
            x={40}
            y={(el.height - 10) / 2}
            width={el.width * 0.5}
            height={8}
            fill="#ddd"
            cornerRadius={2}
          />
          <Line
            points={[el.width - 20, el.height / 2 - 5, el.width - 14, el.height / 2, el.width - 20, el.height / 2 + 5]}
            stroke="#999"
            strokeWidth={1.5}
          />
        </>
      )

    case ElementType.DRAWER:
      return (
        <>
          <Rect
            x={-el.width}
            y={0}
            width={el.width}
            height={el.height}
            fill="rgba(0,0,0,0.3)"
          />
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke || '#e0e0e0'}
            strokeWidth={1}
          />
          <Text
            text={el.text || 'Drawer'}
            x={16}
            y={16}
            fontSize={16}
            fontFamily={WIRE_FONT}
            fill="#333"
          />
          <Text
            text="✕"
            x={el.width - 30}
            y={12}
            fontSize={18}
            fontFamily={WIRE_FONT}
            fill="#666"
          />
        </>
      )

    case ElementType.MODAL:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#fff'}
            stroke={el.stroke || '#ccc'}
            strokeWidth={1}
            cornerRadius={el.cornerRadius || 8}
          />
          <Text
            text={el.text || 'Modal Title'}
            x={16}
            y={16}
            fontSize={16}
            fontFamily={WIRE_FONT}
            fill="#333"
          />
          <Line
            points={[0, 48, el.width, 48]}
            stroke="#e0e0e0"
            strokeWidth={0.5}
          />
          <Rect
            x={el.width / 2 - 100}
            y={el.height - 48}
            width={80}
            height={32}
            fill="#4A90D9"
            cornerRadius={4}
          />
          <Text
            text="OK"
            x={el.width / 2 - 100}
            y={el.height - 42}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#fff"
            width={80}
            align="center"
          />
          <Rect
            x={el.width / 2 + 20}
            y={el.height - 48}
            width={80}
            height={32}
            fill="#fff"
            stroke="#ccc"
            strokeWidth={1}
            cornerRadius={4}
          />
          <Text
            text="Cancel"
            x={el.width / 2 + 20}
            y={el.height - 42}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#333"
            width={80}
            align="center"
          />
        </>
      )

    case ElementType.AVATAR:
      return (
        <>
          <Circle
            radiusX={0}
            radiusY={0}
            x={0}
            y={0}
          />
          <Ellipse
            radiusX={el.width / 2}
            radiusY={el.height / 2}
            fill={el.fill || '#e0e0e0'}
            stroke=""
          />
          <Circle
            x={0}
            y={-el.height * 0.08}
            radius={el.width * 0.2}
            fill="#c0c0c0"
          />
          <Ellipse
            x={0}
            y={el.height * 0.22}
            radiusX={el.width * 0.3}
            radiusY={el.height * 0.16}
            fill="#c0c0c0"
          />
        </>
      )

    case ElementType.TEXT:
      return (
        <Text
          text={el.text || 'Text'}
          x={0}
          y={0}
          fontSize={16}
          fontFamily={WIRE_FONT}
          fill="#333"
          width={el.width}
          height={el.height}
          wrap="word"
        />
      )

    case ElementType.ICON: {
      const cx = el.width / 2
      const cy = el.height / 2
      const r = Math.min(el.width, el.height) / 2 - 2
      return (
        <Line
          points={[
            cx, cy - r,
            cx + r * 0.95, cy + r * 0.31,
            cx - r * 0.59, cy - r * 0.19,
            cx + r * 0.59, cy - r * 0.19,
            cx - r * 0.95, cy + r * 0.31,
          ]}
          stroke={el.stroke || '#333'}
          strokeWidth={2}
          closed
          fill={el.fill !== 'none' ? el.fill : undefined}
        />
      )
    }

    case ElementType.IMAGE_PLACEHOLDER:
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#f0f0f0'}
            stroke={el.stroke || '#ccc'}
            strokeWidth={el.strokeWidth || 1}
            dash={[5, 5]}
          />
          <Line
            points={[0, 0, el.width, el.height]}
            stroke="#ccc"
            strokeWidth={0.5}
          />
          <Line
            points={[el.width, 0, 0, el.height]}
            stroke="#ccc"
            strokeWidth={0.5}
          />
          <Text
            text={el.text || 'Image'}
            x={0}
            y={(el.height - 14) / 2}
            fontSize={14}
            fontFamily={WIRE_FONT}
            fill="#999"
            width={el.width}
            align="center"
          />
        </>
      )

    case ElementType.CHART_PLACEHOLDER: {
      const barCount = 5
      const barGap = 8
      const totalGap = barGap * (barCount + 1)
      const barW = (el.width - totalGap - 20) / barCount
      const heights = [0.4, 0.7, 0.5, 0.9, 0.6]
      const baseY = el.height - 24
      const maxBarH = el.height - 44
      return (
        <>
          <Rect
            width={el.width}
            height={el.height}
            fill={el.fill || '#f0f0f0'}
            stroke={el.stroke || '#ccc'}
            strokeWidth={el.strokeWidth || 1}
          />
          {Array.from({ length: barCount }, (_, i) => (
            <Rect
              key={i}
              x={10 + barGap + i * (barW + barGap)}
              y={baseY - maxBarH * heights[i]}
              width={barW}
              height={maxBarH * heights[i]}
              fill="#b0c4de"
            />
          ))}
          <Line
            points={[10, baseY, el.width - 10, baseY]}
            stroke="#999"
            strokeWidth={1}
          />
        </>
      )
    }

    case ElementType.CUSTOM:
    default:
      return (
        <Rect
          width={el.width}
          height={el.height}
          fill={el.fill}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth}
          cornerRadius={el.cornerRadius}
        />
      )
  }
}

const WireframeElement: React.FC<WireframeElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDragEnd,
  onTransformEnd,
  onDoubleClick,
}) => {
  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      draggable={!element.locked}
      opacity={element.opacity ?? 1}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onDragEnd(element.id, e.target.x(), e.target.y())
      }}
      onDoubleClick={() => onDoubleClick(element.id)}
      onTransformEnd={(e) => {
        const node = e.target
        onTransformEnd(element.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * node.scaleX()),
          height: Math.max(5, node.height() * node.scaleY()),
          rotation: node.rotation(),
        })
        node.scaleX(1)
        node.scaleY(1)
      }}
    >
      {element.type === ElementType.CIRCLE ||
      element.type === ElementType.RADIO ||
      element.type === ElementType.AVATAR ? (
        <Group x={element.width / 2} y={element.height / 2}>
          {renderElement(element)}
        </Group>
      ) : (
        renderElement(element)
      )}
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={element.width + 8}
          height={element.height + 8}
          stroke="#4A90D9"
          strokeWidth={2}
          dash={[6, 3]}
          listening={false}
        />
      )}
    </Group>
  )
}

export default WireframeElement
