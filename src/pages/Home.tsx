import { useEffect } from 'react'
import { useFridgeStore } from '@/store/fridgeStore'
import { getExpiryStatus, getDaysUntilExpiry } from '@/utils/fridge'
import type { FoodItem } from '@/types'
import { Clock, Snowflake, AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SHELF_LABELS = ['第1层 · 蔬果区', '第2层 · 烘焙区', '第3层 · 乳品蛋类', '第4层 · 水果区', '第5层 · 其他']

function ExpiryBadge({ item }: { item: FoodItem }) {
  const status = getExpiryStatus(item.expiryDate, item.status)
  const days = getDaysUntilExpiry(item.expiryDate)

  if (status === 'expired' || item.status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" />已过期·下架
      </span>
    )
  }
  if (status === 'today') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
        <Clock className="w-3 h-3" />今日到期
      </span>
    )
  }
  if (status === 'soon') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
        <Clock className="w-3 h-3" />{days}天后到期
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
      可放心领取
    </span>
  )
}

function FoodPhoto({ src, name, size = 'md' }: { src: string; name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-12 h-12'
  const icon = size === 'sm' ? 14 : 18
  if (src) {
    return (
      <img src={src} alt={name} className={`${dim} rounded-lg object-cover shrink-0`} />
    )
  }
  return (
    <div className={`${dim} rounded-lg bg-stone-100 flex items-center justify-center shrink-0`}>
      <span className="text-stone-300" style={{ fontSize: icon }}>
        {name.charAt(0)}
      </span>
    </div>
  )
}

function FoodCard({ item }: { item: FoodItem }) {
  const isExpired = item.status === 'expired'
  const isDepleted = item.status === 'depleted'

  return (
    <div
      className={`group relative rounded-xl p-3 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isExpired
          ? 'bg-red-50/50 border-red-200 opacity-60'
          : isDepleted
            ? 'bg-stone-50 border-stone-200 opacity-50'
            : 'bg-white border-stone-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <FoodPhoto src={item.photoUrl} name={item.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-800 truncate">{item.name}</h3>
            {item.coldChain && (
              <Snowflake className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-stone-400">{item.source}</span>
            <span className="text-xs text-stone-300">·</span>
            <span className={`text-xs font-bold ${isDepleted ? 'text-stone-400' : 'text-emerald-600'}`}>
              {isDepleted ? '已领完' : `×${item.quantity}`}
            </span>
          </div>
          {item.allergens && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.allergens.split(',').map((a) => (
                <span key={a} className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] rounded-md font-medium">
                  {a.trim()}
                </span>
              ))}
            </div>
          )}
          <div className="mt-1.5">
            <ExpiryBadge item={item} />
          </div>
        </div>
      </div>
      {isExpired && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-400 text-xs font-bold bg-red-50/90 px-3 py-1 rounded-lg border border-red-200 rotate-[-8deg]">
            已下架
          </span>
        </div>
      )}
    </div>
  )
}

function FridgeView() {
  const { foodItems, checkExpiry } = useFridgeStore()
  useEffect(() => { checkExpiry() }, [checkExpiry])

  const shelves = [1, 2, 3, 4, 5].map((layer) => ({
    layer,
    label: SHELF_LABELS[layer - 1],
    items: foodItems.filter((f) => f.shelfLayer === layer),
  }))

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-2xl p-1.5 shadow-2xl">
        <div className="bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-t-xl h-8 flex items-center justify-center gap-2">
          <div className="w-6 h-1 bg-zinc-400 rounded-full" />
          <span className="text-zinc-300 text-[10px] font-medium tracking-wider">COMMUNITY FRIDGE</span>
          <div className="w-6 h-1 bg-zinc-400 rounded-full" />
        </div>
        <div className="bg-stone-50 rounded-b-xl overflow-hidden">
          {shelves.map((shelf, idx) => (
            <div key={shelf.layer}>
              <div className="px-3 py-2 border-b border-stone-200 bg-white/50">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{shelf.label}</span>
              </div>
              <div className="px-3 py-2 min-h-[80px]">
                {shelf.items.length === 0 ? (
                  <div className="flex items-center justify-center h-12 text-stone-300 text-xs">
                    暂无食物
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {shelf.items.map((item) => (
                      <FoodCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
              {idx < shelves.length - 1 && (
                <div className="h-1.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
              )}
            </div>
          ))}
        </div>
        <div className="h-6 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-b-xl flex items-center justify-center">
          <div className="w-16 h-2 bg-zinc-500 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function StatusSection({
  title,
  items,
  color,
  emptyText,
  icon: Icon,
}: {
  title: string
  items: FoodItem[]
  color: 'red' | 'amber' | 'green'
  emptyText: string
  icon: React.ElementType
}) {
  const colorMap = {
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  }
  const c = colorMap[color]

  return (
    <div className={`${c.bg} rounded-xl border ${c.border} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${c.text}`} />
        <h3 className={`text-sm font-bold ${c.text}`}>{title}</h3>
        <span className={`${c.badge} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
          {items.length}种
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-stone-400 text-center py-3">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <FoodPhoto src={item.photoUrl} name={item.name} size="sm" />
                <span className="text-sm font-medium text-stone-700 truncate">{item.name}</span>
                {item.coldChain && <Snowflake className="w-3 h-3 text-blue-400 shrink-0" />}
                {item.allergens && (
                  <span className="text-[10px] text-orange-500 shrink-0">
                    [{item.allergens}]
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-stone-500">×{item.quantity}</span>
                <Link
                  to="/claim"
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                  领取<ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { getTodayExpiryItems, getSoonExpiryItems, getSafeItems, getExpiredItems } = useFridgeStore()

  const todayItems = getTodayExpiryItems()
  const soonItems = getSoonExpiryItems()
  const safeItems = getSafeItems()
  const expiredItems = getExpiredItems()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1">🧊 冰箱看板</h2>
        <p className="text-sm text-stone-400">实时查看冰箱内存放的食物和到期状态</p>
      </div>

      <FridgeView />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusSection
          title="⚠️ 今日到期"
          items={todayItems}
          color="red"
          emptyText="今天没有到期食物"
          icon={AlertTriangle}
        />
        <StatusSection
          title="⏰ 三天内到期"
          items={soonItems}
          color="amber"
          emptyText="近期没有即将到期食物"
          icon={Clock}
        />
        <StatusSection
          title="✅ 可放心领取"
          items={safeItems}
          color="green"
          emptyText="暂无安全库存"
          icon={ChevronRight}
        />
      </div>

      {expiredItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-700">已下架（过期食物）</h3>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {expiredItems.length}种
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiredItems.map((item) => (
              <span key={item.id} className="bg-white/80 text-red-600 text-xs px-3 py-1 rounded-lg line-through">
                {item.name} ×{item.quantity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
