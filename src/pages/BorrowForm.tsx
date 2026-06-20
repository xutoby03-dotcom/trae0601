import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { CATEGORY_LABEL, NEEDS_CLEAN_CHECK } from '@/types';
import { Input, Select, Textarea } from '@/components/FormFields';
import Button from '@/components/Button';

export default function BorrowForm() {
  const navigate = useNavigate();
  const { boxes, items, addBorrow } = useAppStore();

  const [form, setForm] = useState({
    residentName: '',
    building: '',
    purpose: '',
    boxId: boxes[0]?.id ?? '',
    itemId: '',
    quantity: 1,
    returnRequirement: '',
    expectedReturnDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  });

  const availableItems = items.filter(
    i => i.boxId === form.boxId && i.quantity > 0 && i.status !== 'expired' && i.status !== 'damaged'
  );

  const selectedItem = items.find(i => i.id === form.itemId);

  useEffect(() => {
    if (!items.find(i => i.id === form.itemId && i.boxId === form.boxId)) {
      setForm(prev => ({ ...prev, itemId: availableItems[0]?.id ?? '', quantity: 1 }));
    }
  }, [form.boxId, items]);

  useEffect(() => {
    if (selectedItem) {
      const needsClean = NEEDS_CLEAN_CHECK.includes(selectedItem.category);
      setForm(prev => ({
        ...prev,
        returnRequirement: prev.returnRequirement || (needsClean
          ? '请擦拭消毒后归还'
          : selectedItem.category === 'ice-pack'
          ? '归还后请放回冷冻层'
          : '一次性用品无需归还'),
      }));
    }
  }, [selectedItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.residentName.trim() || !form.itemId) {
      alert('请填写居民姓名并选择物品');
      return;
    }
    if (!selectedItem || form.quantity > selectedItem.quantity) {
      alert('借用数量超过库存');
      return;
    }

    addBorrow({
      residentName: form.residentName,
      building: form.building,
      purpose: form.purpose,
      itemId: form.itemId,
      itemName: selectedItem.name,
      category: selectedItem.category,
      quantity: form.quantity,
      returnRequirement: form.returnRequirement,
      expectedReturnDate: form.expectedReturnDate,
      borrowDate: dayjs().format('YYYY-MM-DD'),
    });

    navigate('/borrows');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/borrows" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> 返回借用列表
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">借用登记</h1>
        <p className="text-sm text-zinc-500 mt-1">登记居民借用物品信息</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="居民姓名 *"
            placeholder="如：张大爷"
            value={form.residentName}
            onChange={e => setForm({ ...form, residentName: e.target.value })}
          />
          <Input
            label="楼栋"
            placeholder="如：3号楼"
            value={form.building}
            onChange={e => setForm({ ...form, building: e.target.value })}
          />
        </div>

        <Textarea
          label="借用用途"
          placeholder="如：手部擦伤、发烧测量等"
          value={form.purpose}
          onChange={e => setForm({ ...form, purpose: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="选择药箱"
            value={form.boxId}
            onChange={e => setForm({ ...form, boxId: e.target.value })}
          >
            {boxes.map(b => (
              <option key={b.id} value={b.id}>{b.location}</option>
            ))}
          </Select>
          <Select
            label="选择物品 *"
            value={form.itemId}
            onChange={e => setForm({ ...form, itemId: e.target.value, quantity: 1 })}
          >
            <option value="">请选择物品</option>
            {availableItems.map(i => (
              <option key={i.id} value={i.id}>
                {i.name}（库存: {i.quantity}）- {i.storageCell}
              </option>
            ))}
          </Select>
        </div>

        {selectedItem && (
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
            <p className="text-sm text-primary-700">
              <span className="font-medium">{CATEGORY_LABEL[selectedItem.category]}</span>
              ，当前库存 <span className="font-mono font-bold">{selectedItem.quantity}</span>
              {NEEDS_CLEAN_CHECK.includes(selectedItem.category) && (
                <span className="ml-2 text-warning-600">· 归还时需检查清洁状态</span>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="借用数量 *"
            type="number"
            min={1}
            max={selectedItem?.quantity ?? 999}
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
          />
          <Input
            label="预计归还日期 *"
            type="date"
            value={form.expectedReturnDate}
            onChange={e => setForm({ ...form, expectedReturnDate: e.target.value })}
          />
        </div>

        <Textarea
          label="归还要求"
          value={form.returnRequirement}
          onChange={e => setForm({ ...form, returnRequirement: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-50">
          <Link to="/borrows">
            <Button variant="secondary" type="button">取消</Button>
          </Link>
          <Button type="submit">确认登记</Button>
        </div>
      </form>
    </div>
  );
}
