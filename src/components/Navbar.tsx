import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Film, Search, SlidersHorizontal, BarChart3, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onFilterToggle: () => void
  filterOpen: boolean
  onSearchChange: (value: string) => void
  searchValue: string
}

export default function Navbar({ onFilterToggle, filterOpen, onSearchChange, searchValue }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cinema-900 border-b border-amber-primary">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-amber-primary" />
            <span className="font-display italic text-amber-primary text-xl">影词</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                searchOpen ? 'bg-cinema-700 text-amber-primary' : 'text-gray-400 hover:text-amber-primary hover:bg-cinema-800'
              )}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onFilterToggle}
              className={cn(
                'p-2 rounded-lg transition-colors',
                filterOpen ? 'bg-cinema-700 text-amber-primary' : 'text-gray-400 hover:text-amber-primary hover:bg-cinema-800'
              )}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            <Link
              to="/stats"
              className="p-2 rounded-lg text-gray-400 hover:text-amber-primary hover:bg-cinema-800 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>

            <Link
              to="/add"
              className="flex items-center gap-1.5 bg-amber-primary text-cinema-900 px-3 py-1.5 rounded-full font-body text-sm font-semibold hover:bg-amber-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加台词
            </Link>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-cinema-800 border-b border-cinema-600 animate-slide-up">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="搜索台词、电影..."
                className="w-full bg-cinema-700 text-gray-200 font-body pl-10 pr-4 py-2 rounded-lg border border-cinema-600 focus:border-amber-primary focus:outline-none placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
