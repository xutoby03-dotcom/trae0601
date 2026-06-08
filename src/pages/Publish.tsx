import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Camera, X, AlertTriangle } from 'lucide-react'

const FOOD_PHOTOS: Record<string, string> = {
  '牛奶': '🥛',
  '面包': '🍞',
  '零食': '🍪',
  '调料': '🧂',
  '酸奶': '🥛',
  '饼干': '🍪',
  '水饺': '🥟',
  '果汁': '🧃',
  '水果': '🍎',
  '蔬菜': '🥬',
  '鸡蛋': '🥚',
  '肉类': '🥩',
  '饮料': '🥤',
  '酱料': '🫙',
}

function guessEmoji(name: string): string {
  for (const [keyword, emoji] of Object.entries(FOOD_PHOTOS)) {
    if (name.includes(keyword)) return emoji
  }
  return '🛒'
}

export default function PublishPage() {
  const navigate = useNavigate()
  const { addFoodItem } = useStore()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [originalPrice, setOriginalPrice] = useState('')
  const [sharePrice, setSharePrice] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [isOpened, setIsOpened] = useState(false)
  const [allergyWarning, setAllergyWarning] = useState('')
  const [coldChainRequired, setColdChainRequired] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !originalPrice || !sharePrice || !expiryDate || !pickupLocation.trim()) return

    addFoodItem({
      name: name.trim(),
      photo: guessEmoji(name),
      quantity,
      originalPrice: parseFloat(originalPrice),
      sharePrice: parseFloat(sharePrice),
      expiryDate,
      pickupLocation: pickupLocation.trim(),
      isOpened,
      allergyWarning: allergyWarning.trim(),
      coldChainRequired,
    })
    navigate('/')
  }

  const isValid = name.trim() && originalPrice && sharePrice && expiryDate && pickupLocation.trim()

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">发布食品</h1>
        <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-gray-100">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">食品名称 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：蒙牛纯牛奶 250ml×12盒"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">食品照片</label>
          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-gray-50">
            <div className="text-center">
              {name ? (
                <span className="text-4xl">{guessEmoji(name)}</span>
              ) : (
                <>
                  <Camera size={24} className="text-gray-400 mx-auto" />
                  <span className="text-xs text-gray-400 mt-1">添加照片</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">输入名称后自动匹配图标</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">份数 <span className="text-red-400">*</span></label>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原价 <span className="text-red-400">*</span></label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={originalPrice}
              onChange={e => setOriginalPrice(e.target.value)}
              placeholder="¥"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分摊价 <span className="text-red-400">*</span></label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={sharePrice}
              onChange={e => setSharePrice(e.target.value)}
              placeholder="¥"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {originalPrice && sharePrice && (
          <div className="p-2 bg-green-50 rounded-lg text-sm text-green-700">
            🎉 邻居可以省 <strong>¥{(parseFloat(originalPrice) - parseFloat(sharePrice)).toFixed(1)}</strong>，一起减少浪费！
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">保质期 <span className="text-red-400">*</span></label>
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">取货地点 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={pickupLocation}
            onChange={e => setPickupLocation(e.target.value)}
            placeholder="例如：3号楼1单元门口"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="space-y-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-1.5 text-amber-700 text-sm font-medium">
            <AlertTriangle size={14} />
            食品安全信息
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isOpened}
              onChange={e => setIsOpened(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">此食品已开封</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={coldChainRequired}
              onChange={e => setColdChainRequired(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">需要冷链保存</span>
          </label>
          <div>
            <label className="block text-sm text-gray-700 mb-1">过敏原提醒</label>
            <input
              type="text"
              value={allergyWarning}
              onChange={e => setAllergyWarning(e.target.value)}
              placeholder="例如：含乳制品、麸质、花生"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm text-sm"
        >
          发布到拼单墙 🍊
        </button>
      </form>
    </div>
  )
}
