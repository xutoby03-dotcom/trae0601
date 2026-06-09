import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Eye,
  Snowflake,
  Armchair,
  Sofa,
  Volume2,
  RotateCcw,
} from 'lucide-react'
import { NapSpot, SeatType, SEAT_TYPE_LABELS, AREA_OPTIONS, TIME_SLOTS } from '../types'
import { getSpots, addSpot, updateSpot, deleteSpot, resetStore } from '../store'

const EMPTY_FORM = {
  name: '',
  area: AREA_OPTIONS[0],
  seatType: 'lounge' as SeatType,
  capacity: 1,
  hasLightBlocking: false,
  nearAC: false,
  availableFrom: '12:00',
  availableTo: '14:00',
  rules: '',
  gridRow: 1,
  gridCol: 1,
}

export default function Admin() {
  const [spots, setSpots] = useState<NapSpot[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState<string | null>(null)

  const refresh = () => setSpots(getSpots())

  useEffect(() => { refresh() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateSpot(editingId, form)
      showToast('座位已更新')
    } else {
      addSpot(form)
      showToast('座位已添加')
    }
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    refresh()
  }

  const handleEdit = (spot: NapSpot) => {
    setForm({
      name: spot.name,
      area: spot.area,
      seatType: spot.seatType,
      capacity: spot.capacity,
      hasLightBlocking: spot.hasLightBlocking,
      nearAC: spot.nearAC,
      availableFrom: spot.availableFrom,
      availableTo: spot.availableTo,
      rules: spot.rules,
      gridRow: spot.gridRow,
      gridCol: spot.gridCol,
    })
    setEditingId(spot.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    deleteSpot(id)
    refresh()
    showToast('座位已删除')
  }

  const handleReset = () => {
    if (confirm('确定重置所有数据？此操作不可恢复。')) {
      resetStore()
      refresh()
      showToast('数据已重置为初始状态')
    }
  }

  const TYPE_ICONS: Record<SeatType, React.ReactNode> = {
    lounge: <Armchair className="w-4 h-4" />,
    sofa: <Sofa className="w-4 h-4" />,
    quiet_corner: <Volume2 className="w-4 h-4" />,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">管理后台</h2>
          <p className="text-slate-400 text-sm mt-1">登记和管理午休座位信息</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 text-slate-300 text-sm font-medium hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />重置数据
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition"
          >
            <Plus className="w-4 h-4" />添加座位
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
            onClick={() => { setShowForm(false); setEditingId(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-secondary)] rounded-2xl p-8 w-[560px] border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingId ? '编辑座位' : '添加座位'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">座位名称</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="如：A1躺椅"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">所在区域</label>
                    <select
                      value={form.area}
                      onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">座位类型</label>
                    <select
                      value={form.seatType}
                      onChange={e => setForm(f => ({ ...f, seatType: e.target.value as SeatType }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {Object.entries(SEAT_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">容纳人数</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.capacity}
                      onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">平面图位置</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="行"
                        value={form.gridRow}
                        onChange={e => setForm(f => ({ ...f, gridRow: parseInt(e.target.value) || 1 }))}
                        className="px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="列"
                        value={form.gridCol}
                        onChange={e => setForm(f => ({ ...f, gridCol: parseInt(e.target.value) || 1 }))}
                        className="px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">可预约开始</label>
                    <select
                      value={form.availableFrom}
                      onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">可预约结束</label>
                    <select
                      value={form.availableTo}
                      onChange={e => setForm(f => ({ ...f, availableTo: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hasLightBlocking}
                      onChange={e => setForm(f => ({ ...f, hasLightBlocking: e.target.checked }))}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">有遮光</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.nearAC}
                      onChange={e => setForm(f => ({ ...f, nearAC: e.target.checked }))}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <Snowflake className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">靠空调</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">使用规则</label>
                  <textarea
                    value={form.rules}
                    onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
                    placeholder="如：请轻声，手机静音"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null) }}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 text-sm text-slate-300 hover:bg-slate-600 transition"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 text-sm text-white hover:bg-indigo-600 transition"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? '保存修改' : '添加座位'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {spots.map(spot => (
          <motion.div
            key={spot.id}
            layout
            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-slate-700/50 hover:border-slate-600 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-300">
                {TYPE_ICONS[spot.seatType]}
              </div>
              <div>
                <p className="font-medium text-slate-200">{spot.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {spot.area} · {SEAT_TYPE_LABELS[spot.seatType]} · 容纳{spot.capacity}人 · {spot.availableFrom}-{spot.availableTo}
                  {spot.hasLightBlocking ? ' · 遮光' : ''}{spot.nearAC ? ' · 靠空调' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(spot)}
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(spot.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {spots.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Armchair className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>暂无座位，点击上方按钮添加</p>
        </div>
      )}
    </div>
  )
}
