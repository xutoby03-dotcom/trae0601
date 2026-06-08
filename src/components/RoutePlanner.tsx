import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Place } from '@/types'
import { useWalkStore } from '@/store/useWalkStore'
import { GripVertical, X } from 'lucide-react'

function SortableRouteCard({ place, index }: { place: Place; index: number }) {
  const removeFromRoute = useWalkStore((s) => s.removeFromRoute)
  const setSelectedPlace = useWalkStore((s) => s.setSelectedPlace)
  const selectedPlaceId = useWalkStore((s) => s.selectedPlaceId)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `route-${place.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isSelected = selectedPlaceId === place.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
        ${isSelected ? 'border-[#F97316] bg-orange-50/80 shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}
      `}
      onClick={() => setSelectedPlace(place.id)}
    >
      <div
        className="text-xs font-bold text-white bg-[#F97316] w-6 h-6 rounded-full
          flex items-center justify-center flex-shrink-0 shadow-sm"
      >
        {index + 1}
      </div>

      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical size={16} />
      </button>

      <span className="text-lg flex-shrink-0">{place.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-[#3D2C2E] truncate">{place.name}</div>
        <div className="text-xs text-[#8B7073]">
          {place.stayMinutes}min · ¥{place.budget}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          removeFromRoute(place.id)
        }}
        className="w-6 h-6 rounded-full flex items-center justify-center
          text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function RoutePlanner() {
  const routePlaces = useWalkStore((s) => s.routePlaces)
  const clearRoute = useWalkStore((s) => s.clearRoute)
  const { setNodeRef, isOver } = useDroppable({ id: 'route-drop-zone' })

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#3D2C2E]">🧩 我的路线</h2>
        {routePlaces.length > 0 && (
          <button
            onClick={clearRoute}
            className="text-xs text-[#8B7073] hover:text-red-400 transition-colors"
          >
            清空路线
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-4 pb-4 transition-colors duration-200
          ${isOver ? 'bg-orange-50/50' : ''}
        `}
      >
        {routePlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-5xl mb-4 animate-bounce">🗺️</div>
            <p className="text-[#8B7073] text-sm">拖拽或点击地点卡添加到这里</p>
            <p className="text-[#8B7073] text-xs mt-1">拼出你的专属散步路线</p>
          </div>
        ) : (
          <SortableContext
            items={routePlaces.map((p) => `route-${p.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {routePlaces.map((place, index) => (
                <SortableRouteCard key={place.id} place={place} index={index} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
