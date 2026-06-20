import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { CATEGORY_LABEL, ItemCategory } from '@/types';
import { Input, Select, Textarea } from '@/components/FormFields';
import Button from '@/components/Button';

export default function InventoryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { boxes, items, addItem, updateItem } = useAppStore();
  const existing = items.find(i => i.id === id);

  const [form, setForm] = useState({
    boxId: boxes[0]?.id ?? '',
    name: '',
    category: 'band-aid' as ItemCategory,
    expiryDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    quantity: 10,
    storageCell: '',
  });

  useEffect(() => {
    if (existing) {
      setForm({
        boxId: existing.boxId,
        name: existing.name,
        category: existing.category,
        expiryDate: existing.expiryDate,
        quantity: existing.quantity,
        storageCell: existing.storageCell,
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.boxId) {
      alert('请填写物品名称并选择药箱');
      return;
    }
    if (isEdit && id) {
      updateItem(id, form);
    } else {
      addItem(form);
    }
    navigate('/inventory');
  };

  const handleCategoryChange = (cat: ItemCategory) => {
    setForm(prev => ({
      ...prev,
      category: cat,
      name: prev.name === '' || Object.values(CATEGORY_LABEL).includes(prev.name)
        ? CATEGORY_LABEL[cat]
        : prev.name,
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/inventory" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> 返回库存列表
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">{isEdit ? '编辑物品' : '物品入库'}</h1>
        <p className="text-sm text-zinc-500 mt-1">填写物品详细信息</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <Select
          label="所属药箱 *"
          value={form.boxId}
          onChange={e => setForm({ ...form, boxId: e.target.value })}
        >
          {boxes.map(b => (
            <option key={b.id} value={b.id}>{b.location} - {b.manager}</option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="物品类别 *"
            value={form.category}
            onChange={e => handleCategoryChange(e.target.value as ItemCategory)}
          >
            {(Object.keys(CATEGORY_LABEL) as ItemCategory[]).map(c => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </Select>
          <Input
            label="物品名称 *"
            placeholder="如：防水创可贴"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="有效期至 *"
            type="date"
            value={form.expiryDate}
            onChange={e => setForm({ ...form, expiryDate: e.target.value })}
          />
          <Input
            label="数量 *"
            type="number"
            min={0}
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </div>

        <Input
          label="存放格"
          placeholder="如：A1、B2"
          value={form.storageCell}
          onChange={e => setForm({ ...form, storageCell: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-50">
          <Link to="/inventory">
            <Button variant="secondary" type="button">取消</Button>
          </Link>
          <Button type="submit">{isEdit ? '保存修改' : '确认入库'}</Button>
        </div>
      </form>
    </div>
  );
}
