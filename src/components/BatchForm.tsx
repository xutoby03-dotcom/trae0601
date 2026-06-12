import { useState, useMemo } from 'react';
import { X, ChefHat, Layers, Thermometer, Timer, Hash } from 'lucide-react';
import type { NewBatchInput } from '@/types';
import { useBatchStore } from '@/store/batchStore';
import CameraCapture from './CameraCapture';

interface BatchFormProps {
  onClose: () => void;
}

export default function BatchForm({ onClose }: BatchFormProps) {
  const { ovens, isLayerOccupied, addBatch } = useBatchStore();

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(12);
  const [ovenId, setOvenId] = useState(ovens[0]?.id || '');
  const [layer, setLayer] = useState(1);
  const [durationMin, setDurationMin] = useState(15);
  const [temperature, setTemperature] = useState(180);
  const [entryPhoto, setEntryPhoto] = useState<string | undefined>();

  const selectedOven = ovens.find((o) => o.id === ovenId);

  const availableLayers = useMemo(() => {
    if (!selectedOven) return [];
    const layers = [];
    for (let i = 1; i <= selectedOven.layers; i++) {
      layers.push({
        layer: i,
        occupied: isLayerOccupied(selectedOven.id, i),
      });
    }
    return layers;
  }, [selectedOven, isLayerOccupied]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !ovenId || !layer) return;
    if (isLayerOccupied(ovenId, layer)) {
      alert('该层位已被占用');
      return;
    }
    const input: NewBatchInput = {
      productName: productName.trim(),
      quantity,
      ovenId,
      layer,
      targetDuration: durationMin * 60,
      temperature,
      entryPhoto,
    };
    addBatch(input);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-copper-100 px-8 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-display text-2xl font-bold text-espresso-800">入炉登记</h2>
            <p className="text-sm text-espresso-500">填写批次信息并拍摄入炉照片</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-copper-100 text-espresso-500 hover:text-espresso-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
              <ChefHat className="w-4 h-4 text-copper-500" />
              产品名称
            </label>
            <input
              className="input-field"
              placeholder="例：葡式蛋挞、黄油可颂"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                <Hash className="w-4 h-4 text-copper-500" />
                数量
              </label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                <Thermometer className="w-4 h-4 text-copper-500" />
                温度 (°C)
              </label>
              <input
                type="number"
                min={100}
                max={300}
                className="input-field"
                value={temperature}
                onChange={(e) => setTemperature(+e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                <Timer className="w-4 h-4 text-copper-500" />
                目标时长 (分钟)
              </label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={durationMin}
                onChange={(e) => setDurationMin(+e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-espresso-700 mb-2">
                <Layers className="w-4 h-4 text-copper-500" />
                烤箱选择
              </label>
              <select
                className="input-field"
                value={ovenId}
                onChange={(e) => {
                  setOvenId(e.target.value);
                  setLayer(1);
                }}
              >
                {ovens.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-espresso-700 mb-2">
              选择层位
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableLayers.map(({ layer: l, occupied }) => {
                const active = layer === l;
                return (
                  <button
                    key={l}
                    type="button"
                    disabled={occupied}
                    onClick={() => !occupied && setLayer(l)}
                    className={`py-3 rounded-xl font-medium border-2 transition-all ${
                      occupied
                        ? 'bg-espresso-100 border-espresso-200 text-espresso-300 cursor-not-allowed'
                        : active
                        ? 'bg-copper-500 border-copper-600 text-white shadow-md scale-[1.02]'
                        : 'bg-white border-copper-200 text-espresso-700 hover:border-copper-400 hover:bg-copper-50'
                    }`}
                  >
                    第 {l} 层
                    {occupied && <div className="text-xs mt-0.5">已占用</div>}
                  </button>
                );
              })}
            </div>
          </div>

          <CameraCapture
            label="入炉照片"
            value={entryPhoto}
            onChange={setEntryPhoto}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary">
              🚀 开始烘烤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
