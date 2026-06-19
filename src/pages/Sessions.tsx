import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, api } from '@/store/appStore';
import type { Session } from '../../shared/types';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  CloudSun,
  Users,
  MonitorPlay,
  Edit3,
  Trash2,
  ArrowLeft,
  Save,
  Upload,
  X,
} from 'lucide-react';

const emptyForm = {
  title: '',
  date: '',
  time: '19:30',
  venue: '',
  expectedPeople: 100,
  weather: '晴 25°C',
  screenPosition: '',
  photo: '',
};

export default function Sessions() {
  const navigate = useNavigate();
  const { sessions, fetchSessions } = useAppStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.venue.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (s: Session) => {
    setEditingId(s.id);
    setForm({
      title: s.title,
      date: s.date,
      time: s.time,
      venue: s.venue,
      expectedPeople: s.expectedPeople,
      weather: s.weather,
      screenPosition: s.screenPosition,
      photo: s.photo || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该场次吗？相关报名记录也将被删除。')) return;
    await api(`/api/sessions/${id}`, { method: 'DELETE' });
    await fetchSessions();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) {
      alert('请填写片名、日期和场地');
      return;
    }

    if (editingId) {
      await api(`/api/sessions/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
    } else {
      await api('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
    }

    await fetchSessions();
    setShowForm(false);
    setForm(emptyForm);
  };

  if (showForm) {
    return (
      <FormView
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={() => setShowForm(false)}
        isEdit={!!editingId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-night-teal-800 mb-1">场次档案</h1>
          <p className="text-night-teal-500">管理社区露天电影的所有放映场次</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-night-teal-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索片名或场地..."
              className="input-field pl-11 pr-4 w-64"
            />
          </div>
          <button onClick={handleNew} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            新增场次
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-night-teal-500 mb-4">暂无场次，点击右上角新增</p>
          <button onClick={handleNew} className="btn-secondary">
            创建第一场电影
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s, i) => (
            <SessionCard
              key={s.id}
              session={s}
              stagger={`stagger-${(i % 6) + 1}`}
              onEdit={() => handleEdit(s)}
              onDelete={() => handleDelete(s.id)}
              onView={() => navigate(`/sessions/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  stagger,
  onEdit,
  onDelete,
  onView,
}: {
  session: Session;
  stagger: string;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const statusMap = {
    upcoming: { label: '即将开场', color: 'bg-forest text-white' },
    ongoing: { label: '进行中', color: 'bg-warm-orange-500 text-white animate-pulse' },
    ended: { label: '已结束', color: 'bg-night-teal-200 text-night-teal-700' },
  };
  const s = statusMap[session.status];

  return (
    <div className={`card card-hover overflow-hidden opacity-0 animate-fade-in-up ${stagger} group`}>
      <div className="relative h-48 bg-gradient-to-br from-night-teal-700 to-night-teal-900 overflow-hidden cursor-pointer" onClick={onView}>
        {session.photo ? (
          <img src={session.photo} alt={session.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MonitorPlay size={60} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night-teal-950/80 via-transparent to-transparent" />

        <div className="absolute top-3 left-0">
          <div className="relative">
            <div className="bg-warm-orange-500 text-white text-xs font-medium px-4 py-1.5 pr-6 shadow-lg">
              <Calendar size={12} className="inline mr-1" />
              {session.date} {session.time}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-0 h-0 border-t-[14px] border-t-warm-orange-500 border-r-[14px] border-r-transparent border-b-[14px] border-b-warm-orange-500" />
          </div>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`badge ${s.color}`}>{s.label}</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-2xl text-white mb-1 drop-shadow-lg">{session.title}</h3>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {session.venue}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <InfoPill icon={<Users size={14} />} label={`${session.expectedPeople}人`} />
          <InfoPill icon={<CloudSun size={14} />} label={session.weather} />
          <InfoPill icon={<MonitorPlay size={14} />} label={session.screenPosition.slice(0, 6) + '...'} />
        </div>

        <div className="flex gap-2">
          <button onClick={onView} className="btn-ghost flex-1 text-center !bg-night-teal-50 hover:!bg-night-teal-100">
            查看详情
          </button>
          <button onClick={onEdit} className="btn-outline !p-2.5" title="编辑">
            <Edit3 size={18} />
          </button>
          <button onClick={onDelete} className="btn-outline !p-2.5 !border-red-300 text-red-500 hover:!bg-red-50 hover:!border-red-500 hover:!text-red-600" title="删除">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cream/70 text-night-teal-600 text-xs">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function FormView({
  form,
  setForm,
  onSubmit,
  onCancel,
  isEdit,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="btn-ghost !p-2.5">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-3xl text-night-teal-800 mb-1">
            {isEdit ? '编辑场次' : '新增场次'}
          </h1>
          <p className="text-night-teal-500">填写电影放映的详细信息</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card p-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label-field">🎬 片名 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="例如：千与千寻"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">📅 放映日期 *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">⏰ 放映时间</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-field">📍 放映场地 *</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="例如：社区中心广场"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">👥 预计人数</label>
            <input
              type="number"
              value={form.expectedPeople}
              onChange={(e) => setForm({ ...form, expectedPeople: parseInt(e.target.value) || 0 })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">🌤️ 天气预报</label>
            <input
              type="text"
              value={form.weather}
              onChange={(e) => setForm({ ...form, weather: e.target.value })}
              placeholder="例如：晴 26°C"
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-field">🖥️ 屏幕位置</label>
            <input
              type="text"
              value={form.screenPosition}
              onChange={(e) => setForm({ ...form, screenPosition: e.target.value })}
              placeholder="例如：广场北侧大银幕"
              className="input-field"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label-field">🖼️ 场景照片 URL</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                placeholder="https://..."
                className="input-field flex-1"
              />
              {form.photo && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, photo: '' })}
                  className="btn-ghost !p-3"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {form.photo && (
              <div className="mt-3 rounded-2xl overflow-hidden h-40 border-2 border-night-teal-100">
                <img src={form.photo} alt="预览" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-night-teal-50">
          <button type="button" onClick={onCancel} className="btn-outline">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={18} />
            {isEdit ? '保存修改' : '创建场次'}
          </button>
        </div>
      </form>
    </div>
  );
}
