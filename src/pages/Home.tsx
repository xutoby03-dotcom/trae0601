import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Download, Plus, Search, RotateCcw } from 'lucide-react'
import { useCoffeeStore } from '@/store/coffeeStore'
import BeanCard from '@/components/BeanCard'
import AlertBanner from '@/components/AlertBanner'
import { ROAST_LEVELS, PROCESS_METHODS } from '@/utils/constants'
import { exportToJSON, exportToCSV } from '@/utils/helpers'
import type { CoffeeBean } from '@/types'

export default function Home() {
  const beans = useCoffeeStore((s) => s.beans)
  const getAlerts = useCoffeeStore((s) => s.getAlerts)
  const alerts = getAlerts()

  const [originFilter, setOriginFilter] = useState('')
  const [roastFilter, setRoastFilter] = useState('')
  const [processFilter, setProcessFilter] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredBeans = useMemo(() => {
    return beans.filter((bean: CoffeeBean) => {
      if (originFilter && !bean.origin.toLowerCase().includes(originFilter.toLowerCase())) return false
      if (roastFilter && bean.roastLevel !== roastFilter) return false
      if (processFilter && bean.processMethod !== processFilter) return false
      return true
    })
  }, [beans, originFilter, roastFilter, processFilter])

  function handleReset() {
    setOriginFilter('')
    setRoastFilter('')
    setProcessFilter('')
  }

  function handleExportJSON() {
    exportToJSON(filteredBeans, 'coffee-beans')
    setExportOpen(false)
  }

  function handleExportCSV() {
    exportToCSV(filteredBeans, 'coffee-beans')
    setExportOpen(false)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF8' }}>
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FFFDF8]/90 border-b border-[#E8D5BC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee size={28} className="text-[#6F4E37]" />
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#3E2412]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              咖啡豆风味档案
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F5E6D3] text-[#6F4E37] font-medium text-sm hover:bg-[#E8D5BC] transition-colors"
              >
                <Download size={16} />
                导出清单
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-[#E8D5BC] overflow-hidden z-40">
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#3E2412] hover:bg-[#FFF8F0] transition-colors"
                  >
                    导出 JSON
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#3E2412] hover:bg-[#FFF8F0] transition-colors border-t border-[#E8D5BC]"
                  >
                    导出 CSV
                  </button>
                </div>
              )}
            </div>
            <Link
              to="/beans/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6F4E37] text-white font-medium text-sm hover:bg-[#5C3A1E] transition-colors"
            >
              <Plus size={16} />
              新增豆子
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}

        <div className="bg-[#F5E6D3]/60 rounded-xl p-4 flex flex-wrap items-center gap-3 border border-[#E8D5BC]">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6914]" />
            <input
              type="text"
              placeholder="搜索产地..."
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#D4A574] text-[#3E2412] text-sm placeholder-[#B8864E]/60 focus:outline-none focus:ring-2 focus:ring-[#8B6914]/30 transition-shadow"
            />
          </div>

          <select
            value={roastFilter}
            onChange={(e) => setRoastFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#D4A574] text-[#3E2412] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6914]/30 transition-shadow min-w-[120px]"
          >
            <option value="">全部烘焙度</option>
            {ROAST_LEVELS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <select
            value={processFilter}
            onChange={(e) => setProcessFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#D4A574] text-[#3E2412] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B6914]/30 transition-shadow min-w-[120px]"
          >
            <option value="">全部处理法</option>
            {PROCESS_METHODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#6F4E37] text-sm font-medium hover:bg-[#E8D5BC] transition-colors"
          >
            <RotateCcw size={14} />
            重置
          </button>
        </div>

        {beans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8B6914]">
            <Coffee size={48} className="mb-4 opacity-40" />
            <p className="text-lg">还没有咖啡豆，点击右上角新增第一包吧</p>
          </div>
        ) : filteredBeans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#8B6914]">
            <Coffee size={48} className="mb-4 opacity-40" />
            <p className="text-lg">没有找到匹配的咖啡豆</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeans.map((bean) => (
              <BeanCard key={bean.id} bean={bean} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
