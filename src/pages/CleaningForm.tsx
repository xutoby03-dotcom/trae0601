import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Sparkles, Droplets, Sun, Lock, Wind, CheckCircle } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useCleaningStore } from '../store/useCleaningStore';
import { CLEANING_STEPS, type CleaningRecord, type CleaningStepKey } from '../types';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { AlertBanner } from '../components/ui/AlertBanner';
import { getTodayString, formatDate } from '../utils/helpers';
import { isFullyCleaned } from '../utils/businessRules';

const iconMap = {
  Trash2,
  Sparkles,
  Droplets,
  Sun,
  Lock,
  Wind,
};

export function CleaningForm() {
  const { boxId } = useParams<{ boxId: string }>();
  const navigate = useNavigate();
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { cleaningRecords, fetchCleaningRecords, addCleaningRecord, updateCleaningRecord } = useCleaningStore();

  const [cleaningDate] = useState(getTodayString());
  const [steps, setSteps] = useState<Record<CleaningStepKey, boolean>>({
    residueRemoved: false,
    interiorWiped: false,
    disinfected: false,
    dried: false,
    zipperChecked: false,
    odorChecked: false,
  });
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchCleaningRecords();
  }, [fetchBoxes, fetchRiders, fetchCleaningRecords]);

  useEffect(() => {
    if (boxId) {
      const existingRecord = cleaningRecords.find(
        r => r.boxId === boxId && r.cleaningDate === cleaningDate
      );
      if (existingRecord) {
        setSteps({
          residueRemoved: existingRecord.residueRemoved,
          interiorWiped: existingRecord.interiorWiped,
          disinfected: existingRecord.disinfected,
          dried: existingRecord.dried,
          zipperChecked: existingRecord.zipperChecked,
          odorChecked: existingRecord.odorChecked,
        });
        setRemarks(existingRecord.remarks);
      }
    }
  }, [boxId, cleaningDate, cleaningRecords]);

  const box = boxes.find(b => b.id === boxId);
  const rider = riders.find(r => r.id === box?.riderId);
  const existingRecord = cleaningRecords.find(
    r => r.boxId === boxId && r.cleaningDate === cleaningDate
  );

  const allCompleted = Object.values(steps).every(Boolean);
  const completedCount = Object.values(steps).filter(Boolean).length;

  const handleStepToggle = (key: CleaningStepKey) => {
    setSteps(prev => ({ ...prev, [key]: !prev[key] }));
    setError('');
  };

  const handleSelectAll = () => {
    const allTrue = Object.values(steps).every(Boolean);
    const newValue: Record<CleaningStepKey, boolean> = {
      residueRemoved: !allTrue,
      interiorWiped: !allTrue,
      disinfected: !allTrue,
      dried: !allTrue,
      zipperChecked: !allTrue,
      odorChecked: !allTrue,
    };
    setSteps(newValue);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allCompleted) {
      setError('请完成全部6项清洁步骤后再提交');
      return;
    }

    const recordData: Omit<CleaningRecord, 'id' | 'createdAt'> = {
      boxId: boxId!,
      cleaningDate,
      ...steps,
      remarks,
      cleanedBy: rider?.name || '未知',
    };

    if (existingRecord) {
      updateCleaningRecord(existingRecord.id, recordData);
    } else {
      addCleaningRecord(recordData);
    }

    navigate('/cleaning');
  };

  if (!box) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">箱子不存在</p>
        <Link to="/cleaning">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/cleaning">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {existingRecord ? '编辑清洁记录' : '登记清洁记录'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <img
            src={box.photoUrl}
            alt={box.boxNumber}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{box.boxNumber}</h2>
            <p className="text-sm text-gray-500">骑手: {rider?.name || '未分配'}</p>
            <p className="text-sm text-gray-500">日期: {formatDate(cleaningDate)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-gray-900">{completedCount}/6</p>
            <p className="text-sm text-gray-500">已完成步骤</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">清洁步骤</h3>
            <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
              <CheckCircle className="w-4 h-4" />
              {Object.values(steps).every(Boolean) ? '取消全选' : '一键全选'}
            </Button>
          </div>

          <div className="space-y-3">
            {CLEANING_STEPS.map((step, index) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap];
              const isChecked = steps[step.key];
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => handleStepToggle(step.key)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                    isChecked
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    {index + 1}
                  </div>
                  <Icon className={`w-6 h-6 ${isChecked ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`flex-1 font-medium ${isChecked ? 'text-green-900' : 'text-gray-900'}`}>
                    {step.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <AlertBanner type="error" title="提交失败" message={error} />
          )}

          <div>
            <Textarea
              label="备注信息"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="填写清洁过程中发现的问题或其他需要说明的内容..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link to="/cleaning">
              <Button type="button" variant="secondary">取消</Button>
            </Link>
            <Button type="submit" disabled={!allCompleted}>
              {existingRecord ? '保存修改' : '提交清洁记录'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
