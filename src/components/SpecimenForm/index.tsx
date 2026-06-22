import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useSpecimenStore } from '@/store/useSpecimenStore';
import type { SpecimenFormData } from '@/types/specimen';

const plantParts = ['叶片', '花朵', '全株', '果实', '种子', '枝条', '树皮', '根系', '花+叶', '花序'];

export default function SpecimenForm() {
  const addSpecimen = useSpecimenStore((s) => s.addSpecimen);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState<SpecimenFormData>({
    plantName: '',
    collectionLocation: '',
    plantPart: '',
    pressingDate: new Date().toISOString().slice(0, 10),
    absorbentPaperBatch: '',
    plateWeight: 5,
    paperChangeIntervalDays: 2,
    notes: '',
  });

  const handleChange = (field: keyof SpecimenFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plantName.trim() || !form.collectionLocation.trim() || !form.plantPart) {
      return;
    }

    const submitData: SpecimenFormData = {
      ...form,
      pressingDate: new Date(form.pressingDate).toISOString(),
    };

    addSpecimen(submitData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setForm({
      plantName: '',
      collectionLocation: '',
      plantPart: '',
      pressingDate: new Date().toISOString().slice(0, 10),
      absorbentPaperBatch: '',
      plateWeight: 5,
      paperChangeIntervalDays: 2,
      notes: '',
    });
  };

  const isFormValid = form.plantName.trim() && form.collectionLocation.trim() && form.plantPart;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-card border border-forest-100"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="bg-forest-500 p-2 rounded-lg">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-serif text-xl font-bold text-forest-700">录入新标本</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            植物名称 <span className="text-warning-danger">*</span>
          </label>
          <input
            type="text"
            value={form.plantName}
            onChange={(e) => handleChange('plantName', e.target.value)}
            placeholder="如：银杏、红枫..."
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            采集地点 <span className="text-warning-danger">*</span>
          </label>
          <input
            type="text"
            value={form.collectionLocation}
            onChange={(e) => handleChange('collectionLocation', e.target.value)}
            placeholder="如：北京香山公园"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            植物部位 <span className="text-warning-danger">*</span>
          </label>
          <select
            value={form.plantPart}
            onChange={(e) => handleChange('plantPart', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          >
            <option value="">请选择部位</option>
            {plantParts.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">压制日期</label>
          <input
            type="date"
            value={form.pressingDate}
            onChange={(e) => handleChange('pressingDate', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">吸水纸批次</label>
          <input
            type="text"
            value={form.absorbentPaperBatch}
            onChange={(e) => handleChange('absorbentPaperBatch', e.target.value)}
            placeholder="如：P2024-001"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            压板重量 (kg)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            step="0.5"
            value={form.plateWeight}
            onChange={(e) => handleChange('plateWeight', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            换纸周期 (天)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={form.paperChangeIntervalDays}
            onChange={(e) => handleChange('paperChangeIntervalDays', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">备注</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="特殊情况记录..."
            className="w-full px-4 py-2.5 rounded-lg border-2 border-forest-100 focus:border-forest-400 focus:outline-none transition-colors bg-paper-50 resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          showSuccess
            ? 'bg-green-500 text-white'
            : isFormValid
            ? 'bg-forest-500 text-white hover:bg-forest-600 hover:shadow-card-hover active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {showSuccess ? (
          <>
            <Check className="w-5 h-5" />
            录入成功
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            添加标本
          </>
        )}
      </button>
    </form>
  );
}
