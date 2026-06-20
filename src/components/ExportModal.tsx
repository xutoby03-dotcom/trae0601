import { memo, useCallback, useMemo, useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Mic,
  Ampersand,
  Ruler,
  Volume2,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  calculateOverallScore,
  generateRecommendationReason,
  generateAlternativesSection,
} from '../utils/audio';
import { ANNOTATION_LABELS, type AnnotationKey } from '../types';

export const ExportModal = memo(function ExportModal() {
  const showExportModal = useStore((s) => s.showExportModal);
  const exportTakeId = useStore((s) => s.exportTakeId);
  const setShowExportModal = useStore((s) => s.setShowExportModal);
  const takes = useStore((s) => s.takes);
  const [copied, setCopied] = useState(false);

  const take = useMemo(() => takes.find((t) => t.id === exportTakeId), [takes, exportTakeId]);
  const starredTakes = useMemo(() => takes.filter((t) => t.starred), [takes]);

  const handleClose = useCallback(() => {
    setShowExportModal(false);
    setCopied(false);
  }, [setShowExportModal]);

  const annotationColors: Record<AnnotationKey, string> = {
    sibilance: 'text-red-400',
    nasality: 'text-yellow-400',
    plosives: 'text-blue-400',
    noiseFloor: 'text-purple-400',
    emotion: 'text-emerald-400',
  };

  const markdownReport = useMemo(() => {
    if (!take) return '';

    const overallScore = calculateOverallScore(take.annotations);
    const reason = generateRecommendationReason(take);
    const annotationKeys = Object.keys(ANNOTATION_LABELS) as AnnotationKey[];
    const alternatives = generateAlternativesSection(take, starredTakes);

    const micLine = `**麦克风**：${take.microphone}`;
    const preampLine = `**前级放大器**：${take.preamp}`;
    const distanceLine = `**拾音距离**：${take.distance} cm`;
    const gainLine = `**增益设置**：${take.gain > 0 ? '+' : ''}${take.gain} dB`;
    const roomLine = `**房间位置**：${take.roomPosition}`;
    const popLine = `**防喷罩**：${take.popFilter ? '开启' : '关闭'}`;

    let alternativesMarkdown = '';
    if (starredTakes.length > 1) {
      const otherStars = starredTakes.filter((s) => s.id !== take.id);
      if (otherStars.length > 0) {
        alternativesMarkdown = `---

## 备选方案（${otherStars.length} 个收藏候选）

| Take | 麦克风 | 前级 | 距离 | 增益 | 情绪 | 底噪 | 综合 |
|------|--------|------|------|------|------|------|------|
${otherStars
  .map((s) => {
    const sScore = calculateOverallScore(s.annotations);
    const emotionDiff = s.annotations.emotion - take.annotations.emotion;
    const noiseDiff = take.annotations.noiseFloor - s.annotations.noiseFloor;
    return `| **${s.name}** | ${s.microphone.split(' ').slice(0, 2).join(' ')} | ${s.preamp.split(' ')[0]} | ${s.distance}cm | ${s.gain > 0 ? '+' : ''}${s.gain}dB | ${s.annotations.emotion}${emotionDiff !== 0 ? ` (${emotionDiff > 0 ? '+' : ''}${emotionDiff})` : ''} | ${s.annotations.noiseFloor}${noiseDiff !== 0 ? ` (${noiseDiff > 0 ? '+' : ''}${noiseDiff})` : ''} | ${sScore}/10 |`;
  })
  .join('\n')}

### 备选方案说明

${alternatives}
`;
      }
    }

    return `# 人声试音设备链路推荐报告

## 推荐配置

**项目**：人声试音对比
**Take 名称**：${take.name}
**推荐日期**：${new Date().toLocaleDateString('zh-CN')}
**综合评分**：${overallScore}/10

---

## 设备链路一览

${micLine}

${preampLine}

${distanceLine}

${gainLine}

${roomLine}

${popLine}

---

## 设备链路表

| 设备类型 | 型号 |
|----------|------|
| 🎤 麦克风 | ${take.microphone} |
| 🎛️  前级放大器 | ${take.preamp} |
| 📏 拾音距离 | ${take.distance} cm |
| 🔊 增益设置 | ${take.gain > 0 ? '+' : ''}${take.gain} dB |
| 📍 房间位置 | ${take.roomPosition} |
| 🛡️ 防喷罩 | ${take.popFilter ? '开启' : '关闭'} |

---

## 音质评估详情

| 评估项 | 评分 (0-10) | 评价 | 说明 |
|--------|-------------|------|------|
${annotationKeys
  .map(
    (key) =>
      `| ${ANNOTATION_LABELS[key]} | ${take.annotations[key]}/10 | ${
        key === 'emotion'
          ? take.annotations[key] >= 8
            ? '出色'
            : take.annotations[key] >= 6
              ? '良好'
              : take.annotations[key] >= 4
                ? '一般'
                : '待优化'
          : take.annotations[key] <= 2
            ? '出色'
            : take.annotations[key] <= 4
              ? '良好'
              : take.annotations[key] <= 6
                ? '一般'
                : '待优化'
      } | ${key === 'emotion' ? '越高越好' : '越低越好'} |`
  )
  .join('\n')}

---

## 选择理由

${reason}

${alternativesMarkdown}
---

*报告由 Studio Compare 自动生成 · ${new Date().toLocaleDateString('zh-CN')}*
`;
  }, [take, starredTakes]);

  const handleCopy = useCallback(async () => {
    if (!markdownReport) return;
    try {
      await navigator.clipboard.writeText(markdownReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [markdownReport]);

  const handleDownload = useCallback(() => {
    if (!take || !markdownReport) return;
    const blob = new Blob([markdownReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${take.name.replace(/\s+/g, '-').toLowerCase()}-设备链路推荐.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [take, markdownReport]);

  if (!showExportModal || !take) return null;

  const overallScore = calculateOverallScore(take.annotations);
  const annotationKeys = Object.keys(ANNOTATION_LABELS) as AnnotationKey[];
  const otherStarred = starredTakes.filter((s) => s.id !== take.id);

  const getDiffIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (diff < 0) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-studio-textDim" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-studio-panel border border-studio-border rounded-xl shadow-2xl flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-studio-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-xl text-studio-text">设备链路推荐报告</h2>
            <p className="text-sm text-studio-textDim mt-0.5">{take.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {take.starred && (
              <span className="flex items-center gap-1 px-2 py-1 bg-accent-amber/20 text-accent-amber rounded text-xs">
                <Star className="w-3 h-3 fill-accent-amber" />
                已收藏
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-studio-hover transition-colors"
            >
              <X className="w-5 h-5 text-studio-textDim" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gradient-to-br from-studio-card to-studio-panel rounded-lg p-4 border border-studio-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-studio-text flex items-center gap-2">
                <Mic className="w-5 h-5 text-accent-amber" />
                最终选择设备链路
              </h3>
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  overallScore >= 8
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : overallScore >= 6
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                综合评分 {overallScore}/10
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-studio-bg rounded-lg p-3 border border-studio-border">
                <Mic className="w-5 h-5 text-accent-amber flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-studio-textDim uppercase tracking-wider">麦克风</p>
                  <p className="font-mono text-sm text-studio-text truncate">{take.microphone}</p>
                </div>
              </div>
              <div className="text-accent-amber font-bold">→</div>
              <div className="flex-1 flex items-center gap-2 bg-studio-bg rounded-lg p-3 border border-studio-border">
                <Ampersand className="w-5 h-5 text-accent-purple flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-studio-textDim uppercase tracking-wider">前级放大器</p>
                  <p className="font-mono text-sm text-studio-text truncate">{take.preamp}</p>
                </div>
              </div>
              <div className="text-accent-amber font-bold">→</div>
              <div className="flex-1 flex items-center gap-2 bg-studio-bg rounded-lg p-3 border border-studio-border">
                <Ruler className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-studio-textDim uppercase tracking-wider">拾音距离</p>
                  <p className="font-mono text-sm text-studio-text">{take.distance} cm</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 bg-studio-bg rounded-lg p-3 border border-studio-border">
                <Volume2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-studio-textDim uppercase tracking-wider">增益</p>
                  <p className="font-mono text-sm text-studio-text">
                    {take.gain > 0 ? '+' : ''}
                    {take.gain} dB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-studio-bg rounded-lg p-3 border border-studio-border">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-studio-textDim uppercase tracking-wider">房间位置</p>
                  <p className="font-mono text-xs text-studio-text truncate">{take.roomPosition}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-studio-bg rounded-lg p-3 border border-studio-border">
                <Shield
                  className={`w-4 h-4 flex-shrink-0 ${take.popFilter ? 'text-emerald-400' : 'text-red-400'}`}
                />
                <div>
                  <p className="text-[10px] text-studio-textDim uppercase tracking-wider">防喷罩</p>
                  <p
                    className={`font-mono text-sm ${take.popFilter ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                    {take.popFilter ? '开启' : '关闭'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-studio-card rounded-lg p-4 border border-studio-border">
            <h3 className="font-display font-semibold text-studio-text mb-3">音质评估详情</h3>
            <div className="grid grid-cols-5 gap-3">
              {annotationKeys.map((key) => {
                const score = take.annotations[key];
                const isLowBetter = key !== 'emotion';
                const normalized = isLowBetter ? 10 - score : score;
                const label =
                  normalized >= 8 ? '出色' : normalized >= 6 ? '良好' : normalized >= 4 ? '一般' : '待优化';

                return (
                  <div
                    key={key}
                    className="bg-studio-bg rounded-lg p-3 border border-studio-border text-center"
                  >
                    <p className="text-[10px] text-studio-textDim uppercase tracking-wider mb-1">
                      {ANNOTATION_LABELS[key]}
                    </p>
                    <p className={`text-2xl font-bold font-display ${annotationColors[key]}`}>
                      {score}
                    </p>
                    <p className="text-[10px] text-studio-textDim mt-0.5">
                      {label} / 10
                    </p>
                    <div className="h-1 bg-studio-border rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          key === 'sibilance'
                            ? 'bg-red-500'
                            : key === 'nasality'
                              ? 'bg-yellow-500'
                              : key === 'plosives'
                                ? 'bg-blue-500'
                                : key === 'noiseFloor'
                                  ? 'bg-purple-500'
                                  : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${((isLowBetter ? 10 - score : score) / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-studio-card rounded-lg p-4 border border-studio-border">
            <h3 className="font-display font-semibold text-studio-text mb-3">选择理由</h3>
            <div className="text-sm text-studio-text leading-relaxed whitespace-pre-line space-y-2">
              {generateRecommendationReason(take).split('\n\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {otherStarred.length > 0 && (
            <div className="bg-studio-card rounded-lg p-4 border border-studio-border">
              <h3 className="font-display font-semibold text-studio-text mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent-amber fill-accent-amber" />
                收藏候选对比（{otherStarred.length} 个备选）
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-studio-textDim border-b border-studio-border">
                      <th className="text-left py-2 px-2">Take</th>
                      <th className="text-left py-2 px-2">麦克风</th>
                      <th className="text-left py-2 px-2">前级</th>
                      <th className="text-right py-2 px-2">距离</th>
                      <th className="text-right py-2 px-2">增益</th>
                      <th className="text-right py-2 px-2">情绪</th>
                      <th className="text-right py-2 px-2">底噪</th>
                      <th className="text-right py-2 px-2">综合</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-accent-amber/10 border-b border-studio-border">
                      <td className="py-2 px-2 font-semibold text-accent-amber">
                        {take.name} ⭐
                      </td>
                      <td className="py-2 px-2 font-mono">{take.microphone.split(' ').slice(0, 2).join(' ')}</td>
                      <td className="py-2 px-2 font-mono">{take.preamp.split(' ')[0]}</td>
                      <td className="py-2 px-2 text-right font-mono">{take.distance}cm</td>
                      <td className="py-2 px-2 text-right font-mono">
                        {take.gain > 0 ? '+' : ''}
                        {take.gain}dB
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-400">
                        {take.annotations.emotion}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-purple-400">
                        {take.annotations.noiseFloor}
                      </td>
                      <td className="py-2 px-2 text-right font-bold">{overallScore}</td>
                    </tr>
                    {otherStarred.map((alt) => {
                      const altScore = calculateOverallScore(alt.annotations);
                      const emotionDiff = alt.annotations.emotion - take.annotations.emotion;
                      const noiseDiff = take.annotations.noiseFloor - alt.annotations.noiseFloor;
                      return (
                        <tr
                          key={alt.id}
                          className="border-b border-studio-border/50 hover:bg-studio-hover/30"
                        >
                          <td className="py-2 px-2 text-studio-textDim">{alt.name}</td>
                          <td className="py-2 px-2 font-mono text-studio-textDim">
                            {alt.microphone.split(' ').slice(0, 2).join(' ')}
                          </td>
                          <td className="py-2 px-2 font-mono text-studio-textDim">
                            {alt.preamp.split(' ')[0]}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-studio-textDim">
                            {alt.distance}cm
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-studio-textDim">
                            {alt.gain > 0 ? '+' : ''}
                            {alt.gain}dB
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            <span className="flex items-center justify-end gap-1">
                              {alt.annotations.emotion}
                              {emotionDiff !== 0 && (
                                <span className="text-studio-textDim">
                                  ({emotionDiff > 0 ? '+' : ''}
                                  {emotionDiff})
                                </span>
                              )}
                              {getDiffIcon(emotionDiff)}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            <span className="flex items-center justify-end gap-1">
                              {alt.annotations.noiseFloor}
                              {noiseDiff !== 0 && (
                                <span className="text-studio-textDim">
                                  ({noiseDiff > 0 ? '+' : ''}
                                  {noiseDiff})
                                </span>
                              )}
                              {getDiffIcon(noiseDiff)}
                            </span>
                          </td>
                          <td
                            className={`py-2 px-2 text-right font-bold ${
                              altScore > overallScore
                                ? 'text-emerald-400'
                                : altScore === overallScore
                                  ? 'text-yellow-400'
                                  : 'text-studio-textDim'
                            }`}
                          >
                            {altScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-studio-textDim mt-2 italic">
                情绪/底噪括号内为与最终选择的差值，正数表示更优
              </p>
            </div>
          )}

          <div className="bg-studio-card rounded-lg p-4 border border-studio-border">
            <h3 className="font-display font-semibold text-studio-text mb-3">Markdown 报告预览</h3>
            <pre className="bg-studio-bg rounded-lg p-3 text-xs text-studio-textDim overflow-x-auto font-mono max-h-48 overflow-y-auto">
              {markdownReport}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-studio-border flex-shrink-0">
          <button onClick={handleClose} className="btn-studio">
            关闭
          </button>
          <button onClick={handleCopy} className="btn-studio flex items-center gap-2">
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制 Markdown
              </>
            )}
          </button>
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            下载报告
          </button>
        </div>
      </div>
    </div>
  );
});
