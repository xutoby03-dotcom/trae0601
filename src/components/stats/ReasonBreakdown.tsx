import { useFoodStore } from '@/store/useFoodStore';
import { formatMoney } from '@/utils/food';
import { DISCARD_REASON_LABEL, DISCARD_REASON_EMOJI } from '@/utils/constants';
import type { DiscardReason } from '@/types';
import { clsx } from 'clsx';

const allReasons: DiscardReason[] = ['spoiled', 'bought_too_much', 'forgot', 'bad_taste'];

export function ReasonBreakdown() {
  const getWasteByReason = useFoodStore((s) => s.getWasteByReason);
  const discards = useFoodStore((s) => s.discards);
  const breakdown = getWasteByReason();

  const totalCount = Object.values(breakdown).reduce((sum, r) => sum + r.count, 0);
  const totalAmount = Object.values(breakdown).reduce((sum, r) => sum + r.amount, 0);

  const gradients: Record<DiscardReason, string> = {
    spoiled: 'from-red-400 to-red-500',
    bought_too_much: 'from-amber-400 to-orange-500',
    forgot: 'from-sky-400 to-blue-500',
    bad_taste: 'from-violet-400 to-purple-500',
  };

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-800 mb-5" style={{ fontFamily: "'Fraunces', serif" }}>
        📊 丢弃原因分布
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {allReasons.map((reason) => {
          const data = breakdown[reason];
          const percentage = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;

          return (
            <div
              key={reason}
              className="relative p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[reason]}`} />
              <div className="text-3xl mb-3">{DISCARD_REASON_EMOJI[reason]}</div>
              <p className="text-sm font-medium text-slate-600 mb-1">{DISCARD_REASON_LABEL[reason]}</p>
              <p className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                {data.count} <span className="text-sm font-normal text-slate-400">件</span>
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{percentage}%</p>
                <p className="text-xs font-semibold text-slate-600">{formatMoney(data.amount)}</p>
              </div>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-500', gradients[reason])}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {totalAmount > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-orange-100">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💸</div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                总共浪费了 <span className="font-bold text-red-600">{formatMoney(totalAmount)}</span>，
                相当于 <span className="font-bold text-orange-600">{totalCount}</span> 顿外卖不见了...
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
