import React, { useState } from 'react';
import { useEditorStore } from '../store';
import { BlendMode } from '../types';

const LayerPanel: React.FC = () => {
  const {
    getActiveDoc,
    addLayer,
    removeLayer,
    setActiveLayer,
    updateLayer,
    selectShape,
    selection,
    updateShapeName,
  } = useEditorStore();

  const doc = getActiveDoc();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [editingShapeName, setEditingShapeName] = useState('');

  if (!doc) return null;

  const blendModes: { value: BlendMode; label: string }[] = [
    { value: 'normal', label: '正常' },
    { value: 'multiply', label: '正片叠底' },
    { value: 'screen', label: '滤色' },
    { value: 'overlay', label: '叠加' },
    { value: 'darken', label: '变暗' },
    { value: 'lighten', label: '变亮' },
  ];

  const startEditLayer = (id: string, name: string) => {
    setEditingLayerId(id);
    setEditingName(name);
  };

  const saveEditLayer = () => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, (l) => ({ ...l, name: editingName.trim() }));
    }
    setEditingLayerId(null);
  };

  const startEditShape = (id: string, name: string) => {
    setEditingShapeId(id);
    setEditingShapeName(name);
  };

  const saveEditShape = () => {
    if (editingShapeId && editingShapeName.trim()) {
      updateShapeName(editingShapeId, editingShapeName.trim());
    }
    setEditingShapeId(null);
  };

  return (
    <div className="layer-panel">
      <div className="panel-header">
        <span>图层</span>
        <button className="btn-icon" onClick={() => addLayer()} title="新建图层">
          +
        </button>
      </div>

      <div className="layer-list">
        {[...doc.layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={`layer-item ${doc.activeLayerId === layer.id ? 'active' : ''}`}
          >
            <div className="layer-header" onClick={() => setActiveLayer(layer.id)}>
              <button
                className={`btn-icon-small ${layer.visible ? '' : 'dimmed'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, (l) => ({ ...l, visible: !l.visible }));
                }}
                title={layer.visible ? '隐藏' : '显示'}
              >
                {layer.visible ? '👁' : '👁‍🗨'}
              </button>
              <button
                className={`btn-icon-small ${layer.locked ? '' : 'dimmed'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, (l) => ({ ...l, locked: !l.locked }));
                }}
                title={layer.locked ? '解锁' : '锁定'}
              >
                {layer.locked ? '🔒' : '🔓'}
              </button>

              {editingLayerId === layer.id ? (
                <input
                  className="layer-name-input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveEditLayer}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditLayer()}
                  autoFocus
                />
              ) : (
                <span
                  className="layer-name"
                  onDoubleClick={() => startEditLayer(layer.id, layer.name)}
                >
                  {layer.name}
                </span>
              )}

              <button
                className="btn-icon-small"
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(layer.id, (l) => ({ ...l, expanded: !l.expanded }));
                }}
              >
                {layer.expanded ? '▾' : '▸'}
              </button>
            </div>

            {layer.expanded && (
              <div className="layer-shapes">
                {layer.shapeIds.map((shapeId) => {
                  const shape = doc.shapes[shapeId];
                  if (!shape) return null;
                  const isSelected = selection.shapeIds.includes(shapeId);
                  return (
                    <div
                      key={shapeId}
                      className={`shape-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectShape(shapeId)}
                    >
                      <span className="shape-icon">
                        {shape.type === 'path' ? '✏' :
                         shape.type === 'rect' ? '▭' :
                         shape.type === 'circle' ? '○' :
                         shape.type === 'ellipse' ? '⬭' :
                         shape.type === 'polygon' ? '⬡' :
                         shape.type === 'star' ? '☆' :
                         shape.type === 'text' ? 'T' :
                         shape.type === 'group' ? '📁' : '•'}
                      </span>
                      {editingShapeId === shapeId ? (
                        <input
                          className="layer-name-input"
                          value={editingShapeName}
                          onChange={(e) => setEditingShapeName(e.target.value)}
                          onBlur={saveEditShape}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditShape()}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="shape-name"
                          onDoubleClick={() => startEditShape(shapeId, shape.name)}
                        >
                          {shape.name}
                        </span>
                      )}
                      <button
                        className={`btn-icon-small ${shape.visible ? '' : 'dimmed'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const store = useEditorStore.getState();
                          store.updateShape(shapeId, (s) => ({ ...s, visible: !s.visible }));
                        }}
                      >
                        {shape.visible ? '👁' : '👁‍🗨'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {doc.activeLayerId === layer.id && (
              <div className="layer-props">
                <div className="prop-row compact">
                  <label>透明度</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={layer.opacity}
                    onChange={(e) =>
                      updateLayer(layer.id, (l) => ({ ...l, opacity: parseFloat(e.target.value) }))
                    }
                  />
                  <span className="prop-value">{Math.round(layer.opacity * 100)}%</span>
                </div>
                <div className="prop-row compact">
                  <label>混合</label>
                  <select
                    value={layer.blendMode}
                    onChange={(e) =>
                      updateLayer(layer.id, (l) => ({ ...l, blendMode: e.target.value as BlendMode }))
                    }
                    className="prop-select small"
                  >
                    {blendModes.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="layer-actions">
        <button className="btn-icon" onClick={() => addLayer()} title="新建图层">
          +
        </button>
        <button
          className="btn-icon"
          onClick={() => {
            if (doc.layers.length > 1) {
              removeLayer(doc.activeLayerId);
            }
          }}
          title="删除图层"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default LayerPanel;
