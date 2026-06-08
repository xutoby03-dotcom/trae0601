import { useMemo } from 'react'
import { ShoppingCart, Check, Trash2, RefreshCw, Package } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatPrice, formatDate } from '@/utils/helpers'

export default function ShoppingList() {
  const materials = useStore((s) => s.materials)
  const shoppingItems = useStore((s) => s.shoppingItems)
  const updateShoppingItem = useStore((s) => s.updateShoppingItem)
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

  const totalEstimated = useMemo(() => {
    return pendingItems.reduce((total, item) => {
      const material = materials.find((m) => m.id === item.materialId)
      return total + (material ? material.price * item.quantity : 0)
    }, 0)
  }, [pendingItems, materials])

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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-caramel">{pendingItems.length}</p>
          <p className="text-xs text-sand mt-1">待购项目</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-mint">{formatPrice(totalEstimated)}</p>
          <p className="text-xs text-sand mt-1">预估总价</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-bark">{purchasedItems.length}</p>
          <p className="text-xs text-sand mt-1">已购项目</p>
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
          {pendingItems.length > 0 && (
            <div className="card space-y-3">
              <h3 className="section-title">待购清单</h3>
              <div className="space-y-2">
                {pendingItems.map((item) => {
                  const material = materials.find((m) => m.id === item.materialId)
                  if (!material) return null
                  const estimatedPrice = material.price * item.quantity
                  return (
                    <div
                      key={item.id}
                      className="bg-parchment rounded-xl p-4 flex items-center gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm border border-white/50"
                        style={{ backgroundColor: material.colorHex }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-bark text-sm">{material.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-caramel">
                            需购 {item.quantity} {material.unit}
                          </span>
                          <span className={`badge text-xs ${
                            item.reason === '低库存' ? 'bg-clay-light text-caramel-dark' : 'bg-sand-light text-caramel-dark'
                          }`}>
                            {item.reason}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-bark">{formatPrice(estimatedPrice)}</p>
                        {material.purchaseUrl && (
                          <a
                            href={material.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-caramel hover:underline"
                          >
                            去购买
                          </a>
                        )}
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
                  )
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-caramel/20">
                <span className="font-serif font-semibold text-bark">预估总价</span>
                <span className="font-bold text-caramel text-xl">{formatPrice(totalEstimated)}</span>
              </div>
            </div>
          )}

          {purchasedItems.length > 0 && (
            <div className="card space-y-3">
              <h3 className="section-title">已购记录</h3>
              <div className="space-y-2">
                {purchasedItems.map((item) => {
                  const material = materials.find((m) => m.id === item.materialId)
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
                        <span className="text-xs text-sand">
                          {item.quantity} {material.unit} · {formatDate(item.createdAt)}
                        </span>
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
