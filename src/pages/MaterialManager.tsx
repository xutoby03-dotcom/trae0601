import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  PlusCircle,
  Minus,
  Trash2,
  Package,
  AlertTriangle,
  ShoppingCart,
  Ruler,
  CircleDot,
  Link,
  Square,
} from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import { MaterialType, MATERIAL_TYPE_LABELS, Material } from '@/types';
import { formatDate } from '@/utils/dateUtils';

const typeIcons: Record<MaterialType, React.ElementType> = {
  thread: Ruler,
  button: CircleDot,
  zipper: Link,
  fabric: Square,
};

const typeColors: Record<MaterialType, string> = {
  thread: 'from-blue-400 to-blue-600',
  button: 'from-primary-400 to-primary-600',
  zipper: 'from-purple-400 to-purple-600',
  fabric: 'from-success-400 to-success-600',
};

const MaterialManager = () => {
  const navigate = useNavigate();
  const { materials, addMaterial, updateMaterialQuantity, deleteMaterial } = useAppStore();

  const [activeType, setActiveType] = useState<MaterialType | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    type: 'thread' as MaterialType,
    name: '',
    color: '',
    quantity: 5,
    threshold: 3,
    unit: '',
  });

  const filteredMaterials = useMemo(() => {
    let filtered = [...materials];
    if (activeType !== 'all') {
      filtered = filtered.filter((m) => m.type === activeType);
    }
    return filtered.sort((a, b) => {
      if (a.quantity < a.threshold && b.quantity >= b.threshold) return -1;
      if (a.quantity >= a.threshold && b.quantity < b.threshold) return 1;
      return a.type.localeCompare(b.type);
    });
  }, [materials, activeType]);

  const lowStockCount = useMemo(() => {
    return materials.filter((m) => m.quantity < m.threshold).length;
  }, [materials]);

  const types: { value: MaterialType | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'thread', label: '线' },
    { value: 'button', label: '纽扣' },
    { value: 'zipper', label: '拉链' },
    { value: 'fabric', label: '备用布' },
  ];

  const handleAddMaterial = () => {
    if (!newMaterial.name.trim()) {
      alert('请输入材料名称');
      return;
    }
    addMaterial(newMaterial);
    setNewMaterial({
      type: 'thread',
      name: '',
      color: '',
      quantity: 5,
      threshold: 3,
      unit: '',
    });
    setShowAddForm(false);
  };

  const getUnit = (type: MaterialType) => {
    const units: Record<MaterialType, string> = {
      thread: '卷',
      button: '颗',
      zipper: '条',
      fabric: '块',
    };
    return units[type];
  };

  const getStockPercentage = (material: Material) => {
    const max = material.threshold * 2;
    return Math.min(100, (material.quantity / max) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 stagger-item">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center hover:bg-brown-200 transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-brown-700" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-brown-900">
              📦 材料管理
            </h1>
            <p className="text-brown-500 text-sm">
              共 {materials.length} 种材料
              {lowStockCount > 0 && (
                <span className="text-warning-500 ml-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  {lowStockCount} 种库存不足
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden sm:inline">添加材料</span>
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="card-no-hover p-4 bg-warning-50 border-2 border-warning-200 stagger-item animate-delay-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-brown-800">需要采购</h3>
              <p className="text-sm text-brown-500">
                以下材料库存不足，请及时采购：
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {materials
                  .filter((m) => m.quantity < m.threshold)
                  .slice(0, 5)
                  .map((m) => (
                    <span
                      key={m.id}
                      className="px-3 py-1 bg-white rounded-full text-sm text-warning-600 animate-pulse-soft"
                    >
                      {MATERIAL_TYPE_LABELS[m.type]} - {m.name} (剩 {m.quantity})
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto gap-2 pb-2 stagger-item animate-delay-100">
        {types.map((tab) => {
          const count =
            tab.value === 'all'
              ? materials.length
              : materials.filter((m) => m.type === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeType === tab.value
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-brown-600 hover:bg-brown-50'
              }`}
            >
              {tab.value !== 'all' && (
                <div
                  className={`w-6 h-6 rounded-lg bg-gradient-to-br ${
                    typeColors[tab.value]
                  } flex items-center justify-center`}
                >
                  {(() => {
                    const Icon = typeIcons[tab.value];
                    return <Icon className="w-3.5 h-3.5 text-white" />;
                  })()}
                </div>
              )}
              <span className="font-medium">{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeType === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-brown-100 text-brown-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material, index) => {
          const Icon = typeIcons[material.type];
          const isLowStock = material.quantity < material.threshold;
          const percentage = getStockPercentage(material);

          return (
            <div
              key={material.id}
              className={`card-no-hover p-5 stagger-item ${
                isLowStock ? 'border-2 border-warning-300' : ''
              }`}
              style={{ animationDelay: `${index * 50 + 200}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[material.type]} flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-800">{material.name}</h3>
                    <p className="text-sm text-brown-500">
                      {MATERIAL_TYPE_LABELS[material.type]} · {material.color}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMaterial(material.id)}
                  className="w-8 h-8 rounded-lg text-brown-400 hover:bg-warning-50 hover:text-warning-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-brown-500">库存</span>
                  <span
                    className={`text-sm font-semibold ${
                      isLowStock ? 'text-warning-600 animate-pulse-soft' : 'text-brown-700'
                    }`}
                  >
                    {material.quantity} {material.unit || getUnit(material.type)}
                    {isLowStock && ' ⚠️'}
                  </span>
                </div>
                <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLowStock
                        ? 'bg-gradient-to-r from-warning-400 to-warning-600'
                        : 'bg-gradient-to-r from-success-400 to-success-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-brown-400 mt-1">
                  低于 {material.threshold} {material.unit || getUnit(material.type)} 提醒
                </p>
              </div>

              {material.lastPurchased && (
                <p className="text-xs text-brown-400 mb-4">
                  上次采购：{formatDate(material.lastPurchased)}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => updateMaterialQuantity(material.id, -1)}
                  className="flex-1 py-2 px-3 rounded-xl bg-brown-100 text-brown-600 hover:bg-brown-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Minus className="w-4 h-4" />
                  使用
                </button>
                <button
                  onClick={() => updateMaterialQuantity(material.id, 1)}
                  className="flex-1 py-2 px-3 rounded-xl bg-success-100 text-success-600 hover:bg-success-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  +1
                </button>
                <button
                  onClick={() => updateMaterialQuantity(material.id, 5)}
                  className="flex-1 py-2 px-3 rounded-xl bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  +5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-no-hover p-6 w-full max-w-md animate-bounce-in">
            <h3 className="font-display text-xl font-bold text-brown-900 mb-6">
              添加新材料
            </h3>

            <div className="space-y-4">
              <div>
                <label className="form-label">材料类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['thread', 'button', 'zipper', 'fabric'] as MaterialType[]).map((type) => {
                    const Icon = typeIcons[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setNewMaterial({ ...newMaterial, type, unit: getUnit(type) })
                        }
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          newMaterial.type === type
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-brown-200 hover:border-brown-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeColors[type]} flex items-center justify-center`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-brown-600">
                          {MATERIAL_TYPE_LABELS[type]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">名称</label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, name: e.target.value })
                  }
                  placeholder="如：白线、黑色纽扣"
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">颜色</label>
                <input
                  type="text"
                  value={newMaterial.color}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, color: e.target.value })
                  }
                  placeholder="如：白色、黑色、深蓝色"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">初始数量</label>
                  <input
                    type="number"
                    value={newMaterial.quantity}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="form-label">提醒阈值</label>
                  <input
                    type="number"
                    value={newMaterial.threshold}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        threshold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button onClick={handleAddMaterial} className="btn-primary flex-1">
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManager;
