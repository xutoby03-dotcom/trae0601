import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useStore } from '../store/useStore'
import { EquipmentLibrary } from '../components/EquipmentLibrary'
import { CampingChecklist } from '../components/CampingChecklist'
import { OverdueBanner } from '../components/OverdueBanner'
import BorrowModal from '../components/BorrowModal'
import ReturnModal from '../components/ReturnModal'
import type { Equipment, BorrowRecord } from '../store/types'
import { MapPin, TreePine, FileDown, Mountain, Baby, Waves } from 'lucide-react'

export default function HomePage() {
  const equipment = useStore((s) => s.equipment)
  const currentTrip = useStore((s) => s.currentTrip)
  const setCurrentTrip = useStore((s) => s.setCurrentTrip)
  const applySceneTemplate = useStore((s) => s.applySceneTemplate)
  const addToChecklist = useStore((s) => s.addToChecklist)
  const checkOverdue = useStore((s) => s.checkOverdue)

  const [borrowTarget, setBorrowTarget] = useState<Equipment | null>(null)
  const [returnData, setReturnData] = useState<{ record: BorrowRecord; equipment: Equipment } | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [showTripSetup, setShowTripSetup] = useState(false)
  const [tripName, setTripName] = useState('')
  const [tripDate, setTripDate] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    checkOverdue()
  }, [checkOverdue])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active } = event
      setActiveDragId(null)
      if (!currentTrip) {
        setShowTripSetup(true)
        return
      }
      const eqId = String(active.id).replace('equipment-', '')
      const eq = equipment.find((e) => e.id === eqId)
      if (eq && eq.availableQuantity > 0) {
        addToChecklist(eqId)
      }
    },
    [currentTrip, equipment, addToChecklist]
  )

  const handleDragStart = useCallback((event: DragEndEvent) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleCreateTrip = () => {
    if (!tripName.trim()) return
    applySceneTemplate('custom', tripName.trim(), tripDate)
    setShowTripSetup(false)
    setTripName('')
    setTripDate('')
  }

  const activeDragEq = activeDragId
    ? equipment.find((e) => `equipment-${e.id}` === activeDragId)
    : null

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-700 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <TreePine className="w-7 h-7" />
              <h1 className="font-display text-xl font-bold tracking-wide">露营装备借用清单</h1>
            </div>
            <nav className="flex items-center gap-2">
              {!currentTrip && (
                <button
                  onClick={() => setShowTripSetup(true)}
                  className="camp-btn-primary text-sm bg-white/15 hover:bg-white/25 backdrop-blur-sm"
                >
                  <MapPin className="w-4 h-4 inline mr-1.5" />
                  新建行程
                </button>
              )}
              <Link
                to="/scenes"
                className="camp-btn-secondary text-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
              >
                <Mountain className="w-4 h-4 inline mr-1.5" />
                场景清单
              </Link>
              {currentTrip && currentTrip.selectedEquipment.length > 0 && (
                <Link
                  to="/export"
                  className="camp-btn-secondary text-sm bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm"
                >
                  <FileDown className="w-4 h-4 inline mr-1.5" />
                  导出检查表
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {currentTrip && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 no-print">
          <OverdueBanner />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-10rem)]">
            <div className="lg:col-span-3 camp-card p-4 overflow-hidden flex flex-col">
              <EquipmentLibrary onBorrowClick={setBorrowTarget} />
            </div>
            <div className="lg:col-span-2 camp-card p-4 overflow-hidden flex flex-col">
              <CampingChecklist
                onBorrowClick={setBorrowTarget}
                onReturnClick={(record, eq) => setReturnData({ record, equipment: eq })}
              />
            </div>
          </div>

          <DragOverlay>
            {activeDragEq ? (
              <div className="camp-card p-3 drag-overlay max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-cream-200">
                    {activeDragEq.photo ? (
                      <img src={activeDragEq.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{activeDragEq.name}</div>
                    <div className="text-xs text-gray-500">
                      可用 {activeDragEq.availableQuantity} / 共 {activeDragEq.totalQuantity}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {borrowTarget && (
        <BorrowModal
          isOpen={!!borrowTarget}
          onClose={() => setBorrowTarget(null)}
          equipment={borrowTarget}
        />
      )}

      {returnData && (
        <ReturnModal
          isOpen={!!returnData}
          onClose={() => setReturnData(null)}
          record={returnData.record}
          equipment={returnData.equipment}
        />
      )}

      {showTripSetup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cream-50 rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="font-display text-xl font-semibold text-forest-600 mb-4">
              创建露营行程
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">行程名称</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="例: 周末千岛湖露营"
                  className="camp-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">出发日期</label>
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="camp-input"
                />
              </div>

              <div className="border-t border-cream-300 pt-4 mt-4">
                <p className="text-xs font-medium text-gray-600 mb-3">或选择场景快速创建</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { applySceneTemplate('mountain_overnight', '山里过夜', tripDate || new Date().toISOString().split('T')[0]); setShowTripSetup(false) }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-cream-300 hover:border-forest-400 hover:bg-forest-50 transition-all"
                  >
                    <Mountain className="w-5 h-5 text-forest-600" />
                    <span className="text-xs font-medium">山里过夜</span>
                  </button>
                  <button
                    onClick={() => { applySceneTemplate('beach_bbq', '海边烧烤', tripDate || new Date().toISOString().split('T')[0]); setShowTripSetup(false) }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-cream-300 hover:border-earth-400 hover:bg-earth-50 transition-all"
                  >
                    <Waves className="w-5 h-5 text-earth-500" />
                    <span className="text-xs font-medium">海边烧烤</span>
                  </button>
                  <button
                    onClick={() => { applySceneTemplate('family_camping', '亲子露营', tripDate || new Date().toISOString().split('T')[0]); setShowTripSetup(false) }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-cream-300 hover:border-sunset-400 hover:bg-sunset-50 transition-all"
                  >
                    <Baby className="w-5 h-5 text-sunset-500" />
                    <span className="text-xs font-medium">亲子露营</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowTripSetup(false)}
                className="camp-btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={!tripName.trim()}
                className="camp-btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建行程
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
