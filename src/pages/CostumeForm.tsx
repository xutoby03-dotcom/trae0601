import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store';
import { COSTUME_SIZES, ACCESSORY_LABELS } from '../../shared/types';

export default function CostumeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createCostume, updateCostume, costumes, loading } = useStore();
  const isEdit = !!id;

  const [form, setForm] = useState({
    type: '学士服' as CostumeType,
    size: 'M' as CostumeSize,
    color: '黑色',
    accessories: { hat: true, tassel: true, bowtie: true, shawl: true },
    status: '在库' as CostumeStatus,
    cleaningStatus: '干净' as CleaningStatus,
    photoUrl: '',
    rfidTag: '',
    remark: ''
  });

  useEffect(() => {
    if (isEdit) {
      const costume = costumes.find(c => c.id === id);
      if (costume) {
        setForm({
          type: costume.type,
          size: costume.size,
          color: costume.color,
          accessories: costume.accessories,
          status: costume.status,
          cleaningStatus: costume.cleaningStatus,
          photoUrl: costume.photoUrl,
          rfidTag: costume.rfidTag || '',
          remark: costume.remark || ''
        });
      }
    }
  }, [isEdit, id, costumes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.photoUrl) {
      const prompt = encodeURIComponent(`black graduation gown size ${form.size} on hanger with cap and tassel`);
      form.photoUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;
    }

    if (isEdit) {
      await updateCostume(id!, form);
    } else {
      await createCostume(form);
    }
    navigate('/costumes');
  };

  const handleAccessoryChange = (key: keyof typeof form.accessories) => {
    setForm(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [key]: !prev.accessories[key]
      }
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/costumes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">
            {isEdit ? '编辑服装' : '新增服装'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? '修改服装档案信息' : '添加新的服装档案'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">基本信息</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">服装类型</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as CostumeType }))}
                  className="input"
                >
                  <option value="学士服">学士服</option>
                  <option value="硕士服">硕士服</option>
                  <option value="博士服">博士服</option>
                  <option value="领结">领结</option>
                  <option value="披肩">披肩</option>
                </select>
              </div>
              <div>
                <label className="label">尺码</label>
                <select
                  value={form.size}
                  onChange={(e) => setForm(prev => ({ ...prev, size: e.target.value as CostumeSize }))}
                  className="input"
                >
                  {COSTUME_SIZES.map(size => (
                    <option key={size} value={size}>{size} 码</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">颜色</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                  className="input"
                  placeholder="如：黑色、红色"
                />
              </div>
              <div>
                <label className="label">RFID标签</label>
                <input
                  type="text"
                  value={form.rfidTag}
                  onChange={(e) => setForm(prev => ({ ...prev, rfidTag: e.target.value }))}
                  className="input"
                  placeholder="可选"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as CostumeStatus }))}
                  className="input"
                >
                  <option value="在库">在库</option>
                  <option value="已预约">已预约</option>
                  <option value="借出中">借出中</option>
                  <option value="待清洗">待清洗</option>
                  <option value="清洗中">清洗中</option>
                  <option value="已报废">已报废</option>
                </select>
              </div>
              <div>
                <label className="label">清洗状态</label>
                <select
                  value={form.cleaningStatus}
                  onChange={(e) => setForm(prev => ({ ...prev, cleaningStatus: e.target.value as CleaningStatus }))}
                  className="input"
                >
                  <option value="干净">干净</option>
                  <option value="待清洗">待清洗</option>
                  <option value="清洗中">清洗中</option>
                  <option value="已清洗">已清洗</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">配件清单</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(ACCESSORY_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.accessories[key as keyof typeof form.accessories]
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.accessories[key as keyof typeof form.accessories]}
                    onChange={() => handleAccessoryChange(key as keyof typeof form.accessories)}
                    className="w-5 h-5 text-primary-500 rounded"
                  />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">照片</h3>
            <div>
              <label className="label">照片URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.photoUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="input flex-1"
                  placeholder="留空将自动生成"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                如不填写，将根据尺码自动生成服装照片
              </p>
            </div>
            {form.photoUrl && (
              <div className="flex justify-center">
                <img
                  src={form.photoUrl}
                  alt="预览"
                  className="w-32 h-32 object-cover rounded-xl border-2 border-dashed border-gray-300"
                />
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">备注</h3>
            <textarea
              value={form.remark}
              onChange={(e) => setForm(prev => ({ ...prev, remark: e.target.value }))}
              className="input min-h-[100px]"
              placeholder="填写备注信息..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">预览</h3>
            <div className="space-y-4">
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="预览"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                    <p>自动生成照片</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">类型</span>
                  <span className="font-medium">{form.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">尺码</span>
                  <span className="font-medium">{form.size} 码</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">颜色</span>
                  <span className="font-medium">{form.color}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? '保存中...' : (isEdit ? '保存修改' : '添加服装')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/costumes')}
              className="btn-secondary w-full"
            >
              取消
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
