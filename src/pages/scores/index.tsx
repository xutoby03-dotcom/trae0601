import { useState } from 'react'
import ScoreList from './ScoreList'
import ScoreForm from './ScoreForm'
import ScoreDetail from './ScoreDetail'
import type { Score } from '@/types'

type ViewMode = 'list' | 'detail'

export default function ScoresPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedScore, setSelectedScore] = useState<Score | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)

  const handleViewDetail = (score: Score) => {
    setSelectedScore(score)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setSelectedScore(null)
    setViewMode('list')
  }

  const handleAdd = () => {
    setEditingScore(null)
    setFormOpen(true)
  }

  const handleEdit = (score: Score) => {
    setEditingScore(score)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingScore(null)
  }

  if (viewMode === 'detail' && selectedScore) {
    return (
      <>
        <ScoreDetail
          score={selectedScore}
          onBack={handleBackToList}
          onEdit={handleEdit}
        />
        <ScoreForm
          isOpen={formOpen}
          onClose={handleFormClose}
          initialData={editingScore}
        />
      </>
    )
  }

  return (
    <>
      <ScoreList
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onAdd={handleAdd}
      />
      <ScoreForm
        isOpen={formOpen}
        onClose={handleFormClose}
        initialData={editingScore}
      />
    </>
  )
}
