import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, User, MapPin, Package, AlertTriangle, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { meetingRoomOptions } from '@/types';
import type { Headset } from '@/types';

export default function BorrowPage() {
  const [searchParams] = useSearchParams();
  const headsetIdParam = searchParams.get('headsetId');
  const navigate = useNavigate();
  const { headsets, borrowRecords, addBorrowRecord } = useStore();
  
  const unreturnedBorrowHeadsetIds = useMemo(() => {
    const ids = borrowRecords
      .filter(r => r.status === 'borrowed' || r.status === 'overdue')
      .map(r => r.headsetId);
    return new Set(ids);
  }, [borrowRecords]);
  
  const availableHeadsetIds = useMemo(() => {
    const ids = headsets
      .filter(h => 
        h.status === 'available' && 
        !h.receiverLost && 
        !h.microphoneIssue &&
        !unreturnedBorrowHeadsetIds.has(h.id)
      )
      .map(h => h.id);
    return new Set(ids);
  }, [headsets, unreturnedBorrowHeadsetIds]);
  
  const availableHeadsets = useMemo(() => 
    headsets.filter(h => availableHeadsetIds.has(h.id)),
    [headsets, availableHeadsetIds]
  );
  
  const [selectedHeadsetId, setSelectedHeadsetId] = useState<string>('');
  const [meetingRoom, setMeetingRoom] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState(new Date().toTimeString().slice(0, 5));
  const [borrower, setBorrower] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnTime, setExpectedReturnTime] = useState(
    new Date(Date.now() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5)
  );
  const [needSpareReceiver, setNeedSpareReceiver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [unavailableNotice, setUnavailableNotice] = useState<{ headset: Headset; reason: string } | null>(null);

  const getUnavailableReason = useCallback((headsetId: string): string => {
    const headset = headsets.find(h => h.id === headsetId);
    if (!headset) return '该耳麦不存在';
    if (unreturnedBorrowHeadsetIds.has(headsetId)) {
      const borrow = borrowRecords.find(r => r.headsetId === headsetId && (r.status === 'borrowed' || r.status === 'overdue'));
      const statusText = borrow?.status === 'overdue' ? '逾期未还' : '使用中';
      return `该耳麦${borrow ? `被「${borrow.borrower}」${statusText}` : '有未归还记录'}，暂不可借`;
    }
    if (headset.receiverLost) return '该耳麦接收器已丢失，待补充';
    if (headset.microphoneIssue) return '该耳麦麦克风异常，待维修';
    if (headset.status === 'faulty') return '该耳麦已标记为故障';
    if (headset.status === 'maintenance') return '该耳麦正在维修中';
    if (headset.status === 'borrowed') return '该耳麦已被借出';
    return '该耳麦当前不可借用';
  }, [headsets, borrowRecords, unreturnedBorrowHeadsetIds]);

  useEffect(() => {
    if (headsetIdParam) {
      const isAvailable = availableHeadsetIds.has(headsetIdParam);
      if (isAvailable) {
        if (selectedHeadsetId !== headsetIdParam) {
          setSelectedHeadsetId(headsetIdParam);
        }
        if (unavailableNotice !== null) {
          setUnavailableNotice(null);
        }
      } else {
        const headset = headsets.find(h => h.id === headsetIdParam);
        if (headset) {
          const reason = getUnavailableReason(headsetIdParam);
          const noticeChanged = 
            !unavailableNotice || 
            unavailableNotice.headset.id !== headset.id || 
            unavailableNotice.reason !== reason;
          
          if (noticeChanged) {
            setUnavailableNotice({ headset, reason });
          }
        } else if (unavailableNotice !== null) {
          setUnavailableNotice(null);
        }
        if (selectedHeadsetId !== '') {
          setSelectedHeadsetId('');
        }
      }
    }
  }, [
    headsetIdParam, 
    availableHeadsetIds, 
    headsets, 
    getUnavailableReason,
    selectedHeadsetId,
    unavailableNotice
  ]);

  useEffect(() => {
    if (selectedHeadsetId && unavailableNotice !== null) {
      setUnavailableNotice(null);
    }
  }, [selectedHeadsetId, unavailableNotice]);

  const selectedHeadset = headsets.find(h => h.id === selectedHeadsetId) as Headset | undefined;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedHeadsetId) {
      newErrors.headsetId = '请选择耳麦';
    } else {
      const isAvailable = availableHeadsetIds.has(selectedHeadsetId);
      if (!isAvailable) {
        const headset = headsets.find(h => h.id === selectedHeadsetId);
        if (unreturnedBorrowHeadsetIds.has(selectedHeadsetId)) {
          newErrors.headsetId = '该耳麦有未归还记录，无法再次借用';
        } else if (headset?.receiverLost) {
          newErrors.headsetId = '该耳麦接收器已丢失，无法借用';
        } else if (headset?.microphoneIssue) {
          newErrors.headsetId = '该耳麦麦克风异常，无法借用';
        } else if (headset?.status !== 'available') {
          newErrors.headsetId = '该耳麦当前不可借用';
        } else {
          newErrors.headsetId = '该耳麦当前不可借用';
        }
        if (selectedHeadsetId !== '') {
          setSelectedHeadsetId('');
        }
      }
    }
    
    if (!meetingRoom) newErrors.meetingRoom = '请选择会议室';
    if (!meetingDate) newErrors.meetingDate = '请选择会议日期';
    if (!meetingTime) newErrors.meetingTime = '请选择会议时间';
    if (!borrower.trim()) newErrors.borrower = '请输入借用人姓名';
    if (!expectedReturnDate) newErrors.expectedReturnDate = '请选择预计归还日期';
    if (!expectedReturnTime) newErrors.expectedReturnTime = '请选择预计归还时间';
    
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    const returnDateTime = new Date(`${expectedReturnDate}T${expectedReturnTime}`);
    
    if (returnDateTime <= meetingDateTime) {
      newErrors.expectedReturnTime = '归还时间必须晚于会议时间';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    addBorrowRecord({
      headsetId: selectedHeadsetId,
      meetingRoom,
      meetingTime: new Date(`${meetingDate}T${meetingTime}`).toISOString(),
      borrower: borrower.trim(),
      expectedReturn: new Date(`${expectedReturnDate}T${expectedReturnTime}`).toISOString(),
      needSpareReceiver,
    });
    
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-2xl font-bold text-slate-900">借用登记</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            选择耳麦
          </h2>
          
          {unavailableNotice && (
            <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-red-800">
                    {unavailableNotice.headset.brand} {unavailableNotice.headset.model}
                    <span className="text-red-600 ml-1 text-sm font-normal">
                      （{unavailableNotice.headset.serialNumber}）
                    </span>
                  </p>
                  <p className="text-sm text-red-700 mt-1">{unavailableNotice.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUnavailableNotice(null)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  aria-label="关闭提示"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {availableHeadsets.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无可用耳麦</p>
            ) : (
              availableHeadsets.map(headset => (
                <label
                  key={headset.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedHeadsetId === headset.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="headset"
                    value={headset.id}
                    checked={selectedHeadsetId === headset.id}
                    onChange={(e) => setSelectedHeadsetId(e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={headset.photo}
                      alt={`${headset.brand} ${headset.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {headset.brand} {headset.model}
                    </p>
                    <p className="text-sm text-slate-500">
                      {headset.serialNumber} · {headset.cabinet} · 电量 {headset.batteryLevel}%
                    </p>
                  </div>
                  {headset.batteryLevel < 30 && (
                    <span className="badge badge-warning">低电量</span>
                  )}
                </label>
              ))
            )}
          </div>
          {errors.headsetId && <p className="text-red-500 text-sm mt-2">{errors.headsetId}</p>}
        </div>
        
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            借用信息
          </h2>
          
          <div>
            <label className="label">会议室 *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                className={`input pl-10 ${errors.meetingRoom ? 'border-red-500' : ''}`}
                value={meetingRoom}
                onChange={(e) => setMeetingRoom(e.target.value)}
              >
                <option value="">请选择会议室</option>
                {meetingRoomOptions.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            {errors.meetingRoom && <p className="text-red-500 text-sm mt-1">{errors.meetingRoom}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">会议日期 *</label>
              <input
                type="date"
                className={`input ${errors.meetingDate ? 'border-red-500' : ''}`}
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
              {errors.meetingDate && <p className="text-red-500 text-sm mt-1">{errors.meetingDate}</p>}
            </div>
            <div>
              <label className="label">会议时间 *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="time"
                  className={`input pl-10 ${errors.meetingTime ? 'border-red-500' : ''}`}
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
              {errors.meetingTime && <p className="text-red-500 text-sm mt-1">{errors.meetingTime}</p>}
            </div>
          </div>
          
          <div>
            <label className="label">借用人 *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                className={`input pl-10 ${errors.borrower ? 'border-red-500' : ''}`}
                value={borrower}
                onChange={(e) => setBorrower(e.target.value)}
                placeholder="请输入您的姓名"
              />
            </div>
            {errors.borrower && <p className="text-red-500 text-sm mt-1">{errors.borrower}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">预计归还日期 *</label>
              <input
                type="date"
                className={`input ${errors.expectedReturnDate ? 'border-red-500' : ''}`}
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
              />
              {errors.expectedReturnDate && <p className="text-red-500 text-sm mt-1">{errors.expectedReturnDate}</p>}
            </div>
            <div>
              <label className="label">预计归还时间 *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="time"
                  className={`input pl-10 ${errors.expectedReturnTime ? 'border-red-500' : ''}`}
                  value={expectedReturnTime}
                  onChange={(e) => setExpectedReturnTime(e.target.value)}
                />
              </div>
              {errors.expectedReturnTime && <p className="text-red-500 text-sm mt-1">{errors.expectedReturnTime}</p>}
            </div>
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              checked={needSpareReceiver}
              onChange={(e) => setNeedSpareReceiver(e.target.checked)}
            />
            <div>
              <p className="font-medium text-slate-900">需要备用接收器</p>
              <p className="text-sm text-slate-500">如无线设备需要额外接收器备用，请勾选</p>
            </div>
          </label>
          
          {selectedHeadset && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>已选择：</strong>{selectedHeadset.brand} {selectedHeadset.model}
                （{selectedHeadset.serialNumber}）
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
            disabled={availableHeadsets.length === 0}
          >
            <Save className="w-4 h-4" />
            确认借用
          </button>
        </div>
      </form>
    </div>
  );
}
