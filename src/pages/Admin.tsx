import { useState, useMemo } from 'react';
import { Wrench, Plus, AlertTriangle, CheckCircle, Clock, XCircle, Sparkles } from 'lucide-react';
import { useStore, practiceTypeLabels } from '../store';
import type { EquipmentIssue } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Props {
  onOpenFeedback: (bookingId: string) => void;
}

type IssueCategory = EquipmentIssue['category'];
type IssueSeverity = EquipmentIssue['severity'];

const categoryLabels: Record<IssueCategory, { label: string; icon: string }> = {
  keyboard: { label: '琴键/键盘', icon: '🎹' },
  drum: { label: '鼓具', icon: '🥁' },
  ac: { label: '空调', icon: '❄️' },
  speaker: { label: '音响/外放', icon: '🔊' },
  other: { label: '其他', icon: '🔧' },
};

const severityLabels: Record<IssueSeverity, { label: string; color: string }> = {
  low: { label: '轻微', color: 'bg-blue-100 text-blue-700' },
  medium: { label: '一般', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: '严重', color: 'bg-red-100 text-red-700' },
};

export default function AdminPage({ onOpenFeedback }: Props) {
  const {
    rooms,
    bookings,
    equipmentIssues,
    addEquipmentIssue,
    resolveEquipmentIssue,
    isAdmin,
    updateBookingStatus,
  } = useStore(s => ({
    rooms: s.rooms,
    bookings: s.bookings,
    equipmentIssues: s.equipmentIssues,
    addEquipmentIssue: s.addEquipmentIssue,
    resolveEquipmentIssue: s.resolveEquipmentIssue,
    isAdmin: s.isAdmin,
    updateBookingStatus: s.updateBookingStatus,
  }));

  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [category, setCategory] = useState<IssueCategory>('other');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('管理员');
  const [resolveNote, setResolveNote] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [filterResolved, setFilterResolved] = useState<'all' | 'open' | 'resolved'>('open');
  const [toast, setToast] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredIssues = useMemo(() => {
    if (filterResolved === 'all') return equipmentIssues;
    if (filterResolved === 'open') return equipmentIssues.filter(e => !e.resolved);
    return equipmentIssues.filter(e => e.resolved);
  }, [equipmentIssues, filterResolved]);

  const pendingCleanings = bookings.filter(b => b.status === 'needs_cleaning');
  const todayBookings = bookings.filter(b => b.date === today);
  const inUseBookings = bookings.filter(b => b.status === 'in_use');

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    addEquipmentIssue({
      roomId: selectedRoomId,
      reportedBy,
      category,
      description: description.trim(),
      severity,
    });
    setDescription('');
    setShowIssueForm(false);
    setToast('设备问题已记录');
    setTimeout(() => setToast(null), 2500);
  };

  const handleResolve = (issueId: string) => {
    resolveEquipmentIssue(issueId, resolveNote || '已修复');
    setResolvingId(null);
    setResolveNote('');
    setToast('问题已标记为已解决');
    setTimeout(() => setToast(null), 2500);
  };

  if (!isAdmin) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Wrench size={40} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">管理员功能</h2>
        <p className="text-gray-500 mb-6">请在顶部切换到「管理员模式」以使用此页面功能</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">管理面板</h1>
          <p className="text-gray-500 text-sm">设备问题记录、预约监控、清洁管理</p>
        </div>
        <button
          onClick={() => setShowIssueForm(true)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={18} />
          记录设备问题
        </button>
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-indigo-600 text-white rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="今日预约" value={todayBookings.length} icon={<Clock className="text-indigo-500" />} />
        <StatBox label="使用中" value={inUseBookings.length} icon={<XCircle className="text-red-500" />} />
        <StatBox label="待打扫" value={pendingCleanings.length} icon={<Sparkles className="text-orange-500" />} />
        <StatBox
          label="未解决问题"
          value={equipmentIssues.filter(e => !e.resolved).length}
          icon={<AlertTriangle className="text-yellow-500" />}
        />
      </div>

      {pendingCleanings.length > 0 && (
        <div className="card p-5 border-orange-200 bg-orange-50/50">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-orange-500" /> 待打扫房间
          </h3>
          <div className="space-y-2">
            {pendingCleanings.map(b => {
              const room = rooms.find(r => r.id === b.roomId);
              return (
                <div key={b.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{room?.name}</p>
                    <p className="text-sm text-gray-500">
                      {b.userName} · {b.date} {b.startTime}-{b.endTime} · {practiceTypeLabels[b.practiceType]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { updateBookingStatus(b.id, 'completed'); setToast('已标记打扫完成'); setTimeout(() => setToast(null), 2500); }}
                      className="btn-success text-sm py-1.5 px-3"
                    >
                      已打扫
                    </button>
                    <button
                      onClick={() => onOpenFeedback(b.id)}
                      className="btn-secondary text-sm py-1.5 px-3"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Wrench size={18} /> 设备问题记录
          </h3>
          <div className="flex gap-1.5">
            {(['open', 'resolved', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterResolved(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  filterResolved === f
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'open' ? '未解决' : f === 'resolved' ? '已解决' : '全部'}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
            {filterResolved === 'open' ? '暂无未解决的设备问题，所有设备运行正常 ✨' : '暂无记录'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIssues.slice().sort((a, b) => (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0)).map(issue => {
              const room = rooms.find(r => r.id === issue.roomId);
              const isResolving = resolvingId === issue.id;
              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-xl border transition-all ${
                    issue.resolved
                      ? 'bg-gray-50 border-gray-200 opacity-70'
                      : `bg-white border-gray-200 hover:shadow-sm ${
                          issue.severity === 'high' ? 'border-l-4 border-l-red-500' :
                          issue.severity === 'medium' ? 'border-l-4 border-l-yellow-500' :
                          'border-l-4 border-l-blue-500'
                        }`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-lg">{categoryLabels[issue.category].icon}</span>
                        <span className="font-medium text-gray-800">{room?.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${severityLabels[issue.severity].color}`}>
                          {severityLabels[issue.severity].label}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {categoryLabels[issue.category].label}
                        </span>
                        {issue.resolved && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> 已解决
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{issue.description}</p>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>上报人：{issue.reportedBy}</span>
                        <span>·</span>
                        <span>{format(new Date(issue.reportedAt), 'MM-dd HH:mm', { locale: zhCN })}</span>
                        {issue.resolved && issue.resolvedNote && (
                          <>
                            <span>·</span>
                            <span className="text-green-600">处理备注：{issue.resolvedNote}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {!issue.resolved && (
                      <div>
                        {!isResolving ? (
                          <button
                            onClick={() => { setResolvingId(issue.id); setResolveNote(''); }}
                            className="btn-success text-sm py-1.5 px-3 whitespace-nowrap"
                          >
                            标记解决
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="处理备注"
                              value={resolveNote}
                              onChange={e => setResolveNote(e.target.value)}
                              className="input !py-1 !text-sm !w-36"
                            />
                            <button
                              onClick={() => handleResolve(issue.id)}
                              className="btn-success text-sm py-1.5 px-3"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setResolvingId(null)}
                              className="btn-secondary text-sm py-1.5 px-3"
                            >
                              取消
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-800">记录设备问题</h3>
              <button onClick={() => setShowIssueForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddIssue} className="p-6 space-y-4">
              <div>
                <label className="label">房间</label>
                <select
                  className="input"
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">问题类别</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(Object.keys(categoryLabels) as IssueCategory[]).map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        category === cat
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1">{categoryLabels[cat].icon}</span>
                      {categoryLabels[cat].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">严重程度</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(severityLabels) as IssueSeverity[]).map(sev => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        severity === sev
                          ? severityLabels[sev].color
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {severityLabels[sev].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">问题描述</label>
                <textarea
                  className="input min-h-[90px] resize-none"
                  placeholder="例如：第3个八度的do琴键回弹不灵敏 / 地鼓鼓皮松动，需要重新调音 / 空调制冷效果差..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">上报人</label>
                <input
                  type="text"
                  className="input"
                  value={reportedBy}
                  onChange={e => setReportedBy(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIssueForm(false)} className="btn-secondary flex-1">
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  提交记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
