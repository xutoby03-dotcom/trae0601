import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Package, Truck, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useReturnStore } from '@/store/useReturnStore';
import { getOrdersByColumn } from '@/utils/statusUtils';
import { ColumnType, ReturnOrder, ReturnStatus } from '@/types/return';
import { KanbanColumn } from '@/components/KanbanColumn';
import { ReturnFormModal } from '@/components/ReturnFormModal';
import { ReturnDetailModal } from '@/components/ReturnDetailModal';

export default function Home() {
  const { orders, updateStatus } = useReturnStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ReturnOrder | null>(null);
  const [editOrder, setEditOrder] = useState<ReturnOrder | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnOrders = useMemo(() => getOrdersByColumn(orders), [orders]);

  const handleCardClick = (order: ReturnOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleEdit = () => {
    setEditOrder(selectedOrder);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const columns: ColumnType[] = ['today_must_handle', 'need_tracking', 'refund_followup'];
    const isOverColumn = columns.includes(overId as ColumnType);

    const order = orders.find((o) => o.id === activeId);
    if (!order) return;

    let targetColumn: ColumnType | null = null;

    if (isOverColumn) {
      targetColumn = overId as ColumnType;
    } else {
      targetColumn = findColumnOfOrder(overId, columnOrders);
    }

    if (!targetColumn) return;

    let newStatus: ReturnStatus = order.status;

    switch (targetColumn) {
      case 'today_must_handle':
        newStatus = 'pending';
        break;
      case 'need_tracking':
        newStatus = 'shipment_pending';
        break;
      case 'refund_followup':
        newStatus = 'refund_pending';
        break;
    }

    if (newStatus !== order.status) {
      updateStatus(activeId, newStatus);
    }
  };

  const todayStr = format(new Date(), 'yyyy年MM月dd日 EEEE', { locale: zhCN });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">退货管家</h1>
                <p className="text-sm text-gray-500">{todayStr}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditOrder(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={20} />
              添加退货
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <KanbanColumn
              column="today_must_handle"
              orders={columnOrders.today_must_handle}
              icon={<Calendar size={22} />}
              color="text-red-500"
              bgColor="bg-red-100"
              onCardClick={handleCardClick}
            />
            <KanbanColumn
              column="need_tracking"
              orders={columnOrders.need_tracking}
              icon={<Truck size={22} />}
              color="text-yellow-600"
              bgColor="bg-yellow-100"
              onCardClick={handleCardClick}
            />
            <KanbanColumn
              column="refund_followup"
              orders={columnOrders.refund_followup}
              icon={<Clock size={22} />}
              color="text-purple-500"
              bgColor="bg-purple-100"
              onCardClick={handleCardClick}
            />
          </DndContext>
        </div>
      </main>

      <ReturnFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditOrder(null);
        }}
        editOrder={editOrder}
      />

      <ReturnDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onEdit={handleEdit}
      />
    </div>
  );
}

function findColumnOfOrder(
  orderId: string,
  columnOrders: Record<ColumnType, ReturnOrder[]>
): ColumnType | null {
  for (const column of Object.keys(columnOrders) as ColumnType[]) {
    if (columnOrders[column].some((o) => o.id === orderId)) {
      return column;
    }
  }
  return null;
}
