import { useEmailStore } from '@/store/useEmailStore';
import { EmailComponent, FONT_OPTIONS, ALIGN_OPTIONS, VARIABLE_LIST, SOCIAL_PLATFORMS } from '@/types/email';
import { Variable, Plus, X } from 'lucide-react';

export default function PropertiesPanel() {
  const { selectedComponentId, currentTemplate, updateComponentProps, setShowVariableInsert } = useEmailStore();

  const findComponent = (components: EmailComponent[], id: string): EmailComponent | null => {
    for (const c of components) {
      if (c.id === id) return c;
      if (c.children) {
        for (const col of c.children) {
          const found = findComponent(col, id);
          if (found) return found;
        }
      }
    }
    return null;
  };

  if (!selectedComponentId) {
    return (
      <div className="w-72 bg-[#1a1d23] border-l border-[#2a2d35] flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-[#2a2d35]">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">属性</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">选中组件后<br />在此编辑属性</p>
          </div>
        </div>
      </div>
    );
  }

  const component = findComponent(currentTemplate.components, selectedComponentId);
  if (!component) return null;

  const p = component.properties;

  return (
    <div className="w-72 bg-[#1a1d23] border-l border-[#2a2d35] flex flex-col shrink-0 overflow-y-auto">
      <div className="px-4 py-3 border-b border-[#2a2d35]">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {component.type === 'heading' && '标题'}
          {component.type === 'paragraph' && '段落文字'}
          {component.type === 'button' && '按钮'}
          {component.type === 'image' && '图片'}
          {component.type === 'divider' && '分隔线'}
          {component.type === 'spacer' && '间距块'}
          {component.type === 'two-column' && '两列布局'}
          {component.type === 'three-column' && '三列布局'}
          {component.type === 'social-icons' && '社交图标'}
          {component.type === 'footer' && '页脚'}
        </h2>
      </div>

      <div className="p-3 space-y-3">
        {component.type === 'heading' && <HeadingProps component={component} />}
        {component.type === 'paragraph' && <ParagraphProps component={component} />}
        {component.type === 'button' && <ButtonProps component={component} />}
        {component.type === 'image' && <ImageProps component={component} />}
        {component.type === 'divider' && <DividerProps component={component} />}
        {component.type === 'spacer' && <SpacerProps component={component} />}
        {component.type === 'two-column' && <LayoutProps component={component} />}
        {component.type === 'three-column' && <LayoutProps component={component} />}
        {component.type === 'social-icons' && <SocialProps component={component} />}
        {component.type === 'footer' && <FooterProps component={component} />}
      </div>
    </div>
  );
}

function PropGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs text-gray-400 block mb-0.5">{children}</label>;
}

