import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Send,
  Search,
  Building2,
  MapPin,
  Truck,
  Package,
  Clock
} from 'lucide-react';
import { useAppStore } from '../store';
import { getWallDamageLabel, getDepositStatusLabel, cn } from '../lib/utils';
import StatusBadge from '../components/StatusBadge';
import type { Reservation, CompletionRecord } from '../../shared/types';

interface FormData {
  reservationId: string;
  protectionMatReturned: boolean;
  wallDamage: 'none' | 'minor' | 'major';
  wallDamageDescription: string;
  depositStatus: 'collected' | 'refunded' | 'deducted';
  depositAmount: number | '';
  needsInspection: boolean;
}

const initialFormData: FormData = {
  reservationId: '',
  protectionMatReturned: true,
  wallDamage: 'none',
  wallDamageDescription: '',
  depositStatus: 'collected',
  depositAmount: 200,
  needsInspection: false,
};

export default function Completion() {
  const { reservations, fetchReservations, createCompletionRecord } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [success, setSuccess] = useState(false);
  const [existingRecord, setExistingRecord] = useState<CompletionRecord | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const activeReservations = reservations.filter(r => 
    r.status !== 'completed' && r.status !== 'cancelled'
  );

  const filteredReservations = activeReservations.filter(r => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.building.toLowerCase().includes(query) ||
      r.unit.toLowerCase().includes(query) ||
      r.floor.toString().includes(query) ||
      r.movingCompany.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query)
    );
  });

  const handleSelectReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      ...initialFormData,
      reservationId: reservation.id,
      depositAmount: reservation.needsProtectionMat ? 200 : '',
    });
    setSuccess(false);
    setExistingRecord(null);
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'wallDamage' && value !== 'none') {
      setFormData(prev => ({ ...prev, needsInspection: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reservationId) return;
    
    try {
      await createCompletionRecord({
        reservationId: formData.reservationId,
        protectionMatReturned: formData.protectionMatReturned,
        wallDamage: formData.wallDamage,
        wallDamageDescription: formData.wallDamageDescription || undefined,
        depositStatus: formData.depositStatus,
        depositAmount: formData.depositAmount || undefined,
        needsInspection: formData.needsInspection,
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSelectedReservation(null);
        setFormData(initialFormData);
        fetchReservations();
      }, 2000);
    } catch (error) {
      // Error handled by store
    }
  };

  const loadExistingRecord = async (reservationId: string) => {
    try {
      const { completionApi } = await import('../lib/api');
      const record = await completionApi.getByReservationId(reservationId);
      setExistingRecord(record);
    } catch (error) {
      setExistingRecord(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-sky-600" />
          搬家完成记录
        </h1>
        <p className="text-slate-500 mt-1">记录护板归还、墙面磕碰和押金状态</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium text-green-800">完成记录已提交</p>
            <p className="text-sm text-green-600">系统已自动生成巡检任务（如需）</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3">选择预约</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索楼栋、单元、搬家公司..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredReservations.length > 0 ? (
                filteredReservations.map(reservation => (
                  <button
                    key={reservation.id}
                    onClick={() => handleSelectReservation(reservation)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      selectedReservation?.id === reservation.id
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {reservation.building} {reservation.unit} {reservation.floor}层
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {reservation.date} {reservation.startTime}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {reservation.movingCompany}
                        </p>
                      </div>
                      <StatusBadge status={reservation.status} className="text-xs" />
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8 text-sm">
                  暂无进行中的预约
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedReservation ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-600" />
                  预约详情
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">位置</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {selectedReservation.building} {selectedReservation.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">楼层</span>
                    <p className="font-medium text-slate-800 mt-1">{selectedReservation.floor}层</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">时段</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {selectedReservation.startTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">电梯</span>
                    <p className="font-medium text-slate-800 mt-1">
                      {selectedReservation.elevator?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">搬家公司</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1 mt-1">
                      <Truck className="w-4 h-4 text-slate-400" />
                      {selectedReservation.movingCompany}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">车辆</span>
                    <p className="font-medium text-slate-800 mt-1">{selectedReservation.vehicleInfo}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">物品</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1 mt-1">
                      <Package className="w-4 h-4 text-slate-400" />
                      {selectedReservation.estimatedItems}件
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">保护垫</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1 mt-1">
                      <Shield className={cn(
                        'w-4 h-4',
                        selectedReservation.needsProtectionMat ? 'text-amber-500' : 'text-slate-300'
                      )} />
                      {selectedReservation.needsProtectionMat ? '需要' : '不需要'}
                    </p>
                  </div>
                </div>
              </div>

              {existingRecord ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">已有完成记录</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-blue-600">保护垫归还</span>
                      <p className="font-medium text-blue-800 mt-1">
                        {existingRecord.protectionMatReturned ? '已归还' : '未归还'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-600">墙面磕碰</span>
                      <p className="font-medium text-blue-800 mt-1">
                        {getWallDamageLabel(existingRecord.wallDamage)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-600">押金状态</span>
                      <p className="font-medium text-blue-800 mt-1">
                        {getDepositStatusLabel(existingRecord.depositStatus)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-blue-600">押金金额</span>
                      <p className="font-medium text-blue-800 mt-1">
                        {existingRecord.depositAmount ? `¥${existingRecord.depositAmount}` : '-'}
                      </p>
                    </div>
                    {existingRecord.wallDamageDescription && (
                      <div className="col-span-2">
                        <span className="text-xs text-blue-600">磕碰描述</span>
                        <p className="font-medium text-blue-800 mt-1">
                          {existingRecord.wallDamageDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-sky-600" />
                      保护垫归还
                    </h3>
                    
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="protectionMat"
                          checked={formData.protectionMatReturned}
                          onChange={() => handleInputChange('protectionMatReturned', true)}
                          className="w-5 h-5 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700">已归还</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="protectionMat"
                          checked={!formData.protectionMatReturned}
                          onChange={() => handleInputChange('protectionMatReturned', false)}
                          className="w-5 h-5 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700">未归还</span>
                      </label>
                    </div>
                    
                    {!formData.protectionMatReturned && selectedReservation.needsProtectionMat && (
                      <p className="text-sm text-amber-600 mt-3 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        保护垫未归还，押金将被扣除
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-sky-600" />
                      墙面磕碰检查
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {(['none', 'minor', 'major'] as const).map(damage => (
                        <label
                          key={damage}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all',
                            formData.wallDamage === damage
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <input
                            type="radio"
                            name="wallDamage"
                            value={damage}
                            checked={formData.wallDamage === damage}
                            onChange={() => handleInputChange('wallDamage', damage)}
                            className="sr-only"
                          />
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            damage === 'none' ? 'bg-green-100' :
                            damage === 'minor' ? 'bg-amber-100' : 'bg-red-100'
                          )}>
                            {damage === 'none' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertTriangle className={cn(
                                'w-5 h-5',
                                damage === 'minor' ? 'text-amber-600' : 'text-red-600'
                              )} />
                            )}
                          </div>
                          <span className="font-medium text-slate-700">
                            {getWallDamageLabel(damage)}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    {formData.wallDamage !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          磕碰描述
                        </label>
                        <textarea
                          value={formData.wallDamageDescription}
                          onChange={(e) => handleInputChange('wallDamageDescription', e.target.value)}
                          placeholder="请描述磕碰位置和程度..."
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-sky-600" />
                      押金管理
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          押金金额 (元)
                        </label>
                        <input
                          type="number"
                          value={formData.depositAmount}
                          onChange={(e) => handleInputChange('depositAmount', parseInt(e.target.value) || '')}
                          placeholder="请输入押金金额"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          押金状态
                        </label>
                        <select
                          value={formData.depositStatus}
                          onChange={(e) => handleInputChange('depositStatus', e.target.value as FormData['depositStatus'])}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                          <option value="collected">已收取</option>
                          <option value="refunded">已退还</option>
                          <option value="deducted">已扣除</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.needsInspection}
                          onChange={(e) => handleInputChange('needsInspection', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700">需要安排巡检</span>
                        {formData.wallDamage !== 'none' && (
                          <span className="text-xs text-amber-600">(有磕碰时自动开启)</span>
                        )}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                    提交完成记录
                  </button>
                </>
              )}
            </form>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-600">请从左侧选择一个预约</p>
              <p className="text-sm text-slate-400 mt-1">
                选择后可填写搬家完成记录
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
