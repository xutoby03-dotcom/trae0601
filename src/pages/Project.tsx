import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  Clock,
  Package,
  CheckCircle2,
  Circle,
  Plus,
  ChevronRight,
  Camera,
  Sparkles,
  X,
  Shirt,
  Palette,
  AlertTriangle,
} from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Difficulty, UpcycleIdea, ProjectStatus, Material } from '@/types'

const difficultyConfig: Record<Difficulty, { color: string; bg: string }> = {
  '简单': { color: 'text-sage-700', bg: 'bg-sage-100' },
  '中等': { color: 'text-terra-700', bg: 'bg-terra-100' },
  '困难': { color: 'text-red-700', bg: 'bg-red-100' },
}

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  planning: { label: '规划中', color: 'text-sage-700', bg: 'bg-sage-100', icon: Circle },
  in_progress: { label: '进行中', color: 'text-terra-700', bg: 'bg-terra-100', icon: Clock },
  completed: { label: '已完成', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
}

export default function Project() {
  const { id: clothingId } = useParams<{ id: string }>()
  const store = useStore()
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)
  const [newStepText, setNewStepText] = useState('')

  const clothing = store.clothing.find(c => c.id === clothingId)
  const ideas = clothingId ? store.getIdeasByClothing(clothingId) : []
  const projects = clothingId ? store.getProjectsByClothing(clothingId) : []
  const project = projects.length > 0 ? projects[0] : undefined

  const selectedIdea = selectedIdeaId
    ? ideas.find(i => i.id === selectedIdeaId)
    : ideas.length > 0 ? ideas[0] : null

  if (!clothing) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-6">
            <Shirt className="w-10 h-10 text-sage-400" />
          </div>
          <h2 className="font-display text-2xl text-sage-800 mb-3">未找到衣物</h2>
          <p className="text-sage-500 mb-6 font-body">该衣物可能已被移除或不存在</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terra-500 text-white rounded-2xl font-medium hover:bg-terra-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </motion.div>
      </div>
    )
  }

  const handleCreateProject = (ideaId: string) => {
    store.createProject(clothing.id, ideaId)
  }

  const handleStatusChange = (status: ProjectStatus) => {
    if (project) {
      store.updateProjectStatus(project.id, status)
    }
  }

  const handleAddStep = () => {
    if (project && newStepText.trim()) {
      store.addProjectStep(project.id, newStepText.trim())
      setNewStepText('')
    }
  }

  const handleToggleStep = (stepId: string) => {
    if (project) {
      store.toggleProjectStep(project.id, stepId)
    }
  }

  const handlePhotoUpload = (type: 'before' | 'after') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !project) return
      const reader = new FileReader()
      reader.onload = (re) => {
        const base64 = re.target?.result as string
        if (type === 'before') {
          store.updateProjectPhotos(project.id, base64, undefined)
        } else {
          store.updateProjectPhotos(project.id, undefined, base64)
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleFavorite = (ideaId: string) => {
    store.toggleFavorite(ideaId)
  }

  return (
    <div className="min-h-screen bg-cream-100 pb-24 md:pb-8">
      <div className="md:pt-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sage-500 hover:text-sage-700 transition-colors mb-6 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-card overflow-hidden mb-6"
          >
            <div className="flex flex-col sm:flex-row">
              {clothing.photo && (
                <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                  <img
                    src={clothing.photo}
                    alt={clothing.type}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1">
                <h1 className="font-display text-2xl text-sage-900 mb-4">
                  {clothing.type}改造计划
                </h1>
                <div className="grid grid-cols-2 gap-3">
                  <InfoChip icon={<Shirt className="w-3.5 h-3.5" />} label="类型" value={clothing.type} />
                  <InfoChip icon={<Palette className="w-3.5 h-3.5" />} label="面料" value={clothing.fabric} />
                  <InfoChip icon={<Palette className="w-3.5 h-3.5" />} label="颜色" value={clothing.color} />
                  <InfoChip icon={<AlertTriangle className="w-3.5 h-3.5" />} label="破损" value={clothing.damageLocation} />
                </div>
              </div>
            </div>
          </motion.header>

          {project && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white rounded-3xl shadow-card p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-sage-900">项目状态</h2>
                {(() => {
                  const cfg = statusConfig[project.status]
                  const StatusIcon = cfg.icon
                  return (
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', cfg.color, cfg.bg)}>
                      <StatusIcon className="w-4 h-4" />
                      {cfg.label}
                    </span>
                  )
                })()}
              </div>
              <div className="flex flex-wrap gap-2">
                {project.status !== 'planning' && (
                  <button
                    onClick={() => handleStatusChange('planning')}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-sage-50 text-sage-600 hover:bg-sage-100 transition-colors"
                  >
                    回到规划
                  </button>
                )}
                {project.status !== 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-terra-50 text-terra-600 hover:bg-terra-100 transition-colors"
                  >
                    开始制作
                  </button>
                )}
                {project.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    标记完成
                  </button>
                )}
              </div>

              <AnimatePresence>
                {project.status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-terra-50 to-sage-50 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-terra-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-terra-800 font-semibold">🎉 改造完成！</p>
                        <p className="text-sm text-sage-600">你成功让旧衣焕发了新生，为环保出了一份力！</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="font-display text-xl text-sage-900 mb-4">改造方案</h2>
            {ideas.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                {ideas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => setSelectedIdeaId(idea.id)}
                    className={cn(
                      'flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap',
                      (selectedIdea?.id === idea.id)
                        ? 'bg-terra-500 text-white shadow-card'
                        : 'bg-white text-sage-600 hover:bg-cream-200 shadow-soft'
                    )}
                  >
                    {idea.title}
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          <AnimatePresence mode="wait">
            {selectedIdea && (
              <motion.div
                key={selectedIdea.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <IdeaCard
                  idea={selectedIdea}
                  materials={store.materials}
                  missingMaterials={store.getMissingMaterialsForIdea(selectedIdea.id)}
                  isProjectExists={!!project}
                  onFavorite={() => handleFavorite(selectedIdea.id)}
                  onStartProject={() => handleCreateProject(selectedIdea.id)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {project && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-3xl shadow-card p-6 mb-6"
              >
                <h2 className="font-display text-lg text-sage-900 mb-4">自定义步骤</h2>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                    placeholder="添加自定义步骤..."
                    className="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm text-sage-800 placeholder:text-sage-400 focus:outline-none focus:border-terra-300 focus:ring-2 focus:ring-terra-200 transition-all"
                  />
                  <button
                    onClick={handleAddStep}
                    disabled={!newStepText.trim()}
                    className="px-4 py-2.5 bg-terra-500 text-white rounded-xl text-sm font-medium hover:bg-terra-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {project.customSteps.length > 0 ? (
                  <div className="space-y-2">
                    {project.customSteps.map((step, idx) => (
                      <motion.button
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleToggleStep(step.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                          step.completed
                            ? 'bg-sage-50 text-sage-500 line-through'
                            : 'bg-cream-50 text-sage-800 hover:bg-cream-100'
                        )}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-sage-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-sage-300 flex-shrink-0" />
                        )}
                        <span className="text-sm">{step.description}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sage-400 text-sm text-center py-4">还没有自定义步骤，添加一个吧</p>
                )}
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="bg-white rounded-3xl shadow-card p-6 mb-6"
              >
                <h2 className="font-display text-lg text-sage-900 mb-4">改造对比</h2>
                <div className="grid grid-cols-2 gap-4">
                  <PhotoUpload
                    label="改造前"
                    photo={project.beforePhoto}
                    onUpload={() => handlePhotoUpload('before')}
                  />
                  <PhotoUpload
                    label="改造后"
                    photo={project.afterPhoto}
                    onUpload={() => handlePhotoUpload('after')}
                  />
                </div>
              </motion.section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-cream-50 rounded-xl">
      <span className="text-terra-500">{icon}</span>
      <div>
        <p className="text-[10px] text-sage-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm text-sage-700 font-medium leading-tight">{value}</p>
      </div>
    </div>
  )
}

function IdeaCard({
  idea,
  materials,
  missingMaterials,
  isProjectExists,
  onFavorite,
  onStartProject,
}: {
  idea: UpcycleIdea
  materials: Material[]
  missingMaterials: Material[]
  isProjectExists: boolean
  onFavorite: () => void
  onStartProject: () => void
}) {
  const diff = difficultyConfig[idea.difficulty]
  const ideaMaterials = materials.filter(m => idea.requiredMaterialIds.includes(m.id))

  return (
    <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-display text-xl text-sage-900 mb-1">{idea.title}</h3>
          <p className="text-sage-500 text-sm leading-relaxed">{idea.description}</p>
        </div>
        <button
          onClick={onFavorite}
          className="ml-3 flex-shrink-0 p-2 rounded-xl hover:bg-cream-100 transition-colors"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              idea.favorited ? 'fill-red-400 text-red-400' : 'text-sage-300'
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', diff.color, diff.bg)}>
          {idea.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 text-sage-500 text-xs">
          <Clock className="w-3.5 h-3.5" />
          {idea.estimatedTime}
        </span>
      </div>

      <div className="mb-5">
        <h4 className="font-display text-sm text-sage-800 mb-3">制作步骤</h4>
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-cream-300" />
          {idea.steps.map((step, idx) => (
            <div key={idx} className="relative pb-4 last:pb-0">
              <div className="absolute left-[-15px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-terra-400 bg-white z-10" />
              <p className="text-sm text-sage-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h4 className="font-display text-sm text-sage-800 mb-3">所需材料</h4>
        <div className="flex flex-wrap gap-2">
          {ideaMaterials.map(mat => {
            const isMissing = missingMaterials.some(m => m.id === mat.id)
            return (
              <span
                key={mat.id}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium',
                  isMissing
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-sage-50 text-sage-600 border border-sage-200'
                )}
              >
                <span>{mat.icon}</span>
                {mat.name}
                {isMissing && <X className="w-3 h-3" />}
              </span>
            )
          })}
        </div>
        {missingMaterials.length > 0 && (
          <p className="text-xs text-red-400 mt-2">
            缺少 {missingMaterials.length} 种材料
          </p>
        )}
      </div>

      {!isProjectExists && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartProject}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-terra-500 to-terra-600 text-white rounded-2xl font-medium hover:from-terra-600 hover:to-terra-700 transition-all shadow-card"
        >
          <Sparkles className="w-4 h-4" />
          开始改造
        </motion.button>
      )}
    </div>
  )
}

function PhotoUpload({
  label,
  photo,
  onUpload,
}: {
  label: string
  photo: string
  onUpload: () => void
}) {
  return (
    <div className="flex flex-col">
      <p className="text-xs text-sage-500 mb-2 font-medium text-center">{label}</p>
      <button
        onClick={onUpload}
        className={cn(
          'relative rounded-2xl overflow-hidden aspect-square border-2 border-dashed transition-all',
          photo
            ? 'border-sage-200'
            : 'border-cream-300 hover:border-terra-300 bg-cream-50'
        )}
      >
        {photo ? (
          <img src={photo} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Camera className="w-8 h-8 text-sage-300" />
            <span className="text-xs text-sage-400">上传照片</span>
          </div>
        )}
      </button>
    </div>
  )
}
