import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatISO } from 'date-fns';
import { Save, ArrowLeft, AlertTriangle, Sun, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DUST_LEVEL_LABELS, DRYING_STATUS_LABELS } from '@/types';
import type { CleaningRecordFormData, DryingStatus, DustLevel } from '@/types';
import { useACStatus } from '@/hooks/useACStatus';
import { useAppStore } from '@/store/useAppStore';

interface RecordFormProps {
  onSuccess?: () => void;
}

const familyMembers = ['爸爸', '妈妈', '爷爷', '奶奶', '小明', '小红', '其他'];

export function RecordForm({ onSuccess }: RecordFormProps) {
  const { acId } = useParams<{ acId: string }>();
  const navigate = useNavigate();
  const { getACById } = useACStatus();
  const { addCleaningRecord, installBack, updateCleaningRecord, canInstallBack } = useAppStore();

  const ac = acId ? getACById(acId) : undefined;
  const existingRecord = ac?.latestRecord && !ac.latestRecord.installedBackAt
    ? ac.latestRecord
    : undefined;

  const [formData, setFormData] = useState<CleaningRecordFormData>({
    cleaner: existingRecord?.cleaner || '',
    removedAt: existingRecord?.removedAt || formatISO(new Date(), { representation: 'date' }),
    dustLevel: existingRecord?.dustLevel || 'medium',
    dryingStatus: existingRecord?.dryingStatus || 'drying',
    ventWiped: existingRecord?.ventWiped || false,
    notes: existingRecord?.notes || '',
  });

  const [showInstallBack, setShowInstallBack] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => {
    if (existingRecord && !existingRecord.installedBackAt) {
      setShowInstallBack(true);
    }
  }, [existingRecord]);

  const handleChange = (
    field: keyof CleaningRecordFormData,
    value: string | boolean | DryingStatus | DustLevel
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setInstallError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acId) return;

    if (existingRecord) {
      updateCleaningRecord(existingRecord.id, formData);
    } else {
      addCleaningRecord(acId, {
        ...formData,
        installedBackAt: undefined,
      });
    }

    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/');
    }
  };

  const handleInstallBack = () => {
    if (!existingRecord) return;

    if (formData.dryingStatus !== 'dried') {
      setInstallError('滤网未晾干，不能装回！请先将晾干状态改为"已晾干"。');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    updateCleaningRecord(existingRecord.id, {
      dryingStatus: formData.dryingStatus,
    });

    const result = installBack(existingRecord.id, formatISO(new Date()));
    if (!result.success) {
      setInstallError(result.error || '操作失败');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } else {
      setFormData((prev) => ({
        ...prev,
        dryingStatus: 'dried',
      }));
      setShowInstallBack(false);
    }
  };

  if (!ac) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-800 mb-2">未找到该空调</h2>
        <button
          onClick={() => navigate('/')}
          className="text-primary-500 hover:text-primary-600"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {existingRecord ? '更新清洗记录' : '开始清洗'}
          </h2>
          <p className="text-sm text-gray-500">
            {ac.room} · {ac.brand} {ac.model}
          </p>
        </div>
      </div>

      {installError && (
        <div
          className={cn(
            'mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700',
            shakeError && 'animate-shake'
          )}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{installError}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">清洗流程提示</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>拆下滤网，记录拆下时间和灰尘程度</li>
                <li>清洗滤网后选择晾干状态</li>
                <li>
                  <strong>滤网已晾干后，必须点击"标记装回"按钮</strong>才能完成
                </li>
                <li>系统自动记录装回时间，完成清洗流程</li>
              </ol>
            </div>
          </div>
        </div>

        {existingRecord && showInstallBack && (
          <div className={cn(
            'p-4 rounded-xl border',
            formData.dryingStatus === 'dried'
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {formData.dryingStatus === 'dried' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <p className={cn(
                    'font-medium',
                    formData.dryingStatus === 'dried' ? 'text-green-800' : 'text-amber-800'
                  )}>
                    滤网晾干状态
                  </p>
                  <p className={cn(
                    'text-sm',
                    formData.dryingStatus === 'dried' ? 'text-green-700' : 'text-amber-700'
                  )}>
                    当前状态：{DRYING_STATUS_LABELS[formData.dryingStatus as DryingStatus]}
                  </p>
                  {formData.dryingStatus === 'dried' && (
                    <p className="text-xs text-green-600 mt-1">
                      滤网已晾干，点击"标记装回"完成清洗流程
                    </p>
                  )}
                  {formData.dryingStatus !== 'dried' && (
                    <p className="text-xs text-amber-600 mt-1">
                      请等待滤网完全晾干后再装回
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallBack}
                disabled={formData.dryingStatus !== 'dried'}
                className={cn(
                  'px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2',
                  formData.dryingStatus === 'dried'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                标记装回
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              拆洗人 *
            </label>
            <div className="flex flex-wrap gap-2">
              {familyMembers.map((member) => (
                <button
                  key={member}
                  type="button"
                  onClick={() => handleChange('cleaner', member)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    formData.cleaner === member
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {member}
                </button>
              ))}
            </div>
            {formData.cleaner === '其他' && (
              <input
                type="text"
                placeholder="请输入姓名"
                value={formData.cleaner === '其他' ? '' : formData.cleaner}
                onChange={(e) => handleChange('cleaner', e.target.value)}
                className="mt-3 w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              拆下时间 *
            </label>
            <input
              type="datetime-local"
              value={formData.removedAt.slice(0, 16)}
              onChange={(e) => handleChange('removedAt', new Date(e.target.value).toISOString())}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              灰尘程度 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'medium', 'heavy'] as DustLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleChange('dustLevel', level)}
                  className={cn(
                    'py-3 px-4 rounded-xl text-sm font-medium transition-all border-2',
                    formData.dustLevel === level
                      ? level === 'light'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : level === 'medium'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {DUST_LEVEL_LABELS[level]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              晾干状态 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['not_dried', 'drying', 'dried'] as DryingStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleChange('dryingStatus', status)}
                  className={cn(
                    'py-3 px-4 rounded-xl text-sm font-medium transition-all border-2',
                    formData.dryingStatus === status
                      ? status === 'not_dried'
                        ? 'bg-gray-50 border-gray-500 text-gray-700'
                        : status === 'drying'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {DRYING_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={cn(
                  'w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center',
                  formData.ventWiped
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 group-hover:border-primary-400'
                )}
              >
                {formData.ventWiped && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                顺便擦了出风口
              </span>
              <input
                type="checkbox"
                checked={formData.ventWiped}
                onChange={(e) => handleChange('ventWiped', e.target.checked)}
                className="hidden"
              />
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="记录清洗过程中的特殊情况..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <Save className="w-4 h-4" />
            {existingRecord ? '更新记录' : '开始清洗'}
          </button>
        </div>
      </div>
    </form>
  );
}
