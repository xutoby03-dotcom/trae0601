import React, { useState } from 'react'
import { useStore } from '@/store'
import { Plus, X } from 'lucide-react'

export const PageTabs: React.FC = () => {
  const { currentProjectId, pages, currentPageId, setCurrentPage, addPage, deletePage, updatePage, elements } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const projectPages = pages.filter(p => p.projectId === currentProjectId)

  const handleAddPage = () => {
    const id = crypto.randomUUID()
    addPage({
      id,
      projectId: currentProjectId!,
      name: `Page ${projectPages.length + 1}`,
      order: projectPages.length,
    })
    setCurrentPage(id)
  }

  const handleDoubleClick = (pageId: string, currentName: string) => {
    setEditingId(pageId)
    setEditValue(currentName)
  }

  const handleBlur = (pageId: string) => {
    setEditingId(null)
    if (editValue.trim()) {
      updatePage(pageId, { name: editValue.trim() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, pageId: string) => {
    if (e.key === 'Enter') handleBlur(pageId)
    if (e.key === 'Escape') setEditingId(null)
  }

  const handleDelete = (pageId: string) => {
    const pageElements = elements[pageId] ?? []
    if (pageElements.length > 0) {
      if (!window.confirm('This page has elements. Delete anyway?')) return
    }
    deletePage(pageId)
  }

  return (
    <div className="flex items-center">
      {projectPages.map(page => {
        const isActive = page.id === currentPageId
        return (
          <div
            key={page.id}
            className="group flex items-center px-3 py-1 text-sm rounded-t cursor-pointer"
            style={{
              background: isActive ? 'var(--wire-canvas)' : 'var(--wire-hover)',
              borderBottom: isActive ? '2px solid var(--wire-accent)' : '2px solid transparent',
              fontWeight: isActive ? 500 : 400,
            }}
            onClick={() => setCurrentPage(page.id)}
          >
            {editingId === page.id ? (
              <input
                className="bg-transparent border border-[var(--wire-accent)] outline-none px-1 py-0 text-sm rounded w-16"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => handleBlur(page.id)}
                onKeyDown={e => handleKeyDown(e, page.id)}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span onDoubleClick={() => handleDoubleClick(page.id, page.name)}>
                {page.name}
              </span>
            )}
            {projectPages.length > 1 && (
              <button
                className="ml-2 opacity-0 group-hover:opacity-100 hover:text-red-400"
                style={{ lineHeight: 0 }}
                onClick={e => {
                  e.stopPropagation()
                  handleDelete(page.id)
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )
      })}
      <button
        className="px-2 py-1 text-sm rounded hover:bg-[var(--wire-hover)]"
        onClick={handleAddPage}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
