import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlansStore } from '@/store/plansStore'
import { formatCurrency, daysUntil, getStatusLabel } from '@/utils/format'
import { ArrowLeft, Vote, DollarSign, AlertTriangle, Check, X, Plus, ChevronRight, Truck, RotateCcw, Users, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
type PlanStatus = 'voting' | 'funding' | 'purchased' | 'delivered' | 'completed'

const TABS = [
  { key: 'voting', label: '投票', icon: Vote },
  { key: 'funding', label: '费用', icon: DollarSign },
  { key: 'avoid', label: '避雷', icon: AlertTriangle },
  { key: 'tracking', label: '追踪', icon: Truck },
] as const

const STATUS_FLOW: PlanStatus[] = ['voting', 'funding', 'purchased', 'delivered', 'completed']

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const plan = usePlansStore((s) => s.plans.find((p) => p.id === id))
  const {
    voteForCandidate, togglePaid, updatePledge, setAdvancedAmount,
    addAvoidanceNote, removeAvoidanceNote, updatePlanStatus,
  } = usePlansStore()

  const [activeTab, setActiveTab] = useState<string>('voting')
  const [currentParticipantId, setCurrentParticipantId] = useState<string>('')
  const [noteAuthor, setNoteAuthor] = useState('')
  const [noteContent, setNoteContent] = useState('')

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-bark-500 text-lg">计划不存在</p>
      </div>
    )
  }

  const totalPledged = plan.participants.reduce((s, p) => s + p.pledgedAmount, 0)
  const totalReceived = plan.participants.filter((p) => p.hasPaid).reduce((s, p) => s + p.pledgedAmount, 0)
  const totalAdvanced = plan.participants.reduce((s, p) => s + p.advancedAmount, 0)
  const budgetGap = plan.totalBudget - totalReceived - totalAdvanced
  const progressPercent = plan.totalBudget > 0 ? Math.min(100, ((totalReceived + totalAdvanced) / plan.totalBudget) * 100) : 0
  const unpaidParticipants = plan.participants.filter((p) => !p.hasPaid)
  const maxVotes = Math.max(1, ...plan.giftCandidates.map((c) => c.votes.length))

  const handleAddNote = () => {
    if (!noteAuthor.trim() || !noteContent.trim()) return
    addAvoidanceNote(plan.id, { authorName: noteAuthor.trim(), content: noteContent.trim() })
    setNoteAuthor('')
    setNoteContent('')
  }

  const circumference = 2 * Math.PI * 54
  const strokeOffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <nav className="sticky top-0 z-10 glass rounded-b-2xl px-4 py-3 flex items-center gap-3 mb-4">
        <Link to="/" className="p-1.5 rounded-xl hover:bg-warm-50 transition"><ArrowLeft className="w-5 h-5 text-bark-600" /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-bark-900 truncate">{plan.birthdayPerson} 的生日计划</h1>
          <p className="text-xs text-bark-400">还有 {daysUntil(plan.birthdayDate)} 天</p>
        </div>
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', plan.status === 'completed' ? 'bg-mint-100 text-mint-700' : 'bg-warm-100 text-warm-700')}>
          {getStatusLabel(plan.status)}
        </span>
      </nav>

      <div className="flex gap-1 px-4 mb-5">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition',
              activeTab === tab.key ? 'gradient-warm text-white shadow-warm' : 'text-bark-500 hover:bg-warm-50')}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'voting' && (
        <div className="px-4 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-bark-400" />
            <select value={currentParticipantId} onChange={(e) => setCurrentParticipantId(e.target.value)}
              className="flex-1 rounded-xl border border-bark-200 px-3 py-2 text-sm bg-white">
              <option value="">选择我是谁</option>
              {plan.participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.giftCandidates.map((c) => {
              const voted = currentParticipantId && c.votes.includes(currentParticipantId)
              return (
                <div key={c.id} className="glass rounded-2xl overflow-hidden shadow-card">
                  {c.imageUrl
                    ? <img src={c.imageUrl} alt={c.name} className="w-full h-36 object-cover" />
                    : <div className="w-full h-36 gradient-warm opacity-20" />}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-bark-800 text-sm">{c.name}</span>
                      <span className="text-warm-600 text-sm font-semibold">{formatCurrency(c.price)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-bark-400">{c.votes.length} 票</span>
                      <button disabled={!currentParticipantId}
                        onClick={() => voteForCandidate(plan.id, c.id, currentParticipantId)}
                        className={cn('px-3 py-1 rounded-lg text-xs font-medium transition',
                          voted ? 'bg-mint-100 text-mint-700' : 'bg-warm-500 text-white hover:bg-warm-600',
                          !currentParticipantId && 'opacity-40 cursor-not-allowed')}>
                        {voted ? <><Check className="w-3 h-3 inline mr-0.5" />已投</> : '投票'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="glass rounded-2xl p-4 space-y-2">
            <p className="text-sm font-medium text-bark-700 mb-2">投票结果</p>
            {plan.giftCandidates.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-bark-600">{c.name}</span>
                  <span className="text-bark-400">{c.votes.length} 票</span>
                </div>
                <div className="h-2.5 rounded-full bg-bark-100 overflow-hidden">
                  <div className="h-full rounded-full gradient-warm transition-all" style={{ width: `${(c.votes.length / maxVotes) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'funding' && (
        <div className="px-4 space-y-4">
          <div className="glass rounded-2xl p-5 flex flex-col items-center">
            <svg width="128" height="128" className="mb-3">
              <circle cx="64" cy="64" r="54" fill="none" stroke="var(--color-bark-100, #E7E5E3)" strokeWidth="8" />
              <circle cx="64" cy="64" r="54" fill="none" stroke="#FF6B35" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                strokeLinecap="round" transform="rotate(-90 64 64)" className="transition-all duration-500" />
              <text x="64" y="64" textAnchor="middle" dominantBaseline="central"
                className="text-2xl font-bold fill-bark-800">{Math.round(progressPercent)}%</text>
            </svg>
            <div className="flex gap-6 text-center text-sm">
              <div><p className="text-mint-600 font-bold">{formatCurrency(totalReceived)}</p><p className="text-bark-400 text-xs">已到账</p></div>
              {budgetGap > 0 && <div><p className="text-rose-500 font-bold">{formatCurrency(budgetGap)}</p><p className="text-bark-400 text-xs">预算缺口</p></div>}
              <div><p className="text-warm-600 font-bold">{formatCurrency(totalAdvanced)}</p><p className="text-bark-400 text-xs">垫付总额</p></div>
            </div>
          </div>
          <div className="glass rounded-2xl divide-y divide-bark-100">
            {plan.participants.map((p) => (
              <div key={p.id} className={cn('p-3 flex items-center gap-2', !p.hasPaid && 'bg-rose-50/50')}>
                <span className="text-sm text-bark-700 w-16 truncate">{p.name}</span>
                <input type="number" value={p.pledgedAmount || ''} min={0}
                  onChange={(e) => updatePledge(plan.id, p.id, Number(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-bark-200 px-2 py-1 text-sm text-center" placeholder="认缴" />
                <button onClick={() => togglePaid(plan.id, p.id)}
                  className={cn('p-1 rounded-lg transition', p.hasPaid ? 'bg-mint-100' : 'bg-rose-100')}>
                  {p.hasPaid ? <Check className="w-4 h-4 text-mint-600" /> : <X className="w-4 h-4 text-rose-400" />}
                </button>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', p.hasPaid ? 'bg-mint-50 text-mint-700' : 'bg-rose-100 text-rose-600 font-medium')}>
                  {p.hasPaid ? '已付' : '未付'}
                </span>
                <input type="number" value={p.advancedAmount || ''} min={0}
                  onChange={(e) => setAdvancedAmount(plan.id, p.id, Number(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-bark-200 px-2 py-1 text-xs text-center" placeholder="垫付" />
              </div>
            ))}
          </div>
          {unpaidParticipants.length > 0 && (
            <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200">
              <p className="text-sm font-medium text-rose-700 mb-2">未交款 ({unpaidParticipants.length}人)</p>
              <div className="flex flex-wrap gap-2">
                {unpaidParticipants.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-rose-600 text-xs font-medium shadow-sm">
                    <X className="w-3 h-3" />{p.name} {p.pledgedAmount > 0 ? formatCurrency(p.pledgedAmount) : '未填写'}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="glass rounded-2xl p-3 flex justify-between text-sm">
            <span className="text-bark-500">合计</span>
            <div className="flex gap-4">
              <span className="text-mint-600">到账 {formatCurrency(totalReceived)}</span>
              <span className="text-bark-400">认缴 {formatCurrency(totalPledged)}</span>
              <span className="text-warm-600">垫付 {formatCurrency(totalAdvanced)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'avoid' && (
        <div className="px-4 space-y-4">
          <div className="glass rounded-2xl p-4 space-y-3">
            <input value={noteAuthor} onChange={(e) => setNoteAuthor(e.target.value)}
              placeholder="你的名字" className="w-full rounded-xl border border-bark-200 px-3 py-2 text-sm" />
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
              placeholder="避雷内容..." rows={3} className="w-full rounded-xl border border-bark-200 px-3 py-2 text-sm resize-none" />
            <button onClick={handleAddNote}
              className="gradient-warm text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 hover:opacity-90 transition">
              <Plus className="w-4 h-4" />添加避雷
            </button>
          </div>
          <div className="space-y-3">
            {plan.avoidanceNotes.map((n) => (
              <div key={n.id} className="rounded-2xl p-4 bg-warm-50 border border-warm-200 relative">
                <button onClick={() => removeAvoidanceNote(plan.id, n.id)}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-warm-100 transition">
                  <X className="w-3.5 h-3.5 text-bark-400" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warm-500" />
                  <span className="text-sm font-medium text-bark-700">{n.authorName}</span>
                  <span className="text-xs text-bark-400">{new Date(n.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm text-bark-600 leading-relaxed">{n.content}</p>
              </div>
            ))}
            {plan.avoidanceNotes.length === 0 && (
              <p className="text-center text-bark-400 text-sm py-8">暂无避雷笔记</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="px-4 space-y-4">
          <div className="glass rounded-2xl p-5">
            <p className="text-sm font-medium text-bark-700 mb-4">状态流转</p>
            <div className="flex items-center justify-between">
              {STATUS_FLOW.map((s, i) => {
                const currentIdx = STATUS_FLOW.indexOf(plan.status)
                const isActive = i <= currentIdx
                const isCurrent = s === plan.status
                return (
                  <div key={s} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition',
                      isCurrent ? 'gradient-warm text-white shadow-warm' : isActive ? 'bg-mint-400 text-white' : 'bg-bark-100 text-bark-400')}>
                      {i + 1}
                    </div>
                    <span className={cn('text-xs', isCurrent ? 'text-warm-600 font-semibold' : isActive ? 'text-mint-600' : 'text-bark-400')}>
                      {getStatusLabel(s)}
                    </span>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={cn('h-0.5 w-full -mt-6 mb-4', i < currentIdx ? 'bg-mint-400' : 'bg-bark-100')} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2">
            {STATUS_FLOW.filter((_, i) => i > STATUS_FLOW.indexOf(plan.status)).map((s) => (
              <button key={s} onClick={() => updatePlanStatus(plan.id, s)}
                className="flex-1 py-2 rounded-xl text-xs font-medium bg-warm-50 text-warm-600 hover:bg-warm-100 transition">
                → {getStatusLabel(s)}
              </button>
            ))}
          </div>
          <Link to={`/plan/${plan.id}/order`}
            className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-warm-50 transition">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1"><p className="text-sm font-medium text-bark-800">查看订单追踪</p><p className="text-xs text-bark-400">物流与包装状态</p></div>
            <ChevronRight className="w-4 h-4 text-bark-300" />
          </Link>
          <Link to={`/plan/${plan.id}/refund`}
            className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-warm-50 transition">
            <div className="w-10 h-10 rounded-xl gradient-mint flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1"><p className="text-sm font-medium text-bark-800">退款/加预算</p><p className="text-xs text-bark-400">退款记录与预算调整</p></div>
            <ChevronRight className="w-4 h-4 text-bark-300" />
          </Link>
        </div>
      )}
    </div>
  )
}
