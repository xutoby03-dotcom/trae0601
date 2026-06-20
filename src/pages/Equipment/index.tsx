import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  LifeBuoy,
  Ruler,
  TriangleAlert,
  Heart,
  Camera,
  Package,
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
  Clock,
  User as UserIcon,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import StatusBadge, { TypeBadge, EmptyState } from '@/components/StatusBadge';
import { EquipmentType, EquipmentStatus, EquipmentTypeLabels, EquipmentStatusLabels, PoolZones } from '@/types';
import { formatDate, getEquipmentAge } from '@/utils/dateUtils';

const typeIcons: Record<EquipmentType, typeof LifeBuoy> = {
  lifebuoy: LifeBuoy,
  rescue_pole: Ruler,
  warning_sign: TriangleAlert,
  first_aid_kit: Heart,
  camera: Camera,
};

interface EquipmentFormProps {
  equipment?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

function EquipmentForm({ equipment, onClose, onSave }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    type: equipment?.type || 'lifebuoy' as EquipmentType,
    code: equipment?.code || '',
    location: equipment?.location || '',
    zone: equipment?.zone || PoolZones[0],
    purchaseDate: equipment?.purchaseDate || new Date().toISOString().split('T')[0],
    responsiblePerson: equipment?.responsiblePerson || '',
    photo: equipment?.photo || '',
    status: equipment?.status || 'normal' as EquipmentStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {equipment ? '编辑器材档案' : '新增器材档案'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">器材名称 *</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：标准救生圈"
              />
            </div>
            <div>
              <label className="label-text">器材编号 *</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="如：LB-A001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">器材类型 *</label>
              <select
                required
                className="select-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EquipmentType })}
              >
                {(Object.keys(EquipmentTypeLabels) as EquipmentType[]).map((t) => (
                  <option key={t} value={t}>
                    {EquipmentTypeLabels[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">器材状态</label>
              <select
                className="select-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
              >
                {(Object.keys(EquipmentStatusLabels) as EquipmentStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {EquipmentStatusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">所属区域 *</label>
              <select
                required
                className="select-field"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              >
                {PoolZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">具体位置 *</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="如：A区深水池东侧"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">购置日期 *</label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">责任人 *</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                placeholder="如：张安全"
              />
            </div>
          </div>

          <div>
            <label className="label-text">器材照片</label>
            <div className="flex items-start gap-4">
              {formData.photo ? (
                <div className="relative">
                  <img
                    src={formData.photo}
                    alt="器材照片"
                    className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photo: '' })}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">暂无照片</span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  className="input-field mb-2"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="输入图片URL"
                />
                <p className="text-xs text-slate-500">建议使用清晰的器材现场照片，便于点检时对照</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EquipmentList() {
  const navigate = useNavigate();
  const equipments = useAppStore((state) => state.equipments);
  const addEquipment = useAppStore((state) => state.addEquipment);
  const updateEquipment = useAppStore((state) => state.updateEquipment);
  const deleteEquipment = useAppStore((state) => state.deleteEquipment);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<EquipmentType | ''>('');
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      const matchSearch =
        !search ||
        eq.name.includes(search) ||
        eq.code.includes(search) ||
        eq.location.includes(search) ||
        eq.responsiblePerson.includes(search);
      const matchType = !filterType || eq.type === filterType;
      const matchStatus = !filterStatus || eq.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [equipments, search, filterType, filterStatus]);

  const handleSave = (data: any) => {
    if (editingId) {
      updateEquipment(editingId, data);
    } else {
      addEquipment(data);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该器材档案吗？')) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索器材名称、编号、位置、责任人..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="select-field w-36"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EquipmentType | '')}
            >
              <option value="">全部类型</option>
              {(Object.keys(EquipmentTypeLabels) as EquipmentType[]).map((t) => (
                <option key={t} value={t}>
                  {EquipmentTypeLabels[t]}
                </option>
              ))}
            </select>
            <select
              className="select-field w-28"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | '')}
            >
              <option value="">全部状态</option>
              {(Object.keys(EquipmentStatusLabels) as EquipmentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {EquipmentStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          新增器材
        </button>
      </div>

      <div className="card overflow-hidden">
        {filteredEquipments.length === 0 ? (
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title="暂无器材档案"
            description={search || filterType || filterStatus ? '没有符合条件的器材，请调整筛选条件' : '请点击上方按钮添加第一件器材'}
            action={
              !search && !filterType && !filterStatus && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setShowForm(true);
                  }}
                  className="btn-primary"
                >
                  新增器材
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">器材信息</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">位置/区域</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">责任人</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">购置信息</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">上次点检</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-slate-600">状态</th>
                  <th className="text-right px-5 py-4 text-sm font-semibold text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipments.map((eq) => {
                  const Icon = typeIcons[eq.type];
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {eq.photo ? (
                              <img
                                src={eq.photo}
                                alt={eq.name}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                <Icon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{eq.name}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                              <span>{eq.code}</span>
                              <TypeBadge type={eq.type} />
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm text-slate-800">{eq.zone}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {eq.location}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-800 flex items-center gap-1">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          {eq.responsiblePerson}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-800 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(eq.purchaseDate)}
                        </p>
                        <p className="text-xs text-slate-500">已使用 {getEquipmentAge(eq.purchaseDate)} 年</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-800 flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatDate(eq.lastInspectionDate || '')}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge type="equipment" status={eq.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/equipment/${eq.id}`)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary-600 transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(eq.id);
                              setShowForm(true);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary-600 transition-colors"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(eq.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <EquipmentForm
          equipment={editingId ? equipments.find((e) => e.id === editingId) : undefined}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const equipments = useAppStore((state) => state.equipments);
  const allInspections = useAppStore((state) => state.inspections);
  const updateEquipment = useAppStore((state) => state.updateEquipment);

  const equipment = useMemo(
    () => equipments.find((eq) => eq.id === id),
    [equipments, id]
  );
  const inspections = useMemo(
    () =>
      allInspections
        .filter((ins) => ins.equipmentId === id)
        .sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate)),
    [allInspections, id]
  );
  const [showForm, setShowForm] = useState(false);

  if (!equipment) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">器材不存在</h3>
        <button onClick={() => navigate('/equipment')} className="btn-primary mt-4">
          返回列表
        </button>
      </div>
    );
  }

  const Icon = typeIcons[equipment.type];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/equipment')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回器材列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="aspect-square bg-gradient-to-br from-primary-50 to-slate-100 rounded-xl flex items-center justify-center mb-5 overflow-hidden">
            {equipment.photo ? (
              <img src={equipment.photo} alt={equipment.name} className="w-full h-full object-cover" />
            ) : (
              <Icon className="w-24 h-24 text-primary-400" />
            )}
          </div>
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{equipment.name}</h2>
            <p className="text-slate-500 mb-3">{equipment.code}</p>
            <div className="flex items-center justify-center gap-2">
              <TypeBadge type={equipment.type} />
              <StatusBadge type="equipment" status={equipment.status} />
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary w-full flex items-center justify-center gap-2">
            <Edit className="w-4 h-4" />
            编辑档案
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-sm text-slate-500 mb-1">器材名称</p>
                <p className="font-medium text-slate-800">{equipment.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">器材编号</p>
                <p className="font-medium text-slate-800">{equipment.code}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">器材类型</p>
                <p className="font-medium text-slate-800">{EquipmentTypeLabels[equipment.type]}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">所属区域</p>
                <p className="font-medium text-slate-800">{equipment.zone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-slate-500 mb-1">具体位置</p>
                <p className="font-medium text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {equipment.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">购置日期</p>
                <p className="font-medium text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  {formatDate(equipment.purchaseDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">使用年限</p>
                <p className="font-medium text-slate-800">{getEquipmentAge(equipment.purchaseDate)} 年</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">责任人</p>
                <p className="font-medium text-slate-800 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  {equipment.responsiblePerson}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">上次点检</p>
                <p className="font-medium text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {formatDate(equipment.lastInspectionDate || '')}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              点检历史记录
            </h3>
            {inspections.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-10 h-10" />}
                title="暂无点检记录"
                description="该器材还未进行过点检"
              />
            ) : (
              <div className="space-y-3">
                {inspections.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-primary-200 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-800">{formatDate(ins.inspectionDate)}</p>
                        <StatusBadge type="inspection" status={ins.status} />
                      </div>
                      <p className="text-sm text-slate-500">点检人：{ins.inspector}</p>
                    </div>
                    {ins.remark && <p className="text-sm text-slate-600 mb-2">备注：{ins.remark}</p>}
                    <div className="flex flex-wrap gap-2">
                      {ins.items.map((item) => (
                        <span
                          key={item.id}
                          className={`text-xs px-2 py-1 rounded-lg ${
                            item.isAbnormal
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}
                        >
                          {item.itemName}: {item.itemValue}
                          {item.description && ` - ${item.description}`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <EquipmentForm
          equipment={equipment}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            updateEquipment(equipment.id, data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
