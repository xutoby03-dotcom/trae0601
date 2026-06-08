import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, ShoppingCart, CheckCircle, AlertCircle, Link2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { ProjectStatus } from '@/types'
import { formatPrice, formatDate } from '@/utils/helpers'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projects = useStore((s) => s.projects)
  const materials = useStore((s) => s.materials)
  const projectMaterials = useStore((s) => s.projectMaterials)
  const updateProject = useStore((s) => s.updateProject)
  const deleteProject = useStore((s) => s.deleteProject)
  const addProjectMaterial = useStore((s) => s.addProjectMaterial)
  const removeProjectMaterial = useStore((s) => s.removeProjectMaterial)
  const updateProjectMaterial = useStore((s) => s.updateProjectMaterial)
  const consumeMaterial = useStore((s) => s.consumeMaterial)
  const addShoppingItem = useStore((s) => s.addShoppingItem)

  const project = projects.find((p) => p.id === id)
  const pms = useMemo(
    () => projectMaterials.filter((pm) => pm.projectId === id),
    [projectMaterials, id]
  )

  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [requiredQty, setRequiredQty] = useState(1)

  const availableMaterials = useMemo(
    () => materials.filter((m) => !pms.some((pm) => pm.materialId === m.id)),
    [materials, pms]
  )

  const totalCost = useMemo(() => {
    return pms.reduce((total, pm) => {
      const material = materials.find((m) => m.id === pm.materialId)
      return total + (material ? material.price * pm.usedQuantity : 0)
    }, 0)
  }, [pms, materials])

  const shortageItems = useMemo(() => {
    return pms.filter((pm) => {
      const material = materials.find((m) => m.id === pm.materialId)
      if (!material) return false
      return material.quantity < (pm.requiredQuantity - pm.usedQuantity)
    })
  }, [pms, materials])

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-sand">找不到该项目</p>
        <button onClick={() => navigate('/projects')} className="btn-primary mt-4">返回项目列表</button>
      </div>
    )
  }

  const handleAddMaterial = () => {
    if (!selectedMaterialId) return
    addProjectMaterial({
      projectId: project.id,
      materialId: selectedMaterialId,
      requiredQuantity: requiredQty,
      usedQuantity: 0,
    })
    setShowAddMaterial(false)
    setSelectedMaterialId('')
    setRequiredQty(1)
  }

  const handleConsume = (pmId: string) => {
    consumeMaterial(pmId)
  }

  const handleAddToShoppingList = (materialId: string, qty: number) => {
    addShoppingItem({
      materialId,
      quantity: qty,
      reason: '项目缺料',
      projectId: project.id,
      purchased: false,
    })
  }

  const handleDeleteProject = () => {
    if (confirm('确定要删除这个项目吗？')) {
      deleteProject(project.id)
      navigate('/projects')
    }
  }

  const handleStatusChange = (status: ProjectStatus) => {
    updateProject(project.id, { status })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="btn-secondary p-2.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-2xl font-bold text-bark">{project.name}</h2>
            <p className="text-sm text-sand">{formatDate(project.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['进行中', '已完成'] as ProjectStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                project.status === status
                  ? 'bg-caramel text-white shadow-craft'
                  : 'bg-parchment text-caramel-dark hover:bg-sand-light'
              }`}
            >
              {status}
            </button>
          ))}
          <button onClick={handleDeleteProject} className="btn-danger p-2.5 ml-2">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {project.description && (
        <div className="card bg-parchment">
          <p className="text-sm text-bark">{project.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel">{pms.length}</p>
          <p className="text-xs text-sand mt-1">材料种类</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-mint">{formatPrice(totalCost)}</p>
          <p className="text-xs text-sand mt-1">已耗成本</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel">{shortageItems.length}</p>
          <p className="text-xs text-sand mt-1">缺料项目</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-bark">
            {pms.length > 0
              ? ((pms.reduce((s, pm) => s + pm.usedQuantity, 0) / pms.reduce((s, pm) => s + pm.requiredQuantity, 0)) * 100).toFixed(0)
              : 0}%
          </p>
          <p className="text-xs text-sand mt-1">完成进度</p>
        </div>
      </div>

      {shortageItems.length > 0 && (
        <div className="card bg-clay-light border border-clay/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-clay" />
            <span className="font-serif font-semibold text-caramel-dark">缺料提醒</span>
          </div>
          <div className="space-y-2">
            {shortageItems.map((pm) => {
              const material = materials.find((m) => m.id === pm.materialId)
              if (!material) return null
              const shortage = (pm.requiredQuantity - pm.usedQuantity) - material.quantity
              return (
                <div key={pm.id} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-2">
                  <span className="text-sm text-bark">
                    {material.name} 缺 <span className="text-clay font-medium">{shortage}</span> {material.unit}
                  </span>
                  <button
                    onClick={() => handleAddToShoppingList(material.id, shortage)}
                    className="text-xs text-caramel hover:underline flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />加入采购
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title mb-0">材料清单</h3>
          <button
            onClick={() => setShowAddMaterial(true)}
            className="btn-mint text-sm flex items-center gap-1 py-1.5 px-3"
          >
            <Plus className="w-3 h-3" />添加材料
          </button>
        </div>

        {showAddMaterial && (
          <div className="bg-parchment rounded-xl p-4 space-y-3 border-2 border-mint/30">
            <h4 className="font-medium text-bark text-sm">添加材料到项目</h4>
            <div className="flex gap-3">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="select-field flex-1"
              >
                <option value="">选择材料</option>
                {availableMaterials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.category} · {m.colorName})</option>
                ))}
              </select>
              <input
                type="number"
                value={requiredQty}
                onChange={(e) => setRequiredQty(Number(e.target.value))}
                min="1"
                className="input-field w-24"
                placeholder="用量"
              />
              <button
                onClick={handleAddMaterial}
                disabled={!selectedMaterialId}
                className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50"
              >
                添加
              </button>
              <button
                onClick={() => { setShowAddMaterial(false); setSelectedMaterialId('') }}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {pms.length > 0 ? (
          <div className="space-y-2">
            {pms.map((pm) => {
              const material = materials.find((m) => m.id === pm.materialId)
              if (!material) return null
              const remaining = pm.requiredQuantity - pm.usedQuantity
              const isShort = material.quantity < remaining
              const isComplete = remaining <= 0
              return (
                <div
                  key={pm.id}
                  className={`bg-parchment rounded-xl p-4 transition-all duration-200 ${
                    isShort ? 'border-2 border-clay/40' : isComplete ? 'border-2 border-mint/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-white/50"
                      style={{ backgroundColor: material.colorHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/material/${material.id}`}
                        className="font-medium text-bark text-sm hover:text-caramel transition-colors flex items-center gap-1"
                      >
                        {material.name}
                        <Link2 className="w-3 h-3 text-sand" />
                      </Link>
                      <p className="text-xs text-sand">{material.category} · {material.specification}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm">
                        <span className="text-caramel font-medium">{pm.usedQuantity}</span>
                        <span className="text-sand"> / {pm.requiredQuantity}</span>
                        <span className="text-xs text-sand"> {material.unit}</span>
                      </div>
                      <div className="text-xs text-sand">
                        库存 {material.quantity} {material.unit}
                        {isShort && <span className="text-clay ml-1">缺料!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-light/50">
                    <div className="h-1.5 flex-1 bg-sand-light rounded-full overflow-hidden mr-4">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete ? 'bg-mint' : isShort ? 'bg-clay' : 'bg-caramel'
                        }`}
                        style={{ width: `${(pm.usedQuantity / pm.requiredQuantity) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!isComplete && (
                        <button
                          onClick={() => handleConsume(pm.id)}
                          className="text-xs bg-mint text-white px-3 py-1 rounded-full hover:bg-mint-light hover:text-caramel-dark transition-all duration-200 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          扣料
                        </button>
                      )}
                      {isShort && (
                        <button
                          onClick={() => handleAddToShoppingList(material.id, remaining - material.quantity)}
                          className="text-xs bg-caramel text-white px-3 py-1 rounded-full hover:bg-caramel-light transition-all duration-200 flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          采购
                        </button>
                      )}
                      <button
                        onClick={() => removeProjectMaterial(pm.id)}
                        className="text-xs text-sand hover:text-clay transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-sand text-center py-8">还没添加材料，点击上方按钮添加</p>
        )}
      </div>

      {pms.length > 0 && (
        <div className="card">
          <h3 className="section-title">成本明细</h3>
          <div className="space-y-2">
            {pms.map((pm) => {
              const material = materials.find((m) => m.id === pm.materialId)
              if (!material) return null
              return (
                <div key={pm.id} className="flex items-center justify-between text-sm py-1">
                  <span className="text-bark">{material.name}</span>
                  <span className="text-caramel">
                    {formatPrice(material.price)} × {pm.usedQuantity} = {formatPrice(material.price * pm.usedQuantity)}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center justify-between text-sm pt-3 mt-3 border-t-2 border-caramel/20">
              <span className="font-serif font-semibold text-bark">项目总成本</span>
              <span className="font-bold text-caramel text-lg">{formatPrice(totalCost)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
