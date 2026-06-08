import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useActivityStore } from '@/store/activityStore'
import type { CreateActivityPayload } from '@/utils/api'

const activityTypes = ['户外运动', '桌游', '聚餐', '观影', '学习分享', '手工制作', '志愿服务', '其他']

export default function CreateActivity() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { currentActivity, createActivity, updateActivity } = useActivityStore()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<CreateActivityPayload>({
    title: currentActivity?.title || '',
    location: currentActivity?.location || '',
    startTime: currentActivity?.startTime ? currentActivity.startTime.slice(0, 16) : '',
    endTime: currentActivity?.endTime ? currentActivity.endTime.slice(0, 16) : '',
    maxParticipants: currentActivity?.maxParticipants || 20,
    cost: currentActivity?.cost || 0,
    bringItems: currentActivity?.bringItems || '',
    poster: currentActivity?.poster || '',
    type: currentActivity?.type || activityTypes[0],
  })
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof CreateActivityPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.location.trim()) return
    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateActivity(id, form)
        navigate(`/activity/${id}`)
      } else {
        const activity = await createActivity(form)
        navigate(`/activity/${activity.id}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <h1 className="font-heading text-2xl font-bold text-white">
        {isEdit ? '编辑活动' : '创建活动'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">活动标题 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
            className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent"
            placeholder="给活动起个名字"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">活动地点 *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            required
            className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent"
            placeholder="活动举办地点"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">开始时间 *</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => update('startTime', e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">结束时间 *</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => update('endTime', e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">人数上限</label>
            <input
              type="number"
              min={1}
              value={form.maxParticipants}
              onChange={(e) => update('maxParticipants', parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">费用 (元)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.cost}
              onChange={(e) => update('cost', parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">活动类型</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent"
          >
            {activityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">需要带的东西</label>
          <textarea
            value={form.bringItems}
            onChange={(e) => update('bringItems', e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent resize-none"
            placeholder="运动服、水杯等"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">海报图片URL</label>
          <input
            type="url"
            value={form.poster}
            onChange={(e) => update('poster', e.target.value)}
            className="w-full rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? '提交中...' : isEdit ? '保存修改' : '创建活动'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-dark-border px-6 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-dark-hover hover:text-white"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
