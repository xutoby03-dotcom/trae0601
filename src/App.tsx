import React from 'react'
import GuestListPanel from './components/GuestListPanel'
import BanquetHall from './components/BanquetHall'
import Toolbar from './components/Toolbar'
import { useWeddingStore } from './store'

export default function App() {
  const { guests, tables } = useWeddingStore()

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="header-icon">💒</span>
          <h1>婚礼座位安排器</h1>
        </div>
        <div className="header-stats">
          <span>{guests.length}位宾客</span>
          <span>{tables.length}桌</span>
          <span>{guests.filter((g) => g.tableId).length}已安排</span>
        </div>
      </header>
      <main className="app-main">
        <aside className="sidebar-left">
          <GuestListPanel />
        </aside>
        <section className="hall-section">
          <BanquetHall />
        </section>
        <aside className="sidebar-right">
          <Toolbar />
        </aside>
      </main>
    </div>
  )
}
