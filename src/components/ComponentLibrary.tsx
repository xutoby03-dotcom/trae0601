import React, { useState } from 'react'
import { useStore } from '@/store'
import { ElementType, ComponentCategory } from '@/types'
import { COMPONENT_DEFS } from '@/types/components'
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'

const CATEGORY_SECTIONS: { label: string; category: ComponentCategory | 'custom' }[] = [
  { label: 'Basic Shapes', category: 'basic' },
  { label: 'Form Components', category: 'form' },
  { label: 'Mobile Components', category: 'mobile' },
  { label: 'Common Components', category: 'common' },
  { label: 'Custom', category: 'custom' },
]

function ComponentPreview({ type }: { type: ElementType }) {
  const color = 'currentColor'
  switch (type) {
    case ElementType.RECT:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="6" y="10" width="36" height="28" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case ElementType.CIRCLE:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case ElementType.TRIANGLE:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <polygon points="24,6 6,42 42,42" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case ElementType.LINE:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <line x1="4" y1="24" x2="44" y2="24" stroke={color} strokeWidth="2" />
        </svg>
      )
    case ElementType.INPUT:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="14" width="40" height="20" fill="none" stroke={color} strokeWidth="1.5" rx="3" />
          <line x1="4" y1="34" x2="44" y2="34" stroke={color} strokeWidth="2.5" />
        </svg>
      )
    case ElementType.BUTTON:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="6" y="14" width="36" height="20" fill={color} stroke={color} strokeWidth="1.5" rx="5" />
        </svg>
      )
    case ElementType.DROPDOWN:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="14" width="40" height="20" fill="none" stroke={color} strokeWidth="1.5" rx="3" />
          <polygon points="38,22 42,28 34,28" fill={color} />
        </svg>
      )
    case ElementType.CHECKBOX:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="12" y="12" width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" rx="2" />
          <polyline points="17,24 22,30 31,18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case ElementType.RADIO:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="12" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="24" r="5" fill={color} />
        </svg>
      )
    case ElementType.SWITCH:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="8" y="18" width="32" height="12" fill="none" stroke={color} strokeWidth="1.5" rx="6" />
          <circle cx="33" cy="24" r="5" fill={color} />
        </svg>
      )
    case ElementType.SLIDER:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <line x1="6" y1="24" x2="42" y2="24" stroke={color} strokeWidth="2" />
          <circle cx="30" cy="24" r="5" fill={color} />
        </svg>
      )
    case ElementType.RATING:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <text x="24" y="30" textAnchor="middle" fontSize="18" fill={color}>★★★</text>
        </svg>
      )
    case ElementType.FILE_UPLOAD:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="8" y="8" width="32" height="32" fill="none" stroke={color} strokeWidth="1.5" rx="3" strokeDasharray="3 2" />
          <line x1="24" y1="34" x2="24" y2="18" stroke={color} strokeWidth="2" />
          <polyline points="18,24 24,18 30,24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case ElementType.TABLE:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="6" width="40" height="36" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="4" y1="16" x2="44" y2="16" stroke={color} strokeWidth="1" />
          <line x1="4" y1="26" x2="44" y2="26" stroke={color} strokeWidth="1" />
          <line x1="4" y1="32" x2="44" y2="32" stroke={color} strokeWidth="1" />
          <line x1="20" y1="6" x2="20" y2="42" stroke={color} strokeWidth="1" />
        </svg>
      )
    case ElementType.FORM_LABEL:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <text x="24" y="32" textAnchor="middle" fontSize="20" fontStyle="italic" fill={color}>Aa</text>
        </svg>
      )
    case ElementType.STATUS_BAR:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="2" y="16" width="44" height="16" fill="none" stroke={color} strokeWidth="1.5" rx="2" />
          <circle cx="10" cy="24" r="2" fill={color} />
          <circle cx="18" cy="24" r="2" fill={color} />
          <circle cx="26" cy="24" r="2" fill={color} />
        </svg>
      )
    case ElementType.NAV_BAR:
    case ElementType.TOP_BAR:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="2" y="14" width="44" height="20" fill="none" stroke={color} strokeWidth="1.5" rx="2" />
          <polyline points="12,24 8,24 12,24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="24" x2="10" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <polyline points="10,21 7,24 10,27" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="18" y1="24" x2="38" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case ElementType.BOTTOM_BAR:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="2" y="16" width="44" height="16" fill="none" stroke={color} strokeWidth="1.5" rx="2" />
          <circle cx="12" cy="24" r="2.5" fill={color} />
          <circle cx="22" cy="24" r="2.5" fill={color} />
          <circle cx="32" cy="24" r="2.5" fill={color} />
          <circle cx="42" cy="24" r="2.5" fill={color} />
        </svg>
      )
    case ElementType.CARD:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="6" width="40" height="36" fill="none" stroke={color} strokeWidth="1.5" rx="5" />
          <line x1="10" y1="28" x2="38" y2="28" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case ElementType.LIST_ITEM:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="2" y="10" width="44" height="28" fill="none" stroke={color} strokeWidth="1.5" rx="2" />
          <line x1="10" y1="20" x2="38" y2="20" stroke={color} strokeWidth="1.5" />
          <line x1="10" y1="28" x2="30" y2="28" stroke={color} strokeWidth="1" />
        </svg>
      )
    case ElementType.DRAWER:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="2" y="2" width="30" height="44" fill="none" stroke={color} strokeWidth="1.5" rx="2" />
          <rect x="6" y="6" width="22" height="4" fill={color} opacity="0.3" />
          <line x1="6" y1="16" x2="28" y2="16" stroke={color} strokeWidth="1" />
          <line x1="6" y1="22" x2="28" y2="22" stroke={color} strokeWidth="1" />
          <line x1="6" y1="28" x2="28" y2="28" stroke={color} strokeWidth="1" />
        </svg>
      )
    case ElementType.MODAL:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="6" width="40" height="36" fill="none" stroke={color} strokeWidth="1.5" rx="5" />
          <line x1="36" y1="10" x2="40" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="40" y1="10" x2="36" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case ElementType.AVATAR:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="24" cy="20" r="5" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M14,38 Q14,30 24,30 Q34,30 34,38" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case ElementType.TEXT:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <text x="24" y="34" textAnchor="middle" fontSize="26" fontWeight="bold" fill={color}>T</text>
        </svg>
      )
    case ElementType.ICON:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <polygon points="24,4 28,18 42,18 31,27 35,42 24,33 13,42 17,27 6,18 20,18" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case ElementType.IMAGE_PLACEHOLDER:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="6" width="40" height="36" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="4" y1="6" x2="44" y2="42" stroke={color} strokeWidth="1" />
          <line x1="44" y1="6" x2="4" y2="42" stroke={color} strokeWidth="1" />
        </svg>
      )
    case ElementType.CHART_PLACEHOLDER:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="4" y="6" width="40" height="36" fill="none" stroke={color} strokeWidth="1.5" />
          <rect x="10" y="28" width="6" height="10" fill={color} opacity="0.5" />
          <rect x="21" y="18" width="6" height="20" fill={color} opacity="0.5" />
          <rect x="32" y="12" width="6" height="26" fill={color} opacity="0.5" />
        </svg>
      )
    default:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48">
          <rect x="8" y="8" width="32" height="32" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
  }
}

