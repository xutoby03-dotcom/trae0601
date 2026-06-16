import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, AlertTriangle } from 'lucide-react';
import { ReturnCheckList } from './ReturnCheckList';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils/dateUtils';
import { INTERFACE_TYPE_LABELS, DAMAGE_TYPE_LABELS } from '@/types';
import type { DamageType } from '@/types';

interface FormData {
  damageReport: string;
}

export const ReturnForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBorrowRecordById, getCableById, returnCable } = useAppStore();

  const [checks, setChecks] = useState({
    skin: true,
    interface: true,
    charging: true,
  });

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      damageReport: '',
    },
  });

  const borrowRecord = id ? getBorrowRecordById(id) : undefined;
  const cable = borrowRecord ? getCableById(borrowRecord.cableId) : undefined;

  const hasDamage = !checks.skin || !checks.interface || !checks.charging;

  const getDamageType = (): DamageType | undefined => {
    if (!checks.charging) return 'charging';
    if (!checks.interface) return 'interface';
    if (!checks.skin) return 'skin';
    return undefined;
  };

  const onSubmit = async (data: FormData) => {
    if (!id) return;

    const damageType = getDamageType();
    const result = returnCable(id, checks, data.damageReport, damageType);

    if (result) {
      if (hasDamage) {
        alert('归还成功！已记录损坏情况，管理员将会处理。');
      } else {
        alert('归还成功！感谢您的使用。');
      }
      navigate('/my-borrow');
    } else {
      alert('归还失败，请检查记录状态');
    }
  };

  if (!borrowRecord || !cable) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">借用记录不存在</h2>
        <button
          onClick={() => navigate('/return')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回归还列表
        </button>
      </div>
    );
  }

  if (borrowRecord.status !== 'borrowing') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">该记录已归还</h2>
        <button
          onClick={() => navigate('/return')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回归还列表
        </button>
      </div>
    );
  }

  const interfaceColors: Record<string, string> = {
    'USB-C': 'bg-blue-100 text-blue-700',
    'Lightning': 'bg-purple-100 text-purple-700',
    'Micro-USB': 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/return')}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">归还登记</h1>
          <p className="text-sm text-gray-500">检查线材状态并确认归还</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">借用信息</h2>
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
            <img src={cable.photoUrl} alt={cable.code} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">{cable.code}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${interfaceColors[cable.interfaceType]}`}>
                {INTERFACE_TYPE_LABELS[cable.interfaceType]}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">借用人</p>
                <p className="text-gray-900">{borrowRecord.employeeName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">部门</p>
                <p className="text-gray-900">{borrowRecord.department}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">设备</p>
                <p className="text-gray-900">{borrowRecord.device}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">用途</p>
                <p className="text-gray-900">{borrowRecord.purpose}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">借用时间</p>
                <p className="font-mono text-gray-900">{formatDateTime(borrowRecord.borrowTime)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">预计归还</p>
                <p className="font-mono text-gray-900">{formatDateTime(borrowRecord.expectedReturn)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">状态检查</h2>
          <ReturnCheckList checks={checks} onChange={setChecks} />
        </div>

        {hasDamage && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              损坏说明
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">检测到的损坏类型：</p>
              <div className="flex flex-wrap gap-2">
                {!checks.skin && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {DAMAGE_TYPE_LABELS.skin}
                  </span>
                )}
                {!checks.interface && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {DAMAGE_TYPE_LABELS.interface}
                  </span>
                )}
                {!checks.charging && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {DAMAGE_TYPE_LABELS.charging}
                  </span>
                )}
              </div>
              {!checks.charging && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  充电异常的线材将被标记为报废
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                详细说明 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('damageReport', { 
                  required: hasDamage ? '请填写损坏说明' : false,
                  minLength: { value: 5, message: '请至少填写5个字符' },
                })}
                rows={4}
                placeholder="请详细描述损坏情况，如：外皮在靠近接口处有裂痕，接口有点松动..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              {watch('damageReport') && (
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {watch('damageReport').length} 字
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/return')}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 text-sm font-medium text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              hasDamage
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <Save className="w-4 h-4" />
            {hasDamage ? '标记损坏并归还' : '确认归还'}
          </button>
        </div>
      </form>
    </div>
  );
};
