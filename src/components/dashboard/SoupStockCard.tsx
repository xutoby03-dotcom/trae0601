import { useMemo } from 'react';
import { Droplets, AlertTriangle } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import type { SoupType } from '@/types';
import { SOUP_TYPE_LABEL, SOUP_TYPE_COLOR } from '@/utils/soupConfig';

export default function SoupStockCard() {
  const batches = useBatchStore((s) => s.batches);
  const maxL = 50;
  const warnThreshold = 10;

  const stock = useMemo(() => {
    const map = new Map<SoupType, number>();
    batches
      .filter((b) => b.saleWindow && b.saleWindow.remainingL > 0)
      .forEach((b) => {
        const cur = map.get(b.soupType) || 0;
        map.set(b.soupType, cur + (b.saleWindow?.remainingL || 0));
      });
    return Array.from(map.entries()).map(([soupType, remainingL]) => ({ soupType, remainingL }));
  }, [batches]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-soup-50 flex items-center justify-center text-soup-600">
            <Droplets className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-broth-800">可用汤底剩余量</h3>
        </div>
      </div>

      {stock.length === 0 ? (
        <div className="py-12 text-center text-broth-400">
          <Droplets className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>暂无可用汤底</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stock.map(({ soupType, remainingL }) => {
            const isLow = remainingL < warnThreshold;
            const pct = Math.min(100, (remainingL / maxL) * 100);

            return (
              <div key={soupType}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${SOUP_TYPE_COLOR[soupType]}`}>{SOUP_TYPE_LABEL[soupType]}</span>
                    {isLow && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        库存偏低
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xl font-bold text-broth-800">{remainingL}</span>
                    <span className="text-sm text-broth-500 ml-1">L</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-broth-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isLow
                        ? 'bg-gradient-to-r from-red-300 to-red-500'
                        : 'bg-gradient-to-r from-soup-300 to-soup-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
