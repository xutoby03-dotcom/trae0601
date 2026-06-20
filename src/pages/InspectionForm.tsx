import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Send,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  CornerUpLeft,
  CircleDot,
  GitBranch,
  Droplets,
  StickyNote,
  Sparkles,
  Thermometer,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import { getTodayString } from '@/utils/dateUtils';
import { isCriticalHazard, getOverallStatus } from '@/utils/statusUtils';
import StatusBadge from '@/components/StatusBadge';
import type {
  InspectionItem,
  InspectionItemType,
  InspectionStatus,
  InspectorRole,
} from '@/types';
import { INSPECTION_ITEM_LABELS, STATUS_LABELS } from '@/types';

const itemIcons: Record<InspectionItemType, React.ElementType> = {
  edge_lifting: CornerUpLeft,
  bubbling: CircleDot,
  cracking: GitBranch,
  water_accumulation: Droplets,
  glue_stain: StickyNote,
  mirror_surface: Sparkles,
  handrail: StickyNote,
  hvac: Thermometer,
};

const initialItems: InspectionItem[] = [
  { type: 'edge_lifting', status: 'normal', severity: 1 },
  { type: 'bubbling', status: 'normal', severity: 1 },
  { type: 'cracking', status: 'normal', severity: 1 },
  { type: 'water_accumulation', status: 'normal', severity: 1 },
  { type: 'glue_stain', status: 'normal', severity: 1 },
  { type: 'mirror_surface', status: 'normal', severity: 1 },
  { type: 'handrail', status: 'normal', severity: 1 },
  { type: 'hvac', status: 'normal', severity: 1 },
];

export default function InspectionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { classrooms, addInspection, currentUser } = useAppStore();

  const preselectedClassroomId = (location.state as { classroomId?: string })?.classroomId || '';

  const [classroomId, setClassroomId] = useState(preselectedClassroomId);
  const [inspectorName, setInspectorName] = useState(currentUser.name);
  const [inspectorRole, setInspectorRole] = useState<InspectorRole>(currentUser.role as InspectorRole || 'teacher');
  const [items, setItems] = useState<InspectionItem[]>(initialItems);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>(['']);
  const [showWarning, setShowWarning] = useState(false);

  const overallStatus = getOverallStatus(items);
  const willSuspend = isCriticalHazard(items);

  useEffect(() => {
    if (willSuspend && !showWarning) {
      setShowWarning(true);
    }
  }, [willSuspend]);

  const updateItemStatus = (type: InspectionItemType, status: InspectionStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.type === type
          ? { ...item, status, severity: status === 'normal' ? 1 : item.severity || 3 }
          : item
      )
    );
  };

  const updateItemSeverity = (type: InspectionItemType, severity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.type === type ? { ...item, severity } : item))
    );
  };

  const updateItemDescription = (type: InspectionItemType, description: string) => {
    setItems((prev) =>
      prev.map((item) => (item.type === type ? { ...item, description } : item))
    );
  };

  const addPhoto = () => {
    setPhotos([...photos, '']);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos.length > 0 ? newPhotos : ['']);
  };

  const updatePhoto = (index: number, value: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = value;
    setPhotos(newPhotos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomId) return;

    const cleanedPhotos = photos.filter((p) => p.trim() !== '');
    
    addInspection({
      classroomId,
      classroomName: classrooms.find((c) => c.id === classroomId)?.name,
      inspectorName,
      inspectorRole,
      date: getTodayString(),
      items,
      photos: cleanedPhotos,
      notes,
    });

    navigate('/inspections');
  };

  const statusOptions: { value: InspectionStatus; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'normal', label: '正常', icon: CheckCircle, color: 'text-emerald-500' },
    { value: 'warning', label: '预警', icon: AlertCircle, color: 'text-amber-500' },
    { value: 'critical', label: '严重', icon: AlertTriangle, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">返回</span>
      </button>

      {/* Warning banner */}
      {showWarning && willSuspend && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-800">严重隐患警告</h3>
            <p className="text-sm text-rose-600 mt-1">
              根据当前巡检结果，该教室存在严重安全隐患，提交后将自动暂停该教室的预约功能，直到维修完成并通过复查。
            </p>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">新建巡检记录</h1>
              <p className="text-sm text-slate-500 mt-1">
                请逐项检查并填写巡检结果
              </p>
            </div>
            <StatusBadge status={overallStatus} type="inspection" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              基本信息
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  巡检教室 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={classroomId}
                  onChange={(e) => setClassroomId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  required
                >
                  <option value="">请选择教室</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name} ({classroom.floor}楼)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  巡检日期
                </label>
                <input
                  type="date"
                  value={getTodayString()}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  巡检人 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  角色
                </label>
                <select
                  value={inspectorRole}
                  onChange={(e) => setInspectorRole(e.target.value as InspectorRole)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                >
                  <option value="teacher">老师</option>
                  <option value="club_leader">社团负责人</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inspection items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              巡检项目
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => {
                const Icon = itemIcons[item.type];
                return (
                  <div
                    key={item.type}
                    className={`p-4 rounded-xl border transition-all ${
                      item.status === 'normal'
                        ? 'bg-white border-slate-200'
                        : item.status === 'warning'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-5 h-5 ${
                            item.status === 'normal'
                              ? 'text-slate-400'
                              : item.status === 'warning'
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          }`}
                        />
                        <span className="font-medium text-slate-700">
                          {INSPECTION_ITEM_LABELS[item.type]}
                        </span>
                      </div>
                    </div>

                    {/* Status buttons */}
                    <div className="flex gap-1 mb-3">
                      {statusOptions.map((option) => {
                        const OptIcon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateItemStatus(item.type, option.value)}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                              item.status === option.value
                                ? option.value === 'normal'
                                  ? 'bg-emerald-500 text-white'
                                  : option.value === 'warning'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-rose-500 text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <OptIcon className="w-3.5 h-3.5" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Severity slider */}
                    {item.status !== 'normal' && (
                      <div className="mb-3">
                        <label className="text-xs text-slate-500 mb-1 block">
                          严重程度：{item.severity || 3}/5
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={item.severity || 3}
                          onChange={(e) =>
                            updateItemSeverity(item.type, Number(e.target.value))
                          }
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>
                    )}

                    {/* Description */}
                    {item.status !== 'normal' && (
                      <input
                        type="text"
                        placeholder="问题描述（可选）"
                        value={item.description || ''}
                        onChange={(e) =>
                          updateItemDescription(item.type, e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              问题照片
            </h3>
            <div className="space-y-2">
              {photos.map((photo, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => updatePhoto(index, e.target.value)}
                    placeholder="照片URL"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  {photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhoto}
                className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
              >
                <Upload className="w-4 h-4" />
                添加照片
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
              备注说明
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="其他需要说明的情况..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!classroomId}
              className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                classroomId
                  ? willSuspend
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-500/25'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-500/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              {willSuspend ? '提交并暂停预约' : '提交巡检'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
