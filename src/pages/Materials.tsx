import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronDown, ChevronUp, Check, X, Package } from 'lucide-react'
import type { MaterialCategory } from '@/types'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const categoryTabs: { label: string; value: MaterialCategory | '全部' }[] = [
  { label: '全部', value: '全部' },
  { label: '工具', value: '工具' },
  { label: '辅料', value: '辅料' },
  { label: '布料', value: '布料' },
]

const categoryBadgeStyles: Record<MaterialCategory, string> = {
  '工具': 'bg-terra-100 text-terra-700',
  '辅料': 'bg-sage-100 text-sage-700',
  '布料': 'bg-cream-300 text-cream-500',
}

export default function Materials() {
  const [activeTab, setActiveTab] = useState<MaterialCategory | '全部'>('全部')
  const [alertExpanded, setAlertExpanded] = useState(false)

  const materials = useStore(s => s.materials)
  const toggleMaterialOwned = useStore(s => s.toggleMaterialOwned)
  const getMissingMaterials = useStore(s => s.getMissingMaterials)
  const getMissingMaterialsForIdea = useStore(s => s.getMissingMaterialsForIdea)
  const projects = useStore(s => s.projects)
  const ideas = useStore(s => s.ideas)

  const filteredMaterials = activeTab === '全部'
    ? materials
    : materials.filter(m => m.category === activeTab)

  const missingMaterials = getMissingMaterials()
  const ownedCount = materials.filter(m => m.owned).length

  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning')

  const projectMissingMap = activeProjects.map(project => {
    const idea = ideas.find(i => i.id === project.ideaId)
    const missing = getMissingMaterialsForIdea(project.ideaId)
    return { project, idea, missing }
  }).filter(item => item.missing.length > 0)

  return (
    <div className="min-h-screen bg-cream-50 font-body pb-28 md:pb-8">
      <div className="container mx-auto px-4 pt-20 md:pt-24 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-sage-800">
              材料箱
            </h1>
            <p className="mt-1.5 text-sage-500 text-sm">
              清点你的手工材料，为改造计划做好准备
            </p>
          </div>

          {missingMaterials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setAlertExpanded(e => !e)}
                className={cn(
                  'w-full flex items-center justify-between px-5 py-3.5 text-left',
                  'bg-gradient-to-r from-red-50 to-orange-50',
                  'border border-red-200/60 rounded-2xl',
                  'hover:from-red-100 hover:to-orange-100 transition-colors'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      你还缺少 {missingMaterials.length} 件材料
                    </p>
                    <p className="text-xs text-red-500 mt-0.5">
                      点击查看详情
                    </p>
                  </div>
                </div>
                {alertExpanded
                  ? <ChevronUp className="w-4 h-4 text-red-400" />
                  : <ChevronDown className="w-4 h-4 text-red-400" />
                }
              </button>

              <AnimatePresence>
                {alertExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-red-50/50 border border-t-0 border-red-200/60 rounded-b-2xl">
                      {projectMissingMap.length > 0 ? (
                        <div className="space-y-2.5">
                          {projectMissingMap.map(({ project, idea, missing }) => (
                            <div key={project.id} className="text-sm">
                              <span className="font-medium text-sage-700">
                                {idea?.title ?? '未知项目'}
                              </span>
                              <span className="text-sage-400 mx-1.5">·</span>
                              <span className="text-red-600">
                                缺少: {missing.map(m => m.name).join('、')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-red-600">
                          缺少的材料: {missingMaterials.map(m => m.name).join('、')}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <div className="flex items-center gap-1.5 mb-5 p-1 bg-cream-200/60 rounded-xl w-fit">
            {categoryTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.value
                    ? 'bg-white text-terra-600 shadow-soft'
                    : 'text-sage-500 hover:text-sage-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredMaterials.map((material, index) => (
              <MaterialCard
                key={material.id}
                material={material}
                onToggle={() => toggleMaterialOwned(material.id)}
                index={index}
              />
            ))}
          </div>

          {projectMissingMap.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-sage-800 mb-4">
                进行中的改造需要
              </h2>
              <div className="space-y-3">
                {projectMissingMap.map(({ project, idea, missing }) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-card border border-cream-200/80"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 className="font-medium text-sage-800 text-sm">
                        {idea?.title ?? '未知项目'}
                      </h3>
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                        project.status === 'in_progress'
                          ? 'bg-sage-100 text-sage-700'
                          : 'bg-terra-100 text-terra-700'
                      )}>
                        {project.status === 'in_progress' ? '进行中' : '规划中'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {missing.map(m => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200/50"
                        >
                          <X className="w-3 h-3" />
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40">
        <div className="bg-cream-100/90 backdrop-blur-md border-t border-cream-300/50">
          <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-center gap-2">
            <Package className="w-4 h-4 text-sage-500" />
            <p className="text-sm text-sage-600">
              你有 <span className="font-semibold text-sage-800">{ownedCount}</span> / {materials.length} 件材料
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MaterialCard({
  material,
  onToggle,
  index,
}: {
  material: { id: string; name: string; category: MaterialCategory; owned: boolean; icon: string }
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={cn(
        'relative rounded-2xl p-4 transition-all duration-200',
        'bg-white shadow-card',
        material.owned
          ? 'border-2 border-sage-300/60'
          : 'border-2 border-red-200/50'
      )}
    >
      {material.owned && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-sage-400 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      <div className="text-3xl mb-3 text-center">{material.icon}</div>

      <h3 className={cn(
        'text-sm font-medium text-center mb-2 truncate',
        material.owned ? 'text-sage-800' : 'text-sage-600'
      )}>
        {material.name}
      </h3>

      <div className="flex justify-center mb-3">
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded-full font-medium',
          categoryBadgeStyles[material.category]
        )}>
          {material.category}
        </span>
      </div>

      <button
        onClick={onToggle}
        className={cn(
          'w-full py-1.5 rounded-xl text-xs font-medium transition-all',
          material.owned
            ? 'bg-sage-400 text-white hover:bg-sage-500'
            : 'border border-red-300 text-red-500 bg-red-50/50 hover:bg-red-50'
        )}
      >
        {material.owned ? '已有' : '缺少'}
      </button>
    </motion.div>
  )
}
