import React, { useState } from 'react';
import { useEditorStore } from '../store';
import { Fill, Stroke, FillType, GradientStop, Gradient, PatternFill, StrokeLineCap, StrokeLineJoin } from '../types';

const PropertyPanel: React.FC = () => {
  const { getActiveDoc, selection, updateShapeFill, updateShapeStroke, updateShapeTextProps, updateShapeOpacity, updateShapeBlendMode } = useEditorStore();
  const doc = getActiveDoc();
  const selectedShape = selection.shapeIds.length === 1 ? doc?.shapes[selection.shapeIds[0]] : null;
  const [fillTab, setFillTab] = useState<'fill' | 'stroke'>('fill');

  if (!selectedShape) {
    return (
      <div className="property-panel">
        <div className="panel-header">属性</div>
        <div className="panel-empty">选择一个形状以编辑属性</div>
      </div>
    );
  }

  return (
    <div className="property-panel">
      <div className="panel-header">属性</div>

      <div className="prop-tabs">
        <button className={`prop-tab ${fillTab === 'fill' ? 'active' : ''}`} onClick={() => setFillTab('fill')}>
          填充
        </button>
        <button className={`prop-tab ${fillTab === 'stroke' ? 'active' : ''}`} onClick={() => setFillTab('stroke')}>
          描边
        </button>
      </div>

      {fillTab === 'fill' ? (
        <FillPanel
          fill={selectedShape.fill}
          shapeId={selectedShape.id}
          onUpdate={updateShapeFill}
        />
      ) : (
        <StrokePanel
          stroke={selectedShape.stroke}
          shapeId={selectedShape.id}
          onUpdate={updateShapeStroke}
        />
      )}

      <div className="prop-section">
        <label className="prop-label">透明度</label>
        <div className="prop-row">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selectedShape.opacity}
            onChange={(e) => updateShapeOpacity(selectedShape.id, parseFloat(e.target.value))}
          />
          <span className="prop-value">{Math.round(selectedShape.opacity * 100)}%</span>
        </div>
      </div>

      <div className="prop-section">
        <label className="prop-label">混合模式</label>
        <select
          value={selectedShape.blendMode}
          onChange={(e) => updateShapeBlendMode(selectedShape.id, e.target.value as any)}
          className="prop-select"
        >
          <option value="normal">正常</option>
          <option value="multiply">正片叠底</option>
          <option value="screen">滤色</option>
          <option value="overlay">叠加</option>
          <option value="darken">变暗</option>
          <option value="lighten">变亮</option>
          <option value="color-dodge">颜色减淡</option>
          <option value="color-burn">颜色加深</option>
          <option value="hard-light">强光</option>
          <option value="soft-light">柔光</option>
          <option value="difference">差值</option>
          <option value="exclusion">排除</option>
        </select>
      </div>

      {selectedShape.type === 'text' && selectedShape.textProps && (
        <TextPanel
          shapeId={selectedShape.id}
          textProps={selectedShape.textProps}
          onUpdate={updateShapeTextProps}
        />
      )}
    </div>
  );
};

