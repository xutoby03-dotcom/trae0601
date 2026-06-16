import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  Package,
  Shield,
  Truck,
  AlertTriangle,
  CheckCircle,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  BUILDINGS,
  UNITS,
  FLOORS,
  calculateEstimatedWeight,
  getNextWeekDates,
  formatDisplayDate,
  cn
} from '../lib/utils';
import { reservationApi } from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import type { ConflictCheckResult, WeightCheckResult } from '../../shared/types';

interface FormData {
  building: string;
  unit: string;
  floor: number | '';
  movingCompany: string;
  vehicleInfo: string;
  estimatedItems: number | '';
  needsProtectionMat: boolean;
  date: string;
  startTime: string;
  endTime: string;
  elevatorId: string;
}

const initialFormData: FormData = {
  building: '',
  unit: '',
  floor: '',
  movingCompany: '',
  vehicleInfo: '',
  estimatedItems: '',
  needsProtectionMat: false,
  date: '',
  startTime: '',
  endTime: '',
  elevatorId: '',
};

export default function Reservation() {
  const navigate = useNavigate();
  const { elevators, fetchElevators, createReservation } = useAppStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);
  const [weightResult, setWeightResult] = useState<WeightCheckResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [checkingWeight, setCheckingWeight] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<{ id: string; building: string; unit: string; status?: string } | null>(null);

  const availableDates = getNextWeekDates();
  const estimatedWeight = formData.estimatedItems ? calculateEstimatedWeight(formData.estimatedItems) : 0;

  const filteredElevators = elevators.filter(e => {
    if (e.status !== 'active') return false;
    if (formData.building && e.building !== formData.building) return false;
    if (formData.needsProtectionMat && !e.allowsProtectionMat) return false;
    return true;
  });

  const selectedElevator = elevators.find(e => e.id === formData.elevatorId);
  const availableTimeSlots = selectedElevator?.timeSlots || [];

  useEffect(() => {
    fetchElevators();
  }, [fetchElevators]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (formData.elevatorId && formData.date && formData.startTime && formData.endTime) {
      setCheckingConflict(true);
      timeout = setTimeout(async () => {
        try {
          const result = await reservationApi.checkConflict({
            elevatorId: formData.elevatorId,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
          });
          setConflictResult(result);
        } catch (error) {
          setConflictResult({ hasConflict: true, message: (error as Error).message });
        } finally {
          setCheckingConflict(false);
        }
      }, 300);
    } else {
      setConflictResult(null);
    }
    
    return () => clearTimeout(timeout);
  }, [formData.elevatorId, formData.date, formData.startTime, formData.endTime]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (formData.elevatorId && estimatedWeight > 0) {
      setCheckingWeight(true);
      timeout = setTimeout(async () => {
        try {
          const result = await reservationApi.checkWeight({
            elevatorId: formData.elevatorId,
            estimatedWeight,
          });
          setWeightResult(result);
        } catch (error) {
          setWeightResult(null);
        } finally {
          setCheckingWeight(false);
        }
      }, 200);
    } else {
      setWeightResult(null);
    }
    
    return () => clearTimeout(timeout);
  }, [formData.elevatorId, estimatedWeight]);

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (field === 'building' || field === 'needsProtectionMat') {
      setFormData(prev => ({ ...prev, elevatorId: '', startTime: '', endTime: '' }));
    }
    
    if (field === 'elevatorId') {
      setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
    }
    
    if (field === 'startTime') {
      const slot = availableTimeSlots.find(s => s.startTime === value);
      if (slot) {
        setFormData(prev => ({ ...prev, endTime: slot.endTime }));
      }
    }
    
    setSuccess(false);
    setCreatedReservation(null);
  };

  const isFormValid = (): boolean => {
    if (!formData.building || !formData.unit || !formData.floor) return false;
    if (!formData.movingCompany || !formData.vehicleInfo) return false;
    if (!formData.estimatedItems || formData.estimatedItems < 1) return false;
    if (!formData.date || !formData.startTime || !formData.endTime) return false;
    if (!formData.elevatorId) return false;
    if (weightResult?.isOverloaded) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    try {
      const reservation = await createReservation({
        building: formData.building,
        unit: formData.unit,
        floor: formData.floor as number,
        movingCompany: formData.movingCompany,
        vehicleInfo: formData.vehicleInfo,
        estimatedItems: formData.estimatedItems as number,
        estimatedWeight,
        needsProtectionMat: formData.needsProtectionMat,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        elevatorId: formData.elevatorId,
        status: 'pending',
      });
      
      setSuccess(true);
      setCreatedReservation({
        id: reservation.id,
        building: reservation.building,
        unit: reservation.unit,
        status: reservation.status,
      });
      
      setTimeout(() => {
        setFormData(initialFormData);
        setConflictResult(null);
        setWeightResult(null);
      }, 100);
    } catch (error) {
      // Error is handled by store
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setConflictResult(null);
    setWeightResult(null);
    setSuccess(false);
    setCreatedReservation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-sky-600" />
            搬家预约申请
          </h1>
          <p className="text-slate-500 mt-1">填写以下信息预约货梯使用时段</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重置表单
        </button>
      </div>

      {success && createdReservation && (
        <div className={cn(
          "border rounded-xl p-6 flex items-start gap-4",
          createdReservation.status === 'conflict'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
        )}>
          {createdReservation.status === 'conflict' ? (
            <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
          )}
          <div>
            <h3 className={cn(
              "font-bold text-lg",
              createdReservation.status === 'conflict' ? 'text-amber-800' : 'text-green-800'
            )}>
              {createdReservation.status === 'conflict' ? '预约已提交，等待物业审核' : '预约成功！'}
            </h3>
            <p className={cn(
              "mt-1",
              createdReservation.status === 'conflict' ? 'text-amber-700' : 'text-green-700'
            )}>
              您的{createdReservation.building}{createdReservation.unit}搬家预约已提交，预约号：
              <span className="font-mono bg-white/50 px-2 py-1 rounded ml-1">{createdReservation.id}</span>
            </p>
            <p className={cn(
              "text-sm mt-2",
              createdReservation.status === 'conflict' ? 'text-amber-600' : 'text-green-600'
            )}>
              {createdReservation.status === 'conflict'
                ? '该时段已有其他预约，物业将尽快协调审核，请耐心等待结果。'
                : '请按时使用货梯，如需取消请联系物业。'
              }
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600" />
              房屋信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  楼栋 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.building}
                  onChange={(e) => handleInputChange('building', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                >
                  <option value="">请选择楼栋</option>
                  {BUILDINGS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  单元 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                >
                  <option value="">请选择单元</option>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  楼层 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                >
                  <option value="">请选择楼层</option>
                  {FLOORS.map(f => (
                    <option key={f} value={f}>{f}层</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" />
              搬家信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  搬家公司 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.movingCompany}
                  onChange={(e) => handleInputChange('movingCompany', e.target.value)}
                  placeholder="请输入搬家公司名称"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  车辆信息 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleInfo}
                  onChange={(e) => handleInputChange('vehicleInfo', e.target.value)}
                  placeholder="请输入车牌号，如：京A12345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  预计件数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedItems}
                  onChange={(e) => handleInputChange('estimatedItems', parseInt(e.target.value) || '')}
                  placeholder="请输入预计件数"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  预估重量
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 font-medium">
                    {estimatedWeight > 0 ? `${estimatedWeight} kg` : '请输入件数'}
                  </span>
                  <span className="text-xs text-slate-400">(按50kg/件估算)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.needsProtectionMat}
                  onChange={(e) => handleInputChange('needsProtectionMat', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-500 group-hover:text-sky-600 transition-colors" />
                  <span className="text-slate-700">需要电梯保护垫</span>
                </div>
                <span className="text-xs text-slate-400">(需收取押金200元，归还后退还)</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" />
              预约时段
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  预约日期 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  required
                >
                  <option value="">请选择日期</option>
                  {availableDates.map(d => (
                    <option key={d} value={d}>{formatDisplayDate(d)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  开始时间 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  disabled={!formData.elevatorId}
                  required
                >
                  <option value="">
                    {formData.elevatorId ? '请选择开始时间' : '请先选择电梯'}
                  </option>
                  {availableTimeSlots.map(slot => (
                    <option key={slot.id} value={slot.startTime}>
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  结束时间
                </label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-600 font-medium">
                    {formData.endTime || '自动匹配'}
                  </span>
                </div>
              </div>
            </div>
            {formData.elevatorId && availableTimeSlots.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">该电梯暂未设置可用时段，请联系物业或选择其他电梯。</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600" />
              选择电梯
            </h2>
            
            {!formData.building ? (
              <p className="text-slate-500 text-center py-8">请先选择楼栋以显示可用电梯</p>
            ) : filteredElevators.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-slate-600">当前条件下暂无可用电梯</p>
                {formData.needsProtectionMat && (
                  <p className="text-slate-500 text-sm mt-1">所选楼栋的电梯均不支持铺设保护垫</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredElevators.map(elevator => (
                  <label
                    key={elevator.id}
                    className={cn(
                      'relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                      formData.elevatorId === elevator.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="elevator"
                      value={elevator.id}
                      checked={formData.elevatorId === elevator.id}
                      onChange={(e) => handleInputChange('elevatorId', e.target.value)}
                      className="sr-only"
                    />
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      formData.elevatorId === elevator.id
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300'
                    )}>
                      {formData.elevatorId === elevator.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 truncate">{elevator.name}</span>
                        <StatusBadge status={elevator.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>载重: {elevator.maxLoad}kg</span>
                        <span>护板: {elevator.allowsProtectionMat ? '支持' : '不支持'}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="font-semibold text-slate-800 mb-4">预约检查</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">时段冲突</span>
                  {checkingConflict ? (
                    <span className="text-xs text-slate-400">检测中...</span>
                  ) : conflictResult ? (
                    conflictResult.hasConflict ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        有冲突
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        可用
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">请选择时段</span>
                  )}
                </div>
                {conflictResult?.message && (
                  <p className="text-xs text-slate-500">{conflictResult.message}</p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">载重检查</span>
                  {checkingWeight ? (
                    <span className="text-xs text-slate-400">检测中...</span>
                  ) : weightResult ? (
                    weightResult.isOverloaded ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        超载
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        正常
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">请选择电梯</span>
                  )}
                </div>
                {weightResult?.message && (
                  <p className="text-xs text-slate-500">{weightResult.message}</p>
                )}
              </div>

              {formData.needsProtectionMat && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <Shield className="w-4 h-4 inline mr-1" />
                    需收取保护垫押金 ¥200
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid()}
              className={cn(
                'w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200',
                isFormValid()
                  ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg hover:shadow-xl active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              <Send className="w-5 h-5" />
              提交预约申请
            </button>
            
            {!isFormValid() && (
              <p className="text-xs text-slate-400 text-center mt-2">
                请完善所有必填项并确保无冲突
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
