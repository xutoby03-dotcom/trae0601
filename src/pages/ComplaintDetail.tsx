import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Volume2, Users, AlertTriangle, Plus, Check, Phone, Shield, Wrench } from 'lucide-react';
import { useComplaintStore } from '@/store/useComplaintStore';
import { NOISE_TYPE_LABELS, DECIBEL_LABELS, STATUS_LABELS, STATUS_COLORS, DECIBEL_COLORS, ACTION_LABELS, ComplaintStatus, ActionType } from '@/types';

const ACTION_ICONS: Record<ActionType, React.ElementType> = {
  contacted: Phone,
  visited: Check,
  police: Shield,
  rectification: Wrench,
};

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getComplaintById, secondComplaint, addAction, updateStatus, currentUserId } = useComplaintStore();

  const [actionType, setActionType] = useState<ActionType>('contacted');
  const [actionNote, setActionNote] = useState('');

  const complaint = id ? getComplaintById(id) : undefined;

  if (!complaint) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center text-slate-400 py-20">
        未找到
      </div>
    );
  }

  const hasSeconded = complaint.seconds.some((s) => s.userId === currentUserId);

  const handleSecond = () => {
    secondComplaint(complaint.id);
  };

  const handleAddAction = () => {
    if (!actionNote.trim()) return;
    addAction(complaint.id, actionType, actionNote.trim());
    setActionNote('');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const statusList: ComplaintStatus[] = ['ongoing', 'pending', 'resolved', 'recurring'];
  const actionTypes: ActionType[] = ['contacted', 'visited', 'police', 'rectification'];

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">投诉详情</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[complaint.status]}`}>
            {STATUS_LABELS[complaint.status]}
          </span>
          <span className="text-xs text-slate-400">{formatTime(complaint.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{NOISE_TYPE_LABELS[complaint.noiseType]}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{complaint.location}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{formatTime(complaint.noiseTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm">持续 {complaint.durationMinutes} 分钟</span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <span className={`text-sm font-medium ${DECIBEL_COLORS[complaint.decibelLevel]}`}>
            {DECIBEL_LABELS[complaint.decibelLevel]}
          </span>
        </div>

        {complaint.affectsRest && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">影响休息</span>
          </div>
        )}

        {complaint.notes && (
          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{complaint.notes}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-medium">{complaint.seconds.length} 人附议</span>
          </div>
          {hasSeconded ? (
            <span className="text-sm text-teal-500 font-medium">已附议</span>
          ) : (
            <button
              onClick={handleSecond}
              className="px-4 py-1.5 text-sm text-teal-500 border border-teal-500 rounded-lg hover:bg-teal-50"
            >
              附议
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">处理记录</h2>
        {complaint.actions.length === 0 ? (
          <p className="text-sm text-slate-400">暂无处理记录</p>
        ) : (
          <div className="flex flex-col">
            {complaint.actions.map((action, idx) => {
              const Icon = ACTION_ICONS[action.type];
              const isLast = idx === complaint.actions.length - 1;
              return (
                <div key={action.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-teal-500 mt-1 shrink-0" />
                    {!isLast && <div className="w-0.5 flex-1 bg-teal-200 my-1" />}
                  </div>
                  <div className={`flex-1 ${!isLast ? 'pb-4' : 'pb-0'}`}>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-teal-500" />
                        <span className="text-sm font-medium text-slate-700">{ACTION_LABELS[action.type]}</span>
                        <span className="text-xs text-slate-400 ml-auto">{formatTime(action.actionTime)}</span>
                      </div>
                      {action.note && <p className="text-xs text-slate-500 mt-1">{action.note}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">添加处理记录</h2>
        <div className="flex flex-col gap-3">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ActionType)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {actionTypes.map((t) => (
              <option key={t} value={t}>{ACTION_LABELS[t]}</option>
            ))}
          </select>
          <textarea
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            placeholder="备注说明..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none h-20"
          />
          <button
            onClick={handleAddAction}
            className="flex items-center justify-center gap-1 w-full py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600"
          >
            <Plus className="w-4 h-4" />
            提交记录
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">更新状态</h2>
        <div className="grid grid-cols-2 gap-2">
          {statusList.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(complaint.id, s)}
              className={`py-2 text-sm rounded-lg border ${
                complaint.status === s
                  ? `${STATUS_COLORS[s]} border-current font-semibold`
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
