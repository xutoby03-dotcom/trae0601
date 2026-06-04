import React, { useRef, useState, useCallback } from 'react';

interface UploadButtonProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function UploadButton({ onUpload, isLoading }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['stl', 'obj', 'glb', 'gltf'].includes(ext || '')) {
        onUpload(file);
      }
    }
  }, [onUpload]);

  return (
    <div
      className={`relative transition-all ${isDragging ? 'scale-105' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
                   text-white text-sm font-medium rounded-lg shadow-lg shadow-cyan-500/30
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            加载中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            上传模型
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".stl,.obj,.glb,.gltf"
        onChange={handleFileChange}
        className="hidden"
      />
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-cyan-400 rounded-lg 
                        bg-cyan-400/10 pointer-events-none" />
      )}
    </div>
  );
}
