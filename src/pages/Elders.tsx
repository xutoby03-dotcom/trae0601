import { useStore } from '@/store'
import type { Elder } from '@/types'
import { useNavigate } from 'react-router-dom'
import { User, Building2, Stethoscope, Phone, Plus, Pencil, Trash2, HeartPulse, ClipboardPlus } from 'lucide-react'
import { useState } from 'react'

export default function Elders() {
  const navigate = useNavigate()
  const { elders, chronicDiseases, deleteElder } = useStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const diseaseCount = (elderId: string) =>
    chronicDiseases.filter((d) => d.elderId === elderId).length

  const handleDelete = (id: string) => {
    deleteElder(id)
    setDeleteId(null)
  }

  if (elders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-24 h-24 rounded-full bg-[#FDF6EC] flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-[#E8725A]" />
        </div>
        <h3 className="text-lg font-semibold text-stone-700 mb-2">暂无老人档案</h3>
        <p className="text-sm text-stone-400 mb-6">点击下方按钮添加第一位老人信息</p>
        <button
          onClick={() => navigate('/elders/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E8725A] text-white rounded-lg text-sm font-medium hover:bg-[#C95A43] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          添加老人
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-stone-800">老人档案</h1>
        <button
          onClick={() => navigate('/elders/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#E8725A] text-white rounded-lg text-sm font-medium hover:bg-[#C95A43] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          添加老人
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {elders.map((elder: Elder) => (
          <div
            key={elder.id}
            className="bg-[#FDF6EC] rounded-lg border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8725A] to-[#C95A43] flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-800">{elder.name}</h3>
                  <span className="text-sm text-stone-500">{elder.age} 岁</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8725A]/10 text-[#E8725A]">
                <HeartPulse className="w-3 h-3" />
                {diseaseCount(elder.id)} 种慢病
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-stone-600">
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                <span>{elder.hospital || '未填写'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Stethoscope className="w-3.5 h-3.5 text-stone-400" />
                <span>{elder.doctor || '未填写'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{elder.emergencyContact} {elder.emergencyPhone}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => navigate(`/chronic/${elder.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-[#E8725A]/10 text-[#E8725A] hover:bg-[#E8725A]/20 transition-colors"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                慢病管理
              </button>
              <button
                onClick={() => navigate(`/followup/${elder.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <ClipboardPlus className="w-3.5 h-3.5" />
                复诊记录
              </button>
            </div>

            <div className="flex gap-2 pt-3 border-t border-stone-200/60">
              <button
                onClick={() => navigate(`/elders/${elder.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:bg-stone-100 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                编辑
              </button>
              <button
                onClick={() => setDeleteId(elder.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full">
            <h3 className="font-semibold text-stone-800 mb-2">确认删除</h3>
            <p className="text-sm text-stone-500 mb-5">删除后该老人的所有档案信息将无法恢复，确定要删除吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
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
