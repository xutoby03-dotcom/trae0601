import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import LockerGrid from '@/components/locker/LockerGrid'
import LockerForm from '@/components/locker/LockerForm'
import Modal from '@/components/common/Modal'
import { Plus, Boxes, Trash2 } from 'lucide-react'
import type { Locker, LockerSize } from '@/types'

interface LockersProps {
  onCheckInFromLocker?: (lockerId: string) => void
}

export default function Lockers({ onCheckInFromLocker }: LockersProps) {
  const { lockers, addLocker, updateLocker, deleteLocker, getPackagesByLockerId, refreshUrgentStatus } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingLocker, setEditingLocker] = useState<Locker | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Locker | null>(null)

  useEffect(() => {
    refreshUrgentStatus()
  }, [refreshUrgentStatus])

  const handleFormSubmit = (data: { code: string; size: LockerSize; location: string; isRefrigerated: boolean; photo: string }) => {
    if (editingLocker) {
      updateLocker(editingLocker.id, data)
    } else {
      addLocker(data)
    }
    setShowForm(false)
    setEditingLocker(null)
  }

  const handleEdit = (locker: Locker) => {
    setEditingLocker(locker)
    setShowForm(true)
  }

  const handleDelete = (locker: Locker) => {
    if (locker.status !== 'empty') {
      alert('该柜格当前有包裹存放，无法删除')
      return
    }
    const pkgs = getPackagesByLockerId(locker.id)
    if (pkgs.length > 0) {
      if (!confirm(`确定删除柜格 ${locker.code}？该柜格下有 ${pkgs.length} 条历史记录，删除后历史记录将无法关联柜格信息。`)) return
    } else {
      if (!confirm(`确定删除柜格 ${locker.code}？此操作不可撤销。`)) return
    }
    deleteLocker(locker.id)
    setDeleteConfirm(null)
  }

  const handleSelect = (locker: Locker) => {
    if (locker.status === 'empty' && onCheckInFromLocker) {
      onCheckInFromLocker(locker.id)
    }
  }

  const existingCodes = lockers.map((l) => l.code)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
            <Boxes size={22} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-800">柜格档案管理</h2>
            <p className="text-sm text-slate-500">共 {lockers.length} 个柜格 · 点击空闲柜格可快速入柜</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingLocker(null); setShowForm(true) }}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white text-sm font-medium hover:from-primary-600 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus size={16} />
          新增柜格
        </button>
      </div>

      <LockerGrid
        onAdd={() => { setEditingLocker(null); setShowForm(true) }}
        onEdit={handleEdit}
        onDelete={(l) => setDeleteConfirm(l)}
        onSelect={handleSelect}
        selectable={!!onCheckInFromLocker}
      />

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingLocker(null) }}
        title={editingLocker ? '编辑柜格' : '新增柜格'}
        icon={<Boxes size={20} />}
        size="md"
      >
        <LockerForm
          locker={editingLocker || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingLocker(null) }}
          existingCodes={existingCodes}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="删除柜格确认"
        icon={<Trash2 size={20} className="text-red-500" />}
        size="sm"
      >
        {deleteConfirm && (
          <div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
              <p className="text-sm text-red-800">
                您即将删除柜格 <strong className="font-mono">{deleteConfirm.code}</strong>（{deleteConfirm.location}）。
              </p>
              <p className="text-xs text-red-600 mt-2">柜格状态：{deleteConfirm.status === 'empty' ? '空闲 ✓ 可删除' : '占用中 ✗ 禁止删除'}</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 shadow-sm"
              >
                <Trash2 size={14} />
                确认删除
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
