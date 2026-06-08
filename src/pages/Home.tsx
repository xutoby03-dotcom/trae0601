import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import PlacePool from '@/components/PlacePool'
import RoutePlanner from '@/components/RoutePlanner'
import RouteStats from '@/components/RouteStats'
import MoodSelector from '@/components/MoodSelector'
import RouteMap from '@/components/RouteMap'
import RouteManager from '@/components/RouteManager'
import PlaceCard from '@/components/PlaceCard'
import { useWalkStore } from '@/store/useWalkStore'
import type { Place } from '@/types'

export default function Home() {
  const addToRoute = useWalkStore((s) => s.addToRoute)
  const reorderRoute = useWalkStore((s) => s.reorderRoute)
  const routePlaces = useWalkStore((s) => s.routePlaces)
  const [activePlace, setActivePlace] = useState<Place | null>(null)
  const [activeFromPool, setActiveFromPool] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current as { place: Place; fromPool: boolean } | undefined
    if (data) {
      setActivePlace(data.place)
      setActiveFromPool(data.fromPool)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActivePlace(null)

    if (!over) return

    const activeData = active.data.current as { place: Place; fromPool: boolean } | undefined
    if (!activeData) return

    if (activeData.fromPool) {
      const overId = over.id as string
      if (overId === 'route-drop-zone') {
        addToRoute(activeData.place.id)
        return
      }
      if (overId.startsWith('route-')) {
        addToRoute(activeData.place.id)
        return
      }
    }

    if (!activeData.fromPool) {
      const overIdStr = over.id as string
      if (overIdStr.startsWith('route-')) {
        const oldIndex = routePlaces.findIndex((p) => `route-${p.id}` === active.id)
        const newIndex = routePlaces.findIndex((p) => `route-${p.id}` === over.id)
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderRoute(oldIndex, newIndex)
        }
      }
    }
  }

  return (
    <div className="h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">
      <header className="flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-[#F5E6D8]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <div>
            <h1 className="text-xl font-black text-[#3D2C2E] tracking-tight">城市散步路线拼图</h1>
            <p className="text-xs text-[#8B7073]">周末闲逛，拼出你的专属路线</p>
          </div>
        </div>
        <div className="text-xs text-[#C4A8A0]">
          {new Date().toLocaleDateString('zh-CN', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </header>

      <MoodSelector />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[280px] flex-shrink-0 border-r border-[#F5E6D8] bg-white/30 overflow-hidden">
            <PlacePool />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <RouteMap />
          </div>

          <div className="w-[300px] flex-shrink-0 border-l border-[#F5E6D8] bg-white/30 flex flex-col overflow-hidden">
            <RoutePlanner />
            <RouteStats />
            <RouteManager />
          </div>
        </div>

        <DragOverlay>
          {activePlace ? (
            <div className="w-[250px] opacity-90 rotate-2">
              <PlaceCard place={activePlace} inPool={activeFromPool} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
