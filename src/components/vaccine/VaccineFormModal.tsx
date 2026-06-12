import Modal from '../ui/Modal';
import { useState, useEffect } from 'react';
import type { Vaccine } from '@/types';

interface VaccineFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Vaccine, 'id' | 'createdAt' | 'delayedCount' | 'status'>) => void;
  children: { id: string; name: string }[];
  initialData?: Vaccine | null;
  defaultChildId?: string;
}

export default function VaccineFormModal({
  open,
  onClose,
  onSubmit,
  children,
  initialData,
  defaultChildId,
}: VaccineFormModalProps) {
  const [childId, setChildId] = useState('');
  const [name, setName] = useState('');
  const [dose, setDose] = useState(1);
  const [suggestedDate, setSuggestedDate] = useState('');
  const [latestDate, setLatestDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setChildId(initialData.childId);
        setName(initialData.name);
        setDose(initialData.dose);
        setSuggestedDate(initialData.suggestedDate);
        setLatestDate(initialData.latestDate);
        setNotes(initialData.notes);
      } else {
        setChildId(defaultChildId || children[0]?.id || '');
        setName('');
        setDose(1);
        setSuggestedDate('');
        setLatestDate('');
        setNotes('');
      }
    }
  }, [open, initialData, children, defaultChildId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !name.trim() || !suggestedDate || !latestDate) {
      alert('请完整填写：孩子、疫苗名称、建议日期、最晚日期');
      return;
    }
    onSubmit({
      childId,
      name: name.trim(),
      dose,
      suggestedDate,
      latestDate,
      notes: notes.trim(),
    });
    onClose();
  };

  const commonVaccines = [
    '乙肝疫苗', '卡介苗', '脊灰灭活疫苗', '脊灰减毒疫苗',
    '百白破疫苗', '麻腮风疫苗', '乙脑减毒活疫苗', 'A群流脑多糖疫苗',
    'A+C群流脑多糖疫苗', '甲肝减毒活疫苗', '水痘疫苗', '流感疫苗',
    '肺炎球菌疫苗', '轮状病毒疫苗', '手足口疫苗',
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? '编辑疫苗计划' : '新增疫苗计划'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary btn-sm"
          >
            {initialData ? '保存修改' : '添加疫苗'}
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="label">选择孩子 *</label>
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="input"
          >
            <option value="">-- 请选择 --</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">疫苗名称 *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            list="vaccine-suggestions"
            className="input"
            placeholder="输入或选择常见疫苗"
          />
          <datalist id="vaccine-suggestions">
            {commonVaccines.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">剂次</label>
            <input
              type="number"
              min={1}
              max={10}
              value={dose}
              onChange={(e) => setDose(parseInt(e.target.value) || 1)}
              className="input"
            />
          </div>
          <div></div>
          <div>
            <label className="label">建议接种日期 *</label>
            <input
              type="date"
              value={suggestedDate}
              onChange={(e) => setSuggestedDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">最晚接种日期 *</label>
            <input
              type="date"
              value={latestDate}
              onChange={(e) => setLatestDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">注意事项</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="如：发热时推迟、需观察反应等..."
          />
        </div>
      </form>
    </Modal>
  );
}
