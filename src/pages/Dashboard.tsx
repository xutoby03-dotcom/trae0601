import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  Search,
  Check,
  X,
  Building2,
  MapPin,
  User,
  Truck,
  Package,
  Shield,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store';
import { formatDisplayDate, getTodayDate, cn } from '../lib/utils';
import StatusBadge from '../components/StatusBadge';
import type { Reservation } from '../../shared/types';

interface ExtendedInspection {
  id: string;
  reservationId: string;
  floor: number;
  unit: string;
  status: 'pending' | 'completed';
  building?: string;
  notes?: string;
  createdAt?: string;
  needsProtectionMat?: boolean;
  protectionMatReturned?: boolean;
  wallDamage?: string;
  wallDamageDescription?: string;
  depositStatus?: string;
  depositAmount?: number;
}

export default function Dashboard() {
  const {
    todayReservations,
    reservations,
    pendingInspections,
    fetchTodayReservations,
    fetchReservations,
    fetchPendingInspections,
    approveReservation,
    cancelReservation,
    completeInspection,
    setError
  } = useAppStore();
  
  const [selectedTab, setSelectedTab] = useState<'timeline' | 'conflicts' | 'inspections'>('timeline');
  const [filterDate, setFilterDate] = useState(getTodayDate());
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [inspectionForm, setInspectionForm] = useState({
    wallDamage: 'none' as 'none' | 'minor' | 'major',
    wallDamageDescription: '',
    protectionMatReturned: true,
    depositStatus: 'refunded' as 'collected' | 'refunded' | 'deducted',
    notes: '',
  });

  useEffect(() => {
    fetchTodayReservations();
    fetchReservations();
    fetchPendingInspections();
  }, [fetchTodayReservations, fetchReservations, fetchPendingInspections]);

  const conflictReservations = reservations.filter(r => r.status === 'conflict');
  
  const approvedToday = todayReservations.filter(r => r.status === 'approved').length;
  const completedToday = todayReservations.filter(r => r.status === 'completed').length;
  const pendingCount = pendingInspections.length;

  const handleApproveReservation = async (id: string) => {
    if (!confirm('确定要通过这个预约申请吗？通过后将占用该时段。')) {
      return;
    }
    try {
      await approveReservation(id);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('确定要取消这个预约申请吗？')) {
      return;
    }
    try {
      await cancelReservation(id);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleOpenInspection = (inspection: ExtendedInspection) => {
    setActiveInspectionId(inspection.id);
    setInspectionForm({
      wallDamage: (inspection.wallDamage as 'none' | 'minor' | 'major') || 'none',
      wallDamageDescription: inspection.wallDamageDescription || '',
      protectionMatReturned: inspection.protectionMatReturned !== undefined ? inspection.protectionMatReturned : true,
      depositStatus: (inspection.depositStatus as 'collected' | 'refunded' | 'deducted') || 'refunded',
      notes: inspection.notes || '',
    });
  };

  const handleCloseInspection = () => {
    setActiveInspectionId(null);
  };

  const handleSubmitInspection = async () => {
    if (!activeInspectionId) return;
    try {
      await completeInspection(activeInspectionId, {
        wallDamage: inspectionForm.wallDamage,
        wallDamageDescription: inspectionForm.wallDamageDescription || undefined,
        protectionMatReturned: inspectionForm.protectionMatReturned,
        depositStatus: inspectionForm.depositStatus,
        notes: inspectionForm.notes || undefined,
      });
      setActiveInspectionId(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const getTimeSlotPosition = (startTime: string): number => {
    const [hours] = startTime.split(':').map(Number);
    return Math.max(0, (hours - 8) * 60);
  };

  const getDurationHeight = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(60, endMinutes - startMinutes);
  };

  const timeSlots = [];
  for (let h = 8; h <= 21; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-sky-600" />
            物业看板
          </h1>
          <p className="text-slate-500 mt-1">今日排期、冲突申请和待巡检楼层管理</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border-none focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={() => {
              fetchTodayReservations();
              fetchReservations({ date: filterDate });
              fetchPendingInspections();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">今日预约</p>
              <p className="text-2xl font-bold text-slate-800">{todayReservations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已确认</p>
              <p className="text-2xl font-bold text-green-600">{approvedToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待处理冲突</p>
              <p className="text-2xl font-bold text-red-600">{conflictReservations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待巡检</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSelectedTab('timeline')}
            className={cn(
              'flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2',
              selectedTab === 'timeline'
                ? 'text-sky-600 border-sky-600 bg-sky-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <Clock className="w-5 h-5" />
            今日排期
          </button>
          <button
            onClick={() => setSelectedTab('conflicts')}
            className={cn(
              'flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2',
              selectedTab === 'conflicts'
                ? 'text-sky-600 border-sky-600 bg-sky-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <AlertTriangle className="w-5 h-5" />
            冲突申请
            {conflictReservations.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {conflictReservations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('inspections')}
            className={cn(
              'flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2',
              selectedTab === 'inspections'
                ? 'text-sky-600 border-sky-600 bg-sky-50/50'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <Search className="w-5 h-5" />
            待巡检楼层
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="p-6">
          {selectedTab === 'timeline' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-700">
                  {formatDisplayDate(filterDate)} 排期
                </h3>
                {todayReservations.length === 0 && (
                  <p className="text-sm text-slate-500">今日暂无预约</p>
                )}
              </div>
              
              {todayReservations.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-16 top-0 bottom-0 w-px bg-slate-200" />
                  
                  <div className="space-y-1">
                    {timeSlots.map(time => (
                      <div key={time} className="flex h-16">
                        <div className="w-16 pr-4 text-right">
                          <span className="text-sm text-slate-400 font-mono">{time}</span>
                        </div>
                        <div className="flex-1 border-t border-dashed border-slate-100" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute top-0 left-16 right-0 pl-4">
                    {todayReservations.map((reservation, index) => (
                      <div
                        key={reservation.id}
                        className={cn(
                          'absolute left-4 right-4 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer',
                          reservation.status === 'completed'
                            ? 'bg-blue-50 border-blue-200'
                            : reservation.status === 'conflict'
                            ? 'bg-red-50 border-red-300 border-2'
                            : 'bg-sky-50 border-sky-200'
                        )}
                        style={{
                          top: `${getTimeSlotPosition(reservation.startTime)}px`,
                          height: `${getDurationHeight(reservation.startTime, reservation.endTime)}px`,
                        }}
                      >
                        <div className="flex items-start justify-between h-full">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800 text-sm truncate">
                                {reservation.building} {reservation.unit} {reservation.floor}层
                              </span>
                              <StatusBadge status={reservation.status} />
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {reservation.elevator?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {reservation.movingCompany}
                              </span>
                            </div>
                          </div>
                          {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleCancelReservation(reservation.id)}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                                title="取消预约"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-lg">今日暂无预约排期</p>
                  <p className="text-sm">选择其他日期查看</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'conflicts' && (
            <div className="space-y-4">
              {conflictReservations.length > 0 ? (
                conflictReservations.map(reservation => (
                  <div
                    key={reservation.id}
                    className="bg-red-50 border border-red-200 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {reservation.building} {reservation.unit} {reservation.floor}层
                            </h4>
                            <p className="text-sm text-slate-500">
                              预约时间: {reservation.date} {reservation.startTime} - {reservation.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">搬家公司:</span>
                            <p className="font-medium text-slate-800">{reservation.movingCompany}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">车辆:</span>
                            <p className="font-medium text-slate-800">{reservation.vehicleInfo}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">预计件数:</span>
                            <p className="font-medium text-slate-800">{reservation.estimatedItems} 件 ({reservation.estimatedWeight}kg)</p>
                          </div>
                          <div>
                            <span className="text-slate-500">保护垫:</span>
                            <p className="font-medium text-slate-800">{reservation.needsProtectionMat ? '需要' : '不需要'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveReservation(reservation.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" />
                          人工通过
                        </button>
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Check className="w-16 h-16 text-green-300 mx-auto mb-3" />
                  <p className="text-lg">暂无冲突申请</p>
                  <p className="text-sm">所有预约均正常</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'inspections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingInspections.length > 0 ? (
                pendingInspections.map(inspection => {
                  const extInspection = inspection as ExtendedInspection;
                  const isActive = activeInspectionId === inspection.id;
                  return (
                    <div
                      key={inspection.id}
                      className={cn(
                        'rounded-xl border transition-all',
                        isActive
                          ? 'bg-white border-sky-300 shadow-lg ring-1 ring-sky-200 col-span-1 md:col-span-2 lg:col-span-3'
                          : 'bg-amber-50 border-amber-200 hover:border-amber-300 cursor-pointer'
                      )}
                    >
                      {!isActive ? (
                        <div
                          className="p-5"
                          onClick={() => handleOpenInspection(extInspection)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Search className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">
                                  {extInspection.building || ''} {inspection.unit}
                                </h4>
                                <p className="text-sm text-slate-500">{inspection.floor}层</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded-full">
                              待巡检
                            </span>
                          </div>
                          
                          {extInspection.notes && (
                            <p className="text-sm text-slate-600 bg-white rounded-lg p-3 mb-4">
                              {extInspection.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-sm text-amber-700">
                            <Shield className={cn('w-4 h-4', extInspection.needsProtectionMat ? 'text-amber-500' : 'text-slate-300')} />
                            <span>{extInspection.needsProtectionMat ? '需要检查护板归还' : '无需护板'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                <Search className="w-5 h-5 text-sky-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">
                                  {extInspection.building || ''} {inspection.unit} {inspection.floor}层
                                </h4>
                                <p className="text-sm text-slate-500">填写巡检结果</p>
                              </div>
                            </div>
                            <button
                              onClick={handleCloseInspection}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-500" />
                                护板归还
                              </h4>
                              {extInspection.needsProtectionMat ? (
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer bg-white hover:bg-slate-50 border-slate-200">
                                    <input
                                      type="radio"
                                      name={`mat-${inspection.id}`}
                                      checked={inspectionForm.protectionMatReturned}
                                      onChange={() => setInspectionForm(f => ({ ...f, protectionMatReturned: true }))}
                                      className="text-sky-600"
                                    />
                                    <span className="text-sm text-slate-700">已归还</span>
                                  </label>
                                  <label className="flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer bg-white hover:bg-slate-50 border-slate-200">
                                    <input
                                      type="radio"
                                      name={`mat-${inspection.id}`}
                                      checked={!inspectionForm.protectionMatReturned}
                                      onChange={() => setInspectionForm(f => ({ ...f, protectionMatReturned: false }))}
                                      className="text-sky-600"
                                    />
                                    <span className="text-sm text-slate-700">未归还</span>
                                  </label>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 p-3 bg-slate-50 rounded-lg">无需护板</p>
                              )}

                              <h4 className="font-medium text-slate-700 mt-5 mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-500" />
                                押金状态
                              </h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'refunded' as const, label: '已退还', color: 'text-green-700' },
                                  { value: 'deducted' as const, label: '已扣款', color: 'text-red-700' },
                                  { value: 'collected' as const, label: '已收取', color: 'text-amber-700' },
                                ].map(opt => (
                                  <label key={opt.value} className={cn(
                                    'flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer bg-white hover:bg-slate-50',
                                    inspectionForm.depositStatus === opt.value ? 'border-sky-300 ring-1 ring-sky-200' : 'border-slate-200'
                                  )}>
                                    <input
                                      type="radio"
                                      name={`deposit-${inspection.id}`}
                                      checked={inspectionForm.depositStatus === opt.value}
                                      onChange={() => setInspectionForm(f => ({ ...f, depositStatus: opt.value }))}
                                      className="text-sky-600"
                                    />
                                    <span className={cn('text-sm', opt.color)}>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-orange-500" />
                                墙面情况
                              </h4>
                              <div className="space-y-2">
                                {[
                                  { value: 'none' as const, label: '完好无损', desc: '墙面无任何损坏', color: 'border-green-200 bg-green-50' },
                                  { value: 'minor' as const, label: '轻微刮擦', desc: '小面积划痕或擦伤', color: 'border-amber-200 bg-amber-50' },
                                  { value: 'major' as const, label: '明显损坏', desc: '大面积破损或凹陷', color: 'border-red-200 bg-red-50' },
                                ].map(opt => (
                                  <label key={opt.value} className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                                    inspectionForm.wallDamage === opt.value
                                      ? `${opt.color} ring-1 ring-sky-200`
                                      : 'bg-white border-slate-200 hover:bg-slate-50'
                                  )}>
                                    <input
                                      type="radio"
                                      name={`wall-${inspection.id}`}
                                      checked={inspectionForm.wallDamage === opt.value}
                                      onChange={() => setInspectionForm(f => ({ ...f, wallDamage: opt.value }))}
                                      className="text-sky-600 mt-0.5"
                                    />
                                    <div>
                                      <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                                      <p className="text-xs text-slate-400">{opt.desc}</p>
                                    </div>
                                  </label>
                                ))}
                              </div>

                              {inspectionForm.wallDamage !== 'none' && (
                                <div className="mt-3">
                                  <label className="text-sm text-slate-600 mb-1 block">损坏描述</label>
                                  <textarea
                                    value={inspectionForm.wallDamageDescription}
                                    onChange={e => setInspectionForm(f => ({ ...f, wallDamageDescription: e.target.value }))}
                                    placeholder="请描述墙面损坏的具体位置和程度"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-violet-500" />
                                巡检备注
                              </h4>
                              <textarea
                                value={inspectionForm.notes}
                                onChange={e => setInspectionForm(f => ({ ...f, notes: e.target.value }))}
                                placeholder="填写巡检备注信息..."
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                              />

                              <div className="mt-6 flex gap-3">
                                <button
                                  onClick={handleSubmitInspection}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  <Check className="w-4 h-4" />
                                  确认完成
                                </button>
                                <button
                                  onClick={handleCloseInspection}
                                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-16 text-slate-500">
                  <Check className="w-16 h-16 text-green-300 mx-auto mb-3" />
                  <p className="text-lg">暂无待巡检楼层</p>
                  <p className="text-sm">所有巡检任务已完成</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-sky-600" />
          今日预约详情
        </h3>
        
        {todayReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">房号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">时段</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">电梯</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">搬家公司</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">物品</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">保护垫</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {todayReservations.map(reservation => (
                  <tr key={reservation.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {reservation.building} {reservation.unit} {reservation.floor}层
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {reservation.startTime} - {reservation.endTime}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {reservation.elevator?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400" />
                        {reservation.movingCompany}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-slate-400" />
                        {reservation.estimatedItems}件 / {reservation.estimatedWeight}kg
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Shield className={cn(
                          'w-4 h-4',
                          reservation.needsProtectionMat ? 'text-amber-500' : 'text-slate-300'
                        )} />
                        <span className={reservation.needsProtectionMat ? 'text-amber-600' : 'text-slate-400'}>
                          {reservation.needsProtectionMat ? '需要' : '不需要'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={reservation.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">今日暂无预约</p>
        )}
      </div>
    </div>
  );
}
