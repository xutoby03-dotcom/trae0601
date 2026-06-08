import { Link } from 'react-router-dom'
import { useGardenStore } from '@/store/useGardenStore'
import { isWaterNeeded, BALCONY_ROWS, BALCONY_COLS, ROW_LABELS, COL_LABELS } from '@/types'
import AlertBanner from '@/components/AlertBanner'
import BalconyCell from '@/components/BalconyCell'
import { PlusCircle, Sprout } from 'lucide-react'

export default function Home() {
  const { plants, observations, waterPlant } = useGardenStore()

  const hasPlants = plants.length > 0
  const plantMap = new Map<string, typeof plants[0]>()
  plants.forEach((p) => plantMap.set(`${p.gridRow}-${p.gridCol}`, p))

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title flex items-center gap-2">
            🏡 我的阳台菜园
          </h2>
          <p className="text-sm font-serif text-earth-500 mt-1">
            {hasPlants
              ? `共 ${plants.length} 盆植物，用心呵护每一株`
              : '开始种植你的第一盆蔬菜吧'}
          </p>
        </div>
        <Link to="/add" className="btn-primary text-sm">
          <PlusCircle size={16} />
          添加植物
        </Link>
      </div>

      {hasPlants && (
        <AlertBanner plants={plants} observations={observations} />
      )}

      <div className="card-wood p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🏠</span>
          <h3 className="font-handwriting text-lg text-earth-700">阳台平面图</h3>
          <span className="ml-auto text-[10px] font-serif text-earth-400">点击卡片查看详情</span>
        </div>

        <div className="flex">
          <div className="flex flex-col mr-1 pt-8 shrink-0">
            {ROW_LABELS.map((label, r) => (
              <div
                key={r}
                className="h-[140px] sm:h-[160px] flex items-center justify-center"
              >
                <span className="text-[10px] font-serif text-earth-400 writing-mode-vertical"
                  style={{ writingMode: 'vertical-rl', letterSpacing: '2px' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-4 gap-1 mb-1">
                {COL_LABELS.map((label, c) => (
                  <div key={c} className="text-center text-[10px] font-serif text-earth-400 py-1">
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${BALCONY_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${BALCONY_ROWS}, 1fr)`,
                }}
              >
                {Array.from({ length: BALCONY_ROWS * BALCONY_COLS }, (_, i) => {
                  const row = Math.floor(i / BALCONY_COLS)
                  const col = i % BALCONY_COLS
                  const plant = plantMap.get(`${row}-${col}`)
                  const plantObs = plant
                    ? observations.filter((o) => o.plantId === plant.id)
                    : []

                  return (
                    <BalconyCell
                      key={`${row}-${col}`}
                      row={row}
                      col={col}
                      plant={plant}
                      observations={plantObs}
                      onWater={waterPlant}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-wood-300/30 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] font-serif text-earth-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-dew-300 inline-block" /> 缺水
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-chili-300 inline-block" /> 该施肥
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-tomato-300 inline-block" /> 虫害
            </span>
          </div>
          <span className="text-[10px] font-serif text-earth-400">
            {BALCONY_ROWS * BALCONY_COLS} 个位置 · {plants.length} 盆已种 · {BALCONY_ROWS * BALCONY_COLS - plants.length} 个空位
          </span>
        </div>
      </div>

      {!hasPlants && (
        <div className="card-wood p-12 text-center mt-6">
          <div className="text-6xl mb-4 animate-float">🌱</div>
          <h3 className="font-handwriting text-2xl text-earth-700 mb-2">
            你的菜园还是空的
          </h3>
          <p className="font-serif text-earth-500 mb-6 max-w-md mx-auto">
            在阳台上种一盆番茄、薄荷或辣椒吧，每天记录它们的成长，
            从播种到收获，这里是你专属的植物观察笔记。
          </p>
          <Link to="/add" className="btn-primary">
            <Sprout size={18} />
            种下第一盆
          </Link>
        </div>
      )}

      {hasPlants && (
        <div className="mt-6 card-paper p-4">
          <h3 className="font-handwriting text-lg text-earth-700 mb-3 flex items-center gap-2">
            📋 快速浇水
          </h3>
          <div className="flex flex-wrap gap-2">
            {plants.filter(isWaterNeeded).length > 0 ? (
              plants.filter(isWaterNeeded).map((plant) => (
                <button
                  key={plant.id}
                  onClick={() => waterPlant(plant.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dew-50 border border-dew-200 text-dew-700 text-sm font-serif hover:bg-dew-100 transition-colors"
                >
                  💧 {plant.name}
                </button>
              ))
            ) : (
              <p className="text-sm font-serif text-leaf-600">✅ 今天都浇过水啦！</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
