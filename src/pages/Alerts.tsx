import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, Clock, Search, Filter, AlertCircle, Package } from 'lucide-react';
import { useAppStore } from '@/store';
import { AlertCard } from '@/components/AlertCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/PhotoUpload';
import type { Alert, AlertType, CreateReplenishmentRequest } from '../../shared/types';

type FilterType = 'all' | 'low_stock' | 'abnormal_consumption';
type FilterStatus = 'all' | 'unresolved' | 'resolved';

export default function Alerts() {
  const { alerts, printers, loading, fetchAlerts, fetchPrinters, addReplenishment } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [formData, setFormData] = useState<CreateReplenishmentRequest>({
    printerId: '',
    supplier: '',
    boxCount: 1,
    unitPrice: 0,
    photoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const suppliers = ['亚太森博', 'Double A', '天章纸业', '金光纸业', 'UPM', '其他'];

  useEffect(() => {
    fetchAlerts();
    fetchPrinters();
  }, []);

  const handleOpenReplenish = (alert: Alert) => {
    const printer = printers.find((p) => p.id === alert.printerId);
    if (!printer) return;

    const gap = Math.max(1, printer.minStock - printer.currentStock);
    const defaultBoxes = Math.max(1, Math.ceil(gap / 10));

    setFormData({
      printerId: printer.id,
      supplier: '',
      boxCount: defaultBoxes,
      unitPrice: 0,
      photoUrl: '',
    });
    setErrors({});
    setShowReplenishModal(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.printerId) newErrors.printerId = '请选择打印点';
    if (!formData.supplier.trim()) newErrors.supplier = '请输入供应商';
    if (!formData.boxCount || formData.boxCount <= 0) newErrors.boxCount = '请输入有效箱数';
    if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = '请输入有效单价';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReplenish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addReplenishment(formData);
      setShowReplenishModal(false);
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    }
  };

  const unresolvedAlerts = alerts.filter((a) => !a.isResolved);
  const lowStockAlerts = alerts.filter((a) => a.type === 'low_stock');
  const abnormalAlerts = alerts.filter((a) => a.type === 'abnormal_consumption');
  const resolvedAlerts = alerts.filter((a) => a.isResolved);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      (alert.printerLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all' || alert.type === filterType;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'unresolved' && !alert.isResolved) ||
      (filterStatus === 'resolved' && alert.isResolved);

    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预警中心</h1>
          <p className="text-gray-500 mt-1">查看和处理库存预警与异常领用</p>
        </div>
        {unresolvedAlerts.length > 0 && (
          <Badge variant="danger" className="text-sm px-3 py-1.5">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {unresolvedAlerts.length} 条待处理
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500">待处理预警</p>
          </div>
          <p className="text-2xl font-bold font-mono text-orange-600">
            {unresolvedAlerts.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-500">低库存预警</p>
          </div>
          <p className="text-2xl font-bold font-mono text-red-600">
            {lowStockAlerts.filter((a) => !a.isResolved).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">异常领用</p>
          </div>
          <p className="text-2xl font-bold font-mono text-purple-600">
            {abnormalAlerts.filter((a) => !a.isResolved).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">已处理</p>
          </div>
          <p className="text-2xl font-bold font-mono text-green-600">
            {resolvedAlerts.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索打印点位置、预警内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
          >
            <option value="all">全部类型</option>
            <option value="low_stock">低库存预警</option>
            <option value="abnormal_consumption">异常领用</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm"
          >
            <option value="all">全部状态</option>
            <option value="unresolved">待处理</option>
            <option value="resolved">已处理</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : sortedAlerts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无预警</h3>
          <p className="text-gray-500">
            {filterStatus === 'unresolved'
              ? '当前没有待处理的预警，所有问题都已解决！'
              : filterStatus === 'resolved'
              ? '还没有已处理的预警记录'
              : filterType === 'low_stock'
              ? '暂无低库存预警'
              : filterType === 'abnormal_consumption'
              ? '暂无异常领用预警'
              : '系统运行正常，没有预警信息'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onReplenish={handleOpenReplenish}
              canReplenish={printers.some((p) => p.id === alert.printerId)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showReplenishModal}
        onClose={() => setShowReplenishModal(false)}
        title="登记补货"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmitReplenish} className="space-y-5">
          <Select
            label="选择打印点"
            value={formData.printerId}
            onChange={(e) => setFormData({ ...formData, printerId: e.target.value })}
            options={[
              { value: '', label: '请选择打印点' },
              ...printers.map((p) => ({
                value: p.id,
                label: `${p.location} (当前库存: ${p.currentStock}包)`,
              })),
            ]}
            error={errors.printerId}
          />

          <Select
            label="供应商"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            options={[
              { value: '', label: '请选择供应商' },
              ...suppliers.map((s) => ({ value: s, label: s })),
            ]}
            error={errors.supplier}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="箱数"
              type="number"
              min="1"
              value={formData.boxCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  boxCount: parseInt(e.target.value) || 1,
                })
              }
              error={errors.boxCount}
            />
            <Input
              label="单价（元/箱）"
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unitPrice: parseFloat(e.target.value) || 0,
                })
              }
              error={errors.unitPrice}
            />
          </div>

          {formData.boxCount > 0 && formData.unitPrice > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-primary-700">补货信息</p>
                  <p className="text-xs text-primary-600 mt-1">
                    {formData.boxCount} 箱 × ¥{formData.unitPrice.toFixed(2)}/箱
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-700">
                    ¥{(formData.boxCount * formData.unitPrice).toFixed(2)}
                  </p>
                  <p className="text-xs text-primary-600">
                    共 {formData.boxCount * 10} 包纸
                  </p>
                </div>
              </div>
            </div>
          )}

          <PhotoUpload
            label="入库照片"
            value={formData.photoUrl}
            onChange={(url) => setFormData({ ...formData, photoUrl: url })}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">换算说明</p>
              <p className="text-xs text-blue-600">
                系统默认每箱 = 10 包纸，入库后库存将自动增加
              </p>
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-danger-500">{errors.submit}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowReplenishModal(false)}
            >
              取消
            </Button>
            <Button type="submit">确认补货</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
