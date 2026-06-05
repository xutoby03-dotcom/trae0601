import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import { ElementType, CanvasElement, Interaction } from '@/types'
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Group,
  Ungroup,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'

const TEXT_TYPES = new Set([
  ElementType.INPUT,
  ElementType.BUTTON,
  ElementType.DROPDOWN,
  ElementType.FORM_LABEL,
  ElementType.TEXT,
  ElementType.RATING,
  ElementType.FILE_UPLOAD,
  ElementType.MODAL,
  ElementType.NAV_BAR,
  ElementType.TOP_BAR,
  ElementType.LIST_ITEM,
  ElementType.CARD,
])

const PALETTE = [
  '#ffffff',
  '#f5f5f5',
  '#f0f0f0',
  '#e0e0e0',
  '#cccccc',
  '#4A90D9',
  '#333333',
  '#666666',
  'transparent',
]

const sectionHeader: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  color: 'var(--wire-muted)',
  paddingBottom: 4,
  borderBottom: '1px solid var(--wire-border)',
  marginBottom: 8,
}

const smallInput: React.CSSProperties = {
  width: 50,
  height: 24,
  border: '1px solid var(--wire-border)',
  borderRadius: 3,
  background: 'var(--wire-panel)',
  color: 'var(--wire-text)',
  fontFamily: 'monospace',
  fontSize: 11,
  textAlign: 'center',
  outline: 'none',
  padding: '0 4px',
}

const actionBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 8px',
  border: '1px solid var(--wire-border)',
  borderRadius: 4,
  background: 'var(--wire-panel)',
  color: 'var(--wire-text)',
  cursor: 'pointer',
  fontSize: 11,
  whiteSpace: 'nowrap',
}

