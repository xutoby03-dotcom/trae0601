import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft, Package } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';

interface AddedMaterial {
  materialId: string;
  quantityUsed: number;
}

export default function AddUsage() {
  const navigate = useNavigate();
  const { materials, addUsageRecord } = useJournalStore();

  const [journalName, setJournalName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMaterials, setAddedMaterials] = useState<AddedMaterial[]>([]);

  const selectedMaterial = selectedMaterialId
    ? materials.find((m) => m.id === selectedMaterialId)
    : null;
  const selectedStock = selectedMaterial?.quantity ?? 0;
  const isOverQuantity = selectedMaterialId && quantity > selectedStock;

  const hasOverQuantity = addedMaterials.some((am) => {
    const stock = materials.find((m) => m.id === am.materialId)?.quantity ?? 0;
    return am.quantityUsed > stock;
  });

  const handleAddMaterial = () => {
    if (!selectedMaterialId || quantity < 1) return;
    if (isOverQuantity) return;
    if (addedMaterials.some((m) => m.materialId === selectedMaterialId)) return;

    setAddedMaterials((prev) => [...prev, { materialId: selectedMaterialId, quantityUsed: quantity }]);
    setSelectedMaterialId('');
    setQuantity(1);
  };

  const handleRemoveMaterial = (materialId: string) => {
    setAddedMaterials((prev) => prev.filter((m) => m.materialId !== materialId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalName.trim() || !date || addedMaterials.length === 0) return;

    addUsageRecord(
      { journalName: journalName.trim(), date, note: note.trim() },
      addedMaterials
    );
    navigate('/usage');
  };

  const getMaterialName = (materialId: string) =>
    materials.find((m) => m.id === materialId)?.name ?? '未知素材';

  const getMaterialType = (materialId: string) =>
    materials.find((m) => m.id === materialId)?.type ?? 'sticker';

  const badgeClass: Record<string, string> = {
    sticker: 'badge-sticker',
    tape: 'badge-tape',
    memo: 'badge-memo',
    stamp: 'badge-stamp',
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/usage')} className="p-1.5 rounded-lg text-brown-muted hover:text-brown-dark hover:bg-cream-dark/40 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="page-title mb-0">新建使用记录</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card-paper rounded-xl p-5 space-y-4">
          <div>
            <label className="block font-serif text-brown-dark font-semibold mb-1.5">手账本名称</label>
            <input
              type="text"
              value={journalName}
              onChange={(e) => setJournalName(e.target.value)}
              placeholder="输入手账本名称"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block font-serif text-brown-dark font-semibold mb-1.5">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="card-paper rounded-xl p-5">
          <label className="block font-serif text-brown-dark font-semibold mb-3">素材选择</label>

          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <span className="block text-xs text-brown-muted mb-1">选择素材</span>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="input-field"
              >
                <option value="">-- 请选择 --</option>
                {materials
                  .filter((m) => !addedMaterials.some((am) => am.materialId === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}（库存: {m.quantity}）
                    </option>
                  ))}
              </select>
            </div>

            <div className="w-24">
              <span className="block text-xs text-brown-muted mb-1">数量</span>
              <input
                type="number"
                min={1}
                max={selectedMaterialId ? selectedStock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={`input-field text-center ${isOverQuantity ? 'border-coral ring-1 ring-coral/30' : ''}`}
              />
            </div>

            <button
              type="button"
              onClick={handleAddMaterial}
              disabled={!selectedMaterialId || !!isOverQuantity}
              className="btn-primary flex items-center gap-1 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {isOverQuantity && (
            <p className="text-coral text-xs mt-1 mb-2">
              ⚠️ 库存仅剩 {selectedStock}，使用数量不能超过库存
            </p>
          )}

          {addedMaterials.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3.5 h-3.5 text-brown-muted" />
                <span className="text-xs text-brown-muted">已添加素材</span>
              </div>
              {addedMaterials.map((am) => {
                const type = getMaterialType(am.materialId);
                const stock = materials.find((m) => m.id === am.materialId)?.quantity ?? 0;
                const isOver = am.quantityUsed > stock;
                return (
                  <div
                    key={am.materialId}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${isOver ? 'bg-coral/8 border border-coral/30' : 'bg-cream-dark/25'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={badgeClass[type]}>{getMaterialName(am.materialId)}</span>
                      <span className={`text-sm font-medium ${isOver ? 'text-coral' : 'text-brown-muted'}`}>
                        ×{am.quantityUsed}
                      </span>
                      {isOver && (
                        <span className="text-coral text-xs">超出库存（剩余{stock}）</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(am.materialId)}
                      className="p-1 rounded text-brown-muted/50 hover:text-coral hover:bg-coral/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-brown-muted/50 text-sm text-center py-4">请从上方选择并添加素材</p>
          )}
        </div>

        <div className="card-paper rounded-xl p-5">
          <label className="block font-serif text-brown-dark font-semibold mb-1.5">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注信息（可选）"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/usage')}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!journalName.trim() || !date || addedMaterials.length === 0 || hasOverQuantity}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
