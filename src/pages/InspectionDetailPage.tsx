import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Save, Camera, Hand, Footprints, ArrowDown, Shield, LayoutGrid, Wrench, Droplets, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { INSPECTION_ITEMS } from '@/types';
import type { InspectionItem, InspectionItemKey } from '@/types';
import { formatDate, todayStr } from '@/utils';

const itemIcons: Record<InspectionItemKey, React.ElementType> = {
  handrail: Hand,
  pedal: Footprints,
  slide_surface: ArrowDown,
  guardrail: Shield,
  floor_mat: LayoutGrid,
  screw: Wrench,
  water_logging: Droplets,
  sharp_edge: AlertTriangle,
};

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { inspections, facilities, updateInspection, updateFacility } = useAppStore();

  const inspection = inspections.find((i) => i.id === id);
  const facility = inspection ? facilities.find((f) => f.id === inspection.facilityId) : undefined;

  const [items, setItems] = useState<InspectionItem[]>(
    inspection?.items || INSPECTION_ITEMS.map((i) => ({ key: i.key, name: i.name, isNormal: true }))
  );
  const [remark, setRemark] = useState(inspection?.remark || '');
  const [inspector, setInspector] = useState(inspection?.inspector || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!inspection || !facility) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500 mb-4">巡检记录不存在</p>
        <Link to="/inspections" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>
    );
  }

  const toggleItem = (key: InspectionItemKey) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, isNormal: !item.isNormal } : item))
    );
  };

  const updateItemRemark = (key: InspectionItemKey, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, remark: value } : item))
    );
  };

  const handleSubmit = () => {
    if (!inspector.trim()) {
      alert('请填写巡检人姓名');
      return;
    }
    setIsSubmitting(true);

    const abnormalItems = items.filter((i) => !i.isNormal);

    updateInspection(inspection.id, {
      inspectionDate: todayStr(),
      inspector,
      status: 'completed',
      remark,
      items,
    });

    updateFacility(facility.id, {
      lastInspectionDate: todayStr(),
      status: abnormalItems.length > 0 ? 'needs_repair' : 'normal',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/inspections');
    }, 500);
  };

  const abnormalCount = items.filter((i) => !i.isNormal).length;
  const isCompleted = inspection.status === 'completed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/inspections" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回巡检列表
        </Link>
      </div>

      {/* Facility Info */}
      <div className="card p-5">
        <div className="flex flex-col md:flex-row gap-5">
          <img src={facility.photo} alt={facility.name} className="w-full md:w-48 h-36 object-cover rounded-xl" />
          <div className="flex-1">
            <h2 className="font-display text-2xl text-gray-800 mb-2">{facility.name}</h2>
            <p className="text-gray-500 mb-2">{facility.location}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-400">上次巡检：</span>
                <span className="font-medium">{formatDate(facility.lastInspectionDate)}</span>
              </div>
              <div>
                <span className="text-gray-400">适用年龄：</span>
                <span className="font-medium">{facility.ageRange}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspector Info */}
      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">巡检人 *</label>
            <input
              type="text"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              disabled={isCompleted}
              className="input-field"
              placeholder="请输入巡检人姓名"
            />
          </div>
          <div>
            <label className="label-text">巡检日期</label>
            <input type="date" value={inspection.inspectionDate} disabled className="input-field bg-gray-50" />
          </div>
        </div>
      </div>

      {/* Inspection Items */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-gray-800">巡检项目</h3>
          {abnormalCount > 0 && (
            <span className="badge bg-danger-100 text-danger-700">
              发现 {abnormalCount} 项异常
            </span>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const Icon = itemIcons[item.key];
            return (
              <div
                key={item.key}
                className={`p-4 rounded-xl border-2 transition-all animate-fade-in-up opacity-0 ${
                  item.isNormal
                    ? 'border-gray-100 bg-white'
                    : 'border-danger-200 bg-danger-50'
                }`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.isNormal ? 'bg-gray-100 text-gray-500' : 'bg-danger-100 text-danger-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className={`text-sm ${item.isNormal ? 'text-success-600' : 'text-danger-600'}`}>
                        {item.isNormal ? '正常' : '异常'}
                      </p>
                    </div>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => toggleItem(item.key)}
                      className={`w-12 h-7 rounded-full transition-all relative ${
                        item.isNormal ? 'bg-success-500' : 'bg-danger-500'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all flex items-center justify-center ${
                        item.isNormal ? 'left-5.5 right-0.5' : 'left-0.5'
                      }`} style={item.isNormal ? { left: '22px' } : { left: '2px' }}>
                        {item.isNormal ? (
                          <Check className="w-3.5 h-3.5 text-success-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-danger-500" />
                        )}
                      </div>
                    </button>
                  )}
                </div>
                {!item.isNormal && (
                  <div className="mt-3 pl-13">
                    <input
                      type="text"
                      value={item.remark || ''}
                      onChange={(e) => updateItemRemark(item.key, e.target.value)}
                      disabled={isCompleted}
                      placeholder="请描述异常情况..."
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Remark */}
      <div className="card p-5">
        <label className="label-text flex items-center gap-2">
          <Camera className="w-4 h-4" />
          巡检备注
        </label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          disabled={isCompleted}
          rows={3}
          className="input-field resize-none"
          placeholder="请输入巡检总体备注说明..."
        />
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex justify-end gap-3">
          <Link to="/inspections" className="btn-ghost">取消</Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            提交巡检记录
          </button>
        </div>
      )}
    </div>
  );
}
