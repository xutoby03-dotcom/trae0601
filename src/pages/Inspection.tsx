import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardCheck,
  Monitor,
  Volume2,
  Gamepad2,
  Battery,
  Camera,
  StickyNote,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Room, Inspection } from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/mock';

interface ChecklistItem {
  key: string;
  label: string;
  icon: typeof Monitor;
  checked: boolean;
}

export default function Inspection() {
  const [searchParams] = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');
  
  const { rooms, addInspection, getInspectionsByRoomId, currentUser } = useStore();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { key: 'projectorOk', label: '投屏设备正常', icon: Monitor, checked: true },
    { key: 'soundOk', label: '音响/麦克风正常', icon: Volume2, checked: true },
    { key: 'remotePresent', label: '遥控器在位', icon: Gamepad2, checked: true },
    { key: 'batteryOk', label: '遥控器电池电量充足', icon: Battery, checked: true },
  ]);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (roomIdFromUrl) {
      const room = rooms.find((r) => r.id === roomIdFromUrl);
      if (room) {
        setSelectedRoom(room);
        setInspections(getInspectionsByRoomId(room.id));
      }
    }
  }, [roomIdFromUrl, rooms, getInspectionsByRoomId]);

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDropdown(false);
    setInspections(getInspectionsByRoomId(room.id));
    resetForm();
  };

  const resetForm = () => {
    setChecklist([
      { key: 'projectorOk', label: '投屏设备正常', icon: Monitor, checked: true },
      { key: 'soundOk', label: '音响/麦克风正常', icon: Volume2, checked: true },
      { key: 'remotePresent', label: '遥控器在位', icon: Gamepad2, checked: true },
      { key: 'batteryOk', label: '遥控器电池电量充足', icon: Battery, checked: true },
    ]);
    setNotes('');
    setPhotos([]);
    setSubmitted(false);
  };

  const toggleCheckItem = (key: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.key === key ? { ...item, checked: !item.checked } : item))
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedRoom) return;

    const allOk = checklist.every((item) => item.checked);
    const hasMissingParts = !checklist.find((c) => c.key === 'remotePresent')?.checked;
    const hasRepair = !allOk && !hasMissingParts;
    
    let result: 'normal' | 'needs_repair' | 'missing_parts' = 'normal';
    if (hasMissingParts && !checklist.find((c) => c.key === 'remotePresent')?.checked) {
      result = 'missing_parts';
    } else if (!allOk) {
      result = 'needs_repair';
    }

    const inspectionData = {
      roomId: selectedRoom.id,
      inspectedAt: new Date().toISOString(),
      inspector: currentUser.name,
      projectorOk: checklist.find((c) => c.key === 'projectorOk')?.checked || false,
      soundOk: checklist.find((c) => c.key === 'soundOk')?.checked || false,
      remotePresent: checklist.find((c) => c.key === 'remotePresent')?.checked || false,
      batteryOk: checklist.find((c) => c.key === 'batteryOk')?.checked || false,
      photos,
      notes,
      result,
    };

    addInspection(inspectionData);
    setInspections(getInspectionsByRoomId(selectedRoom.id));
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">巡检中心</h1>
        <p className="text-slate-500 mt-1">按清单逐项检查会议室设备状态</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              选择会议室
            </h3>
            <div className="relative">
              <button
                onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-emerald-300 transition-colors"
              >
                {selectedRoom ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{selectedRoom.name}</p>
                      <p className="text-xs text-slate-500">{selectedRoom.location}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400">请选择要巡检的会议室</span>
                )}
                <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform', showRoomDropdown && 'rotate-180')} />
              </button>
              
              {showRoomDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{room.name}</p>
                        <p className="text-xs text-slate-500">{room.location} · {room.capacity}人</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedRoom && !submitted && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                巡检清单
              </h3>
              <div className="space-y-3">
                {checklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleCheckItem(item.key)}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all text-left',
                        item.checked
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 hover:border-red-200 hover:bg-red-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                          item.checked ? 'bg-emerald-500' : 'bg-slate-200'
                        )}
                      >
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          item.checked ? 'text-emerald-600' : 'text-slate-400'
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          item.checked ? 'text-emerald-700' : 'text-slate-600'
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="ml-auto text-xs">
                        {item.checked ? (
                          <span className="text-emerald-600">正常</span>
                        ) : (
                          <span className="text-red-600">异常</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  现场照片
                </label>
                <div className="flex flex-wrap gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                    <ImagePlus className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-500 mt-1">上传照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  备注说明
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="如有其他问题请在此说明..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  重置
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  提交巡检
                </button>
              </div>
            </div>
          )}

          {selectedRoom && submitted && (
            <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">巡检完成</h3>
              <p className="text-slate-500 mb-6">
                {checklist.every((c) => c.checked)
                  ? '所有设备运行正常'
                  : '已记录设备异常情况，请及时安排维修'}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  继续巡检
                </button>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  选择其他会议室
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedRoom && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">会议室信息</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selectedRoom.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedRoom.location}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    容纳 {selectedRoom.capacity} 人
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {selectedRoom.lastInspectedAt
                      ? formatDate(selectedRoom.lastInspectedAt)
                      : '未巡检'}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-sm text-slate-600 space-y-1.5">
                  <p>
                    <span className="text-slate-400">投屏：</span>
                    {selectedRoom.projector || '无'}
                  </p>
                  <p>
                    <span className="text-slate-400">麦克风：</span>
                    {selectedRoom.microphone || '无'}
                  </p>
                  <p>
                    <span className="text-slate-400">摄像头：</span>
                    {selectedRoom.camera || '无'}
                  </p>
                  <p>
                    <span className="text-slate-400">白板：</span>
                    {selectedRoom.whiteboard || '无'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-400">负责人</p>
                  <p className="font-medium text-slate-700">{selectedRoom.manager}</p>
                  {selectedRoom.managerContact && (
                    <p className="text-sm text-slate-500">{selectedRoom.managerContact}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedRoom && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">巡检历史</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inspections.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">暂无巡检记录</p>
                ) : (
                  inspections.map((insp) => (
                    <div
                      key={insp.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            insp.result === 'normal'
                              ? 'bg-emerald-100 text-emerald-700'
                              : insp.result === 'needs_repair'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          )}
                        >
                          {insp.result === 'normal'
                            ? '正常'
                            : insp.result === 'needs_repair'
                            ? '需维修'
                            : '缺配件'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(insp.inspectedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        巡检人：{insp.inspector}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className={cn('w-2 h-2 rounded-full', insp.projectorOk ? 'bg-emerald-400' : 'bg-red-400')} title="投屏" />
                        <span className={cn('w-2 h-2 rounded-full', insp.soundOk ? 'bg-emerald-400' : 'bg-red-400')} title="声音" />
                        <span className={cn('w-2 h-2 rounded-full', insp.remotePresent ? 'bg-emerald-400' : 'bg-red-400')} title="遥控器" />
                        <span className={cn('w-2 h-2 rounded-full', insp.batteryOk ? 'bg-emerald-400' : 'bg-red-400')} title="电池" />
                      </div>
                      {insp.notes && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          备注：{insp.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
