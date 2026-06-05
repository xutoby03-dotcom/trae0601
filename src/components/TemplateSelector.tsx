import React, { useState } from 'react'
import { useStore } from '@/store'
import { getTemplates } from '@/utils/templates'
import { LayoutTemplate, X } from 'lucide-react'
import { CanvasElement } from '@/types'

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ open, onClose }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!open) return null

  const templates = getTemplates()

  const handleSelect = (id: string) => {
    const template = templates.find((t) => t.id === id)
    if (!template) return

    const { currentPageId, addElement } = useStore.getState()
    if (!currentPageId) return

    const elements = template.createElementFn(currentPageId)
    for (const element of elements) {
      addElement(element)
    }

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 640,
          width: '90%',
          maxHeight: '80vh',
          background: 'var(--wire-panel)',
          borderRadius: 12,
          border: '1px solid var(--wire-border)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutTemplate size={18} style={{ color: 'var(--wire-text)' }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--wire-text)' }}>
              Choose a Template
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--wire-muted)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: 16,
          }}
        >
          {templates.map((t) => (
            <div
              key={t.id}
              onClick={() => handleSelect(t.id)}
              onMouseEnter={() => setHoveredId(t.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                border: `1px solid ${hoveredId === t.id ? 'var(--wire-accent)' : 'var(--wire-border)'}`,
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--wire-text)', marginTop: 6 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--wire-muted)', marginTop: 2 }}>
                {t.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
