import React, { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import * as htmlToImage from 'html-to-image';

interface ToolbarProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const Toolbar: React.FC<ToolbarProps> = ({ canvasRef }) => {
  const {
    alignHorizontalCenter,
    alignVerticalCenter,
    alignLeft,
    alignRight,
    alignTop,
    alignBottom,
    distributeHorizontal,
    distributeVertical,
    undo,
    redo,
    exportJSON,
    importJSON,
    selection,
    history,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPNG = async () => {
    if (!canvasRef.current) return;

    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `flow-diagram-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export PNG failed', e);
      alert('导出PNG失败');
    }
  };

  const handleExportJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `flow-diagram-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importJSON(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ToolButton: React.FC<{
    onClick: () => void;
    title: string;
    disabled?: boolean;
    children: React.ReactNode;
  }> = ({ onClick, title, disabled, children }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        padding: '6px 12px',
        background: disabled ? '#f0f0f0' : '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        color: disabled ? '#aaa' : '#333',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = '#e3f2fd';
          e.currentTarget.style.borderColor = '#2196f3';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.borderColor = '#ddd';
        }
      }}
    >
      {children}
    </button>
  );

  const hasSelection = selection.nodeIds.length > 0;
  const hasMultipleSelection = selection.nodeIds.length >= 2;
  const hasThreeOrMore = selection.nodeIds.length >= 3;

  return (
    <div
      style={{
        height: '56px',
        background: '#fff',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <ToolButton onClick={undo} title="撤销 (Ctrl+Z)" disabled={history.past.length === 0}>
          ↶ 撤销
        </ToolButton>
        <ToolButton onClick={redo} title="重做 (Ctrl+Shift+Z)" disabled={history.future.length === 0}>
          ↷ 重做
        </ToolButton>
      </div>

      <div style={{ width: '1px', height: '32px', background: '#ddd', margin: '0 8px' }} />

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <ToolButton onClick={alignLeft} title="左对齐" disabled={!hasMultipleSelection}>
          ⬅ 左对齐
        </ToolButton>
        <ToolButton onClick={alignHorizontalCenter} title="水平居中" disabled={!hasMultipleSelection}>
          ↔ 水平居中
        </ToolButton>
        <ToolButton onClick={alignRight} title="右对齐" disabled={!hasMultipleSelection}>
          ➡ 右对齐
        </ToolButton>
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <ToolButton onClick={alignTop} title="顶部对齐" disabled={!hasMultipleSelection}>
          ⬆ 顶部对齐
        </ToolButton>
        <ToolButton onClick={alignVerticalCenter} title="垂直居中" disabled={!hasMultipleSelection}>
          ↕ 垂直居中
        </ToolButton>
        <ToolButton onClick={alignBottom} title="底部对齐" disabled={!hasMultipleSelection}>
          ⬇ 底部对齐
        </ToolButton>
      </div>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <ToolButton onClick={distributeHorizontal} title="横向均匀分布" disabled={!hasThreeOrMore}>
          ⇆ 横向分布
        </ToolButton>
        <ToolButton onClick={distributeVertical} title="纵向均匀分布" disabled={!hasThreeOrMore}>
          ⇅ 纵向分布
        </ToolButton>
      </div>

      <div style={{ width: '1px', height: '32px', background: '#ddd', margin: '0 8px' }} />

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <ToolButton onClick={handleExportPNG} title="导出为PNG图片">
          🖼 导出PNG
        </ToolButton>
        <ToolButton onClick={handleExportJSON} title="导出为JSON">
          📄 导出JSON
        </ToolButton>
        <ToolButton onClick={handleImportJSON} title="导入JSON">
          📂 导入JSON
        </ToolButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {hasSelection && (
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
          已选择 {selection.nodeIds.length} 个节点
        </div>
      )}
    </div>
  );
};
