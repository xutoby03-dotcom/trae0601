import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Material } from '@/types';
import MaterialDetail from '@/components/material/MaterialDetail';
import {
  calculateReceivedQuantity,
  getMaterialStatus,
  getStatusColor,
  getStatusText,
  defaultRooms,
} from '@/utils/helpers';
import Badge from '@/components/common/Badge';
import { Home, Package, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const RoomView = () => {
  const { materials, deliveries, afterSales, addDelivery, addAfterSale } = useAppStore();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set(defaultRooms));

  const roomData = useMemo(() => {
    const roomsMap = new Map<string, Material[]>();

    materials.forEach((material) => {
      if (!material.room) return;
      if (!roomsMap.has(material.room)) {
        roomsMap.set(material.room, []);
      }
      roomsMap.get(material.room)!.push(material);
    });

    const rooms: {
      name: string;
      materials: Material[];
      totalCount: number;
      completeCount: number;
      progress: number;
      delayedCount: number;
      hasAfterSale: boolean;
    }[] = [];

    defaultRooms.forEach((roomName) => {
      const roomMaterials = roomsMap.get(roomName) || [];
      const completeCount = roomMaterials.filter(
        (m) => getMaterialStatus(m, deliveries) === 'complete'
      ).length;
      const delayedCount = roomMaterials.filter(
        (m) => getMaterialStatus(m, deliveries) === 'delayed'
      ).length;
      const hasAfterSale = roomMaterials.some((m) =>
        afterSales.some((a) => a.materialId === m.id && a.status !== 'resolved')
      );

      rooms.push({
        name: roomName,
        materials: roomMaterials,
        totalCount: roomMaterials.length,
        completeCount,
        progress: roomMaterials.length > 0 ? (completeCount / roomMaterials.length) * 100 : 0,
        delayedCount,
        hasAfterSale,
      });
    });

    const unassignedMaterials = materials.filter((m) => !m.room);
    if (unassignedMaterials.length > 0) {
      const completeCount = unassignedMaterials.filter(
        (m) => getMaterialStatus(m, deliveries) === 'complete'
      ).length;
      const delayedCount = unassignedMaterials.filter(
        (m) => getMaterialStatus(m, deliveries) === 'delayed'
      ).length;
      const hasAfterSale = unassignedMaterials.some((m) =>
        afterSales.some((a) => a.materialId === m.id && a.status !== 'resolved')
      );

      rooms.push({
        name: '未分配',
        materials: unassignedMaterials,
        totalCount: unassignedMaterials.length,
        completeCount,
        progress: unassignedMaterials.length > 0 ? (completeCount / unassignedMaterials.length) * 100 : 0,
        delayedCount,
        hasAfterSale,
      });
    }

    return rooms.filter((r) => r.totalCount > 0);
  }, [materials, deliveries, afterSales]);

  const toggleRoom = (roomName: string) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomName)) {
        next.delete(roomName);
      } else {
        next.add(roomName);
      }
      return next;
    });
  };

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
    setShowDetail(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-emerald-500';
    if (progress > 0) return 'bg-amber-500';
    return 'bg-gray-300';
  };

  const totalStats = useMemo(() => {
    const total = materials.length;
    const complete = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'complete'
    ).length;
    const delayed = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'delayed'
    ).length;
    return { total, complete, delayed };
  }, [materials, deliveries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">房间视图</h1>
          <p className="text-sm text-gray-500 mt-1">
            按房间分组查看材料齐套情况
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Home className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-1">总体齐套进度</p>
            <p className="text-3xl font-bold mb-2">
              {totalStats.complete}/{totalStats.total} 种材料
            </p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${totalStats.total > 0 ? (totalStats.complete / totalStats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              {totalStats.total > 0
                ? Math.round((totalStats.complete / totalStats.total) * 100)
                : 0}
              %
            </p>
            <p className="text-white/80 text-sm">齐套率</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {roomData.map((room) => (
          <div
            key={room.name}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggleRoom(room.name)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {room.name}
                    </h3>
                    {room.delayedCount > 0 && (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {room.delayedCount} 延期
                      </Badge>
                    )}
                    {room.hasAfterSale && (
                      <Badge variant="warning" size="sm">
                        有售后
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    共 {room.totalCount} 种材料，已齐套 {room.completeCount} 种
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-40 hidden sm:block">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                        room.progress
                      )}`}
                      style={{ width: `${room.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {Math.round(room.progress)}%
                  </p>
                </div>
                {expandedRooms.has(room.name) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedRooms.has(room.name) && (
              <div className="px-5 pb-5 border-t border-gray-100">
                {room.materials.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                    {room.materials.map((material) => {
                      const status = getMaterialStatus(material, deliveries);
                      const received = calculateReceivedQuantity(
                        material.id,
                        deliveries
                      );
                      const hasAfterSale = afterSales.some(
                        (a) =>
                          a.materialId === material.id && a.status !== 'resolved'
                      );

                      return (
                        <div
                          key={material.id}
                          onClick={() => handleMaterialClick(material)}
                          className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-teal-600">
                              {material.name}
                            </h4>
                            <Badge
                              className={getStatusColor(status)}
                              size="sm"
                            >
                              {getStatusText(status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                            {material.brand} · {material.specification}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {received}/{material.orderQuantity}
                              {material.unit}
                            </span>
                            {hasAfterSale && (
                              <span className="text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                售后中
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    该房间暂无材料
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {roomData.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无房间数据，请先添加材料</p>
          </div>
        )}
      </div>

      <MaterialDetail
        material={selectedMaterial}
        deliveries={deliveries}
        afterSales={afterSales}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onEdit={() => {}}
        onDelete={() => {}}
        onAddDelivery={(delivery) => addDelivery(delivery)}
        onAddAfterSale={(afterSale) => addAfterSale(afterSale)}
      />
    </div>
  );
};

export default RoomView;
