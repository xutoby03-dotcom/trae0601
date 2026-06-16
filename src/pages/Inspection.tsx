import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, User, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PhotoUpload } from '../components/PhotoUpload';
import { CheckboxGroup } from '../components/CheckboxGroup';
import { getToday } from '../utils/dateUtils';
import type { Inspection as InspectionType } from '../types';

export const Inspection = () => {
  const { bathroomId } = useParams<{ bathroomId: string }>();
  const navigate = useNavigate();
  const { getBathroomById, addInspection, getSpecById, getTasksByBathroomId } = useStore();

  const bathroom = getBathroomById(bathroomId || '');

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [checks, setChecks] = useState<Partial<Pick<InspectionType, 'adsorptionOk' | 'drainageOk' | 'cleaningOk' | 'dryingOk' | 'handrailOk'>>>({
    adsorptionOk: true,
    drainageOk: true,
    cleaningOk: true,
    dryingOk: true,
    handrailOk: true,
  });
  const [notes, setNotes] = useState('');
  const [inspector, setInspector] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ createdTask: boolean; taskId?: string } | null>(null);

  const handleCheckChange = (key: string, checked: boolean) => {
    setChecks((prev) => ({ ...prev, [key as keyof typeof prev]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bathroomId) return;

    const inspectionData = {
      bathroomId,
      inspectionDate: getToday(),
      photoUrl,
      adsorptionOk: checks.adsorptionOk || false,
      drainageOk: checks.drainageOk || false,
      cleaningOk: checks.cleaningOk || false,
      dryingOk: checks.dryingOk || false,
      handrailOk: checks.handrailOk || false,
      notes,
      inspector: inspector || '未知用户',
    };

    const result = addInspection(inspectionData);
    setResult(result);
    setSubmitted(true);
  };

  if (!bathroom) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">未找到浴室</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    let spec = null;
    if (result.taskId) {
      const tasks = getTasksByBathroomId(bathroomId || '');
      const task = tasks.find((t) => t.id === result.taskId);
      if (task?.procurementSpecId) {
        spec = getSpecById(task.procurementSpecId);
      }
    }
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">检查完成！</h2>
          <p className="text-gray-600 mb-6">{bathroom.name} 的检查记录已保存</p>

          {result.createdTask && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="font-bold text-amber-800">自动生成更换任务</h3>
              </div>
              <p className="text-amber-700 mb-4">
                根据检查结果，该浴室防滑垫需要更换。已自动创建更换任务和采购规格。
              </p>
              {spec && (
                <div className="bg-white rounded-lg p-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">尺寸</div>
                    <div className="text-gray-800 font-medium">{spec.size}</div>
                    <div className="text-gray-500">材质</div>
                    <div className="text-gray-800 font-medium">{spec.material}</div>
                    <div className="text-gray-500">吸盘</div>
                    <div className="text-gray-800 font-medium">{spec.suctionCups} 个</div>
                    <div className="text-gray-500">数量</div>
                    <div className="text-gray-800 font-medium">{spec.quantity} 件</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              返回首页
            </button>
            {result.createdTask && (
              <button
                onClick={() => navigate('/tasks')}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                查看任务
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回概览</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">每周安全检查</h2>
        <p className="text-gray-600">
          正在检查：<span className="font-medium text-gray-900">{bathroom.name}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            📷 检查照片
          </label>
          <p className="text-sm text-gray-500 mb-3">
            拍摄一张防滑垫的整体照片，便于后续对比状态变化
          </p>
          <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            ✅ 检查项目
          </label>
          <p className="text-sm text-gray-500 mb-3">
            请逐项检查以下内容，正常请勾选，如有异常请取消勾选并在备注中说明
          </p>
          <CheckboxGroup value={checks} onChange={handleCheckChange} />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            👤 检查人
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            <FileText size={20} className="inline mr-2" />
            备注说明
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录发现的问题、霉斑情况、吸盘状态等详细信息..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors resize-none"
          />
          <p className="text-xs text-gray-400 mt-2">
            提示：在备注中提到"霉"或"mold"会自动标记霉斑状态
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5"
        >
          提交检查结果
        </button>
      </form>
    </div>
  );
};
