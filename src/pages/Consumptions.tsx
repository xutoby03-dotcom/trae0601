import React, { useEffect, useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import type { Consumption, CreateConsumptionRequest } from '../../shared/types';

export default function Consumptions() {
  const navigate = useNavigate();
  const { printers, consumptions, loading, fetchConsumptions, fetchPrinters, addConsumption } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateConsumptionRequest>({
    printerId: '',
    department: '',
    quantity: 1,
    purpose: '',
    receiver: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConsumptions();
    fetchPrinters();
  }, []);

  const columns = [
    {
      key: 'createdAt',
      title: '时间',
      render: (row: Consumption) => (
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
      render: (row: Consumption) => (
        <span className="font-medium text-gray-900">
          {row.printerLocation || '未知位置'}
        </span>
      ),
    },
    {
      key: 'department',
      title: '部门',
      render: (row: Consumption) => (
        <Badge variant="primary">{row.department}</Badge>
      ),
    },
    {
      key: 'quantity',
      title: '数量',
      render: (row: Consumption) => (
        <span className="font-mono font-semibold text-lg">
          {row.quantity}
          <span className="text-sm text-gray-400 ml-1">包</span>
        </span>
      ),
    },
    {
      key: 'purpose',
      title: '用途',
      render: (row: Consumption) => (
        <span className="text-gray-600">{row.purpose}</span>
      ),
    },
    {
      key: 'receiver',
      title: '领取人',
      render: (row: Consumption) => (
        <span className="font-medium text-gray-700">{row.receiver}</span>
      ),
    },
    {
      key: 'isAbnormal',
      title: '状态',
      render: (row: Consumption) =>
        row.isAbnormal ? (
          <Badge variant="danger">
            <AlertCircle className="w-3 h-3 mr-1" />
            异常领用
          </Badge>
        ) : (
          <Badge variant="success">正常</Badge>
        ),
    },
  ];

  const filteredConsumptions = consumptions.filter(
    (c) =>
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.printerLocation || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.printerId) newErrors.printerId = '请选择打印点';
    if (!formData.department.trim()) newErrors.department = '请输入部门';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = '请输入有效数量';
    if (!formData.purpose.trim()) newErrors.purpose = '请输入用途';
    if (!formData.receiver.trim()) newErrors.receiver = '请输入领取人';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addConsumption(formData);
      setShowModal(false);
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    }
  };

  const departments = ['行政部', '研发部', '财务部', '销售部', '市场部', '人事部', '产品部', '运营部', '客服部', '其他'];
  const purposes = ['日常办公打印', '项目文档打印', '财务报表打印', '客户合同打印', '会议资料打印', '技术方案打印', '员工手册打印', '产品宣传册打印', '代码评审文档', '年度审计报告', '其他'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">领用记录</h1>
          <p className="text-gray-500 mt-1">查看和登记打印纸领用记录</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          新增领用
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索部门、领取人、用途、打印点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">本月领用</p>
          <p className="text-2xl font-bold font-mono text-gray-900">
            {consumptions
              .filter((c) => {
                const now = new Date();
                const cDate = new Date(c.createdAt);
                return (
                  cDate.getMonth() === now.getMonth() &&
                  cDate.getFullYear() === now.getFullYear()
                );
              })
              .reduce((sum, c) => sum + c.quantity, 0)}{' '}
            包
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">异常领用</p>
          <p className="text-2xl font-bold font-mono text-danger-500">
            {consumptions.filter((c) => c.isAbnormal).length} 次
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">领用次数</p>
          <p className="text-2xl font-bold font-mono text-primary-500">
            {consumptions.length} 次
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">人均领用</p>
          <p className="text-2xl font-bold font-mono text-purple-500">
            {consumptions.length > 0
              ? (consumptions.reduce((sum, c) => sum + c.quantity, 0) / consumptions.length).toFixed(1)
              : 0}{' '}
            包
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredConsumptions}
        loading={loading}
        emptyText="暂无领用记录"
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="登记领用"
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
                label: `${p.location} (库存: ${p.currentStock}包)`,
              })),
            ]}
            error={errors.printerId}
          />

          <Select
            label="部门"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { value: '', label: '请选择部门' },
              ...departments.map((d) => ({ value: d, label: d })),
            ]}
            error={errors.department}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="领用数量（包）"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
              error={errors.quantity}
            />
            <Input
              label="领取人"
              placeholder="请输入姓名"
              value={formData.receiver}
              onChange={(e) =>
                setFormData({ ...formData, receiver: e.target.value })
              }
              error={errors.receiver}
            />
          </div>

          <Select
            label="用途"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            options={[
              { value: '', label: '请选择用途' },
              ...purposes.map((p) => ({ value: p, label: p })),
            ]}
            error={errors.purpose}
          />

          {formData.quantity >= 5 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-700">领用数量较大</p>
                <p className="text-xs text-orange-600">
                  超过 5 包的领用将被标记为异常领用，系统会自动生成预警
                </p>
              </div>
            </div>
          )}

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
            <Button type="submit">确认领用</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
