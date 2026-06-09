import { useState } from 'react'
import Home from './pages/Home'
import Dogs from './pages/Dogs'
import Plans from './pages/Plans'
import Records from './pages/Records'
import Stats from './pages/Stats'

type Tab = 'home' | 'dogs' | 'plans' | 'records' | 'stats'

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'dogs', label: '狗狗', icon: '🐕' },
  { key: 'plans', label: '计划', icon: '📅' },
  { key: 'records', label: '记录', icon: '📝' },
  { key: 'stats', label: '统计', icon: '📊' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />
      case 'dogs':
        return <Dogs />
      case 'plans':
        return <Plans onNavigate={setActiveTab} />
      case 'records':
        return <Records />
      case 'stats':
        return <Stats />
    }
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🐾</span>
          <span>遛狗协调</span>
        </div>
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="main-content">{renderPage()}</main>
    </div>
  )
}
