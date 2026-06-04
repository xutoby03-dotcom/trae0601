import { useCallback, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useCanvas } from '../../hooks/useCanvas';

export const MainCanvas = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isDragOverRef = useRef(false);

  const {
    layers,
    canvasWidth,
    canvasHeight,
    scale,
    offsetX,
    offsetY,
    uploadImage,
    setViewTransform,
  } = useEditorStore();

  const {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    render,
  } = useCanvas();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type.startsWith('image/')) {
      await uploadImage(file);
    }
  }, [uploadImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragOverRef.current = false;
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-500/10');
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOverRef.current) {
      isDragOverRef.current = true;
      dropZoneRef.current?.classList.add('border-blue-500', 'bg-blue-500/10');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragOverRef.current = false;
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-500/10');
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newOffsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
      const newOffsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
      setViewTransform(newScale, newOffsetX, newOffsetY);
    }
  }, [scale, offsetX, offsetY, setViewTransform, canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      render();
    }
  }, [canvasWidth, canvasHeight, render, canvasRef]);

  const hasImage = layers.length > 0;

  return (
    <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
      {!hasImage ? (
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="w-96 h-64 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:border-gray-500 hover:bg-white/5"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-300 text-lg mb-2">拖拽图片到这里</p>
          <p className="text-gray-500 text-sm">或点击选择文件</p>
          <p className="text-gray-600 text-xs mt-4">支持 JPG、PNG、WebP 格式</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      ) : (
        <div
          onWheel={handleWheel}
          className="relative w-full h-full flex items-center justify-center"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
              linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
              linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            className="shadow-2xl cursor-crosshair"
            style={{
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              transformOrigin: 'top left',
              imageRendering: 'auto',
            }}
          />
          <div className="absolute bottom-4 right-4 bg-[#2d2d2d] px-3 py-1.5 rounded text-sm text-gray-300 font-mono">
            {Math.round(scale * 100)}% | {canvasWidth} × {canvasHeight}
          </div>
        </div>
      )}
    </div>
  );
};
