import { CoffeeRecord, ROAST_LABELS, NEGATIVE_REASON_LABELS } from '@/types';
import { Edit, Copy, Trash2, Star, StarOff, GitBranch } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

interface Props {
  record: CoffeeRecord;
}

export default function RecordRow({ record }: Props) {
  const deleteRecord = useCoffeeStore((s) => s.deleteRecord);
  const setTodayRecommended = useCoffeeStore((s) => s.setTodayRecommended);
  const records = useCoffeeStore((s) => s.records);

  const { parent, negativeCount } = useMemo(() => {
    const parent = record.parentId ? records.find((r) => r.id === record.parentId) : null;
    const sameBatch = records
      .filter((r) => r.beanName === record.beanName && r.batchDate === record.batchDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let count = 0;
    for (const r of sameBatch) {
      if (r.negativeReason !== null) {
        count++;
      } else {
        break;
      }
    }
    return { parent, negativeCount: count };
  }, [record, records]);

  const roastBadgeColor: Record<string, string> = {
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-orange-50 text-orange-700 border-orange-200',
    dark: 'bg-coffee-100 text-coffee-700 border-coffee-300',
  };

  const reasonBadgeColor: Record<string, string> = {
    sour: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    bitter: 'bg-red-50 text-red-700 border-red-200',
    weak: 'bg-blue-50 text-blue-700 border-blue-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <tr
      className={`border-b border-coffee-100 transition-colors hover:bg-coffee-50/50 ${
        record.isTodayRecommended ? 'bg-matcha/5' : ''
      }`}
    >
      <td className="table-cell">
        <div className="flex items-start gap-2">
          {record.isTodayRecommended && (
            <Star className="w-4 h-4 text-matcha flex-shrink-0 mt-0.5 fill-matcha" />
          )}
          <div>
            <p className="font-medium text-coffee-800">{record.beanName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`badge border ${roastBadgeColor[record.roastLevel]}`}>
                {ROAST_LABELS[record.roastLevel]}
              </span>
              <span className="text-xs text-coffee-500">{record.batchDate}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="table-cell">
        <p className="font-medium">{record.grinder}</p>
        <p className="text-xs text-coffee-500">{record.dripper}</p>
      </td>
      <td className="table-cell">
        <p className="text-lg font-bold text-coffee-800 font-display">{record.grindSetting}</p>
      </td>
      <td className="table-cell">
        <p>{record.waterTemp}℃</p>
      </td>
      <td className="table-cell">
        <p className="font-medium">{record.ratio}</p>
      </td>
      <td className="table-cell">
        <p>{record.pourStages} 段</p>
      </td>
      <td className="table-cell">
        <p>{record.brewTime} 秒</p>
      </td>
      <td className="table-cell max-w-xs">
        {record.negativeReason && (
          <div className="flex items-center gap-1 mb-1">
            <span className={`badge border ${reasonBadgeColor[record.negativeReason]}`}>
              ⚠️ {NEGATIVE_REASON_LABELS[record.negativeReason]}
            </span>
            {negativeCount >= 2 && (
              <span className="badge bg-red-100 text-red-700 border border-red-200">
                连续{negativeCount}次
              </span>
            )}
          </div>
        )}
        {record.flavorNotes && (
          <p className="text-xs text-coffee-600 line-clamp-2">{record.flavorNotes}</p>
        )}
        {record.negativeReason && record.adjustmentNote && (
          <p className="text-xs text-amber/80 mt-1 line-clamp-2">
            <span className="font-medium">调整：</span>
            {record.adjustmentNote}
          </p>
        )}
        {parent && (
          <p className="text-xs text-coffee-400 mt-1 flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            改版自 {parent.beanName}
          </p>
        )}
      </td>
      <td className="table-cell">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTodayRecommended(record.id)}
            className={`p-1.5 rounded-md transition-colors ${
              record.isTodayRecommended
                ? 'bg-matcha text-white hover:bg-matcha-light'
                : 'text-coffee-400 hover:text-matcha hover:bg-matcha/10'
            }`}
            title={record.isTodayRecommended ? '取消今日推荐' : '设为今日推荐'}
          >
            {record.isTodayRecommended ? (
              <Star className="w-4 h-4 fill-current" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </button>
          <Link
            to={`/records/${record.id}/edit`}
            className="p-1.5 rounded-md text-coffee-400 hover:text-coffee-700 hover:bg-coffee-100 transition-colors"
            title="编辑"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <Link
            to={`/records/${record.id}/revise`}
            className="p-1.5 rounded-md text-coffee-400 hover:text-amber hover:bg-amber/10 transition-colors"
            title="改版（复制参数并记录差评原因）"
          >
            <Copy className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (confirm('确定删除这条记录吗？')) deleteRecord(record.id);
            }}
            className="p-1.5 rounded-md text-coffee-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