export default function ComponentLibrary() {
  const [searchText, setSearchText] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const customComponents = useStore((s) => s.customComponents)

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('componentType', type)
  }

  const filteredDefs = COMPONENT_DEFS.filter((def) =>
    def.label.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div
      style={{
        width: 260,
        height: '100%',
        background: 'var(--wire-panel)',
        borderRight: '1px solid var(--wire-border)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--wire-text)',
          borderBottom: '1px solid var(--wire-border)',
        }}
      >
        Components
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--wire-panel)',
            border: '1px solid var(--wire-border)',
            borderRadius: 6,
            padding: '6px 8px',
          }}
        >
          <Search size={14} style={{ color: 'var(--wire-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 12,
              color: 'var(--wire-text)',
              width: '100%',
            }}
          />
        </div>
      </div>

      {CATEGORY_SECTIONS.map((section) => {
        const isCustom = section.category === 'custom'
        const items = isCustom
          ? customComponents.filter((c) =>
              c.name.toLowerCase().includes(searchText.toLowerCase())
            )
          : filteredDefs.filter((d) => d.category === section.category)

        if (!isCustom && items.length === 0) return null

        const isCollapsed = collapsed[section.category] ?? false

        return (
          <div key={section.category}>
            <div
              onClick={() => toggleSection(section.category)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                userSelect: 'none',
                color: 'var(--wire-text)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              {section.label}
            </div>

            {!isCollapsed && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 4,
                  padding: '0 12px 8px',
                }}
              >
                {isCustom
                  ? items.map((comp: any) => (
                      <div
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, `CUSTOM:${comp.id}`)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: 6,
                          borderRadius: 4,
                          cursor: 'grab',
                          color: 'var(--wire-text)',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.background =
                            'var(--wire-hover)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                        }}
                      >
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          style={{ color: 'var(--wire-text)' }}
                        >
                          <rect
                            x="8"
                            y="8"
                            width="32"
                            height="32"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            rx="4"
                          />
                          <circle cx="20" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                          <circle cx="28" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                          <circle cx="20" cy="28" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                          <circle cx="28" cy="28" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                        </svg>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--wire-muted)',
                            marginTop: 2,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                        >
                          {comp.name}
                        </span>
                      </div>
                    ))
                  : filteredDefs.filter((d) => d.category === section.category).map((def) => (
                    <div
                        key={def.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, def.type)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: 6,
                          borderRadius: 4,
                          cursor: 'grab',
                          color: 'var(--wire-text)',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.background =
                            'var(--wire-hover)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                        }}
                      >
                        <ComponentPreview type={def.type} />
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--wire-muted)',
                            marginTop: 2,
                            textAlign: 'center',
                          }}
                        >
                          {def.label}
                        </span>
                      </div>
                    ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
