import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, ExternalLink, Clock, TrendingUp, PackageX } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate, formatPrice, daysSince } from '@/utils/helpers'

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const materials = useStore((s) => s.materials)
  const usageRecords = useStore((s) => s.usageRecords)
  const projects = useStore((s) => s.projects)
  const deleteMaterial = useStore((s) => s.deleteMaterial)

  const material = materials.find((m) => m.id === id)

  const records = useMemo(
    () => usageRecords.filter((r) => r.materialId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [usageRecords, id]
  )

  const totalUsed = useMemo(() => records.reduce((sum, r) => sum + r.quantity, 0), [records])

  const lastUsedDate = useMemo(() => {
    if (records.length === 0) return null
    return records[0].date
  }, [records])

  const idleDays = useMemo(() => {
    if (!lastUsedDate) return daysSince(material?.createdAt || new Date().toISOString())
    return daysSince(lastUsedDate)
  }, [lastUsedDate, material])

  const projectUsageMap = useMemo(() => {
    const map: Record<string, number> = {}
    records.forEach((r) => {
      map[r.projectId] = (map[r.projectId] || 0) + r.quantity
    })
    return map
  }, [records])

  if (!material) {
    return (
      <div className="text-center py-20">
        <p className="text-sand">找不到该材料</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">返回首页</button>
      </div>
    )
  }

  const isLow = material.quantity <= material.lowStockThreshold
  const isIdle = idleDays > 60

  const handleDelete = () => {
    if (confirm('确定要删除这个材料吗？相关使用记录也会被删除。')) {
      deleteMaterial(material.id)
      navigate('/')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl shadow-craft border-2 border-white"
              style={{ backgroundColor: material.colorHex }}
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-bark">{material.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge-caramel">{material.category}</span>
                <span className="text-sm text-sand">{material.colorName}</span>
                {isLow && <span className="badge-clay">低库存</span>}
                {isIdle && <span className="badge-clay">闲置中</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/material/${material.id}/edit`} className="btn-secondary p-2.5">
            <Edit3 className="w-4 h-4" />
          </Link>
          <button onClick={handleDelete} className="btn-danger p-2.5">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel">{material.quantity}</p>
          <p className="text-xs text-sand mt-1">当前库存 ({material.unit})</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-mint">{totalUsed}</p>
          <p className="text-xs text-sand mt-1">累计使用</p>
        </div>
        <div className="card text-center">
          <p className={`text-2xl font-bold ${isIdle ? 'text-clay' : 'text-caramel'}`}>{idleDays}</p>
          <p className="text-xs text-sand mt-1">天未使用</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel">{formatPrice(material.price)}</p>
          <p className="text-xs text-sand mt-1">单价</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="section-title">材料信息</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <span className="text-sand">规格：</span>
            <span className="text-bark">{material.specification || '—'}</span>
          </div>
          <div>
            <span className="text-sand">收纳类型：</span>
            <span className="text-bark">{material.storageType}</span>
          </div>
          <div>
            <span className="text-sand">收纳位置：</span>
            <span className="text-bark">
              {material.storageType === '盒子' && (material.storageBox || '—')}
              {material.storageType === '格子' && (material.storageCompartment || '—')}
              {material.storageType === '袋子' && (material.storageBag || '—')}
            </span>
          </div>
          <div>
            <span className="text-sand">低库存阈值：</span>
            <span className="text-bark">{material.lowStockThreshold} {material.unit}</span>
          </div>
          <div>
            <span className="text-sand">入库日期：</span>
            <span className="text-bark">{formatDate(material.createdAt)}</span>
          </div>
          {material.purchaseUrl && (
            <div>
              <span className="text-sand">购买链接：</span>
              <a
                href={material.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-caramel hover:underline inline-flex items-center gap-1"
              >
                前往购买 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {isIdle && (
        <div className="card bg-clay-light border border-clay/30">
          <div className="flex items-center gap-3">
            <PackageX className="w-6 h-6 text-clay" />
            <div>
              <p className="font-serif font-semibold text-caramel-dark">闲置提醒</p>
              <p className="text-sm text-caramel-dark/80">
                该材料已 {idleDays} 天未使用，入库于 {formatDate(material.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-caramel" />
          <h3 className="section-title mb-0">使用统计</h3>
        </div>
        {Object.keys(projectUsageMap).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(projectUsageMap)
              .sort(([, a], [, b]) => b - a)
              .map(([projectId, used]) => {
                const project = projects.find((p) => p.id === projectId)
                const percentage = totalUsed > 0 ? (used / totalUsed) * 100 : 0
                return (
                  <div key={projectId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-bark truncate">
                          {project?.name || '已删除项目'}
                        </span>
                        <span className="text-xs text-caramel font-medium flex-shrink-0">{used} {material.unit}</span>
                      </div>
                      <div className="h-2 bg-sand-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-caramel rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <p className="text-sm text-sand text-center py-4">暂无使用记录</p>
        )}
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-caramel" />
          <h3 className="section-title mb-0">使用历史</h3>
        </div>
        {records.length > 0 ? (
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-sand-light" />
            {records.map((record) => {
              const project = projects.find((p) => p.id === record.projectId)
              return (
                <div key={record.id} className="relative">
                  <div className="absolute -left-4 w-3 h-3 bg-caramel rounded-full border-2 border-white shadow-sm" />
                  <div className="bg-parchment rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-bark">
                        {project?.name || '已删除项目'}
                      </span>
                      <span className="text-xs text-sand">{formatDate(record.date)}</span>
                    </div>
                    <p className="text-xs text-caramel mt-1">
                      使用 {record.quantity} {material.unit}
                      {record.note && ` · ${record.note}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-sand text-center py-4">暂无使用记录</p>
        )}
      </div>
    </div>
  )
}
