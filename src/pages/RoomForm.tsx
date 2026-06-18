import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Upload, Users, PenTool, User, MapPin } from 'lucide-react';
import { useAppStore } from '@/store';

export default function RoomForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { rooms, addRoom, updateRoom, deleteRoom } = useAppStore();

  const existingRoom = id ? rooms.find((r) => r.id === id) : null;

  const [formData, setFormData] = useState({
    name: existingRoom?.name || '',
    floor: existingRoom?.floor || '',
    capacity: existingRoom?.capacity || 10,
    whiteboardCount: existingRoom?.whiteboardCount || 1,
    responsiblePerson: existingRoom?.responsiblePerson || '',
    photoUrl:
      existingRoom?.photoUrl ||
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateRoom(id, formData);
    } else {
      addRoom(formData);
    }
    navigate('/rooms');
  };

  const handleDelete = () => {
    if (id && confirm('确定要删除这个会议室吗？相关的库存和任务也会被删除。')) {
      deleteRoom(id);
      navigate('/rooms');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rooms')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            {isEdit ? '编辑会议室' : '新增会议室'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEdit ? '修改会议室档案信息' : '创建新的会议室档案'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="label">会议室名称</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field pl-10"
                    placeholder="如：星辰会议室"
                  />
                </div>
              </div>

              <div>
                <label className="label">所在楼层</label>
                <input
                  type="text"
                  required
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="input-field"
                  placeholder="如：3F"
                />
              </div>

              <div>
                <label className="label">
                  <Users className="w-4 h-4 inline mr-1.5" />
                  容纳人数
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  <PenTool className="w-4 h-4 inline mr-1.5" />
                  白板数量
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.whiteboardCount}
                  onChange={(e) =>
                    setFormData({ ...formData, whiteboardCount: parseInt(e.target.value) || 0 })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">
                  <User className="w-4 h-4 inline mr-1.5" />
                  责任人
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsiblePerson}
                  onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                  className="input-field"
                  placeholder="负责人姓名"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">照片链接</label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {isEdit ? (
                <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm">
                  <Trash2 className="w-4 h-4" />
                  删除会议室
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate('/rooms')} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4" />
                  {isEdit ? '保存修改' : '创建会议室'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="aspect-[3/2] relative">
              <img
                src={formData.photoUrl}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold text-white">
                  {formData.name || '会议室预览'}
                </h3>
                <p className="text-sm text-white/80">{formData.floor || '楼层'}</p>
              </div>
            </div>
            <div className="p-4">
              <button className="w-full btn btn-secondary btn-sm">
                <Upload className="w-4 h-4" />
                上传照片
              </button>
            </div>
          </div>

          <div className="card p-4 text-sm text-slate-500 bg-slate-50/50">
            <p className="font-medium text-slate-700 mb-2">提示</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>责任人会收到低库存通知</li>
              <li>创建会议室后会自动初始化6类用品</li>
              <li>照片建议使用会议室真实照片</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
