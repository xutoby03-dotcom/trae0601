import { Link, useNavigate } from 'react-router-dom'
import { Plus, FolderKanban } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice, formatDate } from '@/utils/helpers'

export default function Projects() {
  const navigate = useNavigate()
  const projects = useStore((s) => s.projects)
  const projectMaterials = useStore((s) => s.projectMaterials)
  const materials = useStore((s) => s.materials)

  const getProjectCost = (projectId: string) => {
    const pms = projectMaterials.filter((pm) => pm.projectId === projectId)
    return pms.reduce((total, pm) => {
      const material = materials.find((m) => m.id === pm.materialId)
      return total + (material ? material.price * pm.usedQuantity : 0)
    }, 0)
  }

  const getProjectMaterialCount = (projectId: string) => {
    return projectMaterials.filter((pm) => pm.projectId === projectId).length
  }

  const getProjectProgress = (projectId: string) => {
    const pms = projectMaterials.filter((pm) => pm.projectId === projectId)
    if (pms.length === 0) return 0
    const total = pms.reduce((s, pm) => s + pm.requiredQuantity, 0)
    const used = pms.reduce((s, pm) => s + pm.usedQuantity, 0)
    return total > 0 ? (used / total) * 100 : 0
  }

  const activeProjects = projects.filter((p) => p.status === '进行中')
  const completedProjects = projects.filter((p) => p.status === '已完成')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-6 h-6 text-caramel" />
          <h2 className="font-serif text-2xl font-bold text-bark">我的项目</h2>
        </div>
        <button onClick={() => navigate('/projects/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />创建项目
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-10 h-10 text-sand" />
          </div>
          <p className="text-bark font-serif text-lg mb-2">还没有项目</p>
          <p className="text-sand text-sm mb-6">创建一个项目，开始管理你的手作材料</p>
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            <Plus className="w-4 h-4 inline mr-1" />创建项目
          </button>
        </div>
      ) : (
        <>
          {activeProjects.length > 0 && (
            <div>
              <h3 className="section-title">进行中</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProjects.map((project) => {
                  const cost = getProjectCost(project.id)
                  const matCount = getProjectMaterialCount(project.id)
                  const progress = getProjectProgress(project.id)
                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="card hover:shadow-craft-hover hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge-mint">进行中</span>
                        <span className="text-xs text-sand">{formatDate(project.createdAt)}</span>
                      </div>
                      <h4 className="font-serif font-semibold text-bark text-lg mb-2">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-sand line-clamp-2 mb-3">{project.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-caramel">{matCount} 种材料</span>
                        <span className="font-medium text-bark">{formatPrice(cost)}</span>
                      </div>
                      <div className="mt-3 h-2 bg-sand-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-mint rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-sand mt-1">进度 {progress.toFixed(0)}%</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {completedProjects.length > 0 && (
            <div>
              <h3 className="section-title">已完成</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedProjects.map((project) => {
                  const cost = getProjectCost(project.id)
                  const matCount = getProjectMaterialCount(project.id)
                  return (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="card hover:shadow-craft-hover hover:-translate-y-0.5 transition-all duration-200 opacity-80"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge-caramel">已完成</span>
                        <span className="text-xs text-sand">{formatDate(project.updatedAt)}</span>
                      </div>
                      <h4 className="font-serif font-semibold text-bark text-lg mb-2">{project.name}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-caramel">{matCount} 种材料</span>
                        <span className="font-medium text-bark">{formatPrice(cost)}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
