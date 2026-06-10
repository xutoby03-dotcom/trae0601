import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import type { Application, ProductType } from '../../shared/types'
import {
  Check, X, AlertTriangle, Users, Zap, Flame,
  LayoutPanelTop, Sparkles, ChevronDown, Filter,
  Table, Armchair, Phone
} from 'lucide-react'

const typeColorMap: Partial<Record<ProductType, string>> = {
  '手工艺品': 'bg-purple-100 text-purple-700',
  '文创周边': 'bg-indigo-100 text-indigo-700',
  '食品饮料': 'bg-orange-100 text-orange-700',
  '服饰鞋帽': 'bg-pink-100 text-pink-700',
  '美妆个护': 'bg-rose-100 text-rose-700',
  '家居日用': 'bg-teal-100 text-teal-700',
  '数码配件': 'bg-blue-100 text-blue-700',
  '图书印刷': 'bg-amber-100 text-amber-700',
  '植物花卉': 'bg-green-100 text-green-700',
  '公益义卖': 'bg-yellow-100 text-yellow-800',
  '公司展示': 'bg-sky-100 text-sky-700',
  '其他': 'bg-zinc-100 text-zinc-600',
}

const typeInfo: Record<string, { label: string; icon: any; cls: string }> = {
  adjacent_type: { label: '相邻品类重复', icon: Users, cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  power_overload: { label: '用电超负荷', icon: Zap, cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  aisle_blocked: { label: '通道被挡', icon: AlertTriangle, cls: 'bg-red-100 text-red-700 border-red-200' },
}

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '待审核', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: '已批准', cls: 'bg-green-100 text-green-700' },
  rejected: { label: '已拒绝', cls: 'bg-red-100 text-red-600' },
}

export default function ApplicationsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const id = params.id ? Number(params.id) : 0
  const { applications, fetchApplications, fetchBooths, updateApplicationStatus, setCurrentExhibition } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (id) {
      setCurrentExhibition(id)
      fetchApplications(id)
      fetchBooths(id)
    }
  }, [id])

  const filtered = applications.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return a.brand.toLowerCase().includes(q) ||
      a.vendor_name.toLowerCase().includes(q) ||
      (a as any).booth_number?.toLowerCase().includes(q) ||
      a.product_type.toLowerCase().includes(q)
  })

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    conflicts: applications.filter(a => (a.conflicts?.length || 0) > 0).length,
  }

  return (
    <>
      <PageHeader
        title="申请审核"
        subtitle="审核摊主提交的摊位申请，处理冲突，维护排期秩序"
      />

      <section className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { key: 'all', label: '全部申请', value: counts.all, icon: LayoutPanelTop, cls: 'bg-forest-700 text-white' },
            { key: 'pending', label: '待审核', value: counts.pending, icon: Filter, cls: 'bg-amber-500 text-white' },
            { key: 'approved', label: '已批准', value: counts.approved, icon: Check, cls: 'bg-emerald-500 text-white' },
            { key: 'rejected', label: '已拒绝', value: counts.rejected, icon: X, cls: 'bg-red-500 text-white' },
            { key: 'conflicts', label: '冲突数', value: counts.conflicts, icon: AlertTriangle, cls: counts.conflicts > 0 ? 'bg-orange-500 text-white' : 'bg-zinc-400 text-white' },
          ].map(it => {
            const Icon = it.icon
            return (
              <button
                key={it.key}
                onClick={() => setFilter(it.key)}
                className={cn('rounded-2xl p-4 text-left transition-all',
                  filter === it.key ? it.cls + ' shadow-lift' : 'card hover:shadow-lift')}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn('w-4.5 h-4.5', filter === it.key ? 'opacity-80' : 'text-copper-500')} />
                  <span className={cn('text-xs font-medium', filter === it.key ? 'opacity-70' : 'text-forest-500')}>{it.label}</span>
                </div>
                <div className={cn('font-serif text-3xl font-semibold leading-tight tabular-nums',
                  filter === it.key ? '' : 'text-forest-800')}>{it.value}</div>
              </button>
            )
          })}
        </div>

        <div className="mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索品牌 / 摊主 / 摊位号 / 类型..."
            className="input-base max-w-md"
          />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-forest-50/80 text-xs text-forest-600 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">摊位</th>
                  <th className="text-left px-5 py-3 font-semibold">品牌/摊主</th>
                  <th className="text-left px-5 py-3 font-semibold">商品类型</th>
                  <th className="text-left px-5 py-3 font-semibold">需求</th>
                  <th className="text-left px-5 py-3 font-semibold">冲突</th>
                  <th className="text-left px-5 py-3 font-semibold">联系人</th>
                  <th className="text-left px-5 py-3 font-semibold">状态</th>
                  <th className="text-right px-5 py-3 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-forest-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-serif font-semibold text-forest-800">{(a as any).booth_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-forest-800">{a.brand}</div>
                      <div className="text-xs text-forest-500 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3 text-copper-500" />{a.vendor_name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('badge', typeColorMap[a.product_type] || typeColorMap['其他'])}>
                        {a.product_type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs text-forest-600">
                          <Zap className="w-3 h-3 text-yellow-500" />{a.power_watts}W
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-forest-600">
                          <Table className="w-3 h-3 text-forest-500" />{a.tables}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-forest-600">
                          <Armchair className="w-3 h-3 text-forest-500" />{a.chairs}
                        </span>
                        {a.has_open_flame && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                            <Flame className="w-3 h-3" />明火
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {a.conflicts?.length ? a.conflicts.map((c, i) => {
                          const t = typeInfo[c.type]
                          const Icon = t.icon
                          return (
                            <span key={i} className={cn('badge w-fit border', t.cls)} title={c.message}>
                              <Icon className="w-3 h-3" />{t.label}
                            </span>
                          )
                        }) : (
                          <span className="text-xs text-forest-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-forest-700">{a.contact_name}</div>
                      <div className="text-xs text-forest-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />{a.contact_phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('badge', statusMap[a.status]?.cls)}>{statusMap[a.status]?.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(a.id, 'approved')}
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="批准"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(a.id, 'rejected')}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              title="拒绝"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-forest-400">
                      暂无匹配的申请
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
