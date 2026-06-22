import { useState } from 'react';
import { Plus, Trash2, Thermometer, Droplets, Camera, FileText, X, Save } from 'lucide-react';
import { SampleRecord } from '@/types';
import { useSamplingStore } from '@/stores/useSamplingStore';
import { formatDateTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface SampleRecordPanelProps {
  siteId: string;
}

interface EditingRecord {
  id?: string;
  sampleNumber: string;
  salinity: string;
  waterTemperature: string;
  notes: string;
}

export default function SampleRecordPanel({ siteId }: SampleRecordPanelProps) {
  const { sampleRecords, addSampleRecord, updateSampleRecord, deleteSampleRecord } = useSamplingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditingRecord>({
    sampleNumber: '',
    salinity: '',
    waterTemperature: '',
    notes: '',
  });

  const siteRecords = sampleRecords.filter((r) => r.siteId === siteId);

  const handleAdd = () => {
    setFormData({
      sampleNumber: `BL-${new Date().getFullYear()}-${String(siteRecords.length + 1).padStart(3, '0')}`,
      salinity: '',
      waterTemperature: '',
      notes: '',
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (record: SampleRecord) => {
    setFormData({
      id: record.id,
      sampleNumber: record.sampleNumber,
      salinity: String(record.salinity),
      waterTemperature: String(record.waterTemperature),
      notes: record.notes,
    });
    setEditingId(record.id);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sampleNumber.trim()) return;

    const recordData = {
      sampleNumber: formData.sampleNumber,
      salinity: Number(formData.salinity) || 0,
      waterTemperature: Number(formData.waterTemperature) || 0,
      notes: formData.notes,
    };

    if (editingId) {
      updateSampleRecord(editingId, recordData);
      setEditingId(null);
    } else {
      addSampleRecord({
        ...recordData,
        siteId,
      });
      setIsAdding(false);
    }

    setFormData({
      sampleNumber: '',
      salinity: '',
      waterTemperature: '',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条采样记录吗？')) {
      deleteSampleRecord(id);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      sampleNumber: '',
      salinity: '',
      waterTemperature: '',
      notes: '',
    });
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log('Photo uploaded:', event.target?.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 font-display flex items-center gap-2">
          <FileText size={18} className="text-cyan-600" />
          采样记录
        </h3>
        <button
          onClick={handleAdd}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg',
            'bg-cyan-600 hover:bg-cyan-700 text-white',
            'transition-all hover:shadow-md active:scale-[0.98]'
          )}
        >
          <Plus size={14} />
          新增记录
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {(isAdding || editingId) && (
          <form
            onSubmit={handleSubmit}
            className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-cyan-700">
                {editingId ? '编辑记录' : '新增记录'}
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 rounded text-cyan-500 hover:bg-cyan-100"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                样本编号
              </label>
              <input
                type="text"
                value={formData.sampleNumber}
                onChange={(e) => setFormData({ ...formData, sampleNumber: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                placeholder="例如：BL-2026-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  盐度 (‰)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.salinity}
                  onChange={(e) => setFormData({ ...formData, salinity: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  水温 (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waterTemperature}
                  onChange={(e) => setFormData({ ...formData, waterTemperature: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                备注
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white resize-none"
                placeholder="采样位置、深度、外观等..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePhotoUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 bg-white border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                <Camera size={14} />
                拍照凭证
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Save size={14} />
                保存
              </button>
            </div>
          </form>
        )}

        {siteRecords.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-slate-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无采样记录</p>
            <p className="text-xs mt-1">点击上方按钮添加第一条记录</p>
          </div>
        ) : (
          siteRecords
            .slice()
            .sort((a, b) => new Date(b.sampledAt).getTime() - new Date(a.sampledAt).getTime())
            .map((record) => (
              <div
                key={record.id}
                onClick={() => editingId !== record.id && handleEdit(record)}
                className={cn(
                  'p-3 rounded-xl border transition-all cursor-pointer',
                  editingId === record.id
                    ? 'border-cyan-300 bg-cyan-50'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {record.sampleNumber}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id);
                    }}
                    className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Droplets size={12} className="text-cyan-500" />
                    <span>盐度：</span>
                    <span className="font-medium">{record.salinity}‰</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Thermometer size={12} className="text-orange-500" />
                    <span>水温：</span>
                    <span className="font-medium">{record.waterTemperature}°C</span>
                  </div>
                </div>

                {record.notes && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {record.notes}
                  </p>
                )}

                <p className="text-xs text-slate-400">
                  {formatDateTime(new Date(record.sampledAt))}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
