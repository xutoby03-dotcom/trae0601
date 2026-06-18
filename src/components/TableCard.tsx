import { useDroppable } from '@dnd-kit/core';
import { Table, Guest, ConflictAlert } from '../types';
import { getTableHeadCount } from '../utils/seatingUtils';
import { useWedding } from '../context/WeddingContext';

interface TableCardProps {
  table: Table;
  guests: Guest[];
  headCount: number;
  conflicts: ConflictAlert[];
  specialMealCount: number;
  onSelect: () => void;
}

export default function TableCard({ table, guests, headCount, conflicts, specialMealCount, onSelect }: TableCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `table-${table.id}`,
  });

  const isFull = headCount >= table.capacity;
  const hasHighRisk = conflicts.some(c => c.severity === 'high');

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
        isOver ? 'border-wedding-gold bg-wedding-gold/5 scale-[1.02]' :
        hasHighRisk ? 'border-red-200' :
        isFull ? 'border-green-200' : 'border-wedding-pink/20'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-wedding-dark">
              {table.tableName || `第 ${table.tableNumber} 桌`}
            </h3>
            {table.printed && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                已打印
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">桌号 {table.tableNumber}</p>
        </div>

        <div className="text-right">
          <p className={`text-lg font-bold ${
            isFull ? 'text-green-600' : 'text-wedding-dark'
          }`}>
            {headCount}/{table.capacity}
          </p>
          <p className="text-xs text-gray-400">已入座</p>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className={`rounded-lg p-2 mb-3 ${
          hasHighRisk ? 'bg-red-50' : 'bg-yellow-50'
        }`}>
          {conflicts.slice(0, 2).map((c, i) => (
            <p key={i} className={`text-xs ${
              c.severity === 'high' ? 'text-red-600' :
              c.severity === 'medium' ? 'text-orange-600' : 'text-yellow-700'
            }`}>
              ⚠️ {c.message}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {guests.slice(0, 8).map(guest => (
          <div
            key={guest.id}
            className="w-8 h-8 rounded-full bg-wedding-pink/30 flex items-center justify-center text-xs font-medium text-wedding-dark"
            title={`${guest.name} - ${guest.relation}`}
          >
            {guest.name.charAt(0)}
          </div>
        ))}
        {guests.length > 8 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            +{guests.length - 8}
          </div>
        )}
        {guests.length === 0 && (
          <p className="text-gray-400 text-sm py-1">拖拽宾客到这里</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {specialMealCount > 0 && (
            <span className="text-orange-600">🍽️ {specialMealCount}份特殊餐</span>
          )}
          {guests.filter(g => g.allergens.length > 0).length > 0 && (
            <span className="text-red-500">⚠️ {guests.filter(g => g.allergens.length > 0).length}人过敏</span>
          )}
        </div>
        <span className="text-gray-400">详情 →</span>
      </div>
    </div>
  );
}
