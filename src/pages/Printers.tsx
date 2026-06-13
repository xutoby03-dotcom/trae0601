import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { PrinterCard } from '@/components/PrinterCard';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { PhotoUpload } from '@/components/PhotoUpload';
import type { Printer, CreatePrinterRequest } from '../../shared/types';

export default function Printers() {
  const navigate = useNavigate();
  const { printers, loading, fetchPrinters, addPrinter, updatePrinter, deletePrinter } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [formData, setFormData] = useState<CreatePrinterRequest>({
    location: '',
    printerModel: '',
    paperSpec: 'A4/70g',
    minStock: 10,
    currentStock: 0,
    manager: '',
    managerPhone: '',
    photoUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPrinters();
  }, []);

  const filteredPrinters = printers.filter(
    (p) =>
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.printerModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (printer?: Printer) => {
    if (printer) {
      setEditingPrinter(printer);
      setFormData({
        location: printer.location,
        printerModel: printer.printerModel,
        paperSpec: printer.paperSpec,
        minStock: printer.minStock,
        currentStock: printer.currentStock,
        manager: printer.manager,
        managerPhone: printer.managerPhone,
        photoUrl: printer.photoUrl,
      });
    } else {
      setEditingPrinter(null);
      setFormData({
        location: '',
        printerModel: '',
        paperSpec: 'A4/70g',
        minStock: 10,
        currentStock: 0,
        manager: '',
        managerPhone: '',
        photoUrl: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.location.trim()) newErrors.location = '请输入位置';
    if (!formData.printerModel.trim()) newErrors.printerModel = '请输入打印机型号';
    if (!formData.paperSpec.trim()) newErrors.paperSpec = '请输入纸张规格';
    if (!formData.manager.trim()) newErrors.manager = '请输入负责人';
    if (formData.minStock <= 0) newErrors.minStock = '最低库存必须大于0';
    if (formData.currentStock < 0) newErrors.currentStock = '当前库存不能为负数';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingPrinter) {
        await updatePrinter(editingPrinter.id, formData);
      } else {
        await addPrinter(formData);
      }
      setShowModal(false);
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    }
  };

  const handleDelete = (printer: Printer) => {
    if (confirm(`确定要删除「${printer.location}」的打印点吗？所有相关记录也会被删除。`)) {
      deletePrinter(printer.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">打印点管理</h1>
          <p className="text-gray-500 mt-1">管理所有打印点的档案信息和库存</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
        >
          新增打印点
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索位置、打印机型号、负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
          筛选
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
          ))}
        </div>
      ) : filteredPrinters.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">暂无打印点数据</p>
          <Button onClick={() => handleOpenModal()}>添加第一个打印点</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrinters.map((printer) => (
            <PrinterCard
              key={printer.id}
              printer={printer}
              onEdit={() => handleOpenModal(printer)}
              onDelete={() => handleDelete(printer)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPrinter ? '编辑打印点' : '新增打印点'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="位置"
              placeholder="例如：1楼前台大厅"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={errors.location}
            />
            <Input
              label="打印机型号"
              placeholder="例如：HP LaserJet Pro M404dn"
              value={formData.printerModel}
              onChange={(e) => setFormData({ ...formData, printerModel: e.target.value })}
              error={errors.printerModel}
            />
            <Select
              label="纸张规格"
              value={formData.paperSpec}
              onChange={(e) => setFormData({ ...formData, paperSpec: e.target.value })}
              options={[
                { value: 'A4/70g', label: 'A4/70g' },
                { value: 'A4/80g', label: 'A4/80g' },
                { value: 'A3/70g', label: 'A3/70g' },
                { value: 'A3/80g', label: 'A3/80g' },
                { value: 'B5/70g', label: 'B5/70g' },
              ]}
              error={errors.paperSpec}
            />
            <Input
              label="最低库存（包）"
              type="number"
              min="1"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              error={errors.minStock}
            />
            <Input
              label="当前库存（包）"
              type="number"
              min="0"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
              error={errors.currentStock}
            />
            <Input
              label="负责人"
              placeholder="例如：张三"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              error={errors.manager}
            />
            <Input
              label="联系电话"
              placeholder="例如：13800138000"
              value={formData.managerPhone}
              onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
              error={errors.managerPhone}
            />
          </div>

          <PhotoUpload
            label="现场照片"
            value={formData.photoUrl}
            onChange={(url) => setFormData({ ...formData, photoUrl: url })}
          />

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
            <Button type="submit">
              {editingPrinter ? '保存修改' : '创建打印点'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
