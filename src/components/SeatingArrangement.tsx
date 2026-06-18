import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useWedding } from '../context/WeddingContext';
import { getUnseatedGuests, getTableGuests, getTableHeadCount, detectConflicts, calculateSpecialMeals } from '../utils/seatingUtils';
import { Guest, Table } from '../types';
import UnseatedGuestsPanel from './UnseatedGuestsPanel';
import TableCard from './TableCard';
import DraggableGuest from './DraggableGuest';
import TableForm from './TableForm';

export default function SeatingArrangement() {
  const { guests, tables, seatGuest, unseatGuest, moveGuest, addTable } = useWedding();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTableForm, setShowTableForm] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const unseatedGuests = useMemo(() => getUnseatedGuests(guests), [guests]);

  const activeGuest = activeId ? guests.find(g => g.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const guestId = active.id as string;
    const targetId = over.id as string;

    if (targetId === 'unseated-panel') {
      unseatGuest(guestId);
      return;
    }

    if (targetId.startsWith('table-')) {
      const tableId = targetId.replace('table-', '');
      const guest = guests.find(g => g.id === guestId);

      if (guest?.tableId) {
        moveGuest(guestId, guest.tableId, tableId);
      } else {
        seatGuest(guestId, tableId);
      }
    }
  };

  const allSpecialMeals = useMemo(() => calculateSpecialMeals(guests), [guests]);
  const totalGuests = guests.reduce((sum, g) => sum + g.headCount, 0);
  const totalSeated = tables.reduce((sum, t) => sum + getTableHeadCount(t, guests), 0);

  const handleAddTable = (tableData: { tableNumber: number; tableName?: string; capacity: number }) => {
    addTable(tableData);
    setShowTableForm(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-wedding-pink/20 bg-white no-print">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-wedding-dark">排桌安排</h2>
              <p className="text-gray-500 text-sm mt-1">
                拖拽宾客到桌位，系统自动检测冲突和统计特殊餐食
              </p>
            </div>
            <button
              onClick={() => setShowTableForm(true)}
              className="px-4 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium"
            >
              + 添加桌位
            </button>
          </div>

          <div className="flex gap-6 mt-4">
            <div className="bg-wedding-cream rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">总宾客数</span>
              <p className="text-xl font-bold text-wedding-dark">{totalGuests} 人</p>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">已入座</span>
              <p className="text-xl font-bold text-green-600">{totalSeated} 人</p>
            </div>
            <div className="bg-orange-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">特殊餐</span>
              <p className="text-xl font-bold text-orange-600">
                {Object.values(allSpecialMeals).reduce((a, b) => a + b, 0)} 份
              </p>
            </div>
            <div className="bg-red-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-500">过敏宾客</span>
              <p className="text-xl font-bold text-red-600">
                {guests.filter(g => g.allergens.length > 0).reduce((sum, g) => sum + g.headCount, 0)} 人
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r border-wedding-pink/20 bg-white/50 flex flex-col no-print">
            <UnseatedGuestsPanel guests={unseatedGuests} />
          </div>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tables.map(table => {
                const tableGuests = getTableGuests(table, guests);
                const headCount = getTableHeadCount(table, guests);
                const conflicts = detectConflicts(table, guests);
                const specialMeals = calculateSpecialMeals(tableGuests);
                const specialMealCount = Object.values(specialMeals).reduce((a, b) => a + b, 0);

                return (
                  <TableCard
                    key={table.id}
                    table={table}
                    guests={tableGuests}
                    headCount={headCount}
                    conflicts={conflicts}
                    specialMealCount={specialMealCount}
                    onSelect={() => setSelectedTable(table)}
                  />
                );
              })}
            </div>

            {tables.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🪑</p>
                <p>还没有桌位，点击上方"添加桌位"开始排桌</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeGuest ? (
          <div className="opacity-90 transform scale-105">
            <DraggableGuest guest={activeGuest} isDragging />
          </div>
        ) : null}
      </DragOverlay>

      {showTableForm && (
        <TableForm onClose={() => setShowTableForm(false)} onSubmit={handleAddTable} />
      )}

      {selectedTable && (
        <TableDetailModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </DndContext>
  );
}

function TableDetailModal({ table, onClose }: { table: Table; onClose: () => void }) {
  const { guests, unseatGuest } = useWedding();
  const tableGuests = getTableGuests(table, guests);
  const conflicts = detectConflicts(table, guests);
  const specialMeals = calculateSpecialMeals(tableGuests);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-wedding-dark">
              {table.tableName || `第 ${table.tableNumber} 桌`}
            </h3>
            <p className="text-sm text-gray-500">容量 {table.capacity} 人</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {conflicts.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-red-700 mb-2">⚠️ 注意事项</h4>
              <ul className="space-y-1">
                {conflicts.map((c, i) => (
                  <li key={i} className={`text-sm ${
                    c.severity === 'high' ? 'text-red-600' :
                    c.severity === 'medium' ? 'text-orange-600' : 'text-yellow-700'
                  }`}>
                    {c.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-700 mb-2">🍽️ 特殊餐食统计</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(specialMeals).map(([key, value]) => {
                if (value === 0) return null;
                const labels: Record<string, string> = {
                  vegetarian: '素食',
                  vegan: '纯素',
                  glutenFree: '无麸质',
                  noSeafood: '无海鲜',
                  noPork: '无猪肉',
                  noBeef: '无牛肉',
                  childMeal: '儿童餐',
                  softFood: '软食',
                  other: '其他',
                };
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{labels[key] || key}</span>
                    <span className="font-medium">{value} 份</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              宾客列表 ({tableGuests.length} 位)
            </h4>
            <div className="space-y-2">
              {tableGuests.map(guest => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-wedding-pink/40 flex items-center justify-center text-sm">
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{guest.name}</p>
                      <p className="text-xs text-gray-400">{guest.relation} · {guest.headCount}人</p>
                    </div>
                  </div>
                  <button
                    onClick={() => unseatGuest(guest.id)}
                    className="text-xs text-red-400 hover:text-red-500"
                  >
                    移出
                  </button>
                </div>
              ))}
            </div>

            {tableGuests.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">暂无宾客</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
