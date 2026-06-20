import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store';
import { Input, Select, Textarea } from '@/components/FormFields';
import Button from '@/components/Button';

const defaultPhotos = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&q=80',
];

export default function MedicineBoxForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { boxes, addBox, updateBox } = useAppStore();
  const existing = boxes.find(b => b.id === id);

  const [form, setForm] = useState({
    location: '',
    manager: '',
    capacity: 30,
    applicableActivities: '',
    photoUrl: defaultPhotos[0],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        location: existing.location,
        manager: existing.manager,
        capacity: existing.capacity,
        applicableActivities: existing.applicableActivities,
        photoUrl: existing.photoUrl,
      });
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location.trim() || !form.manager.trim()) {
      alert('请填写位置和负责人');
      return;
    }
    if (isEdit && id) {
      updateBox(id, form);
    } else {
      addBox(form);
    }
    navigate('/medicine-boxes');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/medicine-boxes" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> 返回药箱列表
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">{isEdit ? '编辑药箱' : '新增药箱'}</h1>
        <p className="text-sm text-zinc-500 mt-1">填写药箱基础信息</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <Input
          label="药箱位置 *"
          placeholder="如：活动室入口、多功能厅"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="负责人 *"
            placeholder="如：张阿姨"
            value={form.manager}
            onChange={e => setForm({ ...form, manager: e.target.value })}
          />
          <Input
            label="容量（件）"
            type="number"
            min={1}
            value={form.capacity}
            onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
          />
        </div>

        <Textarea
          label="适用活动"
          placeholder="如：日常便民、老年活动、健身运动"
          value={form.applicableActivities}
          onChange={e => setForm({ ...form, applicableActivities: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">药箱照片</label>
          <div className="space-y-3">
            <div className="w-full h-48 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
              <img
                src={form.photoUrl}
                alt="预览"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23e4e4e7"/><text x="200" y="105" font-family="sans-serif" font-size="16" fill="%23a1a1aa" text-anchor="middle">照片预览</text></svg>';
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {defaultPhotos.map(url => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setForm({ ...form, photoUrl: url })}
                  className={
                    'relative h-20 rounded-lg overflow-hidden border-2 transition-all ' +
                    (form.photoUrl === url ? 'border-primary-500 ring-2 ring-primary-100' : 'border-transparent hover:border-zinc-200')
                  }
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <Input
              placeholder="或粘贴图片URL"
              value={form.photoUrl}
              onChange={e => setForm({ ...form, photoUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-50">
          <Link to="/medicine-boxes">
            <Button variant="secondary" type="button">取消</Button>
          </Link>
          <Button type="submit">{isEdit ? '保存修改' : '创建药箱'}</Button>
        </div>
      </form>
    </div>
  );
}
