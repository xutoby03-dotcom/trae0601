import React, { useEffect, useState } from 'react';
import { Plus, Search, Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { PhotoUpload } from '@/components/PhotoUpload';
import type { Replenishment, CreateReplenishmentRequest } from '../../shared/types';

export default function Replenishments() {
  const { printers, replenishments, loading, fetchReplenishments, fetchPrinters, addReplenishment } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateReplenishmentRequest>({
    printerId: '',
    supplier: '',
    boxCount: 1,
    unitPrice: 0,
    photoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReplenishments();
    fetchPrinters();
  }, []);

  const columns = [
    {
      key: 'createdAt',
      title: '时间',
      render: (row: Replenishment) => (
        <div>
          <p className="font-medium text-gray-900">
            {new Date(row.createdAt).toLocaleDateString('zh-CN')}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'printerLocation',
      title: '打印点',
      render: (row: Replenishment) => (
        <span className="font-medium text-gray-900">
          {row.printerLocation || '未知位置'}
        </span>
      ),
    },
    {
      key: 'supplier',
      title: '供应商',
      render: (row: Replenishment) => (
        <Badge variant="primary">{row.supplier}</Badge>
      ),
    },
    {
      key: 'boxCount',
      title: '箱数',
      render: (row: Replenishment) => (
        <div>
          <span className="font-mono font-semibold text-lg text-gray-900">
            {row.boxCount}
          </span>
          <span className="text-sm text-gray-400 ml-1">箱</span>
          <span className="text-xs text-gray-400 ml-2">({row.boxCount * 10}包)</span>
        </div>
      ),
    },
    {
      key: 'unitPrice',
      title: '单价',
      render: (row: Replenishment) => (
        <span className="font-mono text-gray-900">¥{row.unitPrice.toFixed(2)}</span>
      ),
    },
    {
      key: 'totalAmount',
      title: '总金额',
      render: (row: Replenishment) => (
        <span className="font-mono font-semibold text-primary-600">
          ¥{row.totalAmount.toFixed(2)}
        </span>
      ),
    },
  ];

  const filteredReplenishments = replenishments.filter(
    (r) =>
      r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.printerLocation || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBoxes = replenishments.reduce((sum, r) => sum + r.boxCount, 0);
  const totalAmount = replenishments.reduce((sum, r) => sum + r.totalAmount, 0);
  const avgUnitPrice = replenishments.length > 0
    ? replenishments.reduce((sum, r) => sum + r.unitPrice, 0) / replenishments.length
    : 0;
  const monthlyBoxes = replenishments
    .filter((r) => {
      const now = new Date();
      const rDate = new Date(r.createdAt);
      return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + r.boxCount, 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.printerId) newErrors.printerId = '请选择打印点';
    if (!formData.supplier.trim()) newErrors.supplier = '请输入供应商';
    if (!formData.boxCount || formData.boxCount <= 0) newErrors.boxCount = '请输入有效箱数';
    if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = '请输入有效单价';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addReplenishment(formData);
      setShowModal(false);
      setFormData({
        printerId: '',
        supplier: '',
        boxCount: 1,
        unitPrice: 0,
        photoUrl: '',
      });
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    }
  };

  const suppliers = ['亚太森博', 'Double A', '天章纸业', '金光纸业', 'UPM', '其他'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">补货记录</h1>
          <p className="text-gray-500 mt-1">查看和登记打印纸补货记录</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          新增补货
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索供应商、打印点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-sm text-gray-500">本月补货</p>
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {monthlyBoxes} <span className="text-sm text-gray-400">箱</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">累计箱数</p>
          </div>
          <p className="text-2xl font-bold font-mono text-green-600">
            {totalBoxes} <span className="text-sm text-gray-400">箱</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">累计金额</p>
          </div>
          <p className="text-2xl font-bold font-mono text-purple-600">
            ¥{totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500">平均单价</p>
          </div>
          <p className="text-2xl font-bold font-mono text-orange-600">
            ¥{avgUnitPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredReplenishments}
        loading={loading}
        emptyText="暂无补货记录"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="登记补货"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
              onClick={() => setShowModal(false)}
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
