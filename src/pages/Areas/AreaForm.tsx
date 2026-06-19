import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  MapPin,
  Ruler,
  Droplets,
  Layers,
  Calendar,
  Trash2,
  ClipboardCheck,
  Wrench,
} from 'lucide-react';
import { useAreaStore } from '../../store/useAreaStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useTaskStore } from '../../store/useTaskStore';
import { checkRepeatedAnomaly } from '../../utils/anomaly';
import { formatDate } from '../../utils/date';
import PhotoUpload from '../../components/PhotoUpload';
import StatusBadge from '../../components/StatusBadge';
import AnomalyCard from '../../components/AnomalyCard';
import type { Orientation } from '../../types';

const orientations: Orientation[] = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'];

const pavingMaterials = [
  '防滑瓷砖',
  '防腐木地板',
  '水泥地面',
  '石材地砖',
  '塑胶地板',
  '马赛克',
  '其他',
];

export default function AreaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const { areas, addArea, updateArea, deleteArea, getAreaById } = useAreaStore();
  const { inspections, getInspectionsByArea } = useInspectionStore();
  const { tasks, getTasksByArea } = useTaskStore();

  const existingArea = isEdit ? getAreaById(id || '') : undefined;

  const [formData, setFormData] = useState({
    name: '',
    orientation: '南' as Orientation,
    areaSize: 0,
    drainCount: 1,
    pavingMaterial: '防滑瓷砖',
    lastRepairDate: '',
    photos: [] as string[],
  });

  useEffect(() => {
    if (existingArea) {
      setFormData({
        name: existingArea.name,
        orientation: existingArea.orientation,
        areaSize: existingArea.areaSize,
        drainCount: existingArea.drainCount,
        pavingMaterial: existingArea.pavingMaterial,
        lastRepairDate: existingArea.lastRepairDate || '',
        photos: existingArea.photos,
      });
    }
  }, [existingArea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入区域名称');
      return;
    }

    if (isEdit && id) {
      updateArea(id, formData);
    } else {
      addArea(formData);
    }
    navigate('/areas');
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个区域吗？相关的检查记录和维修任务不会被删除。') && id) {
      deleteArea(id);
      navigate('/areas');
    }
  };

  const areaInspections = isEdit && id ? getInspectionsByArea(id) : [];
  const areaTasks = isEdit && id ? getTasksByArea(id) : [];
  const hasRepeatedAnomaly = isEdit && id ? checkRepeatedAnomaly(id, inspections) : false;

  if (isEdit && !existingArea) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">区域不存在</p>
        <Link to="/areas" className="text-primary-500 hover:text-primary-600">
          返回区域列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/areas"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回区域列表
        </Link>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            删除区域
          </button>
        )}
      </div>

      {hasRepeatedAnomaly && existingArea && (
        <AnomalyCard
          title={`${existingArea.name} 连续异常预警`}
          description="该区域最近两次雨后检查均发现异常，请尽快安排维修"
        >
          <Link
            to={`/tasks/new?areaId=${existingArea.id}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-danger-500 text-white text-sm rounded-lg hover:bg-danger-600 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            创建维修任务
          </Link>
        </AnomalyCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-gray-800">
            {isEdit ? '编辑区域档案' : '新增区域档案'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1.5 text-primary-500" />
                区域名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：主卧露台、客厅大露台"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1.5 text-primary-500" />
                朝向方位
              </label>
              <select
                value={formData.orientation}
                onChange={(e) => setFormData({ ...formData, orientation: e.target.value as Orientation })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                {orientations.map((o) => (
                  <option key={o} value={o}>
                    {o}面
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-1.5 text-primary-500" />
                面积 (㎡)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.areaSize}
                onChange={(e) => setFormData({ ...formData, areaSize: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-1.5 text-primary-500" />
                地漏数量
              </label>
              <input
                type="number"
                min="0"
                value={formData.drainCount}
                onChange={(e) => setFormData({ ...formData, drainCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Layers className="w-4 h-4 inline mr-1.5 text-primary-500" />
                铺装材料
              </label>
              <select
                value={formData.pavingMaterial}
                onChange={(e) => setFormData({ ...formData, pavingMaterial: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                {pavingMaterials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 text-primary-500" />
                最近维修日期
              </label>
              <input
                type="date"
                value={formData.lastRepairDate}
                onChange={(e) => setFormData({ ...formData, lastRepairDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                区域照片
              </label>
              <PhotoUpload
                photos={formData.photos}
                onChange={(photos) => setFormData({ ...formData, photos })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/areas')}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Save className="w-4 h-4" />
              {isEdit ? '保存修改' : '创建区域'}
            </button>
          </div>
        </form>

        {isEdit && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary-500" />
                最近检查记录
              </h3>
              {areaInspections.length === 0 ? (
                <p className="text-sm text-gray-500">暂无检查记录</p>
              ) : (
                <div className="space-y-3">
                  {areaInspections.slice(0, 5).map((insp) => (
                    <Link
                      key={insp.id}
                      to={`/inspections/${insp.areaId}`}
                      className="block p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {formatDate(insp.inspectionDate)}
                        </span>
                        {insp.hasAnomaly ? (
                          <span className="text-xs px-2 py-0.5 bg-danger-100 text-danger-600 rounded-full">
                            异常
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-success-100 text-success-600 rounded-full">
                            正常
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="drain" value={insp.drainStatus} />
                        <StatusBadge type="damp" value={insp.wallDampLevel} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                to={`/inspections/${id}`}
                className="mt-4 block text-center text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                新增雨后检查 →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-warning-500" />
                维修任务
              </h3>
              {areaTasks.length === 0 ? (
                <p className="text-sm text-gray-500">暂无维修任务</p>
              ) : (
                <div className="space-y-3">
                  {areaTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">
                          {task.title}
                        </span>
                        <StatusBadge type="task" value={task.status} />
                      </div>
                      {task.responsiblePerson && (
                        <p className="text-xs text-gray-500">责任人：{task.responsiblePerson}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Link
                to={`/tasks/new?areaId=${id}`}
                className="mt-4 block text-center text-sm text-warning-600 hover:text-warning-700 font-medium"
              >
                创建维修任务 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
