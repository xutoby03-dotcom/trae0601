import React from 'react';
import { useEditorStore } from '../store';
import { ToolType } from '../types';

const tools: { type: ToolType; label: string; icon: string; shortcut: string }[] = [
  { type: 'select', label: '选择工具', icon: '⊹', shortcut: 'V' },
  { type: 'directSelect', label: '直接选择', icon: '⊞', shortcut: 'A' },
  { type: 'pen', label: '钢笔工具', icon: '✒', shortcut: 'P' },
  { type: 'brush', label: '自由画笔', icon: 'brush', shortcut: 'B' },
  { type: 'rect', label: '矩形', icon: '▭', shortcut: 'R' },
  { type: 'circle', label: '圆形', icon: '○', shortcut: 'C' },
  { type: 'ellipse', label: '椭圆', icon: '⬭', shortcut: 'E' },
  { type: 'polygon', label: '多边形', icon: '⬡', shortcut: 'Y' },
  { type: 'star', label: '星形', icon: '☆', shortcut: 'S' },
  { type: 'text', label: '文字', icon: 'T', shortcut: 'T' },
  { type: 'eyedropper', label: '取色器', icon: '◎', shortcut: 'I' },
];

const Toolbar: React.FC = () => {
  const { tool, setTool, polygonSides, starPoints, starInnerRatio, setPolygonSides, setStarPoints, setStarInnerRatio } = useEditorStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const toolItem = tools.find((t) => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (toolItem) {
        e.preventDefault();
        setTool(toolItem.type);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool]);

  return (
    <div className="toolbar">
      <div className="toolbar-tools">
        {tools.map((t) => (
          <button
            key={t.type}
            className={`tool-btn ${tool === t.type ? 'active' : ''}`}
            onClick={() => setTool(t.type)}
            title={`${t.label} (${t.shortcut})`}
          >
            {t.icon === 'brush' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5zM3 11l1 1h1l7-7-1-1-7 7H3z"/>
              </svg>
            ) : (
              <span className="tool-icon">{t.icon}</span>
            )}
          </button>
        ))}
      </div>

      {(tool === 'polygon' || tool === 'star') && (
        <div className="toolbar-options">
          {tool === 'polygon' && (
            <div className="tool-option">
              <label>边数</label>
              <input
                type="number"
                min={3}
                max={20}
                value={polygonSides}
                onChange={(e) => setPolygonSides(Math.max(3, Math.min(20, parseInt(e.target.value) || 3)))}
              />
            </div>
          )}
          {tool === 'star' && (
            <>
              <div className="tool-option">
                <label>角数</label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={starPoints}
                  onChange={(e) => setStarPoints(Math.max(3, Math.min(20, parseInt(e.target.value) || 5)))}
                />
              </div>
              <div className="tool-option">
                <label>内径比</label>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={starInnerRatio}
                  onChange={(e) => setStarInnerRatio(parseFloat(e.target.value))}
                />
                <span className="tool-option-value">{starInnerRatio.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="toolbar-divider" />

      <div className="toolbar-actions">
        <button
          className="tool-btn"
          onClick={() => useEditorStore.getState().undo()}
          title="撤销 (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          className="tool-btn"
          onClick={() => useEditorStore.getState().redo()}
          title="重做 (Ctrl+Shift+Z)"
        >
          ↷
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
