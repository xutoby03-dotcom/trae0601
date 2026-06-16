import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DamageType } from '@/types';
import { DAMAGE_TYPE_LABELS } from '@/types';

interface ReturnCheckListProps {
  checks: {
    skin: boolean;
    interface: boolean;
    charging: boolean;
  };
  onChange: (checks: { skin: boolean; interface: boolean; charging: boolean }) => void;
}

const checkItems = [
  { key: 'skin' as DamageType, label: '外皮完好', icon: '🔌', description: '检查线材外皮是否有破损、裂痕' },
  { key: 'interface' as DamageType, label: '接口紧固', icon: '🔗', description: '检查接口是否松动、变形' },
  { key: 'charging' as DamageType, label: '充电正常', icon: '⚡', description: '测试充电功能是否正常' },
];

export const ReturnCheckList = ({ checks, onChange }: ReturnCheckListProps) => {
  const handleToggle = (key: keyof typeof checks) => {
    onChange({
      ...checks,
      [key]: !checks[key],
    });
  };

  const allPassed = checks.skin && checks.interface && checks.charging;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {allPassed ? (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">状态检查</h3>
          <p className="text-sm text-gray-500">
            {allPassed ? '所有检查项已通过' : '请检查线材状态，勾选正常的项目'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {checkItems.map(item => (
          <div
            key={item.key}
            onClick={() => handleToggle(item.key)}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
              checks[item.key]
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
            )}
          >
            <div className="text-2xl">{item.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                {checks[item.key] ? (
                  <span className="text-xs text-green-600 font-medium">正常</span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">待确认</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <div className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
              checks[item.key]
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300'
            )}>
              {checks[item.key] && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        ))}
      </div>

      {!allPassed && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                发现异常情况
              </p>
              <p className="text-xs text-amber-600 mt-1">
                未通过的检查项将被记录为损坏，请在下方填写损坏说明
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
