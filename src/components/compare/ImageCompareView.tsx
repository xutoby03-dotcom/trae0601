import { useRef, useState } from 'react';
import { useLightingStore } from '@/store/useLightingStore';
import AnnotationListPanel from './AnnotationListPanel';
import {
  ANNOTATION_LABELS,
  ANNOTATION_COLORS,
  SEVERITY_LABELS,
  type Annotation,
  type AnnotationType,
} from '@/types';
import {
  Image,
  Video,
  List,
  Plus,
  X,
  Send,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Move as MoveIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type TabKey = 'sideBySide' | 'annotations';
type ImagePanel = 'final' | 'bts';

const ANNOTATION_OPTIONS: AnnotationType[] = [
  'catch_light',
  'hard_shadow',
  'uneven_bg',
  'overexposure',
  'underexposure',
  'color_cast',
  'other',
];

export default function ImageCompareView() {
  const setup = useLightingStore((s) => s.currentSetup);
  const addAnnotation = useLightingStore((s) => s.addAnnotation);
  const removeAnnotation = useLightingStore((s) => s.removeAnnotation);

  const [tab, setTab] = useState<TabKey>('sideBySide');
  const [splitPct, setSplitPct] = useState(50);
  const [zoomFinal, setZoomFinal] = useState(1);
  const [zoomBts, setZoomBts] = useState(1);
  const [dragSplit, setDragSplit] = useState(false);
  const [activeAnnId, setActiveAnnId] = useState<string | null>(null);
  const [showAnnotator, setShowAnnotator] = useState<{
    panel: ImagePanel;
    x: number;
    y: number;
  } | null>(null);
  const [newAnnType, setNewAnnType] = useState<AnnotationType>('hard_shadow');
  const [newAnnSeverity, setNewAnnSeverity] =
    useState<Annotation['severity']>('medium');
  const [newAnnComment, setNewAnnComment] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  if (!setup) return null;

  const handleSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragSplit(true);
  };

  const handleSplitMove = (e: React.MouseEvent) => {
    if (!dragSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.max(15, Math.min(85, pct)));
  };

  const handleImageClick = (
    e: React.MouseEvent<HTMLDivElement>,
    panel: ImagePanel,
    imgWidth: number,
    imgHeight: number,
    zoom: number
  ) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset?.imageBase) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relX = ((e.clientX - centerX) / (rect.width / zoom)) + 0.5;
    const relY = ((e.clientY - centerY) / (rect.height / zoom)) + 0.5;
    void imgWidth;
    void imgHeight;
    setShowAnnotator({
      panel,
      x: Math.max(0, Math.min(100, relX * 100)),
      y: Math.max(0, Math.min(100, relY * 100)),
    });
  };

  const submitAnnotation = () => {
    if (!showAnnotator) return;
    addAnnotation({
      imageType: showAnnotator.panel,
      x: showAnnotator.x,
      y: showAnnotator.y,
      type: newAnnType,
      severity: newAnnSeverity,
      comment: newAnnComment.trim() || ANNOTATION_LABELS[newAnnType],
      author: '当前用户',
    });
    setShowAnnotator(null);
    setNewAnnComment('');
    setNewAnnType('hard_shadow');
    setNewAnnSeverity('medium');
  };

  const renderMarkers = (panel: ImagePanel, zoom: number) => {
    const list = setup.annotations.filter((a) => a.imageType === panel);
    return list.map((a) => {
      const color = ANNOTATION_COLORS[a.type];
      const active = activeAnnId === a.id;
      return (
        <div
          key={a.id}
          onMouseEnter={() => setActiveAnnId(a.id)}
          onMouseLeave={() => setActiveAnnId(null)}
          className={`absolute z-10 cursor-pointer transition-all
                     ${active ? 'z-20 scale-125' : ''}`}
          style={{
            left: `${a.x}%`,
            top: `${a.y}%`,
            transform: `translate(-50%, -50%) scale(${1 / zoom})`,
          }}
          title={ANNOTATION_LABELS[a.type]}
        >
          <div
            className="relative w-5 h-5 rounded-full flex items-center justify-center border-2 font-bold text-[10px] animate-marker-blink"
            style={{
              borderColor: color,
              background: `${color}E6`,
              color: '#0F172A',
              boxShadow: `0 0 0 2px rgba(15, 23, 42, 0.85), 0 0 14px ${color}80`,
            }}
          >
            {ANNOTATION_LABELS[a.type].slice(0, 1)}
          </div>
          {active && (
            <span
              className="absolute inset-0 rounded-full border-2 animate-pulse-ring"
              style={{ borderColor: color }}
            />
          )}
        </div>
      );
    });
  };

  const ImagePanelView = ({
    title,
    icon: Icon,
    imageUrl,
    panel,
    zoom,
    setZoom,
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    imageUrl: string;
    panel: ImagePanel;
    zoom: number;
    setZoom: (z: number) => void;
  }) => (
    <div className="flex flex-col h-full min-w-0 bg-studio-900/60">
      <div className="flex items-center justify-between px-3 py-2 border-b border-studio-800">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-amber-glow" />
          <span className="text-[12px] font-semibold text-studio-200">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-1 rounded text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-studio-400 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}
            className="p-1 rounded text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-studio-700 mx-1" />
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
            title="重置"
          >
            <MoveIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 relative overflow-hidden cursor-crosshair crosshair"
        onClick={(e) => handleImageClick(e, panel, 100, 100, zoom)}
        data-image-base
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          data-image-base
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.03), transparent 70%)',
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            draggable={false}
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease',
            }}
            data-image-base
          />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {renderMarkers(panel, zoom)}
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-studio-950/60 border border-studio-700/50 backdrop-blur-sm">
          <Plus className="w-3 h-3 text-amber-glow" />
          <span className="text-[10px] text-studio-400">点击图片任意位置标注问题</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 border-t border-studio-800 flex flex-col bg-studio-950/40">
      <div className="flex items-center justify-between border-b border-studio-800 bg-studio-900/50">
        <div className="flex items-center gap-1 px-2 py-1.5">
          <TabBtn label="并排对比" icon={Eye} active={tab === 'sideBySide'} onClick={() => setTab('sideBySide')} />
          <TabBtn label={`标注评论 (${setup.annotations.length})`} icon={List} active={tab === 'annotations'} onClick={() => setTab('annotations')} />
        </div>
        <div className="flex items-center gap-2 pr-3 text-[11px] text-studio-500">
          <ChevronLeft className="w-3 h-3" />
          <span>拖动分割线调整比例</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex relative overflow-hidden"
        onMouseMove={handleSplitMove}
        onMouseUp={() => setDragSplit(false)}
        onMouseLeave={() => setDragSplit(false)}
      >
        {tab === 'sideBySide' ? (
          <>
            <div style={{ width: `${splitPct}%` }} className="min-w-0 h-full">
              <ImagePanelView
                title="成片 FINAL"
                icon={Image}
                imageUrl={setup.finalImage}
                panel="final"
                zoom={zoomFinal}
                setZoom={setZoomFinal}
              />
            </div>
            <div
              onMouseDown={handleSplitMouseDown}
              className={`w-1.5 h-full cursor-col-resize bg-studio-800 shrink-0 relative transition-colors
                         ${dragSplit ? 'bg-amber-glow shadow-amber-glow-sm' : 'hover:bg-studio-700'}`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 py-2 px-1 rounded-md bg-studio-800 border border-studio-700">
                <GripVertical className="w-3 h-3 text-studio-400" />
                <GripVertical className="w-3 h-3 text-studio-400" />
              </div>
            </div>
            <div style={{ width: `${100 - splitPct}%` }} className="min-w-0 h-full">
              <ImagePanelView
                title="现场花絮 BTS"
                icon={Video}
                imageUrl={setup.btsImage}
                panel="bts"
                zoom={zoomBts}
                setZoom={setZoomBts}
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <AnnotationListPanel
              annotations={setup.annotations}
              activeId={activeAnnId}
              onHover={setActiveAnnId}
              onJumpTo={(id) => {
                setActiveAnnId(id);
                setTimeout(() => setActiveAnnId(null), 1800);
              }}
              onDelete={removeAnnotation}
            />
          </div>
        )}
      </div>

      {showAnnotator && (
        <div
          className="fixed inset-0 bg-studio-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-slide-down"
          onClick={() => setShowAnnotator(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md studio-card p-5 shadow-2xl animate-slide-down"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-studio-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-glow" />
                添加问题标注
              </h4>
              <button
                onClick={() => setShowAnnotator(null)}
                className="p-1.5 rounded-md text-studio-400 hover:text-studio-200 hover:bg-studio-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label">问题类型</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ANNOTATION_OPTIONS.map((t) => {
                    const color = ANNOTATION_COLORS[t];
                    const active = newAnnType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setNewAnnType(t)}
                        className={`px-2.5 py-2 rounded-md text-[11px] font-medium text-left transition-all
                                   border
                                   ${
                                     active
                                       ? 'text-studio-950 shadow-sm'
                                       : 'border-studio-700 text-studio-400 hover:border-studio-600 hover:text-studio-200 bg-studio-850/40'
                                   }`}
                        style={
                          active
                            ? { background: color, borderColor: color }
                            : {}
                        }
                      >
                        {ANNOTATION_LABELS[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="section-label">严重级别</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((s) => {
                    const active = newAnnSeverity === s;
                    const color =
                      s === 'low'
                        ? '#10B981'
                        : s === 'medium'
                          ? '#F59E0B'
                          : '#EF4444';
                    return (
                      <button
                        key={s}
                        onClick={() => setNewAnnSeverity(s)}
                        className={`px-2 py-2 rounded-md text-[11px] font-semibold transition-all border
                                   ${
                                     active
                                       ? 'text-studio-950'
                                       : 'border-studio-700 text-studio-400 hover:text-studio-200 bg-studio-850/40'
                                   }`}
                        style={active ? { background: color, borderColor: color } : {}}
                      >
                        {SEVERITY_LABELS[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="section-label">评论备注</label>
                <textarea
                  autoFocus
                  value={newAnnComment}
                  onChange={(e) => setNewAnnComment(e.target.value)}
                  placeholder="详细描述问题，或下次的改进建议..."
                  rows={3}
                  className="param-input resize-none"
                />
              </div>

              <div className="flex items-center gap-1.5 p-3 rounded-lg bg-studio-800/50 border border-studio-700/50">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 font-bold text-[11px]"
                  style={{
                    borderColor: ANNOTATION_COLORS[newAnnType],
                    background: `${ANNOTATION_COLORS[newAnnType]}20`,
                    color: ANNOTATION_COLORS[newAnnType],
                  }}
                >
                  {Math.round(showAnnotator.x)},{Math.round(showAnnotator.y)}
                </div>
                <div className="text-[11px]">
                  <div className="text-studio-300">
                    {showAnnotator.panel === 'final' ? '成片' : '花絮'}图 ·{' '}
                    <span className="text-amber-glow font-semibold">
                      {ANNOTATION_LABELS[newAnnType]}
                    </span>
                  </div>
                  <div className="text-studio-500 mt-0.5">
                    坐标 {showAnnotator.x.toFixed(1)}%, {showAnnotator.y.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setShowAnnotator(null)}
                className="flex-1 studio-btn-ghost"
              >
                取消
              </button>
              <button
                onClick={submitAnnotation}
                className="flex-1 studio-btn-primary"
              >
                <Send className="w-3.5 h-3.5" />
                添加标注
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all
                 ${
                   active
                     ? 'bg-amber-glow/15 text-amber-glow border border-amber-glow/30'
                     : 'text-studio-400 hover:text-studio-200 hover:bg-studio-800/60 border border-transparent'
                 }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
