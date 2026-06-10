import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Save,
  X,
  Calendar,
  MapPin,
  Package,
  Tag,
  DollarSign,
  FileText,
  Trash2,
} from 'lucide-react';
import { useFreezerStore } from '../store';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  Category,
  COMMON_UNITS,
  FreezerPosition,
} from '../types';
import { format, addMonths } from 'date-fns';

export default function AddItem() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as {
    state?: { prefill?: { position?: FreezerPosition } };
  };
  const isEdit = !!id;

  const { items, addItem, updateItem, deleteItem, layout } = useFreezerStore();
  const existingItem = items.find((it) => it.id === id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'meat' as Category,
    quantity: 1,
    unit: '袋',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    position: { drawer: 0, cell: 0 } as FreezerPosition,
    isPackaged: true,
    isOpened: false,
    photo: '' as string,
    price: '' as string | number,
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && existingItem) {
      setForm({
        name: existingItem.name,
        category: existingItem.category,
        quantity: existingItem.quantity,
        unit: existingItem.unit,
        purchaseDate: existingItem.purchaseDate,
        expiryDate: existingItem.expiryDate,
        position: existingItem.position,
        isPackaged: existingItem.isPackaged,
        isOpened: existingItem.isOpened,
        photo: existingItem.photo || '',
        price: existingItem.price || '',
        note: existingItem.note || '',
      });
    } else if (location.state?.prefill?.position) {
      setForm((f) => ({ ...f, position: location.state!.prefill!.position! }));
    }
  }, [isEdit, existingItem, location.state]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '请输入食材名称';
    if (form.quantity <= 0) e.quantity = '数量必须大于0';
    if (!form.purchaseDate) e.purchaseDate = '请选择购买日期';
    if (!form.expiryDate) e.expiryDate = '请选择保质期';
    if (form.expiryDate < form.purchaseDate) e.expiryDate = '保质期不能早于购买日期';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      purchaseDate: form.purchaseDate,
      expiryDate: form.expiryDate,
      position: form.position,
      isPackaged: form.isPackaged,
      isOpened: form.isOpened,
      photo: form.photo || undefined,
      price: form.price ? Number(form.price) : undefined,
      note: form.note.trim() || undefined,
    };

    if (isEdit && id) {
      updateItem(id, payload);
    } else {
      addItem(payload);
    }
    navigate('/');
  };

  const handleDelete = () => {
    if (!id || !existingItem) return;
    if (confirm(`确定要删除「${existingItem.name}」吗？`)) {
      deleteItem(id);
      navigate('/');
    }
  };

  const InputField = ({
    label,
    icon: Icon,
    children,
    error,
  }: {
    label: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    error?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-freezer-accent" />}
        {label}
      </label>
      {children}
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">返回</span>
        </button>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className={`px-6 py-4 ${CATEGORY_COLORS[form.category]} text-white`}>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {isEdit ? '✏️ 编辑食材' : '➕ 登记冷冻食材'}
          </h1>
          <p className="text-sm opacity-90 mt-0.5">
            {isEdit ? '修改食材信息' : '把新买到的食材放进来吧'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="md:w-1/3">
              <InputField label="食材照片" icon={Camera}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-freezer-accent transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden bg-gray-50 relative group"
                >
                  {form.photo ? (
                    <>
                      <img
                        src={form.photo}
                        alt="预览"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((f) => ({ ...f, photo: '' }));
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <div className="text-xs text-gray-500">点击上传照片</div>
                      <div className="text-[10px] text-gray-400 mt-1">方便快速识别</div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </InputField>
            </div>

            <div className="md:flex-1 space-y-4">
              <InputField label="食材名称" icon={Tag} error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="例如：鸡胸肉、牛肉饺子..."
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  } focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm transition-all`}
                />
              </InputField>

              <InputField label="分类">
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.category === cat
                          ? `${CATEGORY_COLORS[cat]} text-white shadow-md`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </InputField>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="数量" error={errors.quantity}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: Number(e.target.value) })
                      }
                      className={`flex-1 px-4 py-2.5 rounded-xl border ${
                        errors.quantity ? 'border-red-300' : 'border-gray-200'
                      } focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm transition-all`}
                    />
                  </div>
                </InputField>
                <InputField label="单位">
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setForm({ ...form, unit: u })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          form.unit === u
                            ? 'bg-freezer-accent text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </InputField>
              </div>

              <InputField label="购入价格（元）" icon={DollarSign}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="可选，用于统计"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm transition-all"
                />
              </InputField>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="购买日期" icon={Calendar} error={errors.purchaseDate}>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.purchaseDate ? 'border-red-300' : 'border-gray-200'
                } focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm transition-all`}
              />
            </InputField>
            <InputField label="保质期至" icon={Calendar} error={errors.expiryDate}>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.expiryDate ? 'border-red-300' : 'border-gray-200'
                } focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm transition-all`}
              />
            </InputField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  expiryDate: format(
                    new Date(new Date(form.purchaseDate).getTime() + 30 * 24 * 60 * 60 * 1000),
                    'yyyy-MM-dd'
                  ),
                })
              }
              className="text-xs text-freezer-accent bg-sky-50 hover:bg-sky-100 py-2 rounded-lg transition-colors md:col-span-2"
            >
              ⏰ 按购买日期+30天快速设置保质期（一般冷冻肉推荐）
            </button>
          </div>

          <InputField label="存放位置" icon={MapPin}>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1.5">选择抽屉层</div>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: layout.drawers }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setForm({ ...form, position: { ...form.position, drawer: i } })}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          form.position.drawer === i
                            ? 'bg-freezer-accent text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {layout.drawerNames[i]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1.5">选择格子</div>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${layout.cellsPerDrawer}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: layout.cellsPerDrawer }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...form, position: { ...form.position, cell: i } })}
                      className={`aspect-square rounded-xl text-sm font-bold transition-all ${
                        form.position.cell === i
                          ? 'bg-freezer-accent text-white shadow-md'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-freezer-accent has-[:checked]:bg-sky-50">
              <input
                type="checkbox"
                checked={form.isPackaged}
                onChange={(e) => setForm({ ...form, isPackaged: e.target.checked })}
                className="w-5 h-5 rounded text-freezer-accent focus:ring-freezer-accent"
              />
              <div>
                <Package className="w-4 h-4 text-freezer-accent mb-1" />
                <div className="text-sm font-medium text-gray-700">已分装</div>
                <div className="text-[10px] text-gray-500">分装好方便取用</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50">
              <input
                type="checkbox"
                checked={form.isOpened}
                onChange={(e) => setForm({ ...form, isOpened: e.target.checked })}
                className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
              />
              <div>
                <div className="mb-1">📂</div>
                <div className="text-sm font-medium text-gray-700">已开封</div>
                <div className="text-[10px] text-gray-500">开封后尽快食用</div>
              </div>
            </label>
          </div>

          <InputField label="备注" icon={FileText}>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              placeholder="可以记一下用法、切好了没、分了几份..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm transition-all resize-none"
            />
          </InputField>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-[2] px-6 py-3 rounded-xl bg-freezer-accent text-white font-bold shadow-md shadow-sky-200 hover:shadow-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isEdit ? '保存修改' : '放入冷冻库'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