function TextProp({ component, prop, placeholder, onInsertVariable }: { component: EmailComponent; prop: string; placeholder?: string; onInsertVariable?: boolean }) {
  const { updateComponentProps } = useEmailStore();
  const { setShowVariableInsert } = useEmailStore();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{prop === 'text' ? '内容' : prop === 'url' ? '链接' : prop === 'src' ? '图片URL' : prop === 'alt' ? 'Alt文本' : prop === 'link' ? '图片链接' : prop}</Label>
        {onInsertVariable && (
          <button
            onClick={() => setShowVariableInsert(true, { componentId: component.id, property: prop })}
            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
          >
            <Variable size={10} /> 插入变量
          </button>
        )}
      </div>
      {prop === 'text' && component.type !== 'button' ? (
        <textarea
          value={component.properties[prop] || ''}
          onChange={(e) => updateComponentProps(component.id, { [prop]: e.target.value })}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 resize-y focus:border-blue-500 focus:outline-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={component.properties[prop] || ''}
          onChange={(e) => updateComponentProps(component.id, { [prop]: e.target.value })}
          placeholder={placeholder}
          className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}

function SelectProp({ component, prop, options }: { component: EmailComponent; prop: string; options: { value: string; label: string }[] }) {
  const { updateComponentProps } = useEmailStore();
  return (
    <div>
      <Label>{prop === 'fontFamily' ? '字体' : prop === 'align' ? '对齐' : prop === 'style' ? '线型' : prop}</Label>
      <select
        value={component.properties[prop] || ''}
        onChange={(e) => updateComponentProps(component.id, { [prop]: e.target.value })}
        className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function NumberProp({ component, prop, min, max, step, suffix }: { component: EmailComponent; prop: string; min?: number; max?: number; step?: number; suffix?: string }) {
  const { updateComponentProps } = useEmailStore();
  return (
    <div>
      <Label>{prop === 'fontSize' ? '字号' : prop === 'lineHeight' ? '行高' : prop === 'borderRadius' ? '圆角' : prop === 'height' ? '高度' : prop === 'thickness' ? '线宽' : prop === 'iconSize' ? '图标大小' : prop === 'gap' ? '间距' : prop}</Label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={component.properties[prop] ?? ''}
          onChange={(e) => updateComponentProps(component.id, { [prop]: parseFloat(e.target.value) || 0 })}
          min={min}
          max={max}
          step={step}
          className="flex-1 bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
        {suffix && <span className="text-[10px] text-gray-500">{suffix}</span>}
      </div>
    </div>
  );
}

function ColorProp({ component, prop }: { component: EmailComponent; prop: string }) {
  const { updateComponentProps } = useEmailStore();
  return (
    <div>
      <Label>{prop === 'color' ? '文字颜色' : prop === 'backgroundColor' ? '背景颜色' : prop}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={component.properties[prop] || '#000000'}
          onChange={(e) => updateComponentProps(component.id, { [prop]: e.target.value })}
          className="w-7 h-7 rounded border border-[#2a2d35] cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={component.properties[prop] || ''}
          onChange={(e) => updateComponentProps(component.id, { [prop]: e.target.value })}
          className="flex-1 bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function PaddingMarginProp({ component }: { component: EmailComponent }) {
  const { updateComponentProps } = useEmailStore();
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label>内边距</Label>
        <input
          type="text"
          value={component.properties.padding || ''}
          onChange={(e) => updateComponentProps(component.id, { padding: e.target.value })}
          placeholder="10px 20px"
          className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
      <div>
        <Label>外边距</Label>
        <input
          type="text"
          value={component.properties.margin || ''}
          onChange={(e) => updateComponentProps(component.id, { margin: e.target.value })}
          placeholder="0"
          className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function FontWeightProp({ component }: { component: EmailComponent }) {
  const { updateComponentProps } = useEmailStore();
  return (
    <div>
      <Label>字重</Label>
      <select
        value={component.properties.fontWeight || 'normal'}
        onChange={(e) => updateComponentProps(component.id, { fontWeight: e.target.value })}
        className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
      >
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
        <option value="100">100</option>
        <option value="200">200</option>
        <option value="300">300</option>
        <option value="400">400</option>
        <option value="500">500</option>
        <option value="600">600</option>
        <option value="700">700</option>
        <option value="800">800</option>
        <option value="900">900</option>
      </select>
    </div>
  );
}

function HeadingProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="内容">
        <TextProp component={component} prop="text" onInsertVariable />
      </PropGroup>
      <PropGroup title="排版">
        <div className="grid grid-cols-2 gap-2">
          <SelectProp component={component} prop="fontFamily" options={FONT_OPTIONS} />
          <SelectProp component={component} prop="align" options={ALIGN_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberProp component={component} prop="fontSize" min={12} max={72} step={1} suffix="px" />
          <NumberProp component={component} prop="lineHeight" min={1} max={3} step={0.1} />
        </div>
        <FontWeightProp component={component} />
      </PropGroup>
      <PropGroup title="颜色">
        <ColorProp component={component} prop="color" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function ParagraphProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="内容">
        <TextProp component={component} prop="text" onInsertVariable />
      </PropGroup>
      <PropGroup title="排版">
        <div className="grid grid-cols-2 gap-2">
          <SelectProp component={component} prop="fontFamily" options={FONT_OPTIONS} />
          <SelectProp component={component} prop="align" options={ALIGN_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberProp component={component} prop="fontSize" min={10} max={36} step={1} suffix="px" />
          <NumberProp component={component} prop="lineHeight" min={1} max={3} step={0.1} />
        </div>
        <FontWeightProp component={component} />
      </PropGroup>
      <PropGroup title="颜色">
        <ColorProp component={component} prop="color" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function ButtonProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="内容">
        <TextProp component={component} prop="text" onInsertVariable />
        <TextProp component={component} prop="url" placeholder="https://..." />
      </PropGroup>
      <PropGroup title="排版">
        <div className="grid grid-cols-2 gap-2">
          <SelectProp component={component} prop="fontFamily" options={FONT_OPTIONS} />
          <SelectProp component={component} prop="align" options={ALIGN_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberProp component={component} prop="fontSize" min={10} max={36} step={1} suffix="px" />
          <NumberProp component={component} prop="borderRadius" min={0} max={30} step={1} suffix="px" />
        </div>
        <FontWeightProp component={component} />
      </PropGroup>
      <PropGroup title="颜色">
        <ColorProp component={component} prop="color" />
        <ColorProp component={component} prop="backgroundColor" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function ImageProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="图片">
        <TextProp component={component} prop="src" placeholder="图片URL" />
        <TextProp component={component} prop="alt" placeholder="Alt文本" />
        <TextProp component={component} prop="link" placeholder="点击链接(可选)" />
      </PropGroup>
      <PropGroup title="尺寸">
        <SelectProp component={component} prop="align" options={ALIGN_OPTIONS} />
        <NumberProp component={component} prop="borderRadius" min={0} max={30} step={1} suffix="px" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function DividerProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="线段">
        <ColorProp component={component} prop="color" />
        <NumberProp component={component} prop="thickness" min={1} max={10} step={1} suffix="px" />
        <SelectProp component={component} prop="style" options={[
          { value: 'solid', label: '实线' },
          { value: 'dashed', label: '虚线' },
          { value: 'dotted', label: '点线' },
        ]} />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function SpacerProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="尺寸">
        <NumberProp component={component} prop="height" min={5} max={100} step={5} suffix="px" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function LayoutProps({ component }: { component: EmailComponent }) {
  const { updateComponentProps } = useEmailStore();
  return (
    <>
      <PropGroup title="布局">
        <div>
          <Label>列宽比例</Label>
          <input
            type="text"
            value={component.properties.columnRatio || ''}
            onChange={(e) => updateComponentProps(component.id, { columnRatio: e.target.value })}
            placeholder="50,50"
            className="w-full bg-[#0d0f12] border border-[#2a2d35] rounded-md px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
        <NumberProp component={component} prop="gap" min={0} max={40} step={2} suffix="px" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function SocialProps({ component }: { component: EmailComponent }) {
  const { updateComponentProps } = useEmailStore();
  const platforms = component.properties.platforms || [];

  const addPlatform = () => {
    const available = SOCIAL_PLATFORMS.filter(sp => !platforms.some((p: any) => p.key === sp.key));
    if (available.length > 0) {
      const next = available[0];
      updateComponentProps(component.id, {
        platforms: [...platforms, { key: next.key, label: next.label, icon: next.icon, url: '' }],
      });
    }
  };

  const removePlatform = (idx: number) => {
    updateComponentProps(component.id, {
      platforms: platforms.filter((_: any, i: number) => i !== idx),
    });
  };

  const updatePlatform = (idx: number, field: string, value: string) => {
    const newPlatforms = platforms.map((p: any, i: number) =>
      i === idx ? { ...p, [field]: value } : p
    );
    updateComponentProps(component.id, { platforms: newPlatforms });
  };

  return (
    <>
      <PropGroup title="社交平台">
        {platforms.map((pl: any, idx: number) => (
          <div key={idx} className="bg-[#0d0f12] rounded-md p-2 space-y-1.5 border border-[#2a2d35]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">{pl.icon} {pl.label}</span>
              <button onClick={() => removePlatform(idx)} className="text-gray-500 hover:text-red-400">
                <X size={12} />
              </button>
            </div>
            <input
              type="text"
              value={pl.url || ''}
              onChange={(e) => updatePlatform(idx, 'url', e.target.value)}
              placeholder="链接URL"
              className="w-full bg-[#1a1d23] border border-[#2a2d35] rounded px-2 py-1 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}
        <button
          onClick={addPlatform}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-dashed border-[#2a2d35] rounded-md hover:border-blue-500/50 transition-colors"
        >
          <Plus size={12} /> 添加平台
        </button>
      </PropGroup>
      <PropGroup title="样式">
        <NumberProp component={component} prop="iconSize" min={16} max={64} step={2} suffix="px" />
        <SelectProp component={component} prop="align" options={ALIGN_OPTIONS} />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}

function FooterProps({ component }: { component: EmailComponent }) {
  return (
    <>
      <PropGroup title="内容">
        <TextProp component={component} prop="text" onInsertVariable />
      </PropGroup>
      <PropGroup title="排版">
        <div className="grid grid-cols-2 gap-2">
          <SelectProp component={component} prop="fontFamily" options={FONT_OPTIONS} />
          <SelectProp component={component} prop="align" options={ALIGN_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberProp component={component} prop="fontSize" min={10} max={20} step={1} suffix="px" />
          <NumberProp component={component} prop="lineHeight" min={1} max={3} step={0.1} />
        </div>
        <FontWeightProp component={component} />
      </PropGroup>
      <PropGroup title="颜色">
        <ColorProp component={component} prop="color" />
      </PropGroup>
      <PropGroup title="间距">
        <PaddingMarginProp component={component} />
      </PropGroup>
    </>
  );
}
