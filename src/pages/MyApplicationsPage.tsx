import { useEffect, useState } from 'react'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import {
  Search, FileText, MapPin, Calendar,
  Clock, ChevronDown, Sparkles, Zap, Flame
} from 'lucide-react'

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '审核中', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: '已通过', cls: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', cls: 'bg-red-100 text-red-600' },
}

export default function MyApplicationsPage() {
  const { fetchMyApplications } = useApp()
  const [list, setList] = useState<any[]>([])
  const [phone, setPhone] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    const data = await fetchMyApplications(phone || undefined)
    setList(data)
  }

  useEffect(() => { load() }, [])

  const filtered = list.filter(a => filter === 'all' || a.status === filter)
  const counts = {
    all: list.length,
    pending: list.filter(a => a.status === 'pending').length,
    approved: list.filter(a => a.status === 'approved').length,
    rejected: list.filter(a => a.status === 'rejected').length,
  }

  return (
    <>
      <PageHeader title="我的申请" subtitle="查看所有摊位申请的审核状态和详情" />

      <section className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="按手机号筛选（选填）"
              className="input-base pl-9 w-72"
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>
          <button onClick={load} className="btn-outline">
            <Search className="w-4 h-4" />查询
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {[
              { key: 'all', label: '全部' },
              { key: 'pending', label: '审核中' },
              { key: 'approved', label: '已通过' },
              { key: 'rejected', label: '已拒绝' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
                  filter === t.key ? 'bg-forest-700 text-white shadow-soft' : 'bg-white border border-forest-200 text-forest-600 hover:border-forest-400'
                )}
              >
                {t.label} <span className="opacity-60 ml-1">({(counts as any)[t.key]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            const st = statusMap[a.status]
            return (
              <div key={a.id} className="card p-5 animate-fade-in hover:shadow-lift transition-all">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('badge', st.cls)}>{st.label}</span>
                      {(a.conflicts?.length || 0) > 0 && (
                        <span className="badge bg-red-100 text-red-600">冲突</span>
                      )}
                    </div>
                    <h3 className="title-md line-clamp-1">{a.brand}</h3>
                    <div className="text-xs text-forest-500 flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-copper-500" />{a.vendor_name}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-serif text-lg font-semibold text-forest-700">{a.booth_number}</div>
                    <div className="text-[10px] text-forest-400">摊位号</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-serif font-semibold text-forest-700 pt-1 border-t border-forest-100/60">
                    {a.exhibition_name}
                  </div>
                  <div className="flex items-center gap-1.5 text-forest-600"><MapPin className="w-3 h-3 text-copper-500" />{a.venue}</div>
                  <div className="flex items-center gap-1.5 text-forest-600"><Calendar className="w-3 h-3 text-copper-500" />{a.start_date} 至 {a.end_date}</div>
                  <div className="flex items-center gap-1.5 text-forest-600"><Clock className="w-3 h-3 text-copper-500" />{a.exhibition_status === 'ongoing' ? '进行中' : a.exhibition_status === 'ended' ? '已结束' : '未开始'}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-forest-100/60 flex items-center gap-3 text-xs">
                  <span className="badge bg-forest-100 text-forest-700">{a.product_type}</span>
                  <span className="inline-flex items-center gap-1 text-forest-600">
                    <Zap className="w-3 h-3 text-yellow-500" />{a.power_watts}W
                  </span>
                  {a.has_open_flame && (
                    <span className="inline-flex items-center gap-1 text-orange-600">
                      <Flame className="w-3 h-3" />明火
                    </span>
                  )}
                </div>

                {a.conflicts?.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-600 leading-relaxed">
                    ⚠ {a.conflicts.map((c: any) => c.message).join('；')}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full card p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-forest-50 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-forest-300" />
              </div>
              <div className="font-serif text-lg text-forest-600 mb-1">暂无申请记录</div>
              <div className="text-sm text-forest-400">快去申请心仪的摊位吧！</div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
