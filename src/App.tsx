import React, { useState } from 'react'
import { EnergyMapPage } from './pages/EnergyMapPage'
import { RecordPage } from './pages/RecordPage'
import { HabitsPage } from './pages/HabitsPage'
import { StatsPage } from './pages/StatsPage'
import { ReviewPage } from './pages/ReviewPage'
import { Map, Edit3, ListChecks, BarChart3, RotateCcw } from 'lucide-react'

type TabId = 'map' | 'record' | 'habits' | 'stats' | 'review'

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'map', label: '地图', icon: <Map size={20} /> },
  { id: 'record', label: '记录', icon: <Edit3 size={20} /> },
  { id: 'habits', label: '习惯', icon: <ListChecks size={20} /> },
  { id: 'stats', label: '统计', icon: <BarChart3 size={20} /> },
  { id: 'review', label: '复盘', icon: <RotateCcw size={20} /> },
]

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('map')

  const renderPage = () => {
    switch (activeTab) {
      case 'map':
        return <EnergyMapPage />
      case 'record':
        return <RecordPage />
      case 'habits':
        return <HabitsPage />
      case 'stats':
        return <StatsPage />
      case 'review':
        return <ReviewPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">{renderPage()}</div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
