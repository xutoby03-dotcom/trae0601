import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { loadProjects, saveProject, deleteProjectFromDB, initDB } from '@/utils/db'
import { Plus, Trash2, Edit, Clock } from 'lucide-react'
import type { Project } from '@/types'

const relativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const theme = useStore((s: any) => s.theme)
  const projects = useStore((s: any) => s.projects)
  const addProject = useStore((s: any) => s.addProject)
  const deleteProject = useStore((s: any) => s.deleteProject)

  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    initDB().then(async () => {
      const loaded = await loadProjects()
      for (const p of loaded) {
        addProject(p)
      }
    })
  }, [])

  const handleCreate = async () => {
    const name = newProjectName.trim() || 'Untitled Project'
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      theme: 'light',
    }
    await saveProject(project)
    addProject(project)
    setNewProjectName('')
    setIsCreating(false)
    navigate(`/editor/${project.id}`)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    await deleteProjectFromDB(id)
    deleteProject(id)
  }

  const handleEditName = async (project: Project) => {
    if (editingId === project.id) {
      const name = editingName.trim() || project.name
      const updated = { ...project, name, updatedAt: Date.now() }
      await saveProject(updated)
      useStore.getState().updateProject(project.id, { name: updated.name, updatedAt: updated.updatedAt })
      setEditingId(null)
      setEditingName('')
    } else {
      setEditingId(project.id)
      setEditingName(project.name)
    }
  }

  const isDark = theme === 'dark'

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: isDark ? '#0f0f1a' : '#f0f2f5',
        padding: '40px 24px',
        boxSizing: 'border-box',
        color: isDark ? '#e0e0e0' : '#333',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: `2px solid ${isDark ? '#6a9fd8' : '#4A90D9'}`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${isDark ? '#6a9fd8' : '#4A90D9'}`,
                  borderRadius: 2,
                }}
              />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>WireFrame Studio</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              background: isDark ? '#4A90D9' : '#4A90D9',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {isCreating && (
          <div
            style={{
              background: isDark ? '#1e1e32' : '#fff',
              border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                borderRadius: 6,
                background: isDark ? '#2a2a40' : '#fff',
                color: isDark ? '#e0e0e0' : '#333',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={handleCreate}
              style={{
                padding: '8px 16px',
                background: '#4A90D9',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewProjectName('')
              }}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: isDark ? '#999' : '#666',
                border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {projects.length === 0 && !isCreating ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                border: `3px dashed ${isDark ? '#444' : '#ccc'}`,
                borderRadius: 12,
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 24,
                  border: `2px solid ${isDark ? '#555' : '#bbb'}`,
                  borderRadius: 4,
                }}
              />
            </div>
            <p style={{ fontSize: 16, color: isDark ? '#777' : '#999', margin: 0 }}>
              Create your first wireframe prototype
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {projects.map((project: any) => (
              <div
                key={project.id}
                style={{
                  background: isDark ? '#1e1e32' : '#fff',
                  border: `1px solid ${isDark ? '#333' : '#e8e8e8'}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    height: 120,
                    background: isDark ? '#252540' : '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${isDark ? '#333' : '#e8e8e8'}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: isDark ? '#555' : '#ccc',
                      lineHeight: 1,
                    }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  {editingId === project.id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditName(project)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => handleEditName(project)}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        border: `1px solid #4A90D9`,
                        borderRadius: 4,
                        background: isDark ? '#2a2a40' : '#fff',
                        color: isDark ? '#e0e0e0' : '#333',
                        fontSize: 15,
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: 4,
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => handleEditName(project)}
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'text',
                        marginBottom: 4,
                        minHeight: 24,
                      }}
                    >
                      {project.name}
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      color: isDark ? '#666' : '#999',
                      marginBottom: 12,
                    }}
                  >
                    <Clock size={12} />
                    {relativeTime(project.updatedAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/editor/${project.id}`)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: '8px 0',
                        background: '#4A90D9',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        background: 'transparent',
                        color: '#e74c3c',
                        border: `1px solid ${isDark ? '#444' : '#e8e8e8'}`,
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectList
