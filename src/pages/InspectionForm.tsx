import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  ChevronRight,
  Eraser,
  SprayCan,
  Magnet,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  Building,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { type ColorStock, DEPARTMENTS, INSPECTORS, COLOR_OPTIONS } from '@/types';
import NumberInput from '@/components/NumberInput';
import ColorBadge from '@/components/ColorBadge';
import StatusBadge from '@/components/StatusBadge';
import { cn, checkStockLevel, formatDate } from '@/utils';

export default function InspectionForm() {
  const navigate = useNavigate();
  const meetingRooms = useAppStore((state) => state.meetingRooms);
  const addInspectionRecord = useAppStore((state) => state.addInspectionRecord);
  const getRecordsByRoomId = useAppStore((state) => state.getRecordsByRoomId);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [inspector, setInspector] = useState(INSPECTORS[0]);
  const [bookingDepartment, setBookingDepartment] = useState(DEPARTMENTS[0]);
  const [notes, setNotes] = useState('');
  const [colorCounts, setColorCounts] = useState<Record<string, number>>({});
  const [eraserCount, setEraserCount] = useState(0);
  const [sprayCount, setSprayCount] = useState(0);
  const [magnetCount, setMagnetCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedRoom = useMemo(
    () => meetingRooms.find((r) => r.id === selectedRoomId),
    [meetingRooms, selectedRoomId]
  );

  const lastRecord = useMemo(() => {
    if (!selectedRoomId) return null;
    const records = getRecordsByRoomId(selectedRoomId);
    return records[0] || null;
  }, [selectedRoomId, getRecordsByRoomId]);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = meetingRooms.find((r) => r.id === roomId);
    if (room) {
      const initialCounts: Record<string, number> = {};
      room.defaultColors.forEach((color) => {
        initialCounts[color] = 0;
      });
      setColorCounts(initialCounts);
      setEraserCount(0);
      setSprayCount(0);
      setMagnetCount(0);
    }
  };

  const handleColorCountChange = (color: string, value: number) => {
    setColorCounts((prev) => ({ ...prev, [color]: value }));
  };

  const colorStocks = useMemo((): ColorStock[] => {
    if (!selectedRoom) return [];
    return selectedRoom.defaultColors.map((color) => {
      const option = COLOR_OPTIONS.find((c) => c.color === color);
      const count = colorCounts[color] ?? 0;
      const consecutive = lastRecord?.colorStocks.find((cs) => cs.color === color)?.consecutiveShortage ?? 0;
      return {
        color,
        colorName: option?.colorName ?? color,
        count,
        belowMin: checkStockLevel(count, selectedRoom.minStock),
        consecutiveShortage: count < selectedRoom.minStock ? consecutive + 1 : 0,
      };
    });
  }, [selectedRoom, colorCounts, lastRecord]);

  const eraserBelowMin = selectedRoom ? checkStockLevel(eraserCount, selectedRoom.minStock) : false;
  const sprayBelowMin = selectedRoom ? checkStockLevel(sprayCount, Math.ceil(selectedRoom.minStock / 2)) : false;
  const magnetBelowMin = selectedRoom ? checkStockLevel(magnetCount, selectedRoom.minStock * 2) : false;

  const needReplenish =
    colorStocks.some((cs) => cs.belowMin) ||
    eraserBelowMin ||
    sprayBelowMin ||
    magnetBelowMin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    addInspectionRecord({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      inspector,
      inspectionDate: formatDate(new Date()),
      colorStocks,
      eraserCount,
      eraserBelowMin,
      sprayCount,
      sprayBelowMin,
      magnetCount,
      magnetBelowMin,
      notes,
      bookingDepartment,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedRoomId('');
      setColorCounts({});
      setEraserCount(0);
      setSprayCount(0);
      setMagnetCount(0);
      setNotes('');
    }, 1500);
  };

  const today = formatDate(new Date());
  const getRoomInspectedToday = (roomId: string) => {
    const records = getRecordsByRoomId(roomId);
    return records.some((r) => r.inspectionDate === today);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">巡检录入</h1>
          <p className="mt-1 text-slate-500">记录会议室耗材库存情况</p>
        </div>
        <Link
          to="/inspection/history"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
        >
          查看历史
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {showSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 animate-in slide-in-from-top">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">巡检记录已保存！</span>
        </div>
      )}

      {!selectedRoom ? (
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">选择会议室</h2>
            <p className="text-sm text-slate-500 mt-1">点击选择要巡检的会议室</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetingRooms.map((room, index) => {
              const inspectedToday = getRoomInspectedToday(room.id);
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room.id)}
                  className="group relative text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {inspectedToday && (
                    <div className="absolute top-3 right-3">
                      <StatusBadge
                        status="inspected"
                        label="已巡检"
                        variant="success"
                        size="sm"
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <img
                      src={room.photo}
                      alt={room.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{room.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        容量 {room.capacity} 人 · {room.whiteboardCount} 块白板
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.defaultColors.slice(0, 4).map((color) => (
                          <ColorBadge
                            key={color}
                            color={color}
                            showName={false}
                            size="sm"
                          />
                        ))}
                        {room.defaultColors.length > 4 && (
                          <span className="text-xs text-slate-400">+{room.defaultColors.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedRoom.photo}
                  alt={selectedRoom.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedRoom.name}</h2>
                  <p className="text-sm text-slate-500">
                    最低库存：每种颜色 {selectedRoom.minStock} 支
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoomId('')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                更换会议室
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-1 text-slate-400" />
                    巡检人
                  </label>
                  <select
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    {INSPECTORS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1 text-slate-400" />
                    预约部门
                  </label>
                  <select
                    value={bookingDepartment}
                    onChange={(e) => setBookingDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    <option value="管理层">管理层</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1 text-slate-400" />
                    巡检日期
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-600">
                    {today}
                  </div>
                </div>
              </div>

              {lastRecord && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">上次巡检：</span>
                    {new Date(lastRecord.createdAt).toLocaleDateString('zh-CN')} ·
                    巡检人：{lastRecord.inspector}
                    {lastRecord.needReplenish && (
                      <span className="ml-2 text-amber-600">（上次有缺货）</span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-500" />
                  白板笔库存
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorStocks.map((cs) => {
                    const lastCount = lastRecord?.colorStocks.find(
                      (c) => c.color === cs.color
                    )?.count;
                    return (
                      <div
                        key={cs.color}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          cs.consecutiveShortage >= 2
                            ? 'border-red-300 bg-red-50'
                            : cs.belowMin
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-slate-200 bg-white'
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <ColorBadge color={cs.color} colorName={cs.colorName} />
                          {cs.consecutiveShortage >= 2 && (
                            <StatusBadge
                              status="urgent"
                              label={`连续${cs.consecutiveShortage}次`}
                              variant="danger"
                              size="sm"
                            />
                          )}
                        </div>
                        <NumberInput
                          value={cs.count}
                          onChange={(v) => handleColorCountChange(cs.color, v)}
                          min={0}
                          max={20}
                          warning={cs.belowMin && cs.consecutiveShortage < 2}
                          error={cs.consecutiveShortage >= 2}
                        />
                        {lastCount !== undefined && (
                          <p className="mt-2 text-xs text-slate-500">
                            上次：{lastCount} 支
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-400">
                          最低库存：{selectedRoom.minStock} 支
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    eraserBelowMin ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Eraser className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">橡皮</span>
                  </div>
                  <NumberInput
                    value={eraserCount}
                    onChange={setEraserCount}
                    min={0}
                    max={20}
                    warning={eraserBelowMin}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    最低库存：{selectedRoom.minStock} 块
                  </p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    sprayBelowMin ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <SprayCan className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">清洁喷雾</span>
                  </div>
                  <NumberInput
                    value={sprayCount}
                    onChange={setSprayCount}
                    min={0}
                    max={20}
                    warning={sprayBelowMin}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    最低库存：{Math.ceil(selectedRoom.minStock / 2)} 瓶
                  </p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all',
                    magnetBelowMin ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Magnet className="w-5 h-5 text-slate-500" />
                    <span className="font-medium text-slate-700">磁贴</span>
                  </div>
                  <NumberInput
                    value={magnetCount}
                    onChange={setMagnetCount}
                    min={0}
                    max={50}
                    warning={magnetBelowMin}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    最低库存：{selectedRoom.minStock * 2} 个
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="其他需要说明的情况..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
                />
              </div>

              {needReplenish && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-amber-700">
                    检测到有物品低于最低库存，提交后将自动加入补给清单
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedRoomId('')}
                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                提交巡检记录
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
