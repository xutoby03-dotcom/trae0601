import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ear, Plus, Pencil, Trash2, Phone, Calendar } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { BATTERY_TYPE_LABELS, SIDE_LABELS } from '@/types/index'
import type { HearingAid } from '@/types/index'

export default function Devices() {
  const hearingAids = useStore((s) => s.hearingAids)
  const deleteHearingAid = useStore((s) => s.deleteHearingAid)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const leftAids = hearingAids.filter((a) => a.side === 'left')
  const rightAids = hearingAids.filter((a) => a.side === 'right')

  const handleDelete = () => {
    if (deleteId) {
      deleteHearingAid(deleteId)
      setDeleteId(null)
    }
  }

  const renderCard = (aid: HearingAid) => (
    <div
      key={aid.id}
      className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              aid.side === 'left' ? 'bg-blue-400' : 'bg-rose-400'
            }`}
          />
          <span className="text-lg font-bold text-[#2D3A4A]">{aid.model}</span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/devices/${aid.id}/edit`}
            className="p-2 rounded-xl hover:bg-[#FDF8F3] text-[#2D3A4A]/60 hover:text-[#E8913A] transition-colors"
          >
            <Pencil size={18} />
          </Link>
          <button
            onClick={() => setDeleteId(aid.id)}
            className="p-2 rounded-xl hover:bg-red-50 text-[#2D3A4A]/60 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-[#2D3A4A]/70">
        <div className="flex items-center gap-2">
          <Ear size={15} className="text-[#E8913A]" />
          <span>{BATTERY_TYPE_LABELS[aid.batteryType]}</span>
        </div>
        {aid.chargingCase && (
          <div className="flex items-center gap-2">
            <span className="w-[15px] text-center text-[#E8913A]">📦</span>
            <span>{aid.chargingCase}</span>
          </div>
        )}
        {aid.purchaseDate && (
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-[#E8913A]" />
            <span>{aid.purchaseDate}</span>
          </div>
        )}
        {aid.warrantyPhone && (
          <div className="flex items-center gap-2">
            <Phone size={15} className="text-[#E8913A]" />
            <span>{aid.warrantyPhone}</span>
          </div>
        )}
      </div>
    </div>
  )

  if (hearingAids.length === 0) {
    return (
      <div className="text-center py-20">
        <Ear size={56} className="mx-auto text-[#E8913A]/30 mb-4" />
        <p className="text-[#2D3A4A]/50 text-lg mb-6">还没有添加助听器</p>
        <Link
          to="/devices/add"
          className="inline-flex items-center gap-2 bg-[#E8913A] text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-[#d07e2e] transition-colors"
        >
          <Plus size={20} />
          添加助听器
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2D3A4A]">助听器管理</h1>
        <Link
          to="/devices/add"
          className="flex items-center gap-2 bg-[#E8913A] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#d07e2e] transition-colors"
        >
          <Plus size={18} />
          添加
        </Link>
      </div>

      {leftAids.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#2D3A4A] mb-3">
            {SIDE_LABELS.left}
          </h2>
          <div className="space-y-3">{leftAids.map(renderCard)}</div>
        </div>
      )}

      {rightAids.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#2D3A4A] mb-3">
            {SIDE_LABELS.right}
          </h2>
          <div className="space-y-3">{rightAids.map(renderCard)}</div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-[#2D3A4A] mb-2">确认删除</h3>
            <p className="text-[#2D3A4A]/60 mb-6">确定要删除这台助听器吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-indigo-100 text-[#2D3A4A] font-semibold hover:bg-[#FDF8F3] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
