import { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Users, CloudSun, Car, Clock, Plus, X, Save, UserPlus, Sparkles, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Avatar from '@/components/common/Avatar';
import type { Trip } from '@/types';

type Mode = 'create' | 'edit';

export default function Plan() {
  const currentTripId = useStore((s) => s.currentTripId);
  const trips = useStore((s) => s.trips);
  const peopleAll = useStore((s) => s.people);
  const createTrip = useStore((s) => s.createTrip);
  const updateTrip = useStore((s) => s.updateTrip);
  const setCurrentTrip = useStore((s) => s.setCurrentTrip);
  const addPerson = useStore((s) => s.addPerson);
  const removePerson = useStore((s) => s.removePerson);

  const trip = useMemo(() => trips.find((t) => t.id === currentTripId) || null, [trips, currentTripId]);
  const people = useMemo(() => peopleAll.filter((p) => p.tripId === currentTripId), [peopleAll, currentTripId]);

  const defaultMeetingTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const formatLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getEmptyForm = (): Omit<Trip, 'id' | 'createdAt'> => ({
    location: '',
    peopleCount: 4,
    days: 2,
    weather: '',
    vehicle: '',
    meetingTime: formatLocal(defaultMeetingTime),
  });

  const [mode, setMode] = useState<Mode>(trip ? 'edit' : 'create');
  const [form, setForm] = useState<Omit<Trip, 'id' | 'createdAt'>>(
    trip
      ? {
          location: trip.location,
          peopleCount: trip.peopleCount,
          days: trip.days,
          weather: trip.weather,
          vehicle: trip.vehicle,
          meetingTime: trip.meetingTime ? trip.meetingTime.slice(0, 16) : formatLocal(defaultMeetingTime),
        }
      : getEmptyForm()
  );
  const [newPersonName, setNewPersonName] = useState('');
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && trip) {
      setForm({
        location: trip.location,
        peopleCount: trip.peopleCount,
        days: trip.days,
        weather: trip.weather,
        vehicle: trip.vehicle,
        meetingTime: trip.meetingTime ? trip.meetingTime.slice(0, 16) : formatLocal(defaultMeetingTime),
      });
    }
  }, [trip, mode]);

  const handleStartCreate = () => {
    setForm(getEmptyForm());
    setMode('create');
  };

  const handleSave = () => {
    if (!form.location.trim()) {
      alert('请输入露营地点');
      return;
    }
    if (mode === 'create') {
      createTrip(form);
      setMode('edit');
    } else if (trip) {
      updateTrip(trip.id, form);
    }
  };

  const handleSwitchTrip = (tripId: string) => {
    setCurrentTrip(tripId);
    setMode('edit');
    setShowTripDropdown(false);
  };

  const handleAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    addPerson(name);
    setNewPersonName('');
  };

  const showPeopleSection = mode === 'edit' && trip;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-bark-500 flex items-center gap-2">
            <MapPin className="text-forest-600" size={26} />
            {mode === 'edit' ? '编辑露营计划' : '创建露营计划'}
          </h1>
          <p className="text-bark-500/60 mt-1 text-sm">
            {mode === 'edit' ? '修改当前计划的基本信息' : '填写基本信息，开始组织你的露营活动'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trips.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowTripDropdown(!showTripDropdown)}
                className="btn-secondary"
              >
                <Calendar size={16} />
                切换计划
                <ChevronDown size={16} />
              </button>
              {showTripDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-card border border-cream-200 z-20 overflow-hidden animate-slide-up">
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSwitchTrip(t.id)}
                      className={`w-full px-4 py-3 text-left transition-colors border-b border-cream-100 last:border-b-0 ${
                        t.id === currentTripId
                          ? 'bg-forest-50 text-forest-700'
                          : 'hover:bg-cream-50 text-bark-500'
                      }`}
                    >
                      <div className="font-medium">{t.location}</div>
                      <div className="text-xs opacity-60 mt-0.5">{t.days}天 · {t.peopleCount}人</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {mode === 'edit' && trip && (
            <button onClick={handleStartCreate} className="btn-warm">
              <Sparkles size={16} />
              新建计划
            </button>
          )}
        </div>
      </div>

      {/* 基本信息表单 */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-bark-500 text-lg flex items-center gap-2">
          <Calendar size={20} className="text-forest-500" />
          基本信息
        </h2>

        <div>
          <label className="label flex items-center gap-1.5">
            <MapPin size={14} className="text-forest-500" />
            露营地点 *
          </label>
          <input
            type="text"
            className="input"
            placeholder="如：莫干山后坞营地"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center gap-1.5">
              <Calendar size={14} className="text-forest-500" />
              露营天数
            </label>
            <input
              type="number"
              className="input"
              min="1"
              value={form.days}
              onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Users size={14} className="text-forest-500" />
              预计人数
            </label>
            <input
              type="number"
              className="input"
              min="1"
              value={form.peopleCount}
              onChange={(e) => setForm({ ...form, peopleCount: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <CloudSun size={14} className="text-forest-500" />
            天气情况
          </label>
          <input
            type="text"
            className="input"
            placeholder="如：多云转晴 22-28°C"
            value={form.weather}
            onChange={(e) => setForm({ ...form, weather: e.target.value })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Car size={14} className="text-forest-500" />
            车辆信息
          </label>
          <input
            type="text"
            className="input"
            placeholder="如：SUV x 2 或 自驾拼车"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Clock size={14} className="text-forest-500" />
            集合时间
          </label>
          <input
            type="datetime-local"
            className="input"
            value={form.meetingTime}
            onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
          />
        </div>

        <button onClick={handleSave} className="btn-primary w-full">
          <Save size={18} />
          {mode === 'create' ? '创建计划' : '保存修改'}
        </button>
      </div>

      {/* 人员管理 - 仅编辑模式且有当前计划时显示 */}
      {showPeopleSection && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-bark-500 text-lg flex items-center gap-2">
            <Users size={20} className="text-forest-500" />
            参与人员
            <span className="text-sm font-normal text-bark-500/50">({people.length}人)</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              className="input flex-1"
              placeholder="输入成员昵称..."
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
            />
            <button onClick={handleAddPerson} className="btn-secondary">
              <UserPlus size={18} />
              添加
            </button>
          </div>

          {people.length === 0 ? (
            <div className="text-center py-8 text-bark-500/50 text-sm">
              还没有添加成员，添加后可以为其分配装备
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {people.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-cream-50 border border-cream-200/60 hover:bg-cream-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} color={p.avatarColor} />
                    <span className="font-medium text-bark-500">{p.name}</span>
                  </div>
                  <button
                    onClick={() => removePerson(p.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-bark-500/40 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 新建模式提示 */}
      {mode === 'create' && (
        <div className="card p-5 border-forest-200 bg-forest-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="font-semibold text-forest-700 mb-1">创建新计划</div>
              <div className="text-sm text-forest-700/70 leading-relaxed">
                填写上方信息并点击「创建计划」。创建成功后，会自动切换到新计划，你就可以添加成员和装备了。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
