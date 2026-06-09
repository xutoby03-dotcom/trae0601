import { Link } from 'react-router-dom'
import { Plus, Cat } from 'lucide-react'
import { useStore } from '@/store'
import PetCard from '@/components/pet/PetCard'

export default function Home() {
  const pets = useStore((s) => s.pets)

  return (
    <div className="animate-fade-in">
      <div className="relative -mx-4 -mt-14 overflow-hidden rounded-b-3xl bg-gradient-to-br from-warm-400 via-warm-500 to-coral-300 px-6 pb-10 pt-14 lg:-mx-8 lg:-mt-8 lg:pt-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <h1 className="font-display text-3xl font-bold text-white">我的宠物</h1>
          <p className="mt-2 text-warm-100">
            记录每一位毛孩子的信息，让寄养更安心
          </p>
          <Link to="/pet/new" className="btn-primary mt-5 inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            添加宠物
          </Link>
        </div>
      </div>

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-warm-400">
          <Cat className="mb-4 h-20 w-20 text-warm-300" strokeWidth={1.2} />
          <p className="font-display text-xl font-semibold text-warm-500">
            还没有添加宠物
          </p>
          <p className="mt-2 text-sm">
            点击上方按钮添加你的第一只毛孩子吧
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
