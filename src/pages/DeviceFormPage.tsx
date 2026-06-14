import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import type { DisplayStatus, DisplayInterface, Accessory } from '../types';
import { DISPLAY_STATUS_LABEL } from '../types';

const displayImages = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sleek%20modern%20computer%20monitor%20product%20photo%20on%20white%20background%20soft%20lighting&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20office%20display%20screen%20front%20view%20minimal%20clean%20photo&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ultrawide%20curved%20gaming%20monitor%20studio%20product%20shot&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=designer%204k%20ips%20monitor%20with%20usb%20c%20high%20end%20photography&image_size=square_hd',
];

export default function DeviceFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const isEdit = !!id;
  const existing = useStore((s) => s.displays.find((d) => d.id === id));
  const addDisplay = useStore((s) => s.addDisplay);
  const updateDisplay = useStore((s) => s.updateDisplay);

  const [code, setCode] = useState('');
  const [size, setSize] = useState('27');
  const [interfaces, setInterfaces] = useState<DisplayInterface[]>(['HDMI']);
  const [location, setLocation] = useState('');
  const [accessories, setAccessories] = useState<Accessory[]>([{ name: '电源线', quantity: 1 }]);
  const [status, setStatus] = useState<DisplayStatus>('available');
  const [photoUrl, setPhotoUrl] = useState(displayImages[0]);
  const [missingAccessories, setMissingAccessories] = useState<string[]>([]);
  const [damageCount, setDamageCount] = useState('0');
  const [notes, setNotes] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccQty, setNewAccQty] = useState('1');

  useEffect(() => {
    if (isEdit && existing) {
      setCode(existing.code);
      setSize(String(existing.size));
      setInterfaces(existing.interfaces);
      setLocation(existing.location);
      setAccessories(existing.accessories);
      setStatus(existing.status);
      setPhotoUrl(existing.photoUrl);
      setMissingAccessories(existing.missingAccessories);
      setDamageCount(String(existing.damageCount));
      setNotes(existing.notes || '');
    } else if (!isEdit) {
      const n = (useStore.getState().displays.length + 1).toString().padStart(3, '0');
      setCode(`MON-${n}`);
    }
  }, [isEdit, existing]);

  const toggleInterface = (i: DisplayInterface) => {
    setInterfaces((arr) => (arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]));
  };

  const addAccessory = () => {
    const name = newAccName.trim();
    const qty = parseInt(newAccQty) || 1;
    if (!name) return;
    setAccessories((a) => [...a, { name, quantity: qty }]);
    setNewAccName('');
    setNewAccQty('1');
  };

  const removeAccessory = (idx: number) => {
    setAccessories((a) => a.filter((_, i) => i !== idx));
  };

  const toggleMissing = (name: string) => {
    setMissingAccessories((arr) => (arr.includes(name) ? arr.filter((x) => x !== name) : [...arr, name]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !location) {
      toast.show('请填写设备编号和放置点', 'error');
      return;
    }
    if (interfaces.length === 0) {
      toast.show('请至少选择一种接口类型', 'warning');
      return;
    }
    const data = {
      code,
      size: parseInt(size) || 27,
      interfaces,
      location,
      accessories,
      status,
      photoUrl,
      missingAccessories,
      damageCount: parseInt(damageCount) || 0,
      notes: notes || undefined,
    };
    if (isEdit) {
      updateDisplay(id!, data);
      toast.show('设备档案已更新', 'success');
    } else {
      addDisplay(data);
      toast.show('设备档案已创建', 'success');
    }
    navigate('/devices');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="btn-ghost !p-2" onClick={() => navigate('/devices')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">
            {isEdit ? '编辑设备档案' : '新增设备档案'}
          </h2>
          <p className="text-sm text-zinc-500">
            {isEdit ? '更新显示器详细信息' : '录入新的显示器设备信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-3">基本信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">设备编号 <span className="text-rose-500">*</span></label>
                <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="例：MON-009" />
              </div>
              <div>
                <label className="label">屏幕尺寸（英寸）<span className="text-rose-500">*</span></label>
                <input type="number" className="input" value={size} onChange={(e) => setSize(e.target.value)} min="15" max="65" />
              </div>
            </div>
            <div>
              <label className="label">放置点 <span className="text-rose-500">*</span></label>
              <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例：3楼设备柜 A-04" />
            </div>
            <div>
              <label className="label mb-2.5">接口类型 <span className="text-rose-500">*</span>（至少选一种）</label>
              <div className="flex flex-wrap gap-2">
                {(['HDMI', 'DP', 'VGA', 'Type-C', 'DVI'] as DisplayInterface[]).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterface(i)}
                    className={`chip px-3 py-1.5 border transition-all ${
                      interfaces.includes(i)
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand-300 hover:text-brand-700'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">状态</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value as DisplayStatus)}>
                {(Object.keys(DISPLAY_STATUS_LABEL) as DisplayStatus[]).map((k) => (
                  <option key={k} value={k}>{DISPLAY_STATUS_LABEL[k]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-3">配件清单</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px]">
                <label className="label">配件名称</label>
                <input className="input" value={newAccName} onChange={(e) => setNewAccName(e.target.value)} placeholder="例：Type-C转接头" />
              </div>
              <div className="w-28">
                <label className="label">数量</label>
                <input type="number" className="input" value={newAccQty} onChange={(e) => setNewAccQty(e.target.value)} min="1" max="10" />
              </div>
              <button type="button" className="btn-secondary" onClick={addAccessory}>
                <Plus size={16} /> 添加
              </button>
            </div>
            {accessories.length > 0 && (
              <ul className="space-y-2">
                {accessories.map((a, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                        checked={missingAccessories.includes(a.name)}
                        onChange={() => toggleMissing(a.name)}
                      />
                      <span className="text-sm font-medium text-zinc-800">{a.name}</span>
                      <span className="chip bg-white border border-zinc-200 text-zinc-600">× {a.quantity}</span>
                      {missingAccessories.includes(a.name) && (
                        <span className="chip bg-rose-100 text-rose-700 border border-rose-200">缺失</span>
                      )}
                    </div>
                    <button type="button" className="btn-ghost !p-1.5 text-rose-500 hover:!text-rose-600 hover:!bg-rose-50" onClick={() => removeAccessory(idx)}>
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-zinc-500">💡 勾选复选框可标记配件为缺失状态，配件缺失时设备不可借出。</p>
          </div>

          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-3">其他信息</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">历史损坏次数</label>
                <input type="number" className="input" value={damageCount} onChange={(e) => setDamageCount(e.target.value)} min="0" />
              </div>
            </div>
            <div>
              <label className="label">备注说明</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="外观情况、已知问题等备注信息..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 sticky top-20">
            <h3 className="font-bold text-zinc-900 mb-4">设备照片</h3>
            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 mb-4">
              <img src={photoUrl} alt="预览" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2.5">选择预设照片</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {displayImages.map((u, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoUrl(u)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      photoUrl === u ? 'border-brand-500 ring-2 ring-brand-200' : 'border-zinc-200 hover:border-brand-300'
                    }`}
                  >
                    <img src={u} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <label className="label">或填入图片 URL</label>
              <input className="input" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            </div>
            <div className="mt-5 pt-5 border-t border-zinc-100 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => navigate('/devices')}>取消</button>
              <button type="submit" className="btn-primary flex-1">
                <Save size={16} />
                {isEdit ? '保存修改' : '创建设备'}
              </button>
            </div>
            <p className="text-xs text-zinc-400 text-center mt-3">
              <Upload size={12} className="inline mr-1" />
              图片支持 URL 链接方式引入
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
