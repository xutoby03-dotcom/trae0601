import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Trash2, Waves, Shirt, Camera, Aperture, Layers, Anchor, FileText } from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import RatingInput from '@/components/RatingInput';
import Bubbles from '@/components/Bubbles';
import PlanSummary from '@/components/PlanSummary';
import { RATING_ITEMS, CAMERA_HOUSING_PRESETS, LENS_PORT_PRESETS, BUOYANCY_ARM_PRESETS } from '@/types';

export default function PlanDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPlan, deletePlan, duplicatePlan } = usePlanStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

  const plan = id ? getPlan(id) : undefined;

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">方案不存在或已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const handleDuplicate = () => {
    const newPlan = duplicatePlan(plan.id);
    navigate(`/edit/${newPlan.id}`, {
      state: { sourcePlanId: plan.id },
    });
  };

  const handleDelete = () => {
    deletePlan(plan.id);
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const avgRating = (
    (plan.pitchForward +
      plan.pitchBackward +
      plan.roll +
      plan.ascentSpeed +
      plan.handling) /
    5
  ).toFixed(1);

  const configItems = [
    { label: '水域盐度', value: plan.salinity, icon: Waves, isCustom: false },
    { label: '潜水服厚度', value: plan.wetsuitThickness, icon: Shirt, isCustom: false },
    { label: '相机壳体', value: plan.cameraHousing, icon: Camera, isCustom: !CAMERA_HOUSING_PRESETS.includes(plan.cameraHousing) },
    { label: '镜头罩', value: plan.lensPort, icon: Aperture, isCustom: !LENS_PORT_PRESETS.includes(plan.lensPort) },
    { label: '浮力臂', value: plan.buoyancyArm, icon: Layers, isCustom: !BUOYANCY_ARM_PRESETS.includes(plan.buoyancyArm) },
    { label: '铅块位置', value: plan.leadPosition, icon: Anchor, isCustom: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative">
      <Bubbles />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {plan.name}
              </h1>
              <p className="text-sm text-slate-400">
                创建于 {formatDate(plan.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="text-2xl font-bold text-amber-400">{avgRating}</span>
              <span className="text-amber-400">★</span>
            </div>
          </div>
        </header>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate(`/edit/${plan.id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 
                       bg-cyan-500/10 border border-cyan-500/30 text-cyan-400
                       rounded-xl hover:bg-cyan-500/20 transition-colors"
          >
            <Edit size={18} />
            <span>编辑</span>
          </button>
          <button
            onClick={() => setShowDuplicateConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 
                       bg-slate-700/30 border border-slate-600/30 text-slate-300
                       rounded-xl hover:bg-slate-700/50 transition-colors"
          >
            <Copy size={18} />
            <span>复用方案</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 
                       bg-red-500/10 border border-red-500/30 text-red-400
                       rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Equipment Config */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Camera size={20} className="text-cyan-400" />
            装备配置
          </h2>
          <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/30 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {configItems.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 p-4 ${
                    index % 2 === 0 ? 'sm:border-r border-slate-700/30' : ''
                  } ${index < configItems.length - 2 ? 'border-b border-slate-700/30' : index < configItems.length - 1 && configItems.length % 2 === 0 ? 'sm:border-b-0 border-b border-slate-700/30' : ''}`}
                >
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <item.icon size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="text-white font-medium flex items-center gap-2 flex-wrap">
                      {item.value}
                      {item.isCustom && (
                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                          自定义
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Ratings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText size={20} className="text-cyan-400" />
            下潜反馈
          </h2>
          <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/30 p-5 space-y-5">
            {RATING_ITEMS.map((item) => (
              <RatingInput
                key={item.key}
                label={item.label}
                description={item.description}
                value={plan[item.key] as number}
                onChange={() => {}}
                readOnly
              />
            ))}
          </div>
        </section>

        {/* Notes */}
        {plan.notes && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-cyan-400" />
              备注
            </h2>
            <div className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/30 p-5">
              <p className="text-slate-300 whitespace-pre-wrap">{plan.notes}</p>
            </div>
          </section>
        )}

        {/* Footer Info */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            最后更新：{formatDate(plan.updatedAt)}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full
                       shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
            <p className="text-slate-400 mb-6">
              删除后无法恢复，确定要删除「{plan.name}」吗？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-300 hover:text-white 
                           hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30
                           hover:bg-red-500/20 rounded-lg transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {showDuplicateConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDuplicateConfirm(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full
                       shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Copy className="text-cyan-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">复用此方案</h3>
                <p className="text-xs text-slate-400">将创建一个副本供你修改</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <PlanSummary plan={plan} />
            </div>

            <p className="text-sm text-slate-400 mb-6">
              新方案将复制以上全部配置，你可以在编辑页调整后保存。
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDuplicateConfirm(false)}
                className="px-4 py-2 text-slate-300 hover:text-white 
                           hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDuplicate}
                className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30
                           hover:bg-cyan-500/20 rounded-lg transition-colors"
              >
                确认复用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
