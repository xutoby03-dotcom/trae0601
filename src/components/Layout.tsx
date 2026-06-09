import { useLocation, useNavigate } from 'react-router-dom'
import { Home, BarChart3, Plus } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  const isHome = path === '/'
  const isStats = path === '/stats'

  return (
    <div className="min-h-screen font-body pb-20">
      <div className="max-w-md mx-auto px-4 pt-4">
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
          <div className="bg-parchment-100/95 backdrop-blur-md border-t border-parchment-300 px-6 py-2 flex items-center justify-around shadow-warm">
            <button
              onClick={() => navigate('/')}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                isHome ? 'text-apricot-600' : 'text-parchment-500 hover:text-apricot-500'
              }`}
            >
              <Home size={22} strokeWidth={isHome ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">备忘</span>
            </button>

            <button
              onClick={() => navigate('/loan/new')}
              className="flex items-center justify-center w-12 h-12 -mt-5 bg-apricot-400 hover:bg-apricot-500 text-white rounded-full shadow-warm-md hover:shadow-warm-lg transition-all active:scale-95"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => navigate('/stats')}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                isStats ? 'text-apricot-600' : 'text-parchment-500 hover:text-apricot-500'
              }`}
            >
              <BarChart3 size={22} strokeWidth={isStats ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">统计</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
