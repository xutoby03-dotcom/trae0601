import { memo, useCallback, useMemo, useState } from 'react';
import { X, Download, Copy, Check, Mic, Ampersand, Ruler, Volume2, MapPin, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateOverallScore, generateRecommendationReason } from '../utils/audio';
import { ANNOTATION_LABELS, type AnnotationKey } from '../types';

export const ExportModal = memo(function ExportModal() {
  const showExportModal = useStore((s) => s.showExportModal);
  const exportTakeId = useStore((s) => s.exportTakeId);
  const setShowExportModal = useStore((s) => s.setShowExportModal);
  const takes = useStore((s) => s.takes);
  const [copied, setCopied] = useState(false);

  const take = useMemo(() => takes.find((t) => t.id === exportTakeId), [takes, exportTakeId]);

  const handleClose = useCallback(() => {
    setShowExportModal(false);
    setCopied(false);
  }, [setShowExportModal]);

  const markdownReport = useMemo(() => {
    if (!take) return '';

    const overallScore = calculateOverallScore(take.annotations);
    const reason = generateRecommendationReason(take);
    const annotationKeys = Object.keys(ANNOTATION_LABELS) as AnnotationKey[];

    return `# 人声试音设备链路推荐报告

## 推荐配置

**Take 名称**: ${take.name}
**推荐日期**: ${new Date().toLocaleDateString('zh-CN')}
**综合评分**: ${overallScore}/10

---

## 设备链路

| 设备类型 | 型号 |
|----------|------|
| 🎤 麦克风 | ${take.microphone} |
| 🎛️  前级放大器 | ${take.preamp} |
| 📏 拾音距离 | ${take.distance} cm |
| 🔊 增益设置 | ${take.gain > 0 ? '+' : ''}${take.gain} dB |
| 📍 房间位置 | ${take.roomPosition} |
| 🛡️ 防喷罩 | ${take.popFilter ? '开启' : '关闭'} |

---

## 音质评估

| 评估项 | 评分 (0-10) | 说明 |
|--------|-------------|------|
${annotationKeys
  .map(
    (key) =>
      `| ${ANNOTATION_LABELS[key]} | ${take.annotations[key]}/10 | ${
        key === 'emotion' ? '越高越好' : '越低越好'
      } |`
  )
  .join('\n')}

---

## 选择理由

${reason}

---

*报告由 Studio Compare 自动生成*
`;
  }, [take]);

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
    a.download = `${take.name.replace(/\s+/g, '-').toLowerCase()}-推荐链路.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [take, markdownReport]);

  if (!showExportModal || !take) return null;

  const overallScore = calculateOverallScore(take.annotations);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-studio-panel border border-studio-border rounded-xl shadow-2xl flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-studio-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-xl text-studio-text">设备链路推荐报告</h2>
            <p className="text-sm text-studio-textDim mt-0.5">{take.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-studio-hover transition-colors"
          >
            <X className="w-5 h-5 text-studio-textDim" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gradient-to-br from-studio-card to-studio-panel rounded-lg p-4 border border-studio-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-studio-text">推荐设备链路</h3>
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

            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center gap-2 bg-studio-bg rounded-lg p-3">
                <Mic className="w-5 h-5 text-accent-amber" />
                <div className="min-w-0">
                  <p className="text-xs text-studio-textDim">麦克风</p>
                  <p className="font-mono text-sm text-studio-text truncate">{take.microphone}</p>
                </div>
              </div>
              <div className="text-accent-amber">→</div>
              <div className="flex-1 flex items-center gap-2 bg-studio-bg rounded-lg p-3">
                <Ampersand className="w-5 h-5 text-accent-purple" />
                <div className="min-w-0">
                  <p className="text-xs text-studio-textDim">前级</p>
                  <p className="font-mono text-sm text-studio-text truncate">{take.preamp}</p>
                </div>
              </div>
              <div className="text-accent-amber">→</div>
              <div className="flex-1 flex items-center gap-2 bg-studio-bg rounded-lg p-3">
                <Ruler className="w-5 h-5 text-blue-400" />
                <div className="min-w-0">
                  <p className="text-xs text-studio-textDim">距离</p>
                  <p className="font-mono text-sm text-studio-text">{take.distance} cm</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex items-center gap-2 bg-studio-bg rounded-lg p-2">
                <Volume2 className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-[10px] text-studio-textDim">增益</p>
                  <p className="font-mono text-xs text-studio-text">
                    {take.gain > 0 ? '+' : ''}
                    {take.gain} dB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-studio-bg rounded-lg p-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <div className="min-w-0">
                  <p className="text-[10px] text-studio-textDim">位置</p>
                  <p className="font-mono text-xs text-studio-text truncate">
                    {take.roomPosition.split(' ')[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-studio-bg rounded-lg p-2">
                <Shield className={`w-4 h-4 ${take.popFilter ? 'text-emerald-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-[10px] text-studio-textDim">防喷</p>
                  <p className={`font-mono text-xs ${take.popFilter ? 'text-emerald-400' : 'text-red-400'}`}>
                    {take.popFilter ? '开启' : '关闭'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-studio-card rounded-lg p-4 border border-studio-border">
            <h3 className="font-display font-semibold text-studio-text mb-3">选择理由</h3>
            <div className="text-sm text-studio-text leading-relaxed whitespace-pre-line">
              {generateRecommendationReason(take)}
            </div>
          </div>

          <div className="bg-studio-card rounded-lg p-4 border border-studio-border">
            <h3 className="font-display font-semibold text-studio-text mb-3">Markdown 预览</h3>
            <pre className="bg-studio-bg rounded-lg p-3 text-xs text-studio-textDim overflow-x-auto font-mono max-h-48 overflow-y-auto">
              {markdownReport}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-studio-border flex-shrink-0">
          <button
            onClick={handleClose}
            className="btn-studio"
          >
            关闭
          </button>
          <button
            onClick={handleCopy}
            className="btn-studio flex items-center gap-2"
          >
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
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载报告
          </button>
        </div>
      </div>
    </div>
  );
});
