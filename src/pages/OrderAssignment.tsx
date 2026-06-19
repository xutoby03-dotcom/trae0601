import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag, CheckCircle, XCircle, AlertTriangle, Package, Users,
  Search, ChefHat, Coffee, Utensils
} from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useCleaningStore } from '../store/useCleaningStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AlertBanner } from '../components/ui/AlertBanner';
import { formatDate, getTodayString } from '../utils/helpers';
import { canAssignHotFood } from '../utils/businessRules';
import { BOX_STATUS_LABELS, USAGE_TYPE_LABELS, type OrderType } from '../types';

const orderTypeIcons = {
  hot_food: ChefHat,
  cold_drink: Coffee,
  other: Utensils,
};

export function OrderAssignment() {
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { cleaningRecords, fetchCleaningRecords } = useCleaningStore();
  const { maintenanceRecords, fetchMaintenanceRecords } = useMaintenanceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('hot_food');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [assignmentResults, setAssignmentResults] = useState<Map<string, { allowed: boolean; reason: string }>>(new Map());

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchCleaningRecords();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchCleaningRecords, fetchMaintenanceRecords]);

  const activeBoxes = useMemo(() => {
    return boxes.filter(b => b.status !== 'scrapped');
  }, [boxes]);

  const filteredBoxes = useMemo(() => {
    return activeBoxes.filter(box => {
      const rider = riders.find(r => r.id === box.riderId);
      const matchesSearch = box.boxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rider?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [activeBoxes, riders, searchTerm]);

  const checkAllAssignments = () => {
    const results = new Map<string, { allowed: boolean; reason: string }>();
    filteredBoxes.forEach(box => {
      const result = canAssignHotFood(box.id, boxes, cleaningRecords, maintenanceRecords, selectedDate);
      results.set(box.id, result);
    });
    setAssignmentResults(results);
  };

  useEffect(() => {
    checkAllAssignments();
  }, [orderType, selectedDate]);

  const stats = useMemo(() => {
    const total = filteredBoxes.length;
    const allowed = Array.from(assignmentResults.values()).filter(r => r.allowed).length;
    const denied = total - allowed;
    return { total, allowed, denied };
  }, [filteredBoxes, assignmentResults]);

  const getRiderName = (riderId: string) => {
    return riders.find(r => r.id === riderId)?.name || '未分配';
  };

  const OrderIcon = orderTypeIcons[orderType];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单分配校验</h1>
          <p className="text-sm text-gray-500 mt-1">检查保温箱是否符合订单分配条件</p>
        </div>
      </div>

      {orderType === 'hot_food' && stats.denied > 0 && (
        <AlertBanner
          type="error"
          title="热食订单分配限制"
          message={`有 ${stats.denied} 个保温箱不符合热食订单分配条件，请先完成清洁或处理异常`}
        />
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">可用箱子</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">可分配</p>
              <p className="text-2xl font-bold text-green-600">{stats.allowed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">禁止分配</p>
              <p className="text-2xl font-bold text-red-600">{stats.denied}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <Select
              label="订单类型"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
              options={[
                { value: 'hot_food', label: '热食订单' },
                { value: 'cold_drink', label: '冷饮订单' },
                { value: 'other', label: '其他订单' },
              ]}
            />
          </div>
          <div className="w-48">
            <Input
              label="选择日期"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="搜索箱子编号、骑手姓名"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button onClick={checkAllAssignments}>
            <Search className="w-4 h-4" />
            重新校验
          </Button>
        </div>
      </div>

      {orderType === 'hot_food' && (
        <AlertBanner
          type="info"
          title="热食订单分配规则"
          message="热食订单必须分配给已完成今日全部6项清洁步骤且无未解决异常的保温箱，以确保食品安全"
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">箱子</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">骑手</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用途</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">箱子状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分配校验</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原因</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBoxes.map((box) => {
              const result = assignmentResults.get(box.id) || { allowed: false, reason: '校验中...' };
              const isForcedCheck = orderType !== 'hot_food';
              const finalAllowed = isForcedCheck || result.allowed;

              return (
                <tr key={box.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={box.photoUrl}
                        alt={box.boxNumber}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-900">{box.boxNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{getRiderName(box.riderId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{USAGE_TYPE_LABELS[box.usageType]}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={box.status} label={BOX_STATUS_LABELS[box.status]} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <OrderIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-900">
                        {orderType === 'hot_food' ? '热食' : orderType === 'cold_drink' ? '冷饮' : '其他'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {finalAllowed ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">可分配</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">禁止分配</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {finalAllowed ? (
                      <span className="text-sm text-green-600">符合分配条件</span>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600">{result.reason}</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredBoxes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  没有找到匹配的箱子
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
