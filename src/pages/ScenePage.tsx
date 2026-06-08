import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { SceneCard } from '../components/SceneCard'
import { SceneList } from '../components/SceneList'
import { sceneTemplates } from '../utils/sceneTemplates'
import type { SceneTemplate, SceneType } from '../store/types'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'

export default function ScenePage() {
  const navigate = useNavigate()
  const equipment = useStore((s) => s.equipment)
  const applySceneTemplate = useStore((s) => s.applySceneTemplate)
  const addToChecklist = useStore((s) => s.addToChecklist)

  const [selectedScene, setSelectedScene] = useState<SceneTemplate | null>(null)

  const handleSceneSelect = (template: SceneTemplate) => {
    setSelectedScene(template)
  }

  const handleApplyScene = () => {
    if (!selectedScene) return
    const today = new Date().toISOString().split('T')[0]
    applySceneTemplate(selectedScene.id as SceneType, selectedScene.name, today)

    selectedScene.recommendedItems.forEach((group) => {
      group.itemNames.forEach((name) => {
        const match = equipment.find((e) =>
          e.name.includes(name.replace(/[\(\)（）].*/, '').slice(0, 2))
        )
        if (match) {
          addToChecklist(match.id)
        }
      })
    })

    navigate('/')
  }

  const handleAddItem = (name: string) => {
    const match = equipment.find((e) =>
      e.name.includes(name.replace(/[\(\)（）].*/, '').slice(0, 2))
    )
    if (match) {
      addToChecklist(match.id)
    }
  }

  const equipmentNames = equipment.map((e) => e.name)

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-700 text-white shadow-lg no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-16">
            <Link to="/" className="hover:bg-white/10 p-2 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Compass className="w-6 h-6" />
            <h1 className="font-display text-xl font-bold">场景清单生成</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-forest-700 mb-2">
            选择露营场景
          </h2>
          <p className="text-sm text-gray-500">
            根据场景一键生成推荐装备清单，再按需调整
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {sceneTemplates.map((template) => (
            <SceneCard
              key={template.id}
              template={template}
              onSelect={handleSceneSelect}
              isSelected={selectedScene?.id === template.id}
            />
          ))}
        </div>

        {selectedScene && (
          <div className="camp-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-forest-600">
                {selectedScene.name} · 推荐清单
              </h3>
              <button
                onClick={handleApplyScene}
                className="camp-btn-primary flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                应用此场景
              </button>
            </div>

            <SceneList
              recommendedItems={selectedScene.recommendedItems}
              equipmentNames={equipmentNames}
              onAddItem={handleAddItem}
            />
          </div>
        )}
      </main>
    </div>
  )
}
