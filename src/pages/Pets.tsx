import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Pill, AlertTriangle, UserPlus, X } from 'lucide-react'
import { usePetStore } from '@/store/usePetStore'
import type { Pet } from '@/types'
import { MEMBER_COLORS } from '@/types'
import PetForm from '@/components/PetForm'

const TYPE_LABELS: Record<Pet['type'], string> = { cat: '猫', dog: '狗' }
const TYPE_EMOJI: Record<Pet['type'], string> = { cat: '🐱', dog: '🐶' }

export default function Pets() {
  const navigate = useNavigate()
  const { pets, members, deletePet, addMember, deleteMember } = usePetStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [memberName, setMemberName] = useState('')

  const handleAddPet = () => {
    setEditingPet(null)
    setDrawerOpen(true)
  }

  const handleEditPet = (e: React.MouseEvent, pet: Pet) => {
    e.stopPropagation()
    setEditingPet(pet)
    setDrawerOpen(true)
  }

  const handleDeletePet = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (deleteConfirmId === id) {
      deletePet(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
    }
  }

  const handleAddMember = () => {
    if (!memberName.trim()) return
    const colorIndex = members.length % MEMBER_COLORS.length
    addMember({
      name: memberName.trim(),
      avatar: '',
      color: MEMBER_COLORS[colorIndex],
    })
    setMemberName('')
    setAddingMember(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white px-4 pb-8 pt-6 font-body">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-800">我的宠物</h1>
        <button
          onClick={handleAddPet}
          className="flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:shadow-lg active:scale-95"
        >
          <Plus size={16} />
          添加宠物
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="mt-20 flex flex-col items-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-100 text-6xl">
            🐾
          </div>
          <p className="mt-6 text-center text-gray-500">
            还没有宠物，点击添加你的第一只宠物吧
          </p>
        </div>
      ) : (
        <motion.div
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {pets.map((pet) => (
            <motion.div
              key={pet.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              onClick={() => navigate(`/pet/${pet.id}`)}
              className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-50 text-3xl">
                  {pet.photo ? (
                    <img src={pet.photo} alt={pet.name} className="h-full w-full object-cover" />
                  ) : (
                    TYPE_EMOJI[pet.type]
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-gray-800">
                      {pet.name}
                    </span>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                      {TYPE_LABELS[pet.type]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    每天{pet.feedPerDay}次 每次{pet.feedAmountGrams}g
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pet.medications && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-500">
                        <Pill size={12} />
                        需服药
                      </span>
                    )}
                    {pet.restrictions && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                        <AlertTriangle size={12} />
                        有禁忌
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => handleEditPet(e, pet)}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeletePet(e, pet.id)}
                    className={`rounded-lg p-1.5 transition ${
                      deleteConfirmId === pet.id
                        ? 'bg-red-50 text-red-500'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {deleteConfirmId === pet.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                      <span className="text-sm text-red-600">确认删除？</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirmId(null)
                          }}
                          className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-white"
                        >
                          取消
                        </button>
                        <button
                          onClick={(e) => handleDeletePet(e, pet.id)}
                          className="rounded-md bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-800">家庭成员</h2>
          {!addingMember && (
            <button
              onClick={() => setAddingMember(true)}
              className="flex items-center gap-1 text-sm text-brand-orange transition hover:underline"
            >
              <UserPlus size={14} />
              添加成员
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {members.map((member) => (
            <div key={member.id} className="group relative flex flex-col items-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0)}
              </div>
              <span className="mt-1 text-xs text-gray-600">{member.name}</span>
              <button
                onClick={() => deleteMember(member.id)}
                className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-400 text-white shadow group-hover:flex"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {addingMember && (
            <div className="flex items-center gap-2">
              <input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                placeholder="成员名称"
                autoFocus
                className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-brand-orange"
              />
              <button
                onClick={handleAddMember}
                className="rounded-lg bg-brand-orange px-3 py-1.5 text-sm text-white"
              >
                确定
              </button>
              <button
                onClick={() => {
                  setAddingMember(false)
                  setMemberName('')
                }}
                className="rounded-lg px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <PetForm
            open={drawerOpen}
            editPet={editingPet}
            onClose={() => {
              setDrawerOpen(false)
              setEditingPet(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
