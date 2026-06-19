import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { useStore } from '@/store/useStore';
import { DoctorMark } from '@/types';

export default function NewVisit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseId = searchParams.get('caseId') || '';
  const planId = searchParams.get('planId') || '';

  const addVisitRecord = useStore((state) => state.addVisitRecord);
  const updateVisitDoctorMark = useStore((state) => state.updateVisitDoctorMark);

  const [appetite, setAppetite] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [spirit, setSpirit] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [medication, setMedication] = useState('');
  const [defecation, setDefecation] = useState('');
  const [abnormalDesc, setAbnormalDesc] = useState('');
  const [ownerReplied, setOwnerReplied] = useState(false);
  const [doctorMark, setDoctorMark] = useState<DoctorMark | null>(null);
  const [doctorNote, setDoctorNote] = useState('');

  const handleSubmit = () => {
    if (!caseId || !planId) {
      alert('缺少必要参数');
      return;
    }

    const record = addVisitRecord({
      caseId,
      planId,
      appetite,
      spirit,
      woundPhotos: [],
      medication,
      defecation,
      abnormalDesc,
      ownerReplied,
    });

    if (doctorMark) {
      updateVisitDoctorMark(record.id, doctorMark, doctorNote);
    }

    navigate(`/cases/${caseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">新建回访记录</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-900">宠物状态</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">食欲</label>
            <StarRating value={appetite} onChange={(v) => setAppetite(v as 1 | 2 | 3 | 4 | 5)} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">精神</label>
            <StarRating value={spirit} onChange={(v) => setSpirit(v as 1 | 2 | 3 | 4 | 5)} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">用药情况</label>
            <textarea
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="请描述用药情况..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">排便情况</label>
            <textarea
              value={defecation}
              onChange={(e) => setDefecation(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="请描述排便情况..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">异常描述</label>
            <textarea
              value={abnormalDesc}
              onChange={(e) => setAbnormalDesc(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="请描述异常情况，如无异常可留空..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ownerReplied}
              onChange={(e) => setOwnerReplied(e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">主人是否已回复</span>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-medium text-gray-900">医生标注</h2>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDoctorMark('normal')}
              className={`py-4 px-4 rounded-lg font-medium text-sm transition-all ${
                doctorMark === 'normal'
                  ? 'bg-green-500 text-white shadow-md ring-2 ring-green-500 ring-offset-2'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
              }`}
            >
              正常
            </button>
            <button
              type="button"
              onClick={() => setDoctorMark('observation')}
              className={`py-4 px-4 rounded-lg font-medium text-sm transition-all ${
                doctorMark === 'observation'
                  ? 'bg-warning-500 text-white shadow-md ring-2 ring-warning-500 ring-offset-2'
                  : 'bg-warning-50 text-warning-700 hover:bg-warning-100 border border-warning-200'
              }`}
            >
              需观察
            </button>
            <button
              type="button"
              onClick={() => setDoctorMark('recheck')}
              className={`py-4 px-4 rounded-lg font-medium text-sm transition-all ${
                doctorMark === 'recheck'
                  ? 'bg-danger-500 text-white shadow-md ring-2 ring-danger-500 ring-offset-2'
                  : 'bg-danger-50 text-danger-700 hover:bg-danger-100 border border-danger-200'
              }`}
            >
              尽快复诊
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">医生备注（可选）</label>
            <textarea
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="请输入医生备注..."
            />
          </div>
        </div>

        <div className="sticky bottom-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg shadow-primary-600/20 transition-colors"
          >
            <Save className="w-5 h-5" />
            保存回访记录
          </button>
        </div>
      </div>
    </div>
  );
}
