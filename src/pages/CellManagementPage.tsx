import { useState } from 'react'
import { Map, Plus, Calendar, Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CellCard } from '../components/CellCard'
import { CellForm } from '../components/CellForm'
import { useInsectHotel } from '../hooks/useInsectHotel'
import type { Cell, CellMaterial, HeightLevel, OccupancyStatus } from '../types'
import { MATERIAL_NAMES, HEIGHT_NAMES, STATUS_NAMES } from '../types'

export default function CellManagementPage() {
  const { cells, addCell, updateCell, deleteCell } = useInsectHotel()
  const [showForm, setShowForm] = useState(false)
  const [editingCell, setEditingCell] = useState<Cell | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMaterial, setFilterMaterial] = useState<CellMaterial | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<OccupancyStatus | 'all'>('all')
  const [filterHeight, setFilterHeight] = useState<HeightLevel | 'all'>('all')

  const filteredCells = cells.filter((cell) => {
    const matchSearch = cell.cellNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchMaterial = filterMaterial === 'all' || cell.material === filterMaterial
    const matchStatus = filterStatus === 'all' || cell.status === filterStatus
    const matchHeight = filterHeight === 'all' || cell.height === filterHeight
    return matchSearch && matchMaterial && matchStatus && matchHeight
  })

  const handleSubmit = (data: Omit<Cell, 'id' | 'status' | 'registeredAt' | 'lastObservedAt'>) => {
    if (editingCell) {
      updateCell(editingCell.id, data)
    } else {
      addCell(data)
    }
    setShowForm(false)
    setEditingCell(null)
  }

  const handleEdit = (cell: Cell) => {
    setEditingCell(cell)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个格口吗？相关的观察记录也会被删除。')) {
      deleteCell(id)
    }
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
                <p className="text-sm text-stone-500">格口管理</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="nav-link flex items-center gap-2">
                <Map className="w-4 h-4" />
                观察地图
              </Link>
              <Link to="/cells" className="nav-link nav-link-active flex items-center gap-2">
                <Plus className="w-4 h-4" />
                格口管理
              </Link>
              <Link to="/record" className="nav-link flex items-center gap-2">
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
            <Link to="/cells" className="nav-link nav-link-active flex items-center gap-1 text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" />
              格口管理
            </Link>
            <Link to="/record" className="nav-link flex items-center gap-1 text-sm whitespace-nowrap">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-stone-800">
              📋 格口列表 <span className="text-stone-400 text-base">({filteredCells.length}个)</span>
            </h2>
            <button
              onClick={() => {
                setEditingCell(null)
                setShowForm(true)
              }}
              className="btn-primary flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              新增格口
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
                placeholder="搜索格口编号..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-stone-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm">筛选：</span>
              </div>

              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value as CellMaterial | 'all')}
                className="input-field py-2 text-sm"
              >
                <option value="all">全部材料</option>
                {Object.entries(MATERIAL_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as OccupancyStatus | 'all')}
                className="input-field py-2 text-sm"
              >
                <option value="all">全部状态</option>
                {Object.entries(STATUS_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <select
                value={filterHeight}
                onChange={(e) => setFilterHeight(e.target.value as HeightLevel | 'all')}
                className="input-field py-2 text-sm"
              >
                <option value="all">全部高度</option>
                {Object.entries(HEIGHT_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredCells.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg mb-2">没有找到符合条件的格口</p>
            <p className="text-sm">试试调整筛选条件或添加新格口</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCells.map((cell) => (
              <CellCard
                key={cell.id}
                cell={cell}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <CellForm
          cell={editingCell}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingCell(null)
          }}
        />
      )}

      <footer className="text-center py-6 text-stone-400 text-sm">
        <p>🐝 探索自然，发现生命的奥秘 🦋</p>
      </footer>
    </div>
  )
}
