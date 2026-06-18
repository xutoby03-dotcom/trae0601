import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Cable,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Monitor,
  MessageSquare,
  User,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import { rooms } from '@/data/rooms';
import { formatDateTime, isOverdue } from '@/utils/date';
import { AppearanceCheck, ReturnFormData } from '@/types';
import { cn } from '@/lib/utils';

const ReturnForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordIdParam = searchParams.get('recordId');
  
  const { borrowRecords, getDeviceById, returnDevice } = useStore();
  
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(recordIdParam);
  const [returnData, setReturnData] = useState<ReturnFormData>({
    appearanceCheck: 'good',
    projectionOK: true,
    pouchPresent: true,
    returnNotes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  
  const activeRecords = borrowRecords.filter(
    (r) => r.status === 'borrowed' || r.status === 'pending' || r.status === 'overdue'
  );
  
  const selectedRecord = borrowRecords.find((r) => r.id === selectedRecordId);
  const selectedDevice = selectedRecord ? getDeviceById(selectedRecord.deviceId) : null;
  const selectedRoom = selectedDevice
    ? rooms.find((r) => r.id === selectedDevice.roomId)
    : null;

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setReturnData({
      appearanceCheck: 'good',
      projectionOK: true,
      pouchPresent: true,
      returnNotes: '',
    });
  };

  const handleSubmit = () => {
    if (!selectedRecordId) return;
    
    returnDevice(selectedRecordId, returnData);
    setSubmitted(true);
  };

  if (submitted && selectedRecord && selectedDevice) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">归还成功！</h2>
          <p className="text-slate-500 mb-6">设备已成功归还</p>
          
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-3">
              <img
                src={selectedDevice.photo}
                alt={selectedDevice.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium text-slate-700">{selectedDevice.name}</p>
                <p className="text-sm text-slate-500">{selectedDevice.type}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">借用人</span>
                <span className="font-medium text-slate-700">{selectedRecord.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">外观检查</span>
                <span className={cn(
                  'font-medium',
                  returnData.appearanceCheck === 'good' && 'text-emerald-600',
                  returnData.appearanceCheck === 'minor-damage' && 'text-amber-600',
                  returnData.appearanceCheck === 'damaged' && 'text-red-600'
                )}>
                  {returnData.appearanceCheck === 'good' && '良好'}
                  {returnData.appearanceCheck === 'minor-damage' && '轻微损坏'}
                  {returnData.appearanceCheck === 'damaged' && '损坏'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">投屏功能</span>
                <span className={cn(
                  'font-medium',
                  returnData.projectionOK ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {returnData.projectionOK ? '正常' : '异常'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">收纳袋</span>
                <span className={cn(
                  'font-medium',
                  returnData.pouchPresent ? 'text-emerald-600' : 'text-red-600'
                )}>
                  {returnData.pouchPresent ? '齐全' : '缺失'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => navigate('/records')}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all"
            >
              查看记录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">归还确认</h1>
        <p className="text-slate-500 mt-1">检查设备状态并确认归还</p>
      </div>

      {!selectedRecordId ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">选择要归还的设备</h2>
            <p className="text-sm text-slate-500 mt-1">
              共 {activeRecords.length} 个待归还设备
            </p>
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {activeRecords.length > 0 ? (
              activeRecords.map((record) => {
                const device = getDeviceById(record.deviceId);
                const room = device ? rooms.find((r) => r.id === device.roomId) : null;
                const overdue = isOverdue(record.endTime, record.status);
                
                return (
                  <button
                    key={record.id}
                    onClick={() => handleSelectRecord(record.id)}
                    className="w-full p-4 hover:bg-slate-50 transition-colors text-left flex items-center gap-4"
                  >
                    <img
                      src={device?.photo}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 truncate">
                          {device?.name}
                        </p>
                        <StatusBadge
                          status={overdue ? 'overdue' : record.status}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {record.borrowerName}
                        <span className="text-slate-300">·</span>
                        {record.purpose}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {room?.name}
                        <span className="text-slate-300">·</span>
                        <Clock className="w-3 h-3" />
                        应还 {formatDateTime(record.endTime)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-slate-500">暂无待归还设备</p>
                <p className="text-sm text-slate-400 mt-1">所有设备均已归还</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-4">
              <img
                src={selectedDevice?.photo}
                alt=""
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg">
                  {selectedDevice?.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge
                    status={selectedRecord && isOverdue(selectedRecord.endTime, selectedRecord.status) ? 'overdue' : selectedRecord?.status || 'available'}
                    size="sm"
                  />
                  <span className="text-sm text-slate-500">
                    {selectedDevice?.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  借用人：{selectedRecord?.borrowerName} ({selectedRecord?.borrowerDept})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-5">归还检查</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  <Package className="w-4 h-4 inline mr-2" />
                  线材外观
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'good', label: '良好', icon: CheckCircle, color: 'emerald' },
                    { value: 'minor-damage', label: '轻微损坏', icon: AlertCircle, color: 'amber' },
                    { value: 'damaged', label: '损坏', icon: XCircle, color: 'red' },
                  ] as { value: AppearanceCheck; label: string; icon: typeof CheckCircle; color: string }[]).map((item) => {
                    const Icon = item.icon;
                    const isSelected = returnData.appearanceCheck === item.value;
                    
                    return (
                      <button
                        key={item.value}
                        onClick={() =>
                          setReturnData((prev) => ({
                            ...prev,
                            appearanceCheck: item.value,
                          }))
                        }
                        className={cn(
                          'p-4 rounded-xl border transition-all flex flex-col items-center gap-2',
                          isSelected && item.color === 'emerald' && 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20',
                          isSelected && item.color === 'amber' && 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20',
                          isSelected && item.color === 'red' && 'border-red-500 bg-red-50 ring-2 ring-red-500/20',
                          !isSelected && 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-6 h-6',
                            isSelected && item.color === 'emerald' && 'text-emerald-600',
                            isSelected && item.color === 'amber' && 'text-amber-600',
                            isSelected && item.color === 'red' && 'text-red-600',
                            !isSelected && 'text-slate-400'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isSelected && item.color === 'emerald' && 'text-emerald-700',
                            isSelected && item.color === 'amber' && 'text-amber-700',
                            isSelected && item.color === 'red' && 'text-red-700',
                            !isSelected && 'text-slate-600'
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    <Monitor className="w-4 h-4 inline mr-2" />
                    投屏功能
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setReturnData((prev) => ({ ...prev, projectionOK: true }))
                      }
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all',
                        returnData.projectionOK
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      正常
                    </button>
                    <button
                      onClick={() =>
                        setReturnData((prev) => ({ ...prev, projectionOK: false }))
                      }
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all',
                        !returnData.projectionOK
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      异常
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    <Cable className="w-4 h-4 inline mr-2" />
                    收纳袋
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setReturnData((prev) => ({ ...prev, pouchPresent: true }))
                      }
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all',
                        returnData.pouchPresent
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      齐全
                    </button>
                    <button
                      onClick={() =>
                        setReturnData((prev) => ({ ...prev, pouchPresent: false }))
                      }
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all',
                        !returnData.pouchPresent
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      缺失
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  备注（可选）
                </label>
                <textarea
                  value={returnData.returnNotes}
                  onChange={(e) =>
                    setReturnData((prev) => ({
                      ...prev,
                      returnNotes: e.target.value,
                    }))
                  }
                  placeholder="如有其他情况请在此备注..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedRecordId(null)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              返回列表
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
            >
              确认归还
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnForm;
