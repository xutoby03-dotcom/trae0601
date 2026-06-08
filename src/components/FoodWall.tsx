import { useState } from 'react'
import type { FoodItem } from '../types'
import { getUrgencyLevel } from '../types'
import FoodCard from './FoodCard'
import GroupBuyModal from './GroupBuyModal'
import ManageModal from './ManageModal'
import NeighborJoinModal from './NeighborJoinModal'
import { AlertTriangle } from 'lucide-react'

interface Props {
  items: FoodItem[]
}

export default function FoodWall({ items }: Props) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [manageItemId, setManageItemId] = useState<string | null>(null)
  const [neighborJoinItem, setNeighborJoinItem] = useState<FoodItem | null>(null)

  const activeItems = items.filter(i => i.status !== 'expired')
  const expiredItems = items.filter(i => i.status === 'expired')

  const todayItems = activeItems.filter(i => getUrgencyLevel(i.expiryDate) === 'today')
  const threeDayItems = activeItems.filter(i => getUrgencyLevel(i.expiryDate) === 'threeDays')
  const oneWeekItems = activeItems.filter(i => getUrgencyLevel(i.expiryDate) === 'oneWeek')
  const safeItems = activeItems.filter(i => getUrgencyLevel(i.expiryDate) === 'safe')

  const sections = [
    {
      key: 'today',
      title: '🔴 今天到期 — 最紧急！',
      subtitle: '再不取就真的来不及了',
      items: todayItems,
      bgClass: 'bg-red-50 border-red-200',
      titleClass: 'text-red-700',
      isEmpty: todayItems.length === 0,
    },
    {
      key: 'threeDays',
      title: '🟠 三天内到期 — 快来分！',
      subtitle: '还有两三天，抓紧拼单',
      items: threeDayItems,
      bgClass: 'bg-orange-50 border-orange-200',
      titleClass: 'text-orange-700',
      isEmpty: threeDayItems.length === 0,
    },
    {
      key: 'oneWeek',
      title: '🟡 一周内到期 — 可以约',
      subtitle: '时间还算充裕，慢慢商量取货时间',
      items: oneWeekItems,
      bgClass: 'bg-yellow-50 border-yellow-200',
      titleClass: 'text-yellow-700',
      isEmpty: oneWeekItems.length === 0,
    },
    {
      key: 'safe',
      title: '🟢 保质期充裕 — 不着急',
      subtitle: '还有不少天，可以放心拼',
      items: safeItems,
      bgClass: 'bg-green-50 border-green-200',
      titleClass: 'text-green-700',
      isEmpty: safeItems.length === 0,
    },
  ]

  return (
    <div>
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
        <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 leading-relaxed">
          <strong>食品安全提示：</strong>
          已开封食品请确认品质后领取；冷链食品请尽快取货并保持低温；
          有过敏原的食品请仔细阅读提醒；超过保质期的食品不可再参与拼单。
        </div>
      </div>

      {sections.map(section => (
        <div key={section.key} className="mb-6">
          <div className={`px-4 py-3 rounded-xl border ${section.bgClass} mb-3`}>
            <h2 className={`font-bold text-sm ${section.titleClass}`}>{section.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
          </div>
          {section.isEmpty ? (
            <p className="text-center text-sm text-gray-300 py-4">暂无食品</p>
          ) : (
            <div className="space-y-3">
              {section.items.map(item => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onJoin={setSelectedItem}
                  onManage={(item) => setManageItemId(item.id)}
                  onNeighborJoin={setNeighborJoinItem}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {expiredItems.length > 0 && (
        <div className="mb-6">
          <div className="px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 mb-3">
            <h2 className="font-bold text-sm text-gray-400">已过期 — 已下架</h2>
            <p className="text-xs text-gray-400 mt-0.5">超过保质期的食品，不可再拼单</p>
          </div>
          <div className="space-y-3">
            {expiredItems.map(item => (
              <FoodCard
                key={item.id}
                item={item}
                onJoin={() => {}}
                onManage={() => {}}
                onNeighborJoin={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {selectedItem && (
        <GroupBuyModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {manageItemId && (
        <ManageModal itemId={manageItemId} onClose={() => setManageItemId(null)} />
      )}
      {neighborJoinItem && (
        <NeighborJoinModal item={neighborJoinItem} onClose={() => setNeighborJoinItem(null)} />
      )}
    </div>
  )
}
