import { useState } from 'react'
import { Map, Plus, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ObservationForm } from '../components/ObservationForm'
import { ObservationTimeline } from '../components/ObservationTimeline'
import { useInsectHotel } from '../hooks/useInsectHotel'
import { MATERIAL_NAMES, STATUS_NAMES } from '../types'

export default function DailyRecordPage() {
  const { cells, selectedCell, selectedCellId, selectCell, addObservation, getCellObservations } = useInsectHotel()
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(true)

  const cellObservations = selectedCellId ? getCellObservations(selectedCellId) : []

  const handleSubmit = (data: Parameters<typeof addObservation>[0]) => {
    addObservation(data)
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b-2 border-dashed border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-float">🏠</span>
              <div>
                <h1 className="text-2xl font-display font-bold text-stone-800">
                  昆虫旅馆观察站
                </h1>
                <p className="text-sm text-stone-500">每日观察记录</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="nav-link flex items-center gap-2">
                <Map className="w-4 h-4" />
                观察地图
              </Link>
              <Link to="/cells" className="nav-link flex items-center gap-2">
                <Plus className="w-4 h-4" />
                格口管理
              </Link>
              <Link to="/record" className="nav-link nav-link-active flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                每日记录
              </Link>
              <Link to="/analysis" className="nav-link flex items-center gap-2">
                📊 数据分析
              </Link>
            </nav>
          </div>

          <nav className="md:hidden flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            <Link to="/" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
              <Map className="w-4 h-4" />
              观察地图
            </Link>
            <Link to="/cells" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" />
              格口管理
            </Link>
            <Link to="/record" className="nav-link nav-link-active flex items-center gap-1 text-sm whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              每日记录
            </Link>
            <Link to="/analysis" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
              📊 数据分析
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-5 mb-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">
            🎯 选择观察格口
          </h2>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {cells.map((cell) => (
              <button
                key={cell.id}
                onClick={() => selectCell(selectedCellId === cell.id ? null : cell.id)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-300
                  ${selectedCellId === cell.id
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }
                `}
              >
                <div className="font-bold text-stone-800 text-sm">{cell.cellNumber}</div>
                <div className="text-[10px] text-stone-500 truncate">
                  {MATERIAL_NAMES[cell.material]}
                </div>
                <div
                  className={`mt-1 text-[10px] px-1.5 py-0.5 rounded-full inline-block ${
                    cell.status === 'occupied'
                      ? 'bg-green-100 text-green-700'
                      : cell.status === 'underObservation'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {STATUS_NAMES[cell.status]}
                </div>
              </button>
            ))}
          </div>

          {selectedCell && (
            <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    {selectedCell.cellNumber}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCell.status === 'occupied'
                          ? 'bg-green-100 text-green-700'
                          : selectedCell.status === 'underObservation'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {STATUS_NAMES[selectedCell.status]}
                    </span>
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">
                    材料：{MATERIAL_NAMES[selectedCell.material]} · 已有 {cellObservations.length} 条观察记录
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary flex items-center gap-2 self-start sm:self-auto"
                >
                  <Plus className="w-5 h-5" />
                  记录今日观察
                </button>
              </div>
            </div>
          )}

          {!selectedCell && (
            <div className="mt-6 text-center py-8 text-stone-400">
              <div className="text-4xl mb-2">👆</div>
              <p>请先选择一个格口开始记录</p>
            </div>
          )}
        </div>

        {selectedCell && (
          <div className="bg-white rounded-xl border-2 border-dashed border-stone-300 p-5">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="text-xl font-bold text-stone-800">
                📜 观察历史记录
              </h2>
              {showHistory ? (
                <ChevronUp className="w-5 h-5 text-stone-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-stone-500" />
              )}
            </button>

            {showHistory && (
              <ObservationTimeline observations={cellObservations} />
            )}
          </div>
        )}
      </main>

      {showForm && selectedCell && (
        <ObservationForm
          cellId={selectedCell.id}
          cellNumber={selectedCell.cellNumber}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <footer className="text-center py-6 text-stone-400 text-sm">
        <p>🐝 探索自然，发现生命的奥秘 🦋</p>
      </footer>
    </div>
  )
}
