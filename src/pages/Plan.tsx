import { useState, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Users, CloudSun, Car, Clock, Plus, X, Save, UserPlus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Avatar from '@/components/common/Avatar';
import type { Trip } from '@/types';

export default function Plan() {
  const currentTripId = useStore((s) => s.currentTripId);
  const trips = useStore((s) => s.trips);
  const peopleAll = useStore((s) => s.people);
  const createTrip = useStore((s) => s.createTrip);
  const updateTrip = useStore((s) => s.updateTrip);
  const addPerson = useStore((s) => s.addPerson);
  const removePerson = useStore((s) => s.removePerson);

  const trip = useMemo(() => trips.find((t) => t.id === currentTripId) || null, [trips, currentTripId]);
  const people = useMemo(() => peopleAll.filter((p) => p.tripId === currentTripId), [peopleAll, currentTripId]);

  const defaultMeetingTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const formatLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState<Omit<Trip, 'id' | 'createdAt'>>({
    location: '',
    peopleCount: 4,
    days: 2,
    weather: '',
    vehicle: '',
    meetingTime: formatLocal(defaultMeetingTime),
  });

  const [newPersonName, setNewPersonName] = useState('');

  useEffect(() => {
    if (trip) {
      setForm({
        location: trip.location,
        peopleCount: trip.peopleCount,
        days: trip.days,
        weather: trip.weather,
        vehicle: trip.vehicle,
        meetingTime: trip.meetingTime ? trip.meetingTime.slice(0, 16) : formatLocal(defaultMeetingTime),
      });
    }
  }, [trip]);

  const handleSave = () => {
    if (!form.location.trim()) {
      alert('请输入露营地点');
      return;
    }
    if (trip) {
      updateTrip(trip.id, form);
    } else {
      createTrip(form);
    }
  };

  const handleAddPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    addPerson(name);
    setNewPersonName('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-bark-500 flex items-center gap-2">
          <MapPin className="text-forest-600" size={26} />
          {trip ? '编辑露营计划' : '创建露营计划'}
        </h1>
        <p className="text-bark-500/60 mt-1 text-sm">
          填写基本信息，开始组织你的露营活动
        </p>
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
          {trip ? '保存修改' : '创建计划'}
        </button>
      </div>

      {/* 人员管理 */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-bark-500 text-lg flex items-center gap-2">
          <Users size={20} className="text-forest-500" />
          参与人员
          <span className="text-sm font-normal text-bark-500/50">({people.length}人)</span>
        </h2>

        {/* 添加人员 */}
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

        {/* 人员列表 */}
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
    </div>
  );
}
