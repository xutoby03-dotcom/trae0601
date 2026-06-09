import { useState, useEffect } from 'react'
import { useUmbrellaStore } from '@/store'
import { useWeather } from '@/hooks/useWeather'
import type { UmbrellaStatus } from '@/types'
import WeatherBanner from '@/components/WeatherBanner'
import StatusTabs from '@/components/StatusTabs'
import UmbrellaCard from '@/components/UmbrellaCard'
import OverdueAlert from '@/components/OverdueAlert'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { weather, loading: weatherLoading } = useWeather()
  const store = useUmbrellaStore()
  const [activeTab, setActiveTab] = useState<UmbrellaStatus>('available')

  useEffect(() => {
    store.getOverdueRecords()
  }, [])

  const overdueRecords = store.borrowRecords.filter(
    (r) => r.status === 'overdue' || (r.status === 'active' && new Date(r.expectedReturnTime) < new Date())
  )

  const counts: Record<UmbrellaStatus, number> = {
    available: store.umbrellas.filter((u) => u.status === 'available').length,
    borrowed: store.umbrellas.filter((u) => u.status === 'borrowed').length,
    damaged: store.umbrellas.filter((u) => u.status === 'damaged').length,
    lost: store.umbrellas.filter((u) => u.status === 'lost').length,
  }

  const filteredUmbrellas = store.umbrellas
    .filter((u) => u.status === activeTab)
    .sort((a, b) => {
      if (weather.isRainy && activeTab === 'available') {
        return a.location.localeCompare(b.location)
      }
      return 0
    })

  const handleRepair = (id: string) => {
    store.repairUmbrella(id)
  }

  return (
    <div className="space-y-4">
      <WeatherBanner weather={weather} loading={weatherLoading} />

      {overdueRecords.length > 0 && <OverdueAlert records={overdueRecords} />}

      <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {filteredUmbrellas.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">☂️</span>
                </div>
                <p className="text-sm text-slate-400">暂无该状态的雨伞</p>
              </div>
            ) : (
              filteredUmbrellas.map((umbrella) => {
                let latestRecord
                if (umbrella.status === 'lost') {
                  const allRecords = store.borrowRecords
                    .filter((r) => r.umbrellaId === umbrella.id)
                    .sort((a, b) => new Date(b.actualReturnTime || b.borrowTime).getTime() - new Date(a.actualReturnTime || a.borrowTime).getTime())
                  const latest = allRecords[0]
                  if (latest && latest.conditionOnReturn === 'lost') latestRecord = latest
                } else if (umbrella.status === 'damaged') {
                  latestRecord = store.borrowRecords
                    .filter((r) => r.umbrellaId === umbrella.id && r.status === 'returned' && r.conditionOnReturn === 'damaged')
                    .sort((a, b) => new Date(b.actualReturnTime || 0).getTime() - new Date(a.actualReturnTime || 0).getTime())[0]
                }
                return (
                  <UmbrellaCard
                    key={umbrella.id}
                    umbrella={umbrella}
                    latestRecord={latestRecord}
                    isRainy={weather.isRainy}
                    onRepair={handleRepair}
                  />
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
