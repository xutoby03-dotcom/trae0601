import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  MapPin,
  User,
  FileText,
  DollarSign,
  Calendar,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useAreaStore } from '../../store/useAreaStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { checkRepeatedAnomaly } from '../../utils/anomaly';
import { formatCurrency, formatDate } from '../../utils/date';
import PhotoUpload from '../../components/PhotoUpload';
import type { TaskStatus } from '../../types';

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: '待处理' },
  { value: 'in_progress', label: '进行中' },
  { value: 'review', label: '待复查' },
  { value: 'completed', label: '已完成' },
];

export default function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const { tasks, addTask, updateTask, deleteTask, getTaskById } = useTaskStore();
  const { areas } = useAreaStore();
  const { inspections } = useInspectionStore();

  const existingTask = isEdit ? getTaskById(id || '') : undefined;

  const preselectedAreaId = searchParams.get('areaId') || '';
  const preselectedInspectionId = searchParams.get('inspectionId') || '';

  const [formData, setFormData] = useState({
    areaId: '',
    inspectionId: '' as string | undefined,
    title: '',
    status: 'pending' as TaskStatus,
    responsiblePerson: '',
    constructionPlan: '',
    estimatedCost: undefined as number | undefined,
    actualCost: undefined as number | undefined,
    reviewDate: '',
    isRepeatedAnomaly: false,
    photos: [] as string[],
  });

  useEffect(() => {
    if (existingTask) {
      setFormData({
        areaId: existingTask.areaId,
        inspectionId: existingTask.inspectionId,
        title: existingTask.title,
        status: existingTask.status,
        responsiblePerson: existingTask.responsiblePerson,
        constructionPlan: existingTask.constructionPlan,
        estimatedCost: existingTask.estimatedCost,
        actualCost: existingTask.actualCost,
        reviewDate: existingTask.reviewDate || '',
        isRepeatedAnomaly: existingTask.isRepeatedAnomaly,
        photos: existingTask.photos,
      });
    } else if (preselectedAreaId) {
      const isRepeated = checkRepeatedAnomaly(preselectedAreaId, inspections);
      const area = areas.find((a) => a.id === preselectedAreaId);
      const inspection = preselectedInspectionId
        ? inspections.find((i) => i.id === preselectedInspectionId)
        : undefined;
      setFormData((prev) => ({
        ...prev,
        areaId: preselectedAreaId,
        inspectionId: preselectedInspectionId || undefined,
        isRepeatedAnomaly: isRepeated,
        title: area ? `${area.name}维修` : '',
        constructionPlan: inspection && inspection.notes ? `检查备注：${inspection.notes}\n\n` : '',
      }));
    }
  }, [existingTask, preselectedAreaId, preselectedInspectionId, areas, inspections]);

  useEffect(() => {
    if (formData.areaId && !isEdit) {
      const isRepeated = checkRepeatedAnomaly(formData.areaId, inspections);
      if (isRepeated !== formData.isRepeatedAnomaly) {
        setFormData((prev) => ({ ...prev, isRepeatedAnomaly: isRepeated }));
      }
    }
  }, [formData.areaId, inspections, isEdit, formData.isRepeatedAnomaly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.areaId || !formData.title.trim()) {
      alert('请填写区域和任务标题');
      return;
    }

    if (isEdit && id) {
      updateTask(id, formData);
    } else {
      addTask(formData);
    }
    navigate('/tasks');
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个维修任务吗？') && id) {
      deleteTask(id);
      navigate('/tasks');
    }
  };

  if (isEdit && !existingTask) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">任务不存在</p>
        <Link to="/tasks" className="text-primary-500 hover:text-primary-600">
          返回任务列表
        </Link>
      </div>
    );
  }

  const selectedArea = areas.find((a) => a.id === formData.areaId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回任务列表
        </Link>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            删除任务
          </button>
        )}
      </div>

      {formData.isRepeatedAnomaly && (
        <div className="bg-danger-50 border-2 border-danger-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-200 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-danger-700" />
            </div>
            <div>
              <h4 className="font-bold text-danger-700 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-danger-500 text-white text-xs rounded">连续异常</span>
                该区域连续两次检查出现异常
              </h4>
              <p className="text-sm text-danger-600 mt-1">
                请优先处理此任务，建议彻底排查渗水根源，避免反复维修
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="font-serif text-xl font-bold text-gray-800">
          {isEdit ? '编辑维修任务' : '新增维修任务'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1.5 text-primary-500" />
              关联区域 *
            </label>
            <select
              value={formData.areaId}
              onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              required
            >
              <option value="">请选择区域</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}（{a.orientation}面 · {a.areaSize}㎡）
                </option>
              ))}
            </select>
            {selectedArea && (
              <p className="mt-2 text-xs text-gray-500">
                地漏 {selectedArea.drainCount} 个 · {selectedArea.pavingMaterial}
                {selectedArea.lastRepairDate && ` · 上次维修 ${selectedArea.lastRepairDate}`}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {formData.inspectionId && (() => {
              const insp = inspections.find((i) => i.id === formData.inspectionId);
              return insp ? (
                <p className="mt-2 text-xs text-primary-600">
                  📋 关联检查：{formatDate(insp.inspectionDate)}
                  {insp.waterPoints.length > 0 && ` · 积水${insp.waterPoints.length}处`}
                  {insp.thresholdLeak && ' · 门槛渗水'}
                </p>
              ) : null;
            })()}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1.5 text-primary-500" />
              任务标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：主卧露台西南墙角防水修复"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1.5 text-primary-500" />
              责任人
            </label>
            <input
              type="text"
              value={formData.responsiblePerson}
              onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
              placeholder="施工方或负责人姓名"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5 text-primary-500" />
              复查日期
            </label>
            <input
              type="date"
              value={formData.reviewDate}
              onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1.5 text-primary-500" />
              预估费用 (元)
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedCost ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedCost: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
            {formData.estimatedCost !== undefined && (
              <p className="mt-1.5 text-xs text-gray-500">
                约 {formatCurrency(formData.estimatedCost)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1.5 text-warning-500" />
              实际费用 (元)
            </label>
            <input
              type="number"
              min="0"
              value={formData.actualCost ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  actualCost: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="维修完成后填写"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
            {formData.actualCost !== undefined && (
              <p className="mt-1.5 text-xs text-gray-500">
                实付 {formatCurrency(formData.actualCost)}
                {formData.estimatedCost !== undefined && (
                  <span className={formData.actualCost > formData.estimatedCost ? 'text-danger-600 ml-1' : 'text-success-600 ml-1'}>
                    ({formData.actualCost > formData.estimatedCost ? '超支' : '节余'} {formatCurrency(Math.abs(formData.actualCost - formData.estimatedCost))})
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1.5 text-primary-500" />
              施工方案
            </label>
            <textarea
              value={formData.constructionPlan}
              onChange={(e) => setFormData({ ...formData, constructionPlan: e.target.value })}
              placeholder="详细的施工步骤、使用材料、注意事项等..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              维修照片
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
            onClick={() => navigate('/tasks')}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-warning-500 to-warning-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '创建任务'}
          </button>
        </div>
      </form>
    </div>
  );
}
