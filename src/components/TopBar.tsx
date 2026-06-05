import React, { useState, useRef } from 'react';
import { useEditorStore } from '../store';
import { exportToSVGString, exportToPNG, importSVG, saveDocument, loadDocument, listDocuments, deleteDocument, generateThumbnail } from '../utils';
import { Document } from '../types';

const TopBar: React.FC = () => {
  const {
    getActiveDoc,
    canvas,
    selection,
    alignSelected,
    distributeSelected,
    applyBooleanOp,
    groupSelected,
    ungroupSelected,
    createNewDocument,
    setActiveDocId,
    setShowDocumentList,
    showDocumentList,
    documents,
    renameDocument,
    updateDocument,
    setCanvas,
    setSelection,
    deselectAll,
  } = useEditorStore();

  const doc = getActiveDoc();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docList, setDocList] = useState<Pick<Document, 'id' | 'name' | 'thumbnail' | 'updatedAt'>[]>([]);

  const handleExportSVG = () => {
    if (!doc) return;
    const svgStr = exportToSVGString(doc);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async (scale: number) => {
    if (!doc) return;
    const dataUrl = await exportToPNG(doc, scale);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${doc.name}@${scale}x.png`;
    a.click();
  };

  const handleExportSVGCode = () => {
    if (!doc) return;
    const svgStr = exportToSVGString(doc);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre style="background:#1e1e1e;color:#d4d4d4;padding:20px;font-family:monospace;font-size:13px;white-space:pre-wrap;">${svgStr.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
    }
  };

  const handleImportSVG = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const svgStr = ev.target?.result as string;
      const result = importSVG(svgStr);

      if (result.shapes.length > 0 && doc) {
        useEditorStore.getState().pushHistory();
        updateDocument((d) => {
          const newShapes = { ...d.shapes };
          const layer = d.layers.find((l) => l.id === d.activeLayerId);
          if (!layer) return d;

          const newShapeIds = [...layer.shapeIds];
          for (const shape of result.shapes) {
            newShapes[shape.id] = shape;
            newShapeIds.push(shape.id);
          }

          return {
            ...d,
            shapes: newShapes,
            layers: d.layers.map((l) =>
              l.id === d.activeLayerId ? { ...l, shapeIds: newShapeIds } : l
            ),
          };
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenDocList = async () => {
    const docs = await listDocuments();
    setDocList(docs);
    setShowDocumentList(!showDocumentList);
  };

  const handleSave = async () => {
    if (!doc) return;
    const thumbnail = generateThumbnail(doc);
    await saveDocument({ ...doc, thumbnail });
  };

  const handleLoadDoc = async (id: string) => {
    const loadedDoc = await loadDocument(id);
    if (loadedDoc) {
      const store = useEditorStore.getState();
      const existing = store.documents.find((d) => d.id === id);
      if (existing) {
        setActiveDocId(id);
      } else {
        useEditorStore.setState((state: any) => ({
          documents: [...state.documents, loadedDoc],
          activeDocId: id,
        }));
      }
    }
    setShowDocumentList(false);
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDocument(id);
    useEditorStore.getState().deleteDocument(id);
    const docs = await listDocuments();
    setDocList(docs);
  };

  const hasSelection = selection.shapeIds.length > 0;
  const hasMultipleSelection = selection.shapeIds.length >= 2;
  const hasGroupSelection = selection.shapeIds.length === 1 && doc?.shapes[selection.shapeIds[0]]?.type === 'group';

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <button className="top-btn" onClick={() => createNewDocument()}>
          新建
        </button>
        <button className="top-btn" onClick={handleSave}>
          保存
        </button>
        <button className="top-btn" onClick={handleOpenDocList}>
          文档
        </button>
        <button className="top-btn" onClick={() => fileInputRef.current?.click()}>
          导入SVG
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg"
          onChange={handleImportSVG}
          style={{ display: 'none' }}
        />
      </div>

      <div className="top-bar-center">
        <span className="doc-name">{doc?.name || '未命名'}</span>
        <span className="zoom-label">缩放: {Math.round(canvas.zoom * 100)}%</span>
      </div>

      <div className="top-bar-right">
        <div className="align-group">
          <button className="top-btn small" onClick={() => alignSelected('left')} title="左对齐" disabled={!hasMultipleSelection}>
            ⊣
          </button>
          <button className="top-btn small" onClick={() => alignSelected('center')} title="水平居中" disabled={!hasMultipleSelection}>
            ⊞
          </button>
          <button className="top-btn small" onClick={() => alignSelected('right')} title="右对齐" disabled={!hasMultipleSelection}>
            ⊢
          </button>
          <button className="top-btn small" onClick={() => alignSelected('top')} title="顶部对齐" disabled={!hasMultipleSelection}>
            ⊤
          </button>
          <button className="top-btn small" onClick={() => alignSelected('middle')} title="垂直居中" disabled={!hasMultipleSelection}>
            ⊡
          </button>
          <button className="top-btn small" onClick={() => alignSelected('bottom')} title="底部对齐" disabled={!hasMultipleSelection}>
            ⊥
          </button>
          <span className="separator" />
          <button className="top-btn small" onClick={() => distributeSelected('horizontal')} title="横向等间距分布" disabled={selection.shapeIds.length < 3}>
            ⇔
          </button>
          <button className="top-btn small" onClick={() => distributeSelected('vertical')} title="纵向等间距分布" disabled={selection.shapeIds.length < 3}>
            ⇕
          </button>
        </div>

        <span className="separator" />

        <div className="boolean-group">
          <button className="top-btn small" onClick={() => applyBooleanOp('union')} title="联合" disabled={!hasMultipleSelection}>
            ∪
          </button>
          <button className="top-btn small" onClick={() => applyBooleanOp('subtract')} title="减去" disabled={!hasMultipleSelection}>
            ∖
          </button>
          <button className="top-btn small" onClick={() => applyBooleanOp('intersect')} title="相交" disabled={!hasMultipleSelection}>
            ∩
          </button>
          <button className="top-btn small" onClick={() => applyBooleanOp('exclude')} title="排除" disabled={!hasMultipleSelection}>
            ⊖
          </button>
        </div>

        <span className="separator" />

        <div className="group-actions">
          <button className="top-btn small" onClick={groupSelected} title="编组 Ctrl+G" disabled={!hasMultipleSelection}>
            编组
          </button>
          <button className="top-btn small" onClick={ungroupSelected} title="解组 Ctrl+Shift+G" disabled={!hasGroupSelection}>
            解组
          </button>
        </div>

        <span className="separator" />

        <div className="grid-controls">
          <select
            value={canvas.gridType}
            onChange={(e) => setCanvas({ gridType: e.target.value as any })}
            className="prop-select tiny"
          >
            <option value="pixel">像素网格</option>
            <option value="isometric">等距网格</option>
            <option value="polar">极坐标</option>
          </select>
          <button
            className={`top-btn small ${canvas.showGrid ? 'active' : ''}`}
            onClick={() => setCanvas({ showGrid: !canvas.showGrid })}
            title="切换网格"
          >
            #
          </button>
          <button
            className={`top-btn small ${canvas.showRulers ? 'active' : ''}`}
            onClick={() => setCanvas({ showRulers: !canvas.showRulers })}
            title="切换标尺"
          >
            📏
          </button>
          <button
            className={`top-btn small ${canvas.snapToGrid ? 'active' : ''}`}
            onClick={() => setCanvas({ snapToGrid: !canvas.snapToGrid })}
            title="吸附到网格"
          >
            ⊞
          </button>
        </div>

        <span className="separator" />

        <div className="export-group">
          <button className="top-btn" onClick={handleExportSVG}>
            导出SVG
          </button>
          <button className="top-btn small" onClick={() => handleExportPNG(1)}>
            PNG 1x
          </button>
          <button className="top-btn small" onClick={() => handleExportPNG(2)}>
            PNG 2x
          </button>
          <button className="top-btn small" onClick={() => handleExportPNG(3)}>
            PNG 3x
          </button>
          <button className="top-btn small" onClick={handleExportSVGCode} title="查看SVG源码">
            &lt;/&gt;
          </button>
        </div>
      </div>

      {showDocumentList && (
        <div className="document-list-popup">
          <div className="doc-list-header">
            <span>文档列表</span>
            <button className="top-btn small" onClick={() => createNewDocument()}>
              + 新建
            </button>
          </div>
          <div className="doc-list-items">
            {documents.map((d) => (
              <div
                key={d.id}
                className={`doc-list-item ${d.id === doc?.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveDocId(d.id);
                  setShowDocumentList(false);
                }}
              >
                <div className="doc-thumb">
                  {d.thumbnail ? (
                    <img src={d.thumbnail} alt={d.name} />
                  ) : (
                    <div className="doc-thumb-placeholder">空</div>
                  )}
                </div>
                <div className="doc-info">
                  <span className="doc-list-name">{d.name}</span>
                  <span className="doc-list-date">
                    {new Date(d.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="btn-icon-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDoc(d.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {docList
              .filter((d) => !documents.find((doc) => doc.id === d.id))
              .map((d) => (
                <div
                  key={d.id}
                  className="doc-list-item"
                  onClick={() => handleLoadDoc(d.id)}
                >
                  <div className="doc-thumb">
                    {d.thumbnail ? (
                      <img src={d.thumbnail} alt={d.name} />
                    ) : (
                      <div className="doc-thumb-placeholder">空</div>
                    )}
                  </div>
                  <div className="doc-info">
                    <span className="doc-list-name">{d.name}</span>
                    <span className="doc-list-date">
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
