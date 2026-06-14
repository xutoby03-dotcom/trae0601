import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  User,
  Ruler,
  X,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import type { Point, LocationType, PointStatus } from '@/types';

export default function Points() {
  const { points, addPoint, updatePoint, deletePoint } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('全部');
  const [showModal, setShowModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [formData, setFormData] = useState({
    building: '',
    location: 'hall' as LocationType,
    name: '',
    matSize: '',
    cleaner: '',
    photo: '',
    status: 'active' as PointStatus,
  });

  const buildings = ['全部', ...new Set(points.map((p) => p.building))];

  const filteredPoints = points.filter((p) => {
    const matchSearch =
      p.name.includes(searchText) ||
      p.building.includes(searchText) ||
      p.cleaner.includes(searchText);
    const matchBuilding =
      filterBuilding === '全部' || p.building === filterBuilding;
    return matchSearch && matchBuilding;
  });

  const handleAdd = () => {
    setEditingPoint(null);
    setFormData({
      building: '',
      location: 'hall',
      name: '',
      matSize: '',
      cleaner: '',
      photo: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (point: Point) => {
    setEditingPoint(point);
    setFormData({
      building: point.building,
      location: point.location,
      name: point.name,
      matSize: point.matSize,
      cleaner: point.cleaner,
      photo: point.photo,
      status: point.status,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.building || !formData.name) return;

    if (editingPoint) {
      updatePoint(editingPoint.id, formData);
    } else {
      addPoint(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该点位吗？')) {
      deletePoint(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">点位档案</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理小区内所有防滑垫点位信息
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新增点位
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索点位名称、楼栋、保洁员..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {buildings.map((b) => (
              <button
                key={b}
                onClick={() => setFilterBuilding(b)}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filterBuilding === b
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 grid grid-cols-4 gap-4">
          {filteredPoints.map((point) => (
            <div
              key={point.id}
              className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-slate-100 relative">
                {point.photo ? (
                  <img
                    src={point.photo}
                    alt={point.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <MapPin className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge
                    variant={point.status === 'active' ? 'success' : 'default'}
                  >
                    {point.status === 'active' ? '启用' : '停用'}
                  </StatusBadge>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <h3 className="font-semibold text-slate-800 text-sm">
                  {point.name}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{point.building}</span>
                    <span className="text-slate-300">|</span>
                    <span>
                      {point.location === 'hall' ? '大厅' : '电梯厅'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{point.matSize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5" />
                    <span>责任保洁：{point.cleaner}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(point)}
                    className="flex-1 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(point.id)}
                    className="flex-1 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPoints.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无点位数据</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingPoint ? '编辑点位' : '新增点位'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    楼栋
                  </label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) =>
                      setFormData({ ...formData, building: e.target.value })
                    }
                    placeholder="如：1号楼"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    位置类型
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: e.target.value as LocationType,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hall">大厅</option>
                    <option value="elevator">电梯厅</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  点位名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="如：1号楼大厅入口"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    垫子尺寸
                  </label>
                  <input
                    type="text"
                    value={formData.matSize}
                    onChange={(e) =>
                      setFormData({ ...formData, matSize: e.target.value })
                    }
                    placeholder="如：120cm × 180cm"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    责任保洁
                  </label>
                  <input
                    type="text"
                    value={formData.cleaner}
                    onChange={(e) =>
                      setFormData({ ...formData, cleaner: e.target.value })
                    }
                    placeholder="如：张阿姨"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  照片链接
                </label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) =>
                    setFormData({ ...formData, photo: e.target.value })
                  }
                  placeholder="输入照片URL"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as PointStatus,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {editingPoint ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
