import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building,
  FileText,
  Cable,
  AlertTriangle,
  MapPin,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { rooms } from '@/data/rooms';
import { getAvailableDevices, getConflictAlternatives } from '@/utils/conflict';
import { ConnectorType, BorrowFormData } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

const connectorTypes: ConnectorType[] = ['HDMI', 'Type-C', 'Mac', 'VGA', 'DP'];

const BorrowForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceIdParam = searchParams.get('deviceId');
  
  const { devices, borrowRecords, addBorrowRecord, getDeviceById } = useStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BorrowFormData>({
    roomId: '',
    deviceType: 'HDMI',
    startTime: '',
    endTime: '',
    borrowerName: '',
    borrowerDept: '',
    purpose: '',
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (deviceIdParam) {
      const device = getDeviceById(deviceIdParam);
      if (device) {
        setFormData((prev) => ({
          ...prev,
          roomId: device.roomId,
          deviceType: device.type,
        }));
        setSelectedDeviceId(device.id);
      }
    }
  }, [deviceIdParam, getDeviceById]);
  
  const availableDevices = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return [];
    return getAvailableDevices(
      devices,
      borrowRecords,
      formData.startTime,
      formData.endTime,
      formData.deviceType,
      formData.roomId || undefined
    );
  }, [devices, borrowRecords, formData.startTime, formData.endTime, formData.deviceType, formData.roomId]);
  
  const conflictAlternatives = useMemo(() => {
    if (!formData.roomId || !formData.startTime || !formData.endTime) return [];
    if (availableDevices.length > 0) return [];
    return getConflictAlternatives(
      formData.roomId,
      formData.deviceType,
      formData.startTime,
      formData.endTime,
      devices,
      borrowRecords,
      rooms
    );
  }, [formData, availableDevices.length, devices, borrowRecords]);
  
  const selectedRoom = rooms.find((r) => r.id === formData.roomId);
  const selectedDevice = selectedDeviceId ? getDeviceById(selectedDeviceId) : null;

  const handleInputChange = (field: keyof BorrowFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSelectedDeviceId(null);
    setShowConflict(false);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.roomId || !formData.deviceType || !formData.startTime || !formData.endTime) {
        return;
      }
      if (availableDevices.length === 0 && conflictAlternatives.length > 0) {
        setShowConflict(true);
        return;
      }
      if (availableDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(availableDevices[0].id);
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.borrowerName || !formData.borrowerDept || !formData.purpose) {
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!selectedDeviceId) return;
    
    addBorrowRecord({
      ...formData,
      deviceId: selectedDeviceId,
    });
    
    setSubmitted(true);
  };

  const handleSelectAlternative = (deviceId: string, roomId?: string) => {
    if (roomId) {
      setFormData((prev) => ({ ...prev, roomId }));
    }
    setSelectedDeviceId(deviceId);
    setShowConflict(false);
    setStep(2);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">借用成功！</h2>
          <p className="text-slate-500 mb-6">您已成功申请借用转接头</p>
          
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">设备</span>
                <span className="font-medium text-slate-700">{selectedDevice?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">会议室</span>
                <span className="font-medium text-slate-700">{selectedRoom?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">借用人</span>
                <span className="font-medium text-slate-700">{formData.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">用途</span>
                <span className="font-medium text-slate-700">{formData.purpose}</span>
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
        <h1 className="text-2xl font-bold text-slate-800">借用登记</h1>
        <p className="text-slate-500 mt-1">填写信息申请借用投影转接头</p>
      </div>

      <div className="flex items-center mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step >= s
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              )}
            >
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            <span className={cn(
              'ml-2 text-sm font-medium',
              step >= s ? 'text-slate-700' : 'text-slate-400'
            )}>
              {s === 1 ? '选择设备' : '填写信息'}
            </span>
            {s < 2 && <div className="w-12 h-0.5 mx-3 bg-slate-200" />}
          </div>
        ))}
      </div>

      {showConflict && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">
                所选时间段内该会议室的 {formData.deviceType} 转接头已全部借出
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                别担心，我们为您找到了以下替代方案：
              </p>
              
              <div className="space-y-3">
                {conflictAlternatives.map((alt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAlternative(alt.deviceId || '', alt.roomId)}
                    className="w-full p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {alt.type === 'room' && <MapPin className="w-4 h-4 text-teal-600" />}
                          {alt.type === 'device' && <Cable className="w-4 h-4 text-blue-600" />}
                          {alt.type === 'time' && <Clock className="w-4 h-4 text-purple-600" />}
                          <span className="font-medium text-slate-700">{alt.title}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{alt.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowConflict(false)}
                className="mt-4 text-sm text-amber-700 hover:text-amber-800 font-medium"
              >
                返回重新选择
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                选择会议室
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
              >
                <option value="">请选择会议室</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} - {room.floor} (容纳{room.capacity}人)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Cable className="w-4 h-4 inline mr-2" />
                转接头类型
              </label>
              <div className="grid grid-cols-5 gap-2">
                {connectorTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('deviceType', type)}
                    className={cn(
                      'py-2.5 rounded-xl text-sm font-medium transition-all',
                      formData.deviceType === type
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-2" />
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            {formData.roomId && formData.startTime && formData.endTime && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  可用设备
                  {availableDevices.length > 0 && (
                    <span className="text-emerald-600 ml-2">
                      ({availableDevices.length} 个可用)
                    </span>
                  )}
                </label>
                
                {availableDevices.length > 0 ? (
                  <div className="space-y-2">
                    {availableDevices.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => setSelectedDeviceId(device.id)}
                        className={cn(
                          'w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                          selectedDeviceId === device.id
                            ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <img
                          src={device.photo}
                          alt={device.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-700">{device.name}</p>
                          <p className="text-sm text-slate-500">{device.serialNumber}</p>
                        </div>
                        <StatusBadge status={device.status} size="sm" />
                        {selectedDeviceId === device.id && (
                          <CheckCircle className="w-5 h-5 text-teal-500" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      该时间段内没有可用的 {formData.deviceType} 转接头
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNextStep}
              disabled={!formData.roomId || !formData.deviceType || !formData.startTime || !formData.endTime || (availableDevices.length === 0 && conflictAlternatives.length === 0)}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              下一步
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDevice?.photo}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-slate-700">{selectedDevice?.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedRoom?.name} · {formData.startTime} - {formData.endTime}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  借用人姓名
                </label>
                <input
                  type="text"
                  value={formData.borrowerName}
                  onChange={(e) => handleInputChange('borrowerName', e.target.value)}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  所在部门
                </label>
                <input
                  type="text"
                  value={formData.borrowerDept}
                  onChange={(e) => handleInputChange('borrowerDept', e.target.value)}
                  placeholder="请输入部门"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                借用用途
              </label>
              <textarea
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="请描述借用用途，如：产品评审会议、客户演示等"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.borrowerName || !formData.borrowerDept || !formData.purpose}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                确认借用
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowForm;
