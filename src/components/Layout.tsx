import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '@/store/useStore'

export default function Layout() {
  const materials = useStore((s) => s.materials)
  const lowStockCount = materials.filter((m) => m.quantity <= m.lowStockThreshold).length

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-cream/80 backdrop-blur-sm border-b border-sand-light px-8 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-4">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 bg-clay-light px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-clay rounded-full animate-pulse" />
                <span className="text-xs font-medium text-caramel-dark">{lowStockCount} 项低库存</span>
              </div>
            )}
            <span className="text-sm text-sand">{materials.length} 种材料</span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
