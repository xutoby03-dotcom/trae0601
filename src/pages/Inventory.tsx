import { useState, useMemo, useEffect } from 'react'
import { useStore } from '@/store'
import { STATUS_LABELS, STATUS_COLORS, SIZE_LABELS, type GoggleSize, type GoggleStatus, type Goggle } from '@/types'
import { formatDateTime, formatDate } from '@/utils/format'
import { Archive, Search, Plus, X, Eye, Edit3, CheckSquare, Square, ArrowRight } from 'lucide-react'
import StatusFlowModal from '@/components/StatusFlowModal'

export default function Inventory() {
  const { goggles, labs, addGoggle, updateGoggle, getLabById } = useStore()
  const [search, setSearch] = useState('')
  const [filterLab, setFilterLab] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [snapshotGoggles, setSnapshotGoggles] = useState<Goggle[]>([])

  const [newCode, setNewCode] = useState('')
  const [newSize, setNewSize] = useState<GoggleSize>('M')
  const [newLabId, setNewLabId] = useState('')

  const filteredGoggles = useMemo(() => goggles.filter(g => {
    if (search && !g.code.toLowerCase().includes(search.toLowerCase())) return false
    if (filterLab && g.labId !== filterLab) return false
    if (filterStatus && g.status !== filterStatus) return false
    return true
  }), [goggles, search, filterLab, filterStatus])

  const visibleIds = useMemo(() => new Set(filteredGoggles.map(g => g.id)), [filteredGoggles])

  useEffect(() => {
    setSelectedIds(prev => {
      const cleaned = prev.filter(id => visibleIds.has(id))
      return cleaned.length === prev.length ? prev : cleaned
    })
  }, [visibleIds])

  const selectedGoggles = useMemo(
    () => filteredGoggles.filter(g => selectedIds.includes(g.id)),
    [filteredGoggles, selectedIds]
  )

  const allSelected = filteredGoggles.length > 0 && selectedGoggles.length === filteredGoggles.length
  const someSelected = selectedGoggles.length > 0 && selectedGoggles.length < filteredGoggles.length

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)))
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filteredGoggles.forEach(g => next.add(g.id))
        return Array.from(next)
      })
    }
  }

  const handleAdd = () => {
    if (!newCode.trim() || !newLabId) return
    addGoggle({
      code: newCode.trim(),
      size: newSize,
      labId: newLabId,
      status: 'available',
      lastDisinfectionTime: null,
      photoUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laboratory+safety+goggles+product+photo+white+background&image_size=square`,
      purchaseDate: new Date().toISOString().split('T')[0],
    })
    setShowAdd(false)
    setNewCode('')
    setNewSize('M')
    setNewLabId('')
  }

  const detailGoggle = showDetail ? goggles.find(g => g.id === showDetail) : null
  const editGoggle = showEdit ? goggles.find(g => g.id === showEdit) : null
  const [editLabId, setEditLabId] = useState('')
  const [editSize, setEditSize] = useState<GoggleSize>('M')

  const openEdit = (id: string) => {
    const g = goggles.find(g => g.id === id)
    if (!g) return
    setEditLabId(g.labId)
    setEditSize(g.size)
    setShowEdit(id)
  }

  const handleEdit = () => {
    if (!showEdit) return
    updateGoggle(showEdit, { labId: editLabId, size: editSize })
    setShowEdit(null)
  }

  const visibleCount = showStatusModal ? snapshotGoggles.length : selectedGoggles.length

  const statusOptions = Object.entries(STATUS_LABELS) as [GoggleStatus, string][]

  const handleBatchStatus = () => {
    if (selectedGoggles.length === 0) return
    setSnapshotGoggles([...selectedGoggles])
    setShowStatusModal(true)
  }

  const handleStatusModalClose = () => {
    setShowStatusModal(false)
    setSnapshotGoggles([])
    setSelectedIds([])
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">护目镜台账</h2>
          <p className="text-slate-500 mt-1">管理所有护目镜的资料信息，包括尺码、实验室和消毒记录</p>
        </div>
        <div className="flex items-center gap-3">
          {visibleCount > 0 && (
            <button onClick={handleBatchStatus} className="btn-secondary">
              <CheckSquare className="w-4 h-4" />
              批量改状态 ({visibleCount})
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            新增护目镜
          </button>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索编号..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={filterLab} onChange={e => setFilterLab(e.target.value)} className="select-field w-48">
            <option value="">全部实验室</option>
            {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-field w-36">
            <option value="">全部状态</option>
            {statusOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <span className="text-sm text-slate-500 shrink-0">共 {filteredGoggles.length} 副</span>
          {visibleCount > 0 && (
            <span className="text-sm text-brand-600 font-medium shrink-0">
              已选 {visibleCount} 副
            </span>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 w-12">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-600" />
                    ) : someSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-400 opacity-60" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">照片</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">编号</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">尺码</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">所在实验室</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">状态</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">最近消毒</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wide">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoggles.map(g => {
                const lab = getLabById(g.labId)
                const isSelected = selectedIds.includes(g.id)
                return (
                  <tr
                    key={g.id}
                    className={`border-b border-slate-100 transition-colors ${
                      isSelected ? 'bg-brand-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-4">
                      <button onClick={() => toggleSelect(g.id)} className="text-slate-400 hover:text-brand-600 transition-colors">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                        {g.photoUrl ? (
                          <img src={g.photoUrl} alt={g.code} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Archive className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{g.code}</td>
                    <td className="py-3 px-4 text-slate-600">{SIZE_LABELS[g.size]}</td>
                    <td className="py-3 px-4 text-slate-600">{lab?.name}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_COLORS[g.status]}`}>{STATUS_LABELS[g.status]}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{g.lastDisinfectionTime ? formatDateTime(g.lastDisinfectionTime) : '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setShowDetail(g.id)} className="text-brand-600 hover:text-brand-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(g.id)} className="text-slate-500 hover:text-slate-700 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredGoggles.length === 0 && (
          <div className="text-center py-12">
            <Archive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">未找到匹配的护目镜</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">新增护目镜</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">编号</label>
                <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="例如：HM-061" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">尺码</label>
                <select value={newSize} onChange={e => setNewSize(e.target.value as GoggleSize)} className="select-field">
                  {(Object.entries(SIZE_LABELS) as [GoggleSize, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">分配实验室</label>
                <select value={newLabId} onChange={e => setNewLabId(e.target.value)} className="select-field">
                  <option value="">请选择实验室</option>
                  {labs.map(l => <option key={l.id} value={l.id}>{l.name} ({l.building} {l.roomNumber})</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">取消</button>
              <button onClick={handleAdd} className="btn-primary flex-1" disabled={!newCode.trim() || !newLabId}>确认新增</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && detailGoggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">护目镜详情 — {detailGoggle.code}</h3>
              <button onClick={() => setShowDetail(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-6">
              <div className="w-32 h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {detailGoggle.photoUrl ? (
                  <img src={detailGoggle.photoUrl} alt={detailGoggle.code} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Archive className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">编号</span>
                  <span className="text-sm font-medium text-slate-800">{detailGoggle.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">尺码</span>
                  <span className="text-sm font-medium text-slate-800">{SIZE_LABELS[detailGoggle.size]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">所在实验室</span>
                  <span className="text-sm font-medium text-slate-800">{getLabById(detailGoggle.labId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">状态</span>
                  <span className={`badge ${STATUS_COLORS[detailGoggle.status]}`}>{STATUS_LABELS[detailGoggle.status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">最近消毒</span>
                  <span className="text-sm font-medium text-slate-800">{detailGoggle.lastDisinfectionTime ? formatDateTime(detailGoggle.lastDisinfectionTime) : '无记录'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">购入日期</span>
                  <span className="text-sm font-medium text-slate-800">{formatDate(detailGoggle.purchaseDate)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDetail(null)
                  setSelectedIds([detailGoggle.id])
                  setSnapshotGoggles([detailGoggle])
                  setShowStatusModal(true)
                }}
                className="btn-secondary flex-1"
              >
                修改状态
              </button>
              <button onClick={() => setShowDetail(null)} className="btn-primary flex-1">关闭</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && editGoggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">编辑护目镜 — {editGoggle.code}</h3>
              <button onClick={() => setShowEdit(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">尺码</label>
                <select value={editSize} onChange={e => setEditSize(e.target.value as GoggleSize)} className="select-field">
                  {(Object.entries(SIZE_LABELS) as [GoggleSize, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">所在实验室</label>
                <select value={editLabId} onChange={e => setEditLabId(e.target.value)} className="select-field">
                  {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowEdit(null)} className="btn-secondary flex-1">取消</button>
              <button onClick={handleEdit} className="btn-primary flex-1">保存修改</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <StatusFlowModal
          goggles={snapshotGoggles}
          onClose={handleStatusModalClose}
          title="批量状态流转"
        />
      )}
    </div>
  )
}
