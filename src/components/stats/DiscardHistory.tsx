import { useFoodStore } from '@/store/useFoodStore';
import { formatMoney } from '@/utils/food';
import { DISCARD_REASON_LABEL, DISCARD_REASON_EMOJI, DISCARD_REASON_COLOR } from '@/utils/constants';
import { formatDate } from '@/utils/date';
import { Trash2 } from 'lucide-react';

export function DiscardHistory() {
  const discards = useFoodStore((s) => s.discards);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
          🗑️ 丢弃历史记录
        </h2>
        <span className="text-sm text-slate-500">共 {discards.length} 条记录</span>
      </div>

      {discards.length === 0 ? (
        <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
          <div className="text-5xl mb-3">🌱</div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-1">零浪费记录</h3>
          <p className="text-sm text-emerald-600/80">保持住，珍惜每一餐！</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">日期</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">食材</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">原因</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">浪费数量</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">浪费金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {discards.map((record, idx) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{formatDate(record.discardedAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                          <Trash2 className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-800">{record.foodName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${DISCARD_REASON_COLOR[record.reason]}`}>
                        {DISCARD_REASON_EMOJI[record.reason]} {DISCARD_REASON_LABEL[record.reason]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-600">{record.wastedQuantity.toFixed(record.wastedQuantity < 1 ? 1 : 0)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-red-600">{formatMoney(record.wastedAmount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
