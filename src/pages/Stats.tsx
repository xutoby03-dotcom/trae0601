import { CalendarCheck, Hash, Coins, Repeat, Clock, AlertCircle, Package } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MATERIAL_TYPE_LABELS } from '@/types';
import type { MaterialType } from '@/types';

export default function Stats() {
  const { materials, usageRecords, usageItems } = useJournalStore();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonthRecords = usageRecords.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const thisMonthRecordIds = new Set(thisMonthRecords.map((r) => r.id));

  const thisMonthUsageItems = usageItems.filter((ui) =>
    thisMonthRecordIds.has(ui.usageRecordId)
  );

  const usageCount = thisMonthRecords.length;

  const totalQuantityUsed = thisMonthUsageItems.reduce(
    (sum, ui) => sum + ui.quantityUsed,
    0
  );

  const estimatedCost = thisMonthUsageItems.reduce((sum, ui) => {
    const material = materials.find((m) => m.id === ui.materialId);
    if (!material) return sum;
    return sum + ui.quantityUsed * material.price;
  }, 0);

  const themeGroups: Record<string, string[]> = {};
  for (const m of materials) {
    if (!themeGroups[m.theme]) {
      themeGroups[m.theme] = [];
    }
    themeGroups[m.theme].push(m.name);
  }

  const repeatThemes = Object.entries(themeGroups)
    .filter(([, names]) => names.length >= 2)
    .sort((a, b) => b[1].length - a[1].length);

  const usedMaterialIds = new Set(usageItems.map((ui) => ui.materialId));

  const unusedMaterials = materials
    .filter((m) => !usedMaterialIds.has(m.id))
    .map((m) => ({
      ...m,
      daysSinceAdded: Math.floor(
        (now.getTime() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => b.daysSinceAdded - a.daysSinceAdded);

  const badgeClass = (type: MaterialType) => {
    const map: Record<MaterialType, string> = {
      sticker: 'badge-sticker',
      tape: 'badge-tape',
      memo: 'badge-memo',
      stamp: 'badge-stamp',
    };
    return map[type];
  };

  return (
    <div className="page-container">
      <h1 className="page-title">数据统计</h1>

      <section className="mb-8">
        <h2 className="section-title flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-brown" />
          月度使用概览
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="card-paper rounded-2xl p-5 text-center">
            <Hash className="w-7 h-7 text-brown mx-auto mb-2" />
            <div className="text-3xl font-bold text-brown-dark font-serif">
              {usageCount}
            </div>
            <div className="text-sm text-brown-muted mt-1">使用次数</div>
          </div>
          <div className="card-paper rounded-2xl p-5 text-center">
            <Package className="w-7 h-7 text-mint-deep mx-auto mb-2" />
            <div className="text-3xl font-bold text-brown-dark font-serif">
              {totalQuantityUsed}
            </div>
            <div className="text-sm text-brown-muted mt-1">消耗数量</div>
          </div>
          <div className="card-paper rounded-2xl p-5 text-center">
            <Coins className="w-7 h-7 text-coral mx-auto mb-2" />
            <div className="text-3xl font-bold text-brown-dark font-serif">
              ¥{estimatedCost.toFixed(1)}
            </div>
            <div className="text-sm text-brown-muted mt-1">花费估算</div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="section-title flex items-center gap-2">
          <Repeat className="w-5 h-5 text-brown" />
          重复购买分析
        </h2>
        {repeatThemes.length === 0 ? (
          <div className="card-paper rounded-2xl p-6 text-center text-brown-muted">
            暂无重复购买的素材主题
          </div>
        ) : (
          <div className="space-y-3">
            {repeatThemes.map(([theme, names]) => (
              <div
                key={theme}
                className="card-paper rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-serif font-semibold text-brown-dark">
                    {theme}
                  </span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-soft/40 text-pink-deep text-xs font-bold">
                    {names.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {names.map((name) => (
                    <span
                      key={name}
                      className="px-2.5 py-1 rounded-lg bg-cream-dark/50 text-brown text-sm"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-coral" />
          闲置素材提醒
        </h2>
        {unusedMaterials.length === 0 ? (
          <div className="card-paper rounded-2xl p-6 text-center text-brown-muted">
            所有素材都已使用过
          </div>
        ) : (
          <div className="space-y-3">
            {unusedMaterials.map((m) => (
              <div
                key={m.id}
                className="card-paper rounded-2xl p-4 flex items-center gap-4"
              >
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="w-12 h-12 rounded-lg object-cover border border-brown-muted/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-cream-dark/50 flex items-center justify-center border border-brown-muted/20">
                    <Package className="w-5 h-5 text-brown-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-brown-dark truncate">
                    {m.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={badgeClass(m.type)}>
                      {MATERIAL_TYPE_LABELS[m.type]}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-brown-muted text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{m.daysSinceAdded}天</span>
                  </div>
                  <div className="text-xs text-brown-muted/60 mt-0.5">未使用</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
