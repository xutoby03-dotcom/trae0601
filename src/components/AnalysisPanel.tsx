import { useStore } from '@/store/useStore';
import { TrendingDown, AlertTriangle, Target, BarChart3, XCircle } from 'lucide-react';

export default function AnalysisPanel() {
  const { currentSessionId, envelopes, flowEvents, getEnvelopeEvents, selectedEnvelopeId, setSelectedEnvelope, getFilteredEnvelopes, statusFilter } = useStore();
  const allSessionEnvelopes = envelopes.filter((e) => e.sessionId === currentSessionId);
  const sessionEnvelopes = currentSessionId ? getFilteredEnvelopes(currentSessionId) : allSessionEnvelopes;

  const wronglyTakenCount = sessionEnvelopes.map((env) => {
    const events = getEnvelopeEvents(env.id);
    const count = events.filter((e) => e.eventType === 'wrongly_taken').length;
    return { env, count };
  })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const missedKeyEvidences = sessionEnvelopes.filter((env) => {
    if (!env.isKeyEvidence) return false;
    if (env.status === 'missed') return true;
    const events = getEnvelopeEvents(env.id);
    return !events.some((e) => e.eventType === 'opened');
  });

  const earlyExposed = (() => {
    const byAct: Record<number, { env: typeof sessionEnvelopes[0]; createdTs: number; openedTs: number }[]> = {};

    sessionEnvelopes.forEach((env) => {
      const events = getEnvelopeEvents(env.id);
      const createdEvent = events.find((e) => e.eventType === 'created');
      const openedEvent = events.find((e) => e.eventType === 'opened');
      if (!createdEvent || !openedEvent) return;
      if (!byAct[env.actNumber]) byAct[env.actNumber] = [];
      byAct[env.actNumber].push({
        env,
        createdTs: new Date(createdEvent.timestamp).getTime(),
        openedTs: new Date(openedEvent.timestamp).getTime(),
      });
    });

    const result: { env: typeof sessionEnvelopes[0]; earlyPct: number; relMinutes: number; avgMinutes: number }[] = [];
    Object.entries(byAct).forEach(([, items]) => {
      if (items.length < 2) return;

      const actStart = Math.min(...items.map((x) => x.createdTs));
      const relativeMinutes = items.map((x) => (x.openedTs - actStart) / 60000);
      const avgMin = relativeMinutes.reduce((s, v) => s + v, 0) / relativeMinutes.length;

      items.forEach((item, i) => {
        const rel = relativeMinutes[i];
        if (avgMin > 0 && rel < avgMin) {
          const pct = Math.round(((avgMin - rel) / avgMin) * 100);
          if (pct >= 20) {
            result.push({ env: item.env, earlyPct: pct, relMinutes: Math.round(rel), avgMinutes: Math.round(avgMin) });
          }
        }
      });
    });
    return result.sort((a, b) => b.earlyPct - a.earlyPct);
  })();

  const totalEnvelopes = sessionEnvelopes.length;
  const openedCount = sessionEnvelopes.filter((e) => e.status === 'opened').length;
  const missedCount = sessionEnvelopes.filter((e) => e.status === 'missed').length;
  const keyCount = sessionEnvelopes.filter((e) => e.isKeyEvidence).length;

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className={`p-3 rounded-lg border-2 ${color}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-serif font-bold mt-1">{value}</p>
    </div>
  );

  const FILTER_LABEL: Record<string, string> = {
    picked: '领取',
    opened: '打开',
    wrongly_taken: '误拿',
    missed: '遗漏',
    reissued: '补发',
  };

  if (!currentSessionId || allSessionEnvelopes.length === 0) {
    return (
      <div className="card-parchment p-4 h-full flex flex-col animate-fade-in-up">
        <h2 className="font-serif text-xl font-bold text-ink-800 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5" />
          汇总分析
        </h2>
        <div className="flex-1 flex items-center justify-center text-ink-700 text-center">
          选择场次并登记线索后查看分析
        </div>
      </div>
    );
  }

  const maxWrongly = wronglyTakenCount[0]?.count || 1;

  return (
    <div className="card-parchment p-4 h-full flex flex-col animate-fade-in-up overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-ink-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          汇总分析
        </h2>
        {statusFilter && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-800 text-parchment-50 font-semibold">
            仅统计：{FILTER_LABEL[statusFilter]} ({sessionEnvelopes.length})
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="线索总数"
            value={totalEnvelopes}
            color="bg-parchment-100 border-parchment-300 text-ink-800"
          />
          <StatCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="关键证据"
            value={keyCount}
            color="bg-red-50 border-seal-red text-seal-red"
          />
          <StatCard
            icon={<TrendingDown className="w-4 h-4" />}
            label="已打开"
            value={`${openedCount} (${totalEnvelopes ? Math.round((openedCount / totalEnvelopes) * 100) : 0}%)`}
            color="bg-green-50 border-seal-green text-seal-green"
          />
          <StatCard
            icon={<XCircle className="w-4 h-4" />}
            label="被遗漏"
            value={`${missedCount} (${totalEnvelopes ? Math.round((missedCount / totalEnvelopes) * 100) : 0}%)`}
            color="bg-amber-50 border-seal-amber text-amber-800"
          />
        </div>

        <div className="p-3 rounded-lg border-2 border-seal-red bg-red-50">
          <h3 className="font-serif font-bold text-seal-red flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4" />
            被错过的关键证据
          </h3>
          {missedKeyEvidences.length === 0 ? (
            <p className="text-sm text-ink-700">本场关键证据均已被发现 🎉</p>
          ) : (
            <ul className="space-y-1.5">
              {missedKeyEvidences.map((env) => {
                const isSelected = selectedEnvelopeId === env.id;
                return (
                  <li key={env.id}>
                    <button
                      onClick={() => setSelectedEnvelope(isSelected ? null : env.id)}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                        isSelected ? 'bg-red-100 border border-seal-red' : 'hover:bg-red-100/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between text-sm">
                        <span className="text-ink-800 font-medium">• {env.name}</span>
                        <span className="text-xs text-ink-700">第{env.actNumber}幕 · {env.ownerCharacter || '公开'}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {earlyExposed.length > 0 && (
          <div className="p-3 rounded-lg border-2 border-seal-amber bg-amber-50">
            <h3 className="font-serif font-bold text-amber-800 flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-4 h-4" />
              暴露过早的封套
            </h3>
            <p className="text-xs text-ink-700 mb-2">相对同幕平均打开时间偏早 20% 以上</p>
            <ul className="space-y-2">
              {earlyExposed.map(({ env, earlyPct, relMinutes, avgMinutes }) => {
                const isSelected = selectedEnvelopeId === env.id;
                return (
                  <li key={env.id}>
                    <button
                      onClick={() => setSelectedEnvelope(isSelected ? null : env.id)}
                      className={`w-full text-left p-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-seal-amber bg-amber-100 shadow-stamp -translate-y-0.5'
                          : 'border-transparent hover:bg-amber-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-800 font-medium">• {env.name}</span>
                        <span className="text-xs font-bold text-amber-800">早 {earlyPct}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-ink-700 mt-0.5">
                        <span>{relMinutes} 分钟打开（同幕平均 {avgMinutes} 分钟）</span>
                      </div>
                      <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-seal-amber rounded-full transition-all"
                          style={{ width: `${Math.min(earlyPct, 100)}%` }}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="p-3 rounded-lg border-2 border-parchment-300 bg-parchment-50">
          <h3 className="font-serif font-bold text-ink-800 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-4 h-4 text-seal-amber" />
            误拿高频榜
          </h3>
          {wronglyTakenCount.length === 0 ? (
            <p className="text-sm text-ink-700">本场无误拿记录 ✓</p>
          ) : (
            <ul className="space-y-2">
              {wronglyTakenCount.slice(0, 5).map(({ env, count }, idx) => {
                const isSelected = selectedEnvelopeId === env.id;
                return (
                  <li key={env.id}>
                    <button
                      onClick={() => setSelectedEnvelope(isSelected ? null : env.id)}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                        isSelected ? 'bg-parchment-200 border border-parchment-400' : 'hover:bg-parchment-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-800">
                          <span className="inline-block w-5 text-center font-bold text-ink-700">{idx + 1}.</span>
                          {env.name}
                        </span>
                        <span className="text-xs font-bold text-seal-amber">{count} 次</span>
                      </div>
                      <div className="h-2 bg-parchment-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-seal-amber rounded-full transition-all"
                          style={{ width: `${(count / maxWrongly) * 100}%` }}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-3 rounded-lg border-2 border-parchment-300 bg-parchment-50">
          <h3 className="font-serif font-bold text-ink-800 mb-2">整体流转统计</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-ink-700">领取事件</p>
              <p className="text-lg font-bold text-seal-green font-serif">
                {flowEvents.filter((f) => f.eventType === 'picked' && sessionEnvelopes.find((e) => e.id === f.envelopeId)).length}
              </p>
            </div>
            <div>
              <p className="text-ink-700">打开事件</p>
              <p className="text-lg font-bold text-ink-800 font-serif">
                {flowEvents.filter((f) => f.eventType === 'opened' && sessionEnvelopes.find((e) => e.id === f.envelopeId)).length}
              </p>
            </div>
            <div>
              <p className="text-ink-700">补发事件</p>
              <p className="text-lg font-bold text-blue-700 font-serif">
                {flowEvents.filter((f) => f.eventType === 'reissued' && sessionEnvelopes.find((e) => e.id === f.envelopeId)).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
