import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, DollarSign, Users, Package, Download,
  ChevronDown, ChevronUp, Check, XCircle, Edit, Trash2, ArrowLeft,
} from 'lucide-react'
import { useActivityStore } from '@/store/activityStore'
import { api } from '@/utils/api'
import RegistrationForm from '@/components/RegistrationForm'
import Countdown from '@/components/Countdown'

const statusLabels: Record<string, string> = {
  not_started: '未开始',
  registering: '报名中',
  full: '已满员',
  ended: '已结束',
}

const statusColors: Record<string, string> = {
  not_started: 'bg-zinc-500/20 text-zinc-400',
  registering: 'bg-status/20 text-status',
  full: 'bg-urgent/20 text-urgent',
  ended: 'bg-zinc-600/20 text-zinc-500',
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentActivity, loading, fetchActivity, register, cancelRegistration, checkinRegistration, deleteActivity } = useActivityStore()
  const [showForm, setShowForm] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)

  useEffect(() => {
    if (id) fetchActivity(id)
  }, [id, fetchActivity])

  if (loading && !currentActivity) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!currentActivity) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-zinc-500">活动不存在</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent hover:underline">
          返回首页
        </button>
      </div>
    )
  }

  const registrations = currentActivity.registrations || []
  const confirmed = registrations.filter((r) => r.status === 'confirmed')
  const waitlisted = registrations.filter((r) => r.status === 'waitlisted')
  const totalConfirmedCount = currentActivity.confirmedCount ?? confirmed.reduce((sum, r) => sum + 1 + r.bringFriends, 0)
  const totalCost = confirmed.reduce((sum, r) => sum + currentActivity.cost * (1 + r.bringFriends), 0)
  const checkedInCount = confirmed.filter((r) => r.checkedIn).length

  const handleDelete = async () => {
    if (!confirm('确定要删除这个活动吗？')) return
    await deleteActivity(currentActivity.id)
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回看板
      </button>

      <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-surface">
        <div className={`h-48 relative overflow-hidden sm:h-56 ${currentActivity.poster ? '' : 'bg-gradient-to-br from-accent/60 via-urgent/40 to-status/60'}`}>
          {currentActivity.poster && (
            <img src={currentActivity.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {currentActivity.poster && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[currentActivity.status]}`}>
                  {statusLabels[currentActivity.status]}
                </span>
                {currentActivity.type && (
                  <span className="rounded-full bg-dark-hover px-2.5 py-1 text-xs text-zinc-400">
                    {currentActivity.type}
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-heading text-2xl font-bold text-white">{currentActivity.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/activity/${currentActivity.id}/edit`)}
                className="rounded-lg border border-dark-border p-2 text-zinc-400 transition-colors hover:bg-dark-hover hover:text-white"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg border border-dark-border p-2 text-zinc-400 transition-colors hover:bg-urgent/20 hover:text-urgent"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="h-4 w-4 text-accent" />
              <span>{currentActivity.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="h-4 w-4 text-accent" />
              <span>
                {new Date(currentActivity.startTime).toLocaleString('zh-CN')} ~ {new Date(currentActivity.endTime).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <DollarSign className="h-4 w-4 text-accent" />
              <span>{currentActivity.cost > 0 ? `¥${currentActivity.cost}/人` : '免费'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Users className="h-4 w-4 text-accent" />
              <span>上限 {currentActivity.maxParticipants} 人</span>
            </div>
            {currentActivity.bringItems && (
              <div className="flex items-center gap-2 text-sm text-zinc-400 sm:col-span-2">
                <Package className="h-4 w-4 text-accent shrink-0" />
                <span>{currentActivity.bringItems}</span>
              </div>
            )}
          </div>

          {currentActivity.status !== 'ended' && currentActivity.status !== 'full' && (
            <div className="mt-4">
              <Countdown targetTime={currentActivity.startTime} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-dark-border bg-dark-surface p-4 text-center">
          <p className="text-2xl font-bold text-status">{confirmed.length}</p>
          <p className="mt-1 text-xs text-zinc-500">已报名</p>
        </div>
        <div className="rounded-xl border border-dark-border bg-dark-surface p-4 text-center">
          <p className="text-2xl font-bold text-urgent">{waitlisted.length}</p>
          <p className="mt-1 text-xs text-zinc-500">候补</p>
        </div>
        <div className="rounded-xl border border-dark-border bg-dark-surface p-4 text-center">
          <p className="text-2xl font-bold text-accent">¥{totalCost}</p>
          <p className="mt-1 text-xs text-zinc-500">费用汇总</p>
        </div>
      </div>

      {currentActivity.status !== 'ended' && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            {totalConfirmedCount >= currentActivity.maxParticipants ? '加入候补' : '立即报名'}
          </button>
        </div>
      )}

      {waitlisted.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowWaitlist(!showWaitlist)}
            className="flex w-full items-center justify-between rounded-xl border border-dark-border bg-dark-surface px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-dark-hover"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-urgent" />
              候补队列 ({waitlisted.length})
            </span>
            {showWaitlist ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showWaitlist && (
            <div className="mt-2 space-y-2">
              {waitlisted.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-dark-border bg-dark-surface px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-urgent/20 text-xs font-medium text-urgent">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white">{r.name}</span>
                    {r.bringFriends > 0 && (
                      <span className="text-xs text-zinc-500">+{r.bringFriends}人</span>
                    )}
                  </div>
                  <button
                    onClick={() => cancelRegistration(r.id)}
                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-urgent/20 hover:text-urgent"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-white">
            签到名单 ({checkedInCount}/{confirmed.length})
          </h2>
          {confirmed.length > 0 && (
            <a
              href={api.exportCSV(currentActivity.id)}
              className="flex items-center gap-1.5 rounded-lg border border-dark-border px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-dark-hover hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              导出CSV
            </a>
          )}
        </div>

        {confirmed.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-dark-border py-8 text-center text-xs text-zinc-600">
            暂无报名
          </div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl border border-dark-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border bg-dark-hover/50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">姓名</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 hidden sm:table-cell">联系方式</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">带朋友</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 hidden sm:table-cell">备注</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500">签到</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {confirmed.map((r) => (
                  <tr key={r.id} className="border-b border-dark-border/50 last:border-0">
                    <td className="px-4 py-2.5 text-white">{r.name}</td>
                    <td className="px-4 py-2.5 text-zinc-400 hidden sm:table-cell">{r.contact}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{r.bringFriends > 0 ? `+${r.bringFriends}` : '-'}</td>
                    <td className="px-4 py-2.5 text-zinc-500 hidden sm:table-cell max-w-[120px] truncate">{r.note || '-'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => checkinRegistration(r.id)}
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                          r.checkedIn
                            ? 'bg-success/20 text-success'
                            : 'bg-dark-hover text-zinc-600 hover:bg-status/20 hover:text-status'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => cancelRegistration(r.id)}
                        className="rounded p-1 text-zinc-600 transition-colors hover:bg-urgent/20 hover:text-urgent"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RegistrationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={(data) => register(currentActivity.id, data)}
        activityTitle={currentActivity.title}
        maxParticipants={currentActivity.maxParticipants}
        currentConfirmed={totalConfirmedCount}
      />
    </div>
  )
}
