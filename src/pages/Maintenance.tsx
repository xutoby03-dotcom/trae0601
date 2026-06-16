import { useState } from 'react'
import { useStore } from '@/store'
import { DAMAGE_LABELS, DAMAGE_COLORS, type DamageActionType } from '@/types'
import { timeAgo, formatDate } from '@/utils/format'
import { Wrench, ShoppingBag, Check, X } from 'lucide-react'

export default function Maintenance() {
  const { damageReports, goggles, completeDamage, getLabById } = useStore()
  const [activeTab, setActiveTab] = useState<'repair' | 'replace'>('repair')
  const [showComplete, setShowComplete] = useState<string | null>(null)
  const [completeNotes, setCompleteNotes] = useState('')

  const filteredReports = damageReports.filter(r => r.actionType === activeTab)
  const pendingReports = filteredReports.filter(r => r.status !== 'completed')
  const completedReports = filteredReports.filter(r => r.status === 'completed')

  const handleComplete = () => {
    if (!showComplete) return
    completeDamage(showComplete, completeNotes)
    setShowComplete(null)
    setCompleteNotes('')
  }

  const getGoggle = (id: string) => goggles.find(g => g.id === id)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">维修补购清单</h2>
        <p className="text-slate-500 mt-1">损坏停用的护目镜自动归入，区分维修与补购处理</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('repair')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'repair'
              ? 'bg-brand-700 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-4 h-4" />
          待维修
          {damageReports.filter(r => r.actionType === 'repair' && r.status !== 'completed').length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${activeTab === 'repair' ? 'bg-white/20' : 'bg-brand-100 text-brand-700'}`}>
              {damageReports.filter(r => r.actionType === 'repair' && r.status !== 'completed').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('replace')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'replace'
              ? 'bg-accent-600 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          待补购
          {damageReports.filter(r => r.actionType === 'replace' && r.status !== 'completed').length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${activeTab === 'replace' ? 'bg-white/20' : 'bg-accent-100 text-accent-700'}`}>
              {damageReports.filter(r => r.actionType === 'replace' && r.status !== 'completed').length}
            </span>
          )}
        </button>
      </div>

      {pendingReports.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            {activeTab === 'repair' ? '待维修' : '待补购'} ({pendingReports.length})
          </h3>
          <div className="space-y-3">
            {pendingReports.map(report => {
              const goggle = getGoggle(report.goggleId)
              const lab = goggle ? getLabById(goggle.labId) : null
              return (
                <div key={report.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === 'repair' ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'
                  }`}>
                    {activeTab === 'repair' ? <Wrench className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">{goggle?.code || '未知'}</span>
                      <span className={`badge ${DAMAGE_COLORS[report.damageType]}`}>
                        {DAMAGE_LABELS[report.damageType]}
                      </span>
                      {report.status === 'in_progress' && (
                        <span className="badge bg-blue-100 text-blue-700">处理中</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{report.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{lab?.name}</span>
                      <span>·</span>
                      <span>报告于 {timeAgo(report.reportedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowComplete(report.id)
                      setCompleteNotes('')
                    }}
                    className={`btn-primary text-xs px-4 py-2 ${activeTab === 'replace' ? 'bg-accent-600 hover:bg-accent-700' : ''}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {activeTab === 'repair' ? '维修完成' : '补购完成'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {completedReports.length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">已完成</h3>
          <div className="space-y-2">
            {completedReports.map(report => {
              const goggle = getGoggle(report.goggleId)
              return (
                <div key={report.id} className="flex items-center gap-4 p-3 rounded-lg opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{goggle?.code || '未知'}</span>
                      <span className={`badge ${DAMAGE_COLORS[report.damageType]}`}>{DAMAGE_LABELS[report.damageType]}</span>
                      <span className="badge bg-emerald-100 text-emerald-700">已完成</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {report.notes && <span>{report.notes} · </span>}
                      完成于 {report.completedAt ? formatDate(report.completedAt) : '未知'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {pendingReports.length === 0 && completedReports.length === 0 && (
        <div className="card p-12 text-center">
          {activeTab === 'repair' ? (
            <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          ) : (
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          )}
          <p className="text-sm text-slate-500">
            {activeTab === 'repair' ? '暂无待维修的护目镜' : '暂无待补购的护目镜'}
          </p>
        </div>
      )}

      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {activeTab === 'repair' ? '确认维修完成' : '确认补购完成'}
              </h3>
              <button onClick={() => setShowComplete(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">处理备注</label>
              <textarea
                value={completeNotes}
                onChange={e => setCompleteNotes(e.target.value)}
                placeholder="请输入处理说明..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            {activeTab === 'repair' && (
              <p className="text-xs text-slate-500 mb-4">
                确认后该护目镜将恢复为可用状态
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowComplete(null)} className="btn-secondary flex-1">取消</button>
              <button
                onClick={handleComplete}
                className={activeTab === 'repair' ? 'btn-primary flex-1' : 'btn-primary flex-1 bg-accent-600 hover:bg-accent-700'}
              >
                <Check className="w-4 h-4" />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
