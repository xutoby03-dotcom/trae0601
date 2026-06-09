import { Link } from 'react-router-dom'
import { Cat, Dog } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPetAvatar } from '@/utils/helpers'
import type { Pet } from '@/types'

interface PetCardProps {
  pet: Pet
}

const vaccineColors: Record<string, string> = {
  已完全接种: 'bg-leaf-400',
  部分接种: 'bg-yellow-400',
  未接种: 'bg-coral-400',
}

export default function PetCard({ pet }: PetCardProps) {
  const avatarUrl = pet.avatarUrl || getPetAvatar(pet)

  return (
    <Link to={`/pet/${pet.id}`} className="group block">
      <div className="section-card rounded-xl border-2 border-warm-100 bg-white p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-warm-200">
            <img
              src={avatarUrl}
              alt={pet.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-semibold text-warm-800 truncate">
                {pet.name}
              </h3>
              <span
                className={cn(
                  'tag',
                  pet.type === 'cat'
                    ? 'bg-coral-50 text-coral-400 border border-coral-200'
                    : 'bg-leaf-50 text-leaf-500 border border-leaf-200'
                )}
              >
                {pet.type === 'cat' ? (
                  <Cat className="h-3 w-3" />
                ) : (
                  <Dog className="h-3 w-3" />
                )}
                {pet.type === 'cat' ? '猫咪' : '狗狗'}
              </span>
            </div>

            <p className="mt-1 text-sm text-warm-500 truncate">{pet.breed}</p>
            <p className="text-sm text-warm-400">{pet.age} 岁</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                'h-3 w-3 rounded-full',
                vaccineColors[pet.vaccineStatus] || 'bg-warm-300'
              )}
              title={pet.vaccineStatus}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
