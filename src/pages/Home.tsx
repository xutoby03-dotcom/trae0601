import { useStore } from '../store/useStore'
import FoodWall from '../components/FoodWall'

export default function HomePage() {
  const { foodItems } = useStore()

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-500">小区公告墙 · {foodItems.filter(i => i.status === 'grouping').length} 件正在拼单</p>
      </div>
      <FoodWall items={foodItems} />
    </div>
  )
}
