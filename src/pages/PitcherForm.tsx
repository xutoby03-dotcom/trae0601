import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { getToday } from '../utils/date';

export default function PitcherForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pitchers = useStore((state) => state.pitchers);
  const addPitcher = useStore((state) => state.addPitcher);
  const updatePitcher = useStore((state) => state.updatePitcher);
  const updateStock = useStore((state) => state.updateStock);
  const replaceFilter = useStore((state) => state.replaceFilter);
  const getStock = useStore((state) => state.getStock);

  const isEdit = !!id;
  const existingPitcher = pitchers.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    capacity: 3.5,
    filterModel: '',
    userCount: 1,
    location: '',
    photo: '',
  });

  const [initialStock, setInitialStock] = useState(0);
  const [showFirstFilter, setShowFirstFilter] = useState(false);
  const [firstFilterData, setFirstFilterData] = useState({
    installDate: getToday(),
    batchNo: '',
    expectedLifeDays: 60,
    flushCount: 3,
  });

  useEffect(() => {
    if (isEdit && existingPitcher) {
      setFormData({
        name: existingPitcher.name,
        brand: existingPitcher.brand,
        capacity: existingPitcher.capacity,
        filterModel: existingPitcher.filterModel,
        userCount: existingPitcher.userCount,
        location: existingPitcher.location,
        photo: existingPitcher.photo,
      });
      setInitialStock(getStock(existingPitcher.filterModel));
    }
  }, [isEdit, existingPitcher, getStock]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('请输入水壶名称');
      return;
    }
    if (!formData.brand.trim()) {
      alert('请输入品牌');
      return;
    }
    if (!formData.filterModel.trim()) {
      alert('请输入滤芯型号');
      return;
    }

    const photoUrl = formData.photo || getDefaultPhoto();

    if (isEdit && existingPitcher) {
      updatePitcher(existingPitcher.id, {
        ...formData,
        photo: photoUrl,
      });
      if (initialStock !== getStock(existingPitcher.filterModel)) {
        updateStock(formData.filterModel, initialStock);
      }
      navigate(`/pitchers/${existingPitcher.id}`);
    } else {
      const newPitcherId = addPitcher({
        ...formData,
        photo: photoUrl,
      });

      if (initialStock > 0) {
        updateStock(formData.filterModel, initialStock);
      }
      if (showFirstFilter && initialStock > 0) {
        replaceFilter(newPitcherId, firstFilterData);
      }

      navigate(`/pitchers/${newPitcherId}`);
    }
  };

  const getDefaultPhoto = () => {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20water%20filter%20pitcher%20on%20white%20background%2C%20product%20photography%2C%20clean%20minimal&image_size=square';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? '编辑水壶' : '新增水壶'}
          </h1>
        </div>

        {/* 照片上传区 */}
        <Card className="mb-6 p-0 overflow-hidden">
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              水壶照片
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="水壶照片预览"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  placeholder="输入照片URL"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">
                  支持输入图片URL，留空将使用默认图片
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 基本信息 */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                水壶名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如：厨房水壶、客厅水壶"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  品牌 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="例如：碧然德、九阳"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  容量 (L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange('capacity', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                滤芯型号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.filterModel}
                onChange={(e) => handleInputChange('filterModel', e.target.value)}
                placeholder="例如：Marella XL、JYW-B05"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  使用人数
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.userCount}
                  onChange={(e) =>
                    handleInputChange('userCount', parseInt(e.target.value) || 1)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  放置位置
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="例如：厨房、客厅"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 库存设置 */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">滤芯库存</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              当前库存数量
            </label>
            <input
              type="number"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-2">
              设置该型号滤芯的当前库存数量
            </p>
          </div>
        </Card>

        {/* 首次安装（仅新增时显示） */}
        {!isEdit && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">首次安装滤芯</h2>
              <button
                onClick={() => setShowFirstFilter(!showFirstFilter)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  showFirstFilter ? 'bg-sky-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showFirstFilter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {showFirstFilter && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    安装日期
                  </label>
                  <input
                    type="date"
                    value={firstFilterData.installDate}
                    onChange={(e) =>
                      setFirstFilterData({
                        ...firstFilterData,
                        installDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    滤芯批次
                  </label>
                  <input
                    type="text"
                    value={firstFilterData.batchNo}
                    onChange={(e) =>
                      setFirstFilterData({
                        ...firstFilterData,
                        batchNo: e.target.value,
                      })
                    }
                    placeholder="请输入批次号"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      预计寿命（天）
                    </label>
                    <input
                      type="number"
                      value={firstFilterData.expectedLifeDays}
                      onChange={(e) =>
                        setFirstFilterData({
                          ...firstFilterData,
                          expectedLifeDays: parseInt(e.target.value) || 60,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      冲洗次数
                    </label>
                    <input
                      type="number"
                      value={firstFilterData.flushCount}
                      onChange={(e) =>
                        setFirstFilterData({
                          ...firstFilterData,
                          flushCount: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                {initialStock <= 0 && (
                  <p className="text-sm text-red-500">
                    注意：库存为 0，无法记录首次安装
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* 底部操作栏 */}
        <div className="sticky bottom-6 z-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              fullWidth
            >
              取消
            </Button>
            <Button
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSubmit}
              fullWidth
            >
              {isEdit ? '保存修改' : '创建水壶'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
