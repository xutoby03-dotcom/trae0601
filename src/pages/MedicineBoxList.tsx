import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  User,
  Layers,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store';
import Button from '@/components/Button';

export default function MedicineBoxList() {
  const { boxes, items, deleteBox } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = boxes.filter(
    b =>
      b.location.includes(search) ||
      b.manager.includes(search) ||
      b.applicableActivities.includes(search)
  );

  const getItemCount = (boxId: string) =>
    items.filter(i => i.boxId === boxId).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">药箱档案</h1>
          <p className="text-sm text-zinc-500 mt-1">管理各活动室药箱的基础信息</p>
        </div>
        <Link to="/medicine-boxes/new">
          <Button>
            <Plus className="w-4 h-4" />
            新增药箱
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索位置、负责人、适用活动..."
            className="input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-100 p-12 text-center shadow-card">
          <p className="text-zinc-400">暂无药箱档案，点击右上角新增</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(box => (
            <div key={box.id} className="card overflow-hidden group">
              <div className="relative h-40 bg-zinc-100 overflow-hidden">
                <img
                  src={box.photoUrl}
                  alt={box.location}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23e4e4e7"/><text x="200" y="105" font-family="sans-serif" font-size="16" fill="%23a1a1aa" text-anchor="middle">药箱照片</text></svg>';
                  }}
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900">{box.location}</h3>
                  <span className="badge-neutral">
                    <Layers className="w-3 h-3" />
                    {getItemCount(box.id)}/{box.capacity}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <User className="w-4 h-4 text-zinc-400" />
                    负责人: {box.manager}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    容量: {box.capacity} 件
                  </div>
                  <div className="flex items-start gap-2 text-zinc-600">
                    <Tag className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{box.applicableActivities}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-50">
                  <Link to={'/medicine-boxes/' + box.id + '/edit'} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Edit2 className="w-4 h-4" />
                      编辑
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                    onClick={() => {
                      if (confirm('确定删除该药箱吗？关联的库存物品也会被删除。')) {
                        deleteBox(box.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