export default function PropertiesPanel() {
  const selectedElementIds = useStore((s) => s.selectedElementIds)
  const elements = useStore((s) => s.elements)
  const currentPageId = useStore((s) => s.currentPageId)
  const pages = useStore((s) => s.pages)
  const interactions = useStore((s) => s.interactions)
  const updateElement = useStore((s) => s.updateElement)
  const deleteElement = useStore((s) => s.deleteElement)
  const lockElement = useStore((s) => s.lockElement)
  const duplicateElement = useStore((s) => s.duplicateElement)
  const bringToFront = useStore((s) => s.bringToFront)
  const sendToBack = useStore((s) => s.sendToBack)
  const groupElements = useStore((s) => s.groupElements)
  const ungroupElements = useStore((s) => s.ungroupElements)
  const addInteraction = useStore((s) => s.addInteraction)
  const deleteInteraction = useStore((s) => s.deleteInteraction)
  const updateInteraction = useStore((s) => s.updateInteraction)
  const addCustomComponent = useStore((s) => s.addCustomComponent)

  const findElement = useCallback(
    (id: string): CanvasElement | undefined => {
      for (const els of Object.values(elements)) {
        const found = els.find((e) => e.id === id)
        if (found) return found
      }
      return undefined
    },
    [elements],
  )

  const element =
    selectedElementIds.length === 1 ? findElement(selectedElementIds[0]) : undefined

  const [localValues, setLocalValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (element) {
      setLocalValues({
        x: String(element.x),
        y: String(element.y),
        width: String(element.width),
        height: String(element.height),
        rotation: String(element.rotation),
        strokeWidth: String(element.strokeWidth),
        cornerRadius: String(element.cornerRadius),
        opacity: String(element.opacity),
        fill: element.fill,
        stroke: element.stroke,
        text: element.text,
        fontSize: String(element.styleProps?.fontSize ?? 14),
      })
    } else {
      setLocalValues({})
    }
  }, [element?.id, element?.x, element?.y, element?.width, element?.height, element?.rotation, element?.strokeWidth, element?.cornerRadius, element?.opacity, element?.fill, element?.stroke, element?.text, element?.styleProps?.fontSize])

  const commitValue = useCallback(
    (key: string, value: string, numeric = true) => {
      if (!element) return
      if (key === 'text') {
        updateElement(element.id, { text: value })
        return
      }
      if (key === 'fontSize') {
        updateElement(element.id, {
          styleProps: { ...element.styleProps, fontSize: Number(value) || 14 },
        })
        return
      }
      if (key === 'fill') {
        updateElement(element.id, { fill: value })
        return
      }
      if (key === 'stroke') {
        updateElement(element.id, { stroke: value })
        return
      }
      if (key === 'opacity') {
        updateElement(element.id, { opacity: Number(value) || 0 })
        return
      }
      if (numeric) {
        const num = Number(value)
        if (isNaN(num)) return
        updateElement(element.id, { [key]: num })
      }
    },
    [element, updateElement],
  )

  const handleBlur = useCallback(
    (key: string, numeric = true) => {
      const val = localValues[key]
      if (val !== undefined) commitValue(key, val, numeric)
    },
    [localValues, commitValue],
  )

  const handleChange = useCallback((key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const elementInteractions = element
    ? interactions.filter((i) => i.elementId === element.id)
    : []

  const otherPages = pages.filter((p) => p.id !== currentPageId)

  const handleAddInteraction = useCallback(() => {
    if (!element || otherPages.length === 0) return
    const interaction: Interaction = {
      id: crypto.randomUUID(),
      elementId: element.id,
      trigger: 'onClick',
      action: 'navigate',
      targetPageId: otherPages[0].id,
    }
    addInteraction(interaction)
  }, [element, otherPages, addInteraction])

  const handleSaveAsCustom = useCallback(() => {
    if (selectedElementIds.length < 2) return
    const selectedEls = selectedElementIds.map(id => findElement(id)).filter(Boolean) as CanvasElement[]
    const name = prompt('Component name:', 'My Component')
    if (!name) return
    const currentProjectId = useStore.getState().currentProjectId
    addCustomComponent({
      id: crypto.randomUUID(),
      projectId: currentProjectId ?? '',
      name,
      category: 'custom',
      elements: selectedEls,
    })
  }, [selectedElementIds, findElement, addCustomComponent])

  const handleGroup = useCallback(() => {
    if (selectedElementIds.length < 2) return
    groupElements(selectedElementIds, crypto.randomUUID())
  }, [selectedElementIds, groupElements])

  const handleUngroup = useCallback(() => {
    if (!element?.groupId) return
    ungroupElements(element.groupId)
  }, [element, ungroupElements])

  const selectedElements = selectedElementIds
    .map((id) => findElement(id))
    .filter(Boolean) as CanvasElement[]

  const commonGroupId =
    selectedElementIds.length > 1 &&
    selectedElements.every((e) => e.groupId && e.groupId === selectedElements[0].groupId)
      ? selectedElements[0].groupId
      : null

  if (!element) {
    return (
      <div
        style={{
          width: 280,
          height: '100%',
          background: 'var(--wire-panel)',
          borderLeft: '1px solid var(--wire-border)',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--wire-muted)',
          fontSize: 12,
          padding: 20,
          textAlign: 'center',
        }}
      >
        Select an element to edit properties
      </div>
    )
  }

  return (
    <div
      style={{
        width: 280,
        height: '100%',
        background: 'var(--wire-panel)',
        borderLeft: '1px solid var(--wire-border)',
        overflowY: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--wire-text)', fontWeight: 600 }}>
        {element.type}
      </div>

      <div>
        <div style={sectionHeader}>Position & Size</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['x', 'y', 'width', 'height'] as const).map((key) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 9, color: 'var(--wire-muted)', textAlign: 'center' }}>
                {key.toUpperCase()}
              </span>
              <input
                style={smallInput}
                value={localValues[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={() => handleBlur(key)}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          <span style={{ fontSize: 9, color: 'var(--wire-muted)' }}>ROTATION (°)</span>
          <input
            style={{ ...smallInput, width: 70 }}
            value={localValues.rotation ?? ''}
            onChange={(e) => handleChange('rotation', e.target.value)}
            onBlur={() => handleBlur('rotation')}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          <span style={{ fontSize: 9, color: 'var(--wire-muted)' }}>Z-INDEX</span>
          <span style={{ ...smallInput, width: 50, lineHeight: '24px', textAlign: 'center', display: 'inline-block' }}>
            {element.zIndex}
          </span>
        </div>
      </div>

      <div>
        <div style={sectionHeader}>Appearance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <span style={{ fontSize: 10, color: 'var(--wire-muted)', display: 'block', marginBottom: 4 }}>
              Fill
            </span>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {PALETTE.map((color) => (
                <div
                  key={color}
                  onClick={() => {
                    handleChange('fill', color)
                    commitValue('fill', color)
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    border:
                      localValues.fill === color
                        ? '2px solid #4A90D9'
                        : '1px solid var(--wire-border)',
                    borderRadius: 3,
                    background: color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px' : color,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <input
              style={{ ...smallInput, width: '100%', marginTop: 4 }}
              value={localValues.fill ?? ''}
              onChange={(e) => handleChange('fill', e.target.value)}
              onBlur={() => handleBlur('fill', false)}
            />
          </div>
          <div>
            <span style={{ fontSize: 10, color: 'var(--wire-muted)', display: 'block', marginBottom: 4 }}>
              Stroke
            </span>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {PALETTE.map((color) => (
                <div
                  key={color}
                  onClick={() => {
                    handleChange('stroke', color)
                    commitValue('stroke', color)
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    border:
                      localValues.stroke === color
                        ? '2px solid #4A90D9'
                        : '1px solid var(--wire-border)',
                    borderRadius: 3,
                    background: color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px' : color,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <input
              style={{ ...smallInput, width: '100%', marginTop: 4 }}
              value={localValues.stroke ?? ''}
              onChange={(e) => handleChange('stroke', e.target.value)}
              onBlur={() => handleBlur('stroke', false)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 9, color: 'var(--wire-muted)' }}>STROKE WIDTH</span>
              <input
                style={smallInput}
                type="number"
                min={0}
                max={5}
                value={localValues.strokeWidth ?? ''}
                onChange={(e) => handleChange('strokeWidth', e.target.value)}
                onBlur={() => handleBlur('strokeWidth')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 9, color: 'var(--wire-muted)' }}>CORNER RADIUS</span>
              <input
                style={smallInput}
                type="number"
                min={0}
                max={50}
                value={localValues.cornerRadius ?? ''}
                onChange={(e) => handleChange('cornerRadius', e.target.value)}
                onBlur={() => handleBlur('cornerRadius')}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, color: 'var(--wire-muted)' }}>OPACITY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={localValues.opacity ?? 1}
                onChange={(e) => {
                  handleChange('opacity', e.target.value)
                  commitValue('opacity', e.target.value)
                }}
                style={{ flex: 1, accentColor: '#4A90D9' }}
              />
              <span style={{ fontSize: 10, color: 'var(--wire-text)', fontFamily: 'monospace', width: 28, textAlign: 'right' }}>
                {Number(localValues.opacity ?? 1).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {TEXT_TYPES.has(element.type) && (
        <div>
          <div style={sectionHeader}>Text Content</div>
          <textarea
            style={{
              width: '100%',
              height: 60,
              border: '1px solid var(--wire-border)',
              borderRadius: 3,
              background: 'var(--wire-panel)',
              color: 'var(--wire-text)',
              fontSize: 11,
              padding: 6,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            value={localValues.text ?? ''}
            onChange={(e) => handleChange('text', e.target.value)}
            onBlur={() => handleBlur('text', false)}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
            <span style={{ fontSize: 9, color: 'var(--wire-muted)' }}>FONT SIZE</span>
            <input
              style={smallInput}
              type="number"
              value={localValues.fontSize ?? ''}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              onBlur={() => handleBlur('fontSize')}
            />
          </div>
        </div>
      )}

      <div>
        <div style={sectionHeader}>Actions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <button
            style={actionBtn}
            onClick={() => lockElement(element.id)}
          >
            {element.locked ? <Unlock size={12} /> : <Lock size={12} />}
            {element.locked ? 'Unlock' : 'Lock'}
          </button>
          <button
            style={actionBtn}
            onClick={() => duplicateElement(element.id)}
          >
            <Copy size={12} /> Duplicate
          </button>
          <button
            style={{ ...actionBtn, color: '#d44' }}
            onClick={() => deleteElement(element.id)}
          >
            <Trash2 size={12} /> Delete
          </button>
          <button
            style={actionBtn}
            onClick={() => bringToFront(element.id)}
          >
            <ArrowUp size={12} /> Front
          </button>
          <button
            style={actionBtn}
            onClick={() => sendToBack(element.id)}
          >
            <ArrowDown size={12} /> Back
          </button>
          {selectedElementIds.length > 1 && !commonGroupId && (
            <button style={actionBtn} onClick={handleGroup}>
              <Group size={12} /> Group
            </button>
          )}
          {commonGroupId && (
            <button style={actionBtn} onClick={handleUngroup}>
              <Ungroup size={12} /> Ungroup
            </button>
          )}
          {selectedElementIds.length > 1 && (
            <button style={actionBtn} onClick={handleSaveAsCustom}>
              <Copy size={12} /> Save as Component
            </button>
          )}
        </div>
      </div>

      <div>
        <div style={sectionHeader}>Interactions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {elementInteractions.map((interaction) => {
            const targetPage = pages.find((p) => p.id === interaction.targetPageId)
            return (
              <div
                key={interaction.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 6px',
                  border: '1px solid var(--wire-border)',
                  borderRadius: 4,
                  fontSize: 11,
                  color: 'var(--wire-text)',
                }}
              >
                <span style={{ fontSize: 9, color: 'var(--wire-muted)', textTransform: 'uppercase' }}>
                  {interaction.trigger}
                </span>
                <span style={{ fontSize: 10 }}>→</span>
                <span style={{ fontSize: 10 }}>Navigate to</span>
                {interaction.targetPageId && (
                  <span
                    style={{
                      fontSize: 10,
                      color: '#4A90D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {targetPage?.name ?? interaction.targetPageId}
                  </span>
                )}
                <select
                  value={interaction.targetPageId}
                  onChange={(e) =>
                    updateInteraction(interaction.id, { targetPageId: e.target.value })
                  }
                  style={{
                    flex: 1,
                    fontSize: 10,
                    border: '1px solid var(--wire-border)',
                    borderRadius: 3,
                    background: 'var(--wire-panel)',
                    color: 'var(--wire-text)',
                    padding: '1px 2px',
                    outline: 'none',
                    minWidth: 0,
                  }}
                >
                  {otherPages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteInteraction(interaction.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--wire-muted)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}
          <button
            style={{
              ...actionBtn,
              justifyContent: 'center',
              width: '100%',
              opacity: otherPages.length === 0 ? 0.5 : 1,
            }}
            disabled={otherPages.length === 0}
            onClick={handleAddInteraction}
          >
            <Plus size={12} /> Add Interaction
          </button>
        </div>
      </div>
    </div>
  )
}
