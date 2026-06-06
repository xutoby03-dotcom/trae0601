import React, { useState, useEffect } from 'react';
import { DesktopWidget as DesktopWidgetType } from '../../types';
import { useWidgetStore } from '../../stores/useWidgetStore';
import { X, Clock, StickyNote, Cpu } from 'lucide-react';

interface DesktopWidgetProps {
  widget: DesktopWidgetType;
}

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-5xl font-bold text-white drop-shadow-lg tabular-nums">
        {hours}:{minutes}
      </div>
      <div className="text-xl text-white/80 mt-1 tabular-nums">
        {seconds}
      </div>
      <div className="text-sm text-white/70 mt-2">
        {date}
      </div>
    </div>
  );
};

const StickyNoteWidget: React.FC<{ content?: string; widgetId: string }> = ({ content, widgetId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content || '');
  const updateWidgetContent = useWidgetStore(state => state.updateWidgetContent);

  const handleBlur = () => {
    setIsEditing(false);
    updateWidgetContent(widgetId, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setText(content || '');
      setIsEditing(false);
    }
  };

  return (
    <div 
      className="h-full p-3 bg-yellow-200 text-gray-800 shadow-lg"
      style={{ fontFamily: 'cursive' }}
      onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-full bg-transparent resize-none outline-none border-none cursor-text"
          style={{ fontFamily: 'cursive' }}
        />
      ) : (
        <div className="whitespace-pre-wrap text-sm">
          {text || '双击编辑便签...'}
        </div>
      )}
    </div>
  );
};

const SystemInfoWidget: React.FC = () => {
  const [cpu, setCpu] = useState(Math.floor(Math.random() * 30) + 10);
  const [memory, setMemory] = useState(Math.floor(Math.random() * 40) + 30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(prev => Math.max(5, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemory(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 5)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col justify-center h-full p-4 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Cpu size={18} />
        <span className="text-sm font-medium">系统信息</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>CPU</span>
            <span>{cpu.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${cpu}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>内存</span>
            <span>{memory.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${memory}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DesktopWidget: React.FC<DesktopWidgetProps> = ({ widget }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showClose, setShowClose] = useState(false);
  const updateWidgetPosition = useWidgetStore(state => state.updateWidgetPosition);
  const removeWidget = useWidgetStore(state => state.removeWidget);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const taskbarHeight = 48;
    const maxX = window.innerWidth - widget.width;
    const maxY = window.innerHeight - taskbarHeight - widget.height;
    const newX = Math.max(0, Math.min(maxX, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(maxY, e.clientY - dragOffset.y));
    updateWidgetPosition(widget.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'clock':
        return <ClockWidget />;
      case 'sticky-note':
        return <StickyNoteWidget content={widget.content} widgetId={widget.id} />;
      case 'system-info':
        return <SystemInfoWidget />;
      default:
        return null;
    }
  };

  const getWidgetBg = () => {
    switch (widget.type) {
      case 'clock':
        return 'bg-black/40 backdrop-blur-md';
      case 'sticky-note':
        return 'bg-transparent';
      case 'system-info':
        return 'bg-black/40 backdrop-blur-md';
      default:
        return 'bg-black/40 backdrop-blur-md';
    }
  };

  return (
    <div
      className={`absolute rounded-xl overflow-hidden shadow-2xl transition-shadow ${
        isDragging ? 'opacity-80 cursor-grabbing shadow-3xl z-50' : 'cursor-grab'
      } ${getWidgetBg()}`}
      style={{ 
        left: widget.x, 
        top: widget.y,
        width: widget.width,
        height: widget.height,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowClose(true)}
      onMouseLeave={() => setShowClose(false)}
    >
      {showClose && !isDragging && (
        <button
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/30 hover:bg-red-500 text-white/80 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
        >
          <X size={14} />
        </button>
      )}
      <div data-widget-content className="w-full h-full">
        {renderWidgetContent()}
      </div>
    </div>
  );
};

export default DesktopWidget;
