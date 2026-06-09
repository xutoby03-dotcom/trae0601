import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { getPetAvatar, formatDate } from '@/utils/helpers'

function InfoSection({ title, borderColor, children }: { title: string; borderColor: string; children: React.ReactNode }) {
  return (
    <div className={cn('section-card rounded-xl border-2 border-warm-100 bg-white', `border-l-4 ${borderColor}`)}>
      <h3 className="font-display text-base font-semibold text-warm-700">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-warm-400">{label}</span>
      <span className="text-warm-700">{value || '-'}</span>
    </div>
  )
}

const vaccineColors: Record<string, string> = {
  已完全接种: 'text-leaf-500',
  部分接种: 'text-yellow-500',
  未接种: 'text-coral-400',
}

export default function PetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pets = useStore((s) => s.pets)
  const fosters = useStore((s) => s.fosters)
  const deletePet = useStore((s) => s.deletePet)
  const pet = pets.find((p) => p.id === id)
  const petFosters = fosters.filter((f) => f.petId === id)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-warm-400">未找到该宠物信息</p>
        <Link to="/" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    )
  }

  const avatarUrl = pet.avatarUrl || getPetAvatar(pet)

  function handleDelete() {
    deletePet(pet.id)
    navigate('/')
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-2 text-sm text-warm-500 transition-colors hover:text-warm-700"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <img
          src={avatarUrl}
          alt={pet.name}
          className="h-24 w-24 rounded-full border-2 border-warm-200 object-cover"
        />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-warm-800">{pet.name}</h1>
          <div className="mt-1 flex items-center gap-3">
            <span
              className={cn(
                'tag',
                pet.type === 'cat'
                  ? 'bg-coral-50 text-coral-400 border border-coral-200'
                  : 'bg-leaf-50 text-leaf-500 border border-leaf-200'
              )}
            >
              {pet.type === 'cat' ? '猫咪' : '狗狗'}
            </span>
            <span className="text-sm text-warm-400">{pet.breed}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/pet/${pet.id}/edit`}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <Pencil className="h-4 w-4" />
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-coral-200 bg-coral-50 px-5 py-2.5 text-sm font-medium text-coral-400 transition-all hover:bg-coral-100"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoSection title="基本信息" borderColor="border-l-warm-400">
          <InfoRow label="品种" value={pet.breed} />
          <InfoRow label="年龄" value={`${pet.age} 岁`} />
          <InfoRow label="类型" value={pet.type === 'cat' ? '猫咪' : '狗狗'} />
        </InfoSection>

        <InfoSection title="健康信息" borderColor="border-l-leaf-300">
          <div className="flex justify-between text-sm">
            <span className="text-warm-400">疫苗状态</span>
            <span className={cn('font-medium', vaccineColors[pet.vaccineStatus] || 'text-warm-700')}>
              {pet.vaccineStatus || '-'}
            </span>
          </div>
          <InfoRow label="过敏情况" value={pet.allergies} />
          <InfoRow label="性格特点" value={pet.temperament} />
        </InfoSection>

        <InfoSection title="饮食信息" borderColor="border-l-coral-300">
          <InfoRow label="食物品牌" value={pet.foodBrand} />
        </InfoSection>

        <InfoSection title="紧急联系人" borderColor="border-l-sky-300">
          <InfoRow label="联系方式" value={pet.emergencyContact} />
        </InfoSection>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-warm-800">寄养记录</h2>
          <Link
            to={`/foster/new?petId=${pet.id}`}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            创建寄养单
          </Link>
        </div>

        {petFosters.length === 0 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-warm-200 py-10 text-center text-sm text-warm-400">
            暂无寄养记录
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {petFosters.map((foster) => (
              <Link
                key={foster.id}
                to={`/foster/${foster.id}`}
                className="section-card flex items-center gap-4 rounded-xl border-2 border-warm-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Calendar className="h-5 w-5 text-warm-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warm-700">
                    {formatDate(foster.startDate)} - {formatDate(foster.endDate)}
                  </p>
                  <p className="text-xs text-warm-400">寄养人: {foster.feederName}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/40" onClick={() => setShowDeleteConfirm(false)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold text-warm-800">确认删除</h3>
            <p className="mt-2 text-sm text-warm-500">
              确定要删除 {pet.name} 吗？此操作不可撤销，相关寄养记录也将一并删除。
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary text-sm">
                取消
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-coral-400 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-coral-500"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
