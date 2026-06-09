import { useNavigate } from 'react-router-dom'
import { Smartphone } from 'lucide-react'
import type { Phone } from '@/types'
import { GROUP_LABELS, GROUP_COLORS } from '@/types'

interface PhoneCardProps {
  phone: Phone
}

export default function PhoneCard({ phone }: PhoneCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/phone/${phone.id}`)}
      className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
        {phone.photos.length > 0 ? (
          <img
            src={phone.photos[0]}
            alt={`${phone.brand} ${phone.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Smartphone className="h-8 w-8 text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-gray-900 truncate">
            {phone.brand} {phone.model}
          </p>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: GROUP_COLORS[phone.group] }}
          >
            {GROUP_LABELS[phone.group]}
          </span>
        </div>

        <p className="mt-0.5 text-sm text-gray-500 truncate">
          {phone.capacity ?? '容量未知'} · {phone.color}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#F77F00]">
          ¥{phone.estimatedMin} ~ ¥{phone.estimatedMax}
        </p>
      </div>
    </div>
  )
}