const FillPanel: React.FC<{
  fill: Fill;
  shapeId: string;
  onUpdate: (id: string, fill: Partial<Fill>) => void;
}> = ({ fill, shapeId, onUpdate }) => {
  const [gradientStops, setGradientStops] = useState<GradientStop[]>(
    fill.gradient?.stops || [
      { offset: 0, color: '#ffffff', opacity: 1 },
      { offset: 1, color: '#000000', opacity: 1 },
    ]
  );

  const handleFillTypeChange = (type: FillType) => {
    const update: Partial<Fill> = { type };
    if (type === 'linearGradient' || type === 'radialGradient') {
      update.gradient = fill.gradient || {
        type: type === 'linearGradient' ? 'linear' : 'radial',
        stops: gradientStops,
        angle: 0,
        cx: 50,
        cy: 50,
      };
      update.gradient.type = type === 'linearGradient' ? 'linear' : 'radial';
    }
    if (type === 'pattern') {
      update.pattern = fill.pattern || {
        type: 'dots',
        color: '#000000',
        backgroundColor: 'transparent',
        scale: 1,
        spacing: 10,
        angle: 0,
      };
    }
    onUpdate(shapeId, update);
  };

  return (
    <div className="prop-section">
      <label className="prop-label">填充类型</label>
      <select
        value={fill.type}
        onChange={(e) => handleFillTypeChange(e.target.value as FillType)}
        className="prop-select"
      >
        <option value="none">无填充</option>
        <option value="solid">纯色</option>
        <option value="linearGradient">线性渐变</option>
        <option value="radialGradient">径向渐变</option>
        <option value="pattern">图案填充</option>
      </select>

      {fill.type === 'solid' && (
        <div className="prop-row">
          <input
            type="color"
            value={fill.color || '#4a90d9'}
            onChange={(e) => onUpdate(shapeId, { color: e.target.value })}
            className="color-input"
          />
          <input
            type="text"
            value={fill.color || '#4a90d9'}
            onChange={(e) => onUpdate(shapeId, { color: e.target.value })}
            className="prop-text-input"
          />
        </div>
      )}

      {(fill.type === 'linearGradient' || fill.type === 'radialGradient') && fill.gradient && (
        <div className="gradient-editor">
          <div className="gradient-preview">
            <div
              className="gradient-bar"
              style={{
                background:
                  fill.gradient.type === 'linear'
                    ? `linear-gradient(${fill.gradient.angle}deg, ${fill.gradient.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`
                    : `radial-gradient(circle, ${fill.gradient.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`,
              }}
            />
          </div>
          {fill.gradient.type === 'linear' && (
            <div className="prop-row">
              <label>角度</label>
              <input
                type="range"
                min={0}
                max={360}
                value={fill.gradient.angle}
                onChange={(e) =>
                  onUpdate(shapeId, {
                    gradient: { ...fill.gradient!, angle: parseInt(e.target.value) },
                  })
                }
              />
              <span className="prop-value">{fill.gradient.angle}°</span>
            </div>
          )}
          <div className="gradient-stops">
            {fill.gradient.stops.map((stop, i) => (
              <div key={i} className="gradient-stop">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => {
                    const newStops = [...fill.gradient!.stops];
                    newStops[i] = { ...newStops[i], color: e.target.value };
                    setGradientStops(newStops);
                    onUpdate(shapeId, {
                      gradient: { ...fill.gradient!, stops: newStops },
                    });
                  }}
                  className="color-input small"
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={stop.offset}
                  onChange={(e) => {
                    const newStops = [...fill.gradient!.stops];
                    newStops[i] = { ...newStops[i], offset: parseFloat(e.target.value) };
                    setGradientStops(newStops);
                    onUpdate(shapeId, {
                      gradient: { ...fill.gradient!, stops: newStops },
                    });
                  }}
                />
              </div>
            ))}
            <button
              className="btn-small"
              onClick={() => {
                const newStops = [
                  ...fill.gradient!.stops,
                  { offset: 0.5, color: '#888888', opacity: 1 },
                ];
                setGradientStops(newStops);
                onUpdate(shapeId, {
                  gradient: { ...fill.gradient!, stops: newStops },
                });
              }}
            >
              + 添加色标
            </button>
          </div>
        </div>
      )}

      {fill.type === 'pattern' && fill.pattern && (
        <div className="pattern-editor">
          <div className="prop-row">
            <label>图案</label>
            <select
              value={fill.pattern.type}
              onChange={(e) =>
                onUpdate(shapeId, {
                  pattern: { ...fill.pattern!, type: e.target.value as PatternFill['type'] },
                })
              }
              className="prop-select"
            >
              <option value="dots">圆点</option>
              <option value="lines">线条</option>
              <option value="crosshatch">交叉线</option>
              <option value="zigzag">锯齿</option>
            </select>
          </div>
          <div className="prop-row">
            <label>颜色</label>
            <input
              type="color"
              value={fill.pattern.color}
              onChange={(e) =>
                onUpdate(shapeId, {
                  pattern: { ...fill.pattern!, color: e.target.value },
                })
              }
              className="color-input"
            />
          </div>
          <div className="prop-row">
            <label>间距</label>
            <input
              type="range"
              min={2}
              max={50}
              value={fill.pattern.spacing}
              onChange={(e) =>
                onUpdate(shapeId, {
                  pattern: { ...fill.pattern!, spacing: parseInt(e.target.value) },
                })
              }
            />
            <span className="prop-value">{fill.pattern.spacing}</span>
          </div>
          <div className="prop-row">
            <label>角度</label>
            <input
              type="range"
              min={0}
              max={360}
              value={fill.pattern.angle}
              onChange={(e) =>
                onUpdate(shapeId, {
                  pattern: { ...fill.pattern!, angle: parseInt(e.target.value) },
                })
              }
            />
            <span className="prop-value">{fill.pattern.angle}°</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StrokePanel: React.FC<{
  stroke: Stroke;
  shapeId: string;
  onUpdate: (id: string, stroke: Partial<Stroke>) => void;
}> = ({ stroke, shapeId, onUpdate }) => {
  return (
    <div className="prop-section">
      <div className="prop-row">
        <label>颜色</label>
        <input
          type="color"
          value={stroke.color}
          onChange={(e) => onUpdate(shapeId, { color: e.target.value })}
          className="color-input"
        />
        <input
          type="text"
          value={stroke.color}
          onChange={(e) => onUpdate(shapeId, { color: e.target.value })}
          className="prop-text-input"
        />
      </div>

      <div className="prop-row">
        <label>粗细</label>
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={stroke.width}
          onChange={(e) => onUpdate(shapeId, { width: parseFloat(e.target.value) || 0 })}
          className="prop-number-input"
        />
      </div>

      <div className="prop-row">
        <label>虚线</label>
        <select
          value={stroke.dashArray || ''}
          onChange={(e) => onUpdate(shapeId, { dashArray: e.target.value })}
          className="prop-select"
        >
          <option value="">实线</option>
          <option value="4 4">短虚线</option>
          <option value="8 4">中虚线</option>
          <option value="12 4">长虚线</option>
          <option value="2 2">点线</option>
          <option value="8 4 2 4">点划线</option>
        </select>
      </div>

      <div className="prop-row">
        <label>端点</label>
        <div className="btn-group">
          {(['butt', 'round', 'square'] as StrokeLineCap[]).map((cap) => (
            <button
              key={cap}
              className={`btn-toggle ${stroke.lineCap === cap ? 'active' : ''}`}
              onClick={() => onUpdate(shapeId, { lineCap: cap })}
              title={cap}
            >
              {cap === 'butt' ? '┃' : cap === 'round' ? '●' : '■'}
            </button>
          ))}
        </div>
      </div>

      <div className="prop-row">
        <label>连接</label>
        <div className="btn-group">
          {(['miter', 'round', 'bevel'] as StrokeLineJoin[]).map((join) => (
            <button
              key={join}
              className={`btn-toggle ${stroke.lineJoin === join ? 'active' : ''}`}
              onClick={() => onUpdate(shapeId, { lineJoin: join })}
              title={join}
            >
              {join === 'miter' ? '⌐' : join === 'round' ? '⌒' : '⌙'}
            </button>
          ))}
        </div>
      </div>

      <div className="prop-row">
        <label>透明度</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={stroke.opacity}
          onChange={(e) => onUpdate(shapeId, { opacity: parseFloat(e.target.value) })}
        />
        <span className="prop-value">{Math.round(stroke.opacity * 100)}%</span>
      </div>
    </div>
  );
};

const TextPanel: React.FC<{
  shapeId: string;
  textProps: NonNullable<import('../types').TextProperties>;
  onUpdate: (id: string, props: Partial<import('../types').TextProperties>) => void;
}> = ({ shapeId, textProps, onUpdate }) => {
  const doc = useEditorStore((s) => s.getActiveDoc());
  const selection = useEditorStore((s) => s.selection);

  const availablePaths = doc
    ? Object.values(doc.shapes)
        .filter((s) => s.id !== shapeId && s.anchors.length > 1 && s.pathData)
        .map((s) => ({ id: s.id, name: s.name }))
    : [];

  return (
    <div className="prop-section text-section">
      <label className="prop-label">文字属性</label>

      <div className="prop-row">
        <label>内容</label>
        <textarea
          value={textProps.content}
          onChange={(e) => onUpdate(shapeId, { content: e.target.value })}
          className="prop-textarea"
          rows={2}
        />
      </div>

      <div className="prop-row">
        <label>字体</label>
        <select
          value={textProps.fontFamily}
          onChange={(e) => onUpdate(shapeId, { fontFamily: e.target.value })}
          className="prop-select"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
          <option value="SimSun">宋体</option>
          <option value="Microsoft YaHei">微软雅黑</option>
          <option value="SimHei">黑体</option>
          <option value="KaiTi">楷体</option>
        </select>
      </div>

      <div className="prop-row">
        <label>大小</label>
        <input
          type="number"
          min={1}
          max={500}
          value={textProps.fontSize}
          onChange={(e) => onUpdate(shapeId, { fontSize: parseFloat(e.target.value) || 12 })}
          className="prop-number-input"
        />
      </div>

      <div className="prop-row">
        <label>对齐</label>
        <div className="btn-group">
          {(['start', 'middle', 'end'] as const).map((anchor) => (
            <button
              key={anchor}
              className={`btn-toggle ${textProps.textAnchor === anchor ? 'active' : ''}`}
              onClick={() => onUpdate(shapeId, { textAnchor: anchor })}
            >
              {anchor === 'start' ? '⊑' : anchor === 'middle' ? '⊐⊑' : '⊐'}
            </button>
          ))}
        </div>
      </div>

      <div className="prop-row">
        <label>路径排版</label>
        <select
          value={textProps.pathId || ''}
          onChange={(e) => onUpdate(shapeId, { pathId: e.target.value || null })}
          className="prop-select"
        >
          <option value="">无路径</option>
          {availablePaths.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {textProps.pathId && (
        <div className="prop-row">
          <label>起始偏移</label>
          <input
            type="range"
            min={0}
            max={100}
            value={textProps.startOffset}
            onChange={(e) => onUpdate(shapeId, { startOffset: parseFloat(e.target.value) })}
          />
          <span className="prop-value">{Math.round(textProps.startOffset)}%</span>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;
