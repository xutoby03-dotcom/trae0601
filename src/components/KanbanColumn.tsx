import { ReactNode } from 'react';
import { ColumnType, ReturnOrder } from '@/types/return';
import { getColumnLabel } from '@/utils/statusUtils';
import { ReturnCard } from './ReturnCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Package } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnType;
  orders: ReturnOrder[];
  icon: ReactNode;
  color: string;
  bgColor: string;
  onCardClick: (order: ReturnOrder) => void;
}

export function KanbanColumn({
  column,
  orders,
  icon,
  color,
  bgColor,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column,
  });

  const label = getColumnLabel(column);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <span className={color}>{icon}</span>
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{label}</h2>
          <span className="text-sm text-gray-400">{orders.length} 件待处理</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`
          flex-1 rounded-2xl p-3 transition-all duration-300
          ${isOver ? 'bg-gray-100 ring-2 ring-dashed ring-gray-300' : 'bg-gray-50/50'}
        `}
      >
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
            <Package size={40} strokeWidth={1} />
            <p className="text-sm mt-2">暂无退货</p>
          </div>
        ) : (
          <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <ReturnCard
                  key={order.id}
                  order={order}
                  onClick={() => onCardClick(order)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
