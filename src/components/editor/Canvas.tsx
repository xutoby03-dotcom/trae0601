import { useEmailStore } from '@/store/useEmailStore';
import CanvasComponent from './CanvasComponent';
import { Palette } from 'lucide-react';

export default function Canvas() {
  const { currentTemplate, previewMode, selectComponent, addComponent, pushHistory, setDragOverInfo, dragOverInfo, setBackgroundColor } = useEmailStore();
  const { components, backgroundColor } = currentTemplate;

  const canvasWidth = previewMode === 'mobile' ? 375 : 600;
  const isDark = previewMode === 'dark';

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvas === 'true') {
      selectComponent(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverInfo(null);
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      pushHistory();
      addComponent(componentType as any);
    }
  };

  const isPhoneFrame = previewMode === 'mobile';
  const emailBg = isDark ? '#111827' : backgroundColor;
  const canvasBg = isDark ? '#030712' : '#e5e7eb';
  const dotColor = isDark ? '#1f2937' : '#d1d5db';

  return (
    <div
      className="flex-1 overflow-auto relative"
      style={{
        background: canvasBg,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: '20px 20px',
      }}
      onClick={handleCanvasClick}
      data-canvas="true"
    >
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#1a1d23]/90 rounded-lg px-2.5 py-1.5 backdrop-blur-sm border border-[#2a2d35]">
        <Palette size={12} className="text-gray-400" />
        <span className="text-[10px] text-gray-500">背景</span>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border border-[#2a2d35] bg-transparent"
        />
        <input
          type="text"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-20 bg-transparent text-[10px] text-gray-300 border-none outline-none font-mono"
        />
      </div>

      <div className="flex justify-center py-8 min-h-full" data-canvas="true">
        {isPhoneFrame ? (
          <div className="relative">
            <div
              className="rounded-[36px] border-4 overflow-hidden shadow-2xl"
              style={{ borderColor: isDark ? '#374151' : '#374151', width: canvasWidth + 24 }}
            >
              <div className="h-6 flex items-center justify-center" style={{ backgroundColor: isDark ? '#1f2937' : '#374151' }}>
                <div className="w-20 h-3 rounded-full" style={{ backgroundColor: isDark ? '#374151' : '#4b5563' }} />
              </div>
              <div
                className="transition-colors duration-300"
                style={{
                  backgroundColor: emailBg,
                  width: canvasWidth,
                  margin: '0 auto',
                  minHeight: 600,
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {components.length === 0 ? (
                  <EmptyCanvasPlaceholder isDark={isDark} />
                ) : (
                  components.map((comp, idx) => (
                    <CanvasComponent key={comp.id} component={comp} index={idx} />
                  ))
                )}
              </div>
              <div className="h-6 flex items-center justify-center" style={{ backgroundColor: isDark ? '#1f2937' : '#374151' }}>
                <div className="w-8 h-8 border-2 rounded-full" style={{ borderColor: isDark ? '#4b5563' : '#6b7280' }} />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="transition-all duration-300 shadow-lg"
            style={{
              width: canvasWidth,
              backgroundColor: emailBg,
              minHeight: 600,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {components.length === 0 ? (
              <EmptyCanvasPlaceholder isDark={isDark} />
            ) : (
              components.map((comp, idx) => (
                <CanvasComponent key={comp.id} component={comp} index={idx} />
              ))
            )}
            {dragOverInfo && dragOverInfo.insertIndex === components.length && !dragOverInfo.parentId && (
              <div className="h-0.5 bg-blue-500 mx-2" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyCanvasPlaceholder({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20" style={{ color: isDark ? '#4b5563' : '#9ca3af' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      </div>
      <p className="text-sm font-medium mb-1">拖拽组件到这里</p>
      <p className="text-xs" style={{ color: isDark ? '#374151' : '#6b7280' }}>从左侧面板拖入组件开始设计</p>
    </div>
  );
}
