import { useState } from 'react'
import WardrobeGrid from './components/WardrobeGrid'
import OutfitBoard from './components/OutfitBoard'
import CalendarView from './components/CalendarView'
import WeatherMode from './components/WeatherMode'
import LaundryBasket from './components/LaundryBasket'
import StatisticsPage from './components/StatisticsPage'

type Page = 'wardrobe' | 'outfit' | 'calendar' | 'weather' | 'laundry' | 'stats'

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'wardrobe', label: '我的衣橱', icon: '👗' },
  { key: 'outfit', label: '穿搭搭配', icon: '🎨' },
  { key: 'calendar', label: '穿搭日历', icon: '📅' },
  { key: 'weather', label: '天气推荐', icon: '🌤️' },
  { key: 'laundry', label: '洗衣篮', icon: '🧺' },
  { key: 'stats', label: '衣橱统计', icon: '📊' },
]

export default function App() {
  const [page, setPage] = useState<Page>('wardrobe')

  const renderPage = () => {
    switch (page) {
      case 'wardrobe': return <WardrobeGrid />
      case 'outfit': return <OutfitBoard />
      case 'calendar': return <CalendarView />
      case 'weather': return <WeatherMode />
      case 'laundry': return <LaundryBasket />
      case 'stats': return <StatisticsPage />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      <nav style={{
        width: 200,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        <div style={{
          padding: '0 20px 24px',
          fontSize: 20,
          fontWeight: 700,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 28 }}>👔</span>
          <span>衣橱日历</span>
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              border: 'none',
              background: page === item.key ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: page === item.key ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: page === item.key ? 600 : 400,
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.2s',
              borderLeft: page === item.key ? '3px solid #7c4dff' : '3px solid transparent',
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <main style={{
        flex: 1,
        marginLeft: 200,
        padding: 24,
        minHeight: '100vh',
      }}>
        {renderPage()}
      </main>
    </div>
  )
}
