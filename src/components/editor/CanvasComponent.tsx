import { EmailComponent } from '@/types/email';
import { useEmailStore } from '@/store/useEmailStore';
import { buildInlineStyle, renderComponentToHtml } from '@/utils/exportHtml';
import { GripVertical, Trash2, Copy, Columns2, Columns3 } from 'lucide-react';

interface CanvasComponentProps {
  component: EmailComponent;
  index: number;
  parentId?: string;
  columnIndex?: number;
  isNested?: boolean;
}

export default function CanvasComponent({ component, index, parentId, columnIndex, isNested }: CanvasComponentProps) {
  const {
    selectedComponentId, selectComponent, previewMode,
    variables, showVariables, removeComponent, duplicateComponent,
    moveComponent, setDragOverInfo, dragOverInfo, addComponent, pushHistory,
  } = useEmailStore();

  const isSelected = selectedComponentId === component.id;
  const isLayoutComponent = component.type === 'two-column' || component.type === 'three-column';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('moveComponentId', component.id);
    e.dataTransfer.setData('moveComponentIndex', String(index));
    if (parentId) e.dataTransfer.setData('moveParentId', parentId);
    if (columnIndex !== undefined) e.dataTransfer.setData('moveColumnIndex', String(columnIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertIndex = e.clientY < midY ? index : index + 1;
    setDragOverInfo({
      parentId: isNested ? parentId : undefined,
      columnIndex: isNested ? columnIndex : undefined,
      insertIndex,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverInfo(null);

    const componentType = e.dataTransfer.getData('componentType');
    const moveComponentId = e.dataTransfer.getData('moveComponentId');

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertIndex = e.clientY < midY ? index : index + 1;

    if (componentType) {
      pushHistory();
      addComponent(componentType as any, insertIndex, isNested ? parentId : undefined, isNested ? columnIndex : undefined);
    } else if (moveComponentId) {
      const fromIndex = parseInt(e.dataTransfer.getData('moveComponentIndex') || '0');
      pushHistory();
      moveComponent(fromIndex, insertIndex, isNested ? parentId : undefined, isNested ? columnIndex : undefined);
    }
  };

  const renderContent = () => {
    if (isLayoutComponent) {
      return renderLayoutContent();
    }
    if (previewMode === 'dark') {
      return <DarkModePreview component={component} variables={variables} showVariables={showVariables} />;
    }
    const html = renderComponentToHtml(component, variables, showVariables);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const renderLayoutContent = () => {
    const p = component.properties;
    const isDark = previewMode === 'dark';
    const colCount = component.type === 'two-column' ? 2 : 3;
    const ratios = (p.columnRatio || (colCount === 2 ? '50,50' : '33,34,33')).split(',').map(Number);
    const total = ratios.reduce((a: number, b: number) => a + b, 0);
    const Icon = component.type === 'two-column' ? Columns2 : Columns3;

    return (
      <div style={{ padding: p.padding, margin: p.margin }}>
        <div className="flex items-center gap-1 mb-1">
          <Icon size={12} className="text-gray-400" />
          <span className="text-[10px] text-gray-500">
            {component.type === 'two-column' ? '两列布局' : '三列布局'}
          </span>
        </div>
        <div className="flex" style={{ gap: p.gap || 0 }}>
          {(component.children || Array.from({ length: colCount }, () => [])).map((col, ci) => (
            <div
              key={ci}
              className="min-h-[60px] border-2 border-dashed rounded transition-colors hover:border-blue-300/50"
              style={{
                flex: ratios[ci] || 1,
                borderColor: isDark ? '#374151' : '#e5e7eb',
                padding: '4px',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const componentType = e.dataTransfer.getData('componentType');
                if (componentType) {
                  pushHistory();
                  addComponent(componentType as any, undefined, component.id, ci);
                }
              }}
            >
              {col.length === 0 ? (
                <div className="flex items-center justify-center h-12 text-xs" style={{ color: isDark ? '#4b5563' : '#9ca3af' }}>
                  拖入组件
                </div>
              ) : (
                col.map((child, childIdx) => (
                  <CanvasComponent
                    key={child.id}
                    component={child}
                    index={childIdx}
                    parentId={component.id}
                    columnIndex={ci}
                    isNested
                  />
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative group transition-all duration-150 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-0' : ''
      } ${!isLayoutComponent && !isNested ? 'hover:ring-1 hover:ring-blue-400/50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
      onDragOver={isLayoutComponent ? undefined : handleDragOver}
      onDrop={isLayoutComponent ? undefined : handleDrop}
      onDragLeave={isLayoutComponent ? undefined : () => setDragOverInfo(null)}
    >
      {!isLayoutComponent && dragOverInfo?.insertIndex === index && dragOverInfo.parentId === (isNested ? parentId : undefined) && dragOverInfo.columnIndex === (isNested ? columnIndex : undefined) && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10" />
      )}

      <div className={`relative ${isNested ? '' : 'cursor-pointer'}`}>
        {renderContent()}
      </div>

      <div className={`absolute top-1 right-1 flex gap-0.5 transition-opacity z-20 ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button
          onClick={(e) => { e.stopPropagation(); }}
          draggable
          onDragStart={handleDragStart}
          className="p-1 bg-[#1a1d23]/90 rounded text-gray-400 hover:text-white hover:bg-blue-500 transition-colors cursor-grab"
          title="拖拽排序"
        >
          <GripVertical size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id); }}
          className="p-1 bg-[#1a1d23]/90 rounded text-gray-400 hover:text-white hover:bg-emerald-500 transition-colors"
          title="复制"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); removeComponent(component.id, isNested ? parentId : undefined, isNested ? columnIndex : undefined); }}
          className="p-1 bg-[#1a1d23]/90 rounded text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
          title="删除"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function DarkModePreview({ component, variables, showVariables }: { component: EmailComponent; variables: Record<string, string>; showVariables: boolean }) {
  const processText = (text: string): string => {
    if (showVariables) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  };

  const p = component.properties;

  const darkStyle = (base: Record<string, any>): Record<string, any> => {
    const result = { ...base };
    if (result.color && result.color !== '#ffffff' && result.color !== '#fff') {
      result.color = '#e5e7eb';
    }
    if (result.backgroundColor && result.backgroundColor !== '#ffffff' && result.backgroundColor !== '#fff') {
      result.backgroundColor = '#374151';
    }
    return result;
  };

  switch (component.type) {
    case 'heading':
      return <div style={darkStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: '#e5e7eb', textAlign: p.align, lineHeight: p.lineHeight, fontWeight: p.fontWeight, padding: p.padding, margin: p.margin })}>{processText(p.text || '')}</div>;
    case 'paragraph': {
      const text = processText(p.text || '');
      return <div style={darkStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: '#d1d5db', textAlign: p.align, lineHeight: p.lineHeight, fontWeight: p.fontWeight, padding: p.padding, margin: p.margin })}>{text.split('\n').map((line: string, i: number) => <span key={i}>{i > 0 && <br />}{line}</span>)}</div>;
    }
    case 'button': {
      const ds = darkStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: p.color, backgroundColor: p.backgroundColor, padding: p.padding, borderRadius: p.borderRadius, fontWeight: p.fontWeight, textDecoration: 'none', display: 'inline-block' });
      return <div style={{ textAlign: p.align, padding: p.padding, margin: p.margin }}><span style={ds}>{processText(p.text || '')}</span></div>;
    }
    case 'image':
      return <div style={{ padding: p.padding, margin: p.margin, textAlign: p.align || 'center' }}><img src={p.src} alt={p.alt} style={{ maxWidth: '100%', height: 'auto', borderRadius: p.borderRadius, filter: 'brightness(0.85)' }} /></div>;
    case 'divider':
      return <div style={{ padding: p.padding, margin: p.margin }}><hr style={{ border: 'none', borderTop: `${p.thickness || 1}px ${p.style || 'solid'} #4b5563`, margin: 0 }} /></div>;
    case 'spacer':
      return <div style={{ height: p.height }} />;
    case 'social-icons': {
      const platforms = p.platforms || [];
      return <div style={{ textAlign: p.align || 'center', padding: p.padding, margin: p.margin }}>{platforms.map((pl: any, i: number) => <span key={i} style={{ fontSize: p.iconSize || 32, padding: '0 8px' }}>{pl.icon}</span>)}</div>;
    }
    case 'footer': {
      const text = processText(p.text || '');
      return <div style={darkStyle({ fontSize: p.fontSize, fontFamily: p.fontFamily, color: '#9ca3af', textAlign: p.align, lineHeight: p.lineHeight, fontWeight: p.fontWeight, padding: p.padding, margin: p.margin })}>{text.split('\n').map((line: string, i: number) => <span key={i}>{i > 0 && <br />}{line}</span>)}</div>;
    }
    default:
      return <div style={{ color: '#e5e7eb', padding: '10px' }}>{component.type}</div>;
  }
}
