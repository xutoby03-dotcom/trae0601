import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Check, Trash2, RefreshCw, Package, AlertTriangle, FolderKanban } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice, formatDate } from '@/utils/helpers'

export default function ShoppingList() {
  const materials = useStore((s) => s.materials)
  const projects = useStore((s) => s.projects)
  const shoppingItems = useStore((s) => s.shoppingItems)
  const deleteShoppingItem = useStore((s) => s.deleteShoppingItem)
  const markShoppingItemPurchased = useStore((s) => s.markShoppingItemPurchased)
  const generateShoppingList = useStore((s) => s.generateShoppingList)

  const pendingItems = useMemo(
    () => shoppingItems.filter((s) => !s.purchased),
    [shoppingItems]
  )

  const purchasedItems = useMemo(
    () => shoppingItems.filter((s) => s.purchased),
    [shoppingItems]
  )

  const lowStockPending = useMemo(
    () => pendingItems.filter((i) => i.reason === '低库存'),
    [pendingItems]
  )

  const projectShortagePending = useMemo(
    () => pendingItems.filter((i) => i.reason === '项目缺料'),
    [pendingItems]
  )

  const lowStockTotal = useMemo(() => {
    return lowStockPending.reduce((total, item) => {
      const m = materials.find((m) => m.id === item.materialId)
      return total + (m ? m.price * item.quantity : 0)
    }, 0)
  }, [lowStockPending, materials])

  const projectShortageTotal = useMemo(() => {
    return projectShortagePending.reduce((total, item) => {
      const m = materials.find((m) => m.id === item.materialId)
      return total + (m ? m.price * item.quantity : 0)
    }, 0)
  }, [projectShortagePending, materials])

  const totalEstimated = lowStockTotal + projectShortageTotal

  const handleGenerate = () => {
    generateShoppingList()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-caramel" />
          <h2 className="font-serif text-2xl font-bold text-bark">采购清单</h2>
          {pendingItems.length > 0 && (
            <span className="badge-caramel">{pendingItems.length} 项待购</span>
          )}
        </div>
        <button onClick={handleGenerate} className="btn-mint flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />自动生成
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel">{pendingItems.length}</p>
          <p className="text-xs text-sand mt-1">待购项目</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-mint">{formatPrice(totalEstimated)}</p>
          <p className="text-xs text-sand mt-1">预估总价</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-clay">{lowStockPending.length}</p>
          <p className="text-xs text-sand mt-1">低库存补货</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel-dark">{projectShortagePending.length}</p>
          <p className="text-xs text-sand mt-1">项目缺料</p>
        </div>
      </div>

      {shoppingItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-sand" />
          </div>
          <p className="text-bark font-serif text-lg mb-2">采购清单为空</p>
          <p className="text-sand text-sm mb-6">点击"自动生成"按钮，根据低库存和项目缺料生成采购清单</p>
          <button onClick={handleGenerate} className="btn-mint">
            <RefreshCw className="w-4 h-4 inline mr-1" />自动生成
          </button>
        </div>
      ) : (
        <>
          {lowStockPending.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-clay" />
                  <h3 className="section-title mb-0">低库存补货</h3>
                  <span className="badge-clay">{lowStockPending.length} 项</span>
                </div>
                <span className="text-sm text-sand">小计 {formatPrice(lowStockTotal)}</span>
              </div>
              <div className="space-y-2">
                {lowStockPending.map((item) => {
                  const material = materials.find((m) => m.id === item.materialId)
                  if (!material) return null
                  const estimatedPrice = material.price * item.quantity
                  return (
                    <div
                      key={item.id}
                      className="bg-parchment rounded-xl p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm border border-white/50"
                          style={{ backgroundColor: material.colorHex }}
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/material/${material.id}`}
                            className="font-medium text-bark text-sm hover:text-caramel transition-colors"
                          >
                            {material.name}
                          </Link>
                          <p className="text-xs text-sand mt-0.5">{material.category} · {material.specification || '无规格'}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => markShoppingItemPurchased(item.id)}
                            className="p-2 bg-mint text-white rounded-lg hover:bg-mint-light hover:text-caramel-dark transition-all duration-200"
                            title="标记已购"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteShoppingItem(item.id)}
                            className="p-2 text-sand hover:text-clay transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-sand-light/50 text-center">
                        <div>
                          <p className={`text-sm font-bold ${material.quantity <= material.lowStockThreshold ? 'text-clay' : 'text-bark'}`}>
                            {material.quantity} {material.unit}
                          </p>
                          <p className="text-xs text-sand">当前库存</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-caramel">{item.quantity} {material.unit}</p>
                          <p className="text-xs text-sand">需购数量</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-bark">{formatPrice(estimatedPrice)}</p>
                          <p className="text-xs text-sand">预估价格</p>
                        </div>
                      </div>
                      {material.purchaseUrl && (
                        <div className="mt-2 pt-2 border-t border-sand-light/50">
                          <a
                            href={material.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-caramel hover:underline"
                          >
                            前往购买 →
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {projectShortagePending.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-caramel" />
                  <h3 className="section-title mb-0">项目缺料</h3>
                  <span className="badge-caramel">{projectShortagePending.length} 项</span>
                </div>
                <span className="text-sm text-sand">小计 {formatPrice(projectShortageTotal)}</span>
              </div>
              <div className="space-y-2">
                {projectShortagePending.map((item) => {
                  const material = materials.find((m) => m.id === item.materialId)
                  if (!material) return null
                  const project = projects.find((p) => p.id === item.projectId)
                  const estimatedPrice = material.price * item.quantity
                  return (
                    <div
                      key={item.id}
                      className="bg-parchment rounded-xl p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm border border-white/50"
                          style={{ backgroundColor: material.colorHex }}
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/material/${material.id}`}
                            className="font-medium text-bark text-sm hover:text-caramel transition-colors"
                          >
                            {material.name}
                          </Link>
                          <p className="text-xs text-sand mt-0.5">{material.category} · {material.specification || '无规格'}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => markShoppingItemPurchased(item.id)}
                            className="p-2 bg-mint text-white rounded-lg hover:bg-mint-light hover:text-caramel-dark transition-all duration-200"
                            title="标记已购"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteShoppingItem(item.id)}
                            className="p-2 text-sand hover:text-clay transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-sand-light/50 text-center">
                        <div>
                          <p className={`text-sm font-bold ${material.quantity <= material.lowStockThreshold ? 'text-clay' : 'text-bark'}`}>
                            {material.quantity} {material.unit}
                          </p>
                          <p className="text-xs text-sand">当前库存</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-caramel">{item.quantity} {material.unit}</p>
                          <p className="text-xs text-sand">缺料数量</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-bark">{formatPrice(estimatedPrice)}</p>
                          <p className="text-xs text-sand">预估价格</p>
                        </div>
                      </div>
                      {project && (
                        <div className="mt-2 pt-2 border-t border-sand-light/50 flex items-center gap-1.5">
                          <FolderKanban className="w-3.5 h-3.5 text-caramel" />
                          <span className="text-xs text-sand">所属项目：</span>
                          <Link
                            to={`/projects/${project.id}`}
                            className="text-xs text-caramel font-medium hover:underline"
                          >
                            {project.name}
                          </Link>
                          <span className={`badge text-xs ml-1 ${project.status === '进行中' ? 'bg-mint-light text-caramel-dark' : 'bg-sand-light text-caramel-dark'}`}>
                            {project.status}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {pendingItems.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between">
                <span className="font-serif font-semibold text-bark">预估总价</span>
                <div className="text-right">
                  <span className="font-bold text-caramel text-xl">{formatPrice(totalEstimated)}</span>
                  <div className="flex gap-3 justify-end mt-1 text-xs text-sand">
                    {lowStockPending.length > 0 && <span>补货 {formatPrice(lowStockTotal)}</span>}
                    {projectShortagePending.length > 0 && <span>缺料 {formatPrice(projectShortageTotal)}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {purchasedItems.length > 0 && (
            <div className="card space-y-3">
              <h3 className="section-title">已购记录</h3>
              <div className="space-y-2">
                {purchasedItems.map((item) => {
                  const material = materials.find((m) => m.id === item.materialId)
                  const project = item.projectId ? projects.find((p) => p.id === item.projectId) : null
                  if (!material) return null
                  return (
                    <div
                      key={item.id}
                      className="bg-parchment/50 rounded-xl p-3 flex items-center gap-3 opacity-70"
                    >
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-mint bg-mint/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-mint" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-bark text-sm line-through">{material.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-sand">
                          <span>{item.quantity} {material.unit}</span>
                          <span>·</span>
                          <span>{formatDate(item.createdAt)}</span>
                          {project && (
                            <>
                              <span>·</span>
                              <span>项目：{project.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteShoppingItem(item.id)}
                        className="text-xs text-sand hover:text-clay"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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
