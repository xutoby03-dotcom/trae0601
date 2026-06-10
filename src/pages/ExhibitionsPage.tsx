import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import {
  Plus, Calendar, MapPin, Users, AlertTriangle,
  ChevronRight, Edit, Trash2, Filter, ChevronDown
} from 'lucide-react'
import { useState } from 'react'

const statusMap: Record<string, { label: string; cls: string; dot: string }> = {
  draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  published: { label: '已发布', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  ongoing: { label: '进行中', cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  ended: { label: '已结束', cls: 'bg-zinc-100 text-zinc-500', dot: 'bg-zinc-400' },
}

export default function ExhibitionsPage() {
  const navigate = useNavigate()
  const { exhibitions, setCurrentExhibition, updateExhibition, deleteExhibition } = useApp()
  const [filter, setFilter] = useState<string>('all')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const filtered = exhibitions.filter(e => filter === 'all' || e.status === filter)

  return (
    <>
      <PageHeader
        title="展会管理"
        subtitle="创建与管理市集、义卖会、开放日等各类展会活动"
        actions={
          <button onClick={() => navigate('/exhibitions/create')} className="btn-secondary">
            <Plus className="w-4 h-4" />新建展会
          </button>
        }
      />

      <section className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative">
            <Filter className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input-base pl-9 pr-8 appearance-none"
            >
              <option value="all">全部状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="ongoing">进行中</option>
              <option value="ended">已结束</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-forest-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="text-sm text-forest-500">
            共 <span className="font-semibold text-forest-700">{filtered.length}</span> 场展会
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(ex => {
            const status = statusMap[ex.status] || statusMap.draft
            const rate = ex.total ? Math.round((ex.occupied || 0) / ex.total * 100) : 0
            const onMainClick = () => { setCurrentExhibition(ex.id); navigate(`/exhibitions/${ex.id}`) }
            return (
              <div key={ex.id} className="card p-5 group animate-fade-in hover:shadow-lift transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={onMainClick}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('w-2 h-2 rounded-full', status.dot)} />
                      <span className={cn('badge', status.cls)}>{status.label}</span>
                    </div>
                    <h3 className="title-md group-hover:text-copper-600 transition-colors line-clamp-1">
                      {ex.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setCurrentExhibition(ex.id); navigate(`/exhibitions/${ex.id}`) }}
                      className="p-2 rounded-lg hover:bg-forest-50 text-forest-400 hover:text-forest-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(ex.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-5 cursor-pointer" onClick={onMainClick}>
                  <div className="flex items-center gap-2 text-xs text-forest-600">
                    <MapPin className="w-3.5 h-3.5 text-copper-500 shrink-0" />
                    <span className="truncate">{ex.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-forest-600">
                    <Calendar className="w-3.5 h-3.5 text-copper-500 shrink-0" />
                    <span>{ex.start_date} 至 {ex.end_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-forest-600">
                    <Users className="w-3.5 h-3.5 text-copper-500 shrink-0" />
                    <span>摊位 {ex.occupied || 0} / {ex.total || ex.booth_count}</span>
                    {(ex.conflicts || 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-red-500 ml-auto">
                        <AlertTriangle className="w-3.5 h-3.5" />{ex.conflicts} 个冲突
                      </span>
                    )}
                    {(ex.pending || 0) > 0 && (
                      <span className="badge bg-amber-100 text-amber-700 ml-auto">
                        {ex.pending} 待审核
                      </span>
                    )}
                  </div>
                </div>

                {ex.total ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] font-medium text-forest-500 mb-1.5">
                      <span>摊位占用率</span>
                      <span className="tabular-nums">{rate}%</span>
                    </div>
                    <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500',
                          rate >= 90 ? 'bg-red-400' : rate >= 70 ? 'bg-copper-500' : 'bg-forest-500')}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-forest-100/60">
                  <div className="flex gap-2">
                    {ex.status === 'draft' && (
                      <button
                        onClick={() => updateExhibition(ex.id, { status: 'published' })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-forest-100 text-forest-700 hover:bg-forest-200 font-medium"
                      >
                        发布
                      </button>
                    )}
                    {ex.status === 'published' && (
                      <button
                        onClick={() => updateExhibition(ex.id, { status: 'ongoing' })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
                      >
                        开始
                      </button>
                    )}
                    {ex.status === 'ongoing' && (
                      <button
                        onClick={() => updateExhibition(ex.id, { status: 'ended' })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-medium"
                      >
                        结束
                      </button>
                    )}
                  </div>
                  <button
                    onClick={onMainClick}
                    className="btn-ghost text-xs py-1.5 px-3 !gap-1"
                  >
                    详情 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-full card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-forest-50 mx-auto flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-forest-300" />
              </div>
              <div className="font-serif text-lg text-forest-600 mb-1">暂无展会</div>
              <div className="text-sm text-forest-400 mb-5">点击右上角按钮创建你的第一场展会</div>
              <button onClick={() => navigate('/exhibitions/create')} className="btn-secondary">
                <Plus className="w-4 h-4" />新建展会
              </button>
            </div>
          )}
        </div>
      </section>

      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setConfirmDelete(null)}
        >
          <div className="card p-6 max-w-sm w-full animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="section-title mb-3 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              确认删除展会？
            </div>
            <p className="text-sm text-forest-600 mb-5">
              删除后所有摊位、申请和签到记录将无法恢复。
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-outline">取消</button>
              <button
                onClick={() => { deleteExhibition(confirmDelete); setConfirmDelete(null) }}
                className="btn-danger"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
