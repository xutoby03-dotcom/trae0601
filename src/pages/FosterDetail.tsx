import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UtensilsCrossed, Droplets, PawPrint, Heart, ClipboardCheck, MessageSquare, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { formatDate, categoryLabels } from '@/utils/helpers'
import type { Taboo } from '@/types'

const tagClass: Record<string, string> = {
  feeding: 'tag tag-feeding',
  cleaning: 'tag tag-cleaning',
  walking: 'tag tag-walking',
  health: 'tag tag-health',
}

export default function FosterDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fosters, pets, checkins } = useStore()

  const foster = fosters.find((f) => f.id === id)
  const pet = foster ? pets.find((p) => p.id === foster.petId) : null

  if (!foster || !pet) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-warm-400">未找到交接单</p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todayCheckin = checkins.find((c) => c.fosterId === foster.id && c.date === today)
  const end = new Date(foster.endDate)
  const remaining = Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  const feedingTaboos = foster.taboos.filter((t: Taboo) => t.category === 'feeding')
  const cleaningTaboos = foster.taboos.filter((t: Taboo) => t.category === 'cleaning')
  const walkingTaboos = foster.taboos.filter((t: Taboo) => t.category === 'walking')
  const healthTaboos = foster.taboos.filter((t: Taboo) => t.category === 'health')

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/pet/${pet.id}`)} className="flex items-center gap-1 text-warm-500 hover:text-warm-700 mb-4">
          <ArrowLeft size={18} /> 返回宠物详情
        </button>

        <div className="flex items-center gap-4 mb-6">
          <img src={pet.avatarUrl} alt={pet.name} className="w-14 h-14 rounded-full object-cover border-2 border-warm-200" />
          <div>
            <h1 className="font-display text-xl text-warm-800">{pet.name}</h1>
            <p className="text-sm text-warm-500">
              {formatDate(foster.startDate)} — {formatDate(foster.endDate)}
            </p>
            <p className="text-sm text-warm-400">
              寄养人：{foster.feederName} · {foster.feederPhone}
            </p>
          </div>
        </div>

        <div className="stitch-border p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeedingCard plan={foster.feedingPlan} foodBrand={pet.foodBrand} taboos={feedingTaboos} />
            <CleaningCard plan={foster.cleanPlan} taboos={cleaningTaboos} />
            <WalkingCard plan={foster.walkPlan} isDog={pet.type === 'dog'} taboos={walkingTaboos} />
            <HealthCard medications={foster.medications} taboos={healthTaboos} supplies={foster.supplies} />
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn('w-3 h-3 rounded-full', todayCheckin?.completed ? 'bg-leaf-400' : 'bg-warm-200')} />
            <span className="text-sm text-warm-600">
              {todayCheckin?.completed ? '今日已打卡' : '今日未打卡'}
            </span>
          </div>
          <span className="text-sm text-warm-500">剩余 {remaining} 天</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => navigate(`/foster/${foster.id}/checkin`)} className="btn-primary flex items-center justify-center gap-1 text-sm">
            <ClipboardCheck size={16} /> 每日打卡
          </button>
          <button onClick={() => navigate(`/foster/${foster.id}/messages`)} className="btn-secondary flex items-center justify-center gap-1 text-sm">
            <MessageSquare size={16} /> 留言板
          </button>
          <button onClick={() => navigate(`/foster/${foster.id}/stats`)} className="btn-secondary flex items-center justify-center gap-1 text-sm">
            <BarChart3 size={16} /> 统计
          </button>
        </div>
      </div>
    </div>
  )
}

function FeedingCard({ plan, foodBrand, taboos }: { plan: { dailyAmount: string; schedule: string; notes: string }; foodBrand: string; taboos: Taboo[] }) {
  return (
    <div className="section-card bg-leaf-100">
      <div className="flex items-center gap-2 mb-3">
        <UtensilsCrossed size={18} className="text-leaf-500" />
        <h3 className="font-display text-warm-800">喂食板块</h3>
      </div>
      <div className="space-y-1 text-sm text-warm-700">
        <p>每日喂食量：{plan.dailyAmount}</p>
        <p>喂食时间：{plan.schedule}</p>
        <p>粮食品牌：{foodBrand}</p>
        {plan.notes && <p>备注：{plan.notes}</p>}
      </div>
      {taboos.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {taboos.map((t) => (
            <span key={t.id} className={tagClass[t.category]}>{categoryLabels[t.category]}：{t.content}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function CleaningCard({ plan, taboos }: { plan: { bathFrequency: string; litterFrequency: string; supplyLocations: string }; taboos: Taboo[] }) {
  return (
    <div className="section-card bg-sky-100">
      <div className="flex items-center gap-2 mb-3">
        <Droplets size={18} className="text-sky-500" />
        <h3 className="font-display text-warm-800">清洁板块</h3>
      </div>
      <div className="space-y-1 text-sm text-warm-700">
        <p>洗澡频率：{plan.bathFrequency}</p>
        <p>猫砂/清洁频率：{plan.litterFrequency}</p>
        <p>用品位置：{plan.supplyLocations}</p>
      </div>
      {taboos.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {taboos.map((t) => (
            <span key={t.id} className={tagClass[t.category]}>{categoryLabels[t.category]}：{t.content}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function WalkingCard({ plan, isDog, taboos }: { plan: { walkTime: string; route: string; leashLocation: string } | null; isDog: boolean; taboos: Taboo[] }) {
  return (
    <div className="section-card bg-coral-100">
      <div className="flex items-center gap-2 mb-3">
        <PawPrint size={18} className="text-coral-400" />
        <h3 className="font-display text-warm-800">外出板块</h3>
      </div>
      {isDog && plan ? (
        <div className="space-y-1 text-sm text-warm-700">
          <p>遛狗时间：{plan.walkTime}</p>
          <p>遛狗路线：{plan.route}</p>
          <p>牵引绳位置：{plan.leashLocation}</p>
        </div>
      ) : (
        <p className="text-sm text-warm-500">无需外出</p>
      )}
      {taboos.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {taboos.map((t) => (
            <span key={t.id} className={tagClass[t.category]}>{categoryLabels[t.category]}：{t.content}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function HealthCard({ medications, taboos, supplies }: { medications: { id: string; name: string; dosage: string; frequency: string }[]; taboos: Taboo[]; supplies: { id: string; name: string; remainingDays: number; totalDays: number }[] }) {
  return (
    <div className="section-card bg-red-100">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={18} className="text-red-500" />
        <h3 className="font-display text-warm-800">健康观察</h3>
      </div>
      {medications.length > 0 ? (
        <div className="space-y-1 text-sm text-warm-700">
          {medications.map((m) => (
            <p key={m.id}>{m.name} · {m.dosage} · {m.frequency}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-warm-500">无用药记录</p>
      )}
      {supplies.length > 0 && (
        <div className="mt-2 space-y-1 text-sm text-warm-600">
          {supplies.map((s) => (
            <p key={s.id}>{s.name}：剩余 {s.remainingDays}/{s.totalDays} 天</p>
          ))}
        </div>
      )}
      {taboos.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {taboos.map((t) => (
            <span key={t.id} className={tagClass[t.category]}>{categoryLabels[t.category]}：{t.content}</span>
          ))}
        </div>
      )}
    </div>
  )
}
