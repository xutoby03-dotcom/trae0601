import { useEffect, useState, useMemo } from 'react';
import {
  ShoppingBag, CheckCircle, XCircle, AlertTriangle, Package, Users,
  Search, ChefHat, Coffee, Utensils, ClipboardList, Send, RefreshCcw
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

interface AssignmentRecord {
  id: string;
  boxId: string;
  boxNumber: string;
  riderId: string;
  riderName: string;
  orderType: OrderType;
  assignedAt: string;
  date: string;
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  hot_food: '热食',
  cold_drink: '冷饮',
  other: '其他',
};

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
  const [assignmentRecords, setAssignmentRecords] = useState<AssignmentRecord[]>([]);
  const [assignedBoxIds, setAssignedBoxIds] = useState<Set<string>>(new Set());
  const [recordOrderType, setRecordOrderType] = useState<OrderType | 'all'>('all');

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
    const assigned = Array.from(assignedBoxIds).filter(id =>
      filteredBoxes.some(b => b.id === id)
    ).length;
    return { total, allowed, denied, assigned };
  }, [filteredBoxes, assignmentResults, assignedBoxIds]);

  const filteredRecords = useMemo(() => {
    return assignmentRecords.filter(record => {
      const matchDate = record.date === selectedDate;
      const matchType = recordOrderType === 'all' || record.orderType === recordOrderType;
      return matchDate && matchType;
    });
  }, [assignmentRecords, selectedDate, recordOrderType]);

  const getRiderName = (riderId: string) => {
    return riders.find(r => r.id === riderId)?.name || '未分配';
  };

  const handleAssign = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (!box) return;

    const rider = riders.find(r => r.id === box.riderId);
    const now = new Date();

    const record: AssignmentRecord = {
      id: `assign-${now.getTime()}`,
      boxId,
      boxNumber: box.boxNumber,
      riderId: box.riderId,
      riderName: rider?.name || '未分配',
      orderType,
      assignedAt: now.toISOString(),
      date: selectedDate,
    };

    setAssignmentRecords(prev => [record, ...prev]);
    setAssignedBoxIds(prev => new Set(prev).add(boxId));
  };

  const handleClearAssignments = () => {
    setAssignmentRecords([]);
    setAssignedBoxIds(new Set());
  };

  const OrderIcon = orderTypeIcons[orderType];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单分配校验</h1>
          <p className="text-sm text-gray-500 mt-1">检查保温箱是否符合订单分配条件</p>
        </div>
        {assignmentRecords.length > 0 && (
          <Button variant="secondary" onClick={handleClearAssignments}>
            <RefreshCcw className="w-4 h-4" />
            清空分配记录
          </Button>
        )}
      </div>

      {orderType === 'hot_food' && stats.denied > 0 && (
        <AlertBanner
          type="error"
          title="热食订单分配限制"
          message={`有 ${stats.denied} 个保温箱不符合热食订单分配条件，请先完成清洁或处理异常`}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
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
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已分配</p>
              <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredBoxes.map((box) => {
              const result = assignmentResults.get(box.id) || { allowed: false, reason: '校验中...' };
              const isForcedCheck = orderType !== 'hot_food';
              const finalAllowed = isForcedCheck || result.allowed;
              const isAssigned = assignedBoxIds.has(box.id);
              const canShowAssignButton = finalAllowed && !isAssigned;

              return (
                <tr key={box.id} className={`transition-colors ${isAssigned ? 'bg-purple-50/50' : 'hover:bg-gray-50'}`}>
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
                      <span className="text-sm text-gray-900">{ORDER_TYPE_LABELS[orderType]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAssigned ? (
                      <div className="flex items-center gap-2 text-purple-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">已分配</span>
                      </div>
                    ) : finalAllowed ? (
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
                    {isAssigned ? (
                      <span className="text-sm text-purple-600">已成功分配订单</span>
                    ) : finalAllowed ? (
                      <span className="text-sm text-green-600">符合分配条件</span>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600">{result.reason}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canShowAssignButton && (
                      <Button size="sm" onClick={() => handleAssign(box.id)}>
                        <Send className="w-3.5 h-3.5" />
                        分配
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredBoxes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  没有找到匹配的箱子
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            分配记录
            <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
              {filteredRecords.length} 条
            </span>
          </h3>
          <div className="w-40">
            <Select
              value={recordOrderType}
              onChange={(e) => setRecordOrderType(e.target.value as OrderType | 'all')}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'hot_food', label: '热食订单' },
                { value: 'cold_drink', label: '冷饮订单' },
                { value: 'other', label: '其他订单' },
              ]}
            />
          </div>
        </div>
        {filteredRecords.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredRecords.map((record) => {
              const RecordIcon = orderTypeIcons[record.orderType];
              return (
                <div key={record.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <RecordIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{record.boxNumber}</span>
                        <StatusBadge status="active" label={ORDER_TYPE_LABELS[record.orderType]} />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        骑手：{record.riderName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium">分配成功</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(record.assignedAt, 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              {selectedDate} 暂无{recordOrderType !== 'all' ? ORDER_TYPE_LABELS[recordOrderType as OrderType] : ''}分配记录
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
