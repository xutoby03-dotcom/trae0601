import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ImagePlus } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MATERIAL_TYPE_LABELS } from '@/types';
import type { MaterialType } from '@/types';

const TYPE_BADGE: Record<MaterialType, string> = {
  sticker: 'badge-sticker',
  tape: 'badge-tape',
  memo: 'badge-memo',
  stamp: 'badge-stamp',
};

export default function AddInspiration() {
  const { materials, addInspiration } = useJournalStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [note, setNote] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [addedMaterialIds, setAddedMaterialIds] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMaterial = () => {
    if (!selectedMaterialId) return;
    if (addedMaterialIds.includes(selectedMaterialId)) return;
    setAddedMaterialIds((prev) => [...prev, selectedMaterialId]);
    setSelectedMaterialId('');
  };

  const handleRemoveMaterial = (id: string) => {
    setAddedMaterialIds((prev) => prev.filter((mid) => mid !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addInspiration(
      {
        name: name.trim(),
        theme: theme.trim(),
        note: note.trim(),
        coverPhoto,
      },
      addedMaterialIds
    );
    navigate('/inspirations');
  };

  const availableMaterials = materials.filter(
    (m) => !addedMaterialIds.includes(m.id)
  );

  return (
    <div className="page-container">
      <h1 className="page-title">创建搭配</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="section-title block">搭配名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：秋日手帐套装"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="section-title block">主题</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="例如：秋日咖啡、复古花园"
            className="input-field"
          />
        </div>

        <div>
          <label className="section-title block">封面图</label>
          <div className="flex items-start gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {coverPhoto ? (
              <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-brown-muted/30">
                <img src={coverPhoto} alt="封面" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverPhoto('')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-lg border-2 border-dashed border-brown-muted/40 flex flex-col items-center justify-center gap-1 text-brown-muted/60 hover:border-brown-light hover:text-brown-light transition-colors"
              >
                <ImagePlus size={24} />
                <span className="text-xs">添加封面</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              选择图片
            </button>
          </div>
        </div>

        <div>
          <label className="section-title block">素材选择</label>
          <div className="flex gap-2 mb-3">
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">选择素材...</option>
              {availableMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({MATERIAL_TYPE_LABELS[m.type]})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddMaterial}
              disabled={!selectedMaterialId}
              className="btn-secondary flex items-center gap-1 disabled:opacity-40"
            >
              <Plus size={14} />
              添加
            </button>
          </div>

          {addedMaterialIds.length > 0 && (
            <div className="space-y-2">
              {addedMaterialIds.map((mid) => {
                const material = materials.find((m) => m.id === mid);
                if (!material) return null;
                return (
                  <div
                    key={mid}
                    className="card-paper rounded-lg p-2.5 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden border border-brown-muted/20 flex-shrink-0">
                      {material.photo ? (
                        <img
                          src={material.photo}
                          alt={material.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-cream-dark/50 flex items-center justify-center text-brown-muted/50 text-xs">
                          无
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brown-dark truncate">{material.name}</p>
                      <span className={`${TYPE_BADGE[material.type]} text-[10px]`}>
                        {MATERIAL_TYPE_LABELS[material.type]}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(mid)}
                      className="text-brown-muted/60 hover:text-coral-deep transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {addedMaterialIds.length === 0 && (
            <p className="text-brown-muted/60 text-sm">尚未添加素材</p>
          )}
        </div>

        <div>
          <label className="section-title block">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="记录搭配想法和灵感..."
            className="input-field min-h-[100px] resize-y"
            rows={4}
          />
        </div>

        <div className="stitch-line pt-4 flex gap-3">
          <button type="submit" className="btn-primary flex-1">
            创建搭配
          </button>
          <button
            type="button"
            onClick={() => navigate('/inspirations')}
            className="btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
