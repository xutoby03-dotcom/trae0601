import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Clock,
  User,
  Bike,
  Crown,
  MessageSquare,
  Check,
  Plus,
} from 'lucide-react';
import FormField from '@/components/FormField';
import { useStore } from '@/store/useStore';
import { BIKE_TYPE_LABELS } from '@/utils/constants';
import { formatDateTime } from '@/utils/formatters';
import type { BikeType, Participant, RideEvent } from '@/types';

type Tab = 'list' | 'create' | 'join';

export default function JoinRide() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getRouteById, getEventsByRouteId, addRideEvent, addParticipant } = useStore();

  const route = getRouteById(id);
  const events = getEventsByRouteId(id);

  const [tab, setTab] = useState<Tab>(events.length > 0 ? 'list' : 'create');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events.length > 0 ? events[0].id : null
  );
  const [submitting, setSubmitting] = useState(false);

  const [eventForm, setEventForm] = useState<Omit<RideEvent, 'id' | 'participants' | 'createdAt' | 'routeId'>>({
    title: '',
    meetTime: '',
    meetPoint: '',
  });

  const [joinForm, setJoinForm] = useState<Omit<Participant, 'id' | 'eventId'>>({
    name: '',
    bikeType: 'road',
    canLead: false,
    note: '',
  });

  if (!route) {
    return (
      <div className="page-container">
        <div className="container max-w-4xl">
          <p className="text-slate-400">路线不存在</p>
        </div>
      </div>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.meetTime || !eventForm.meetPoint) return;
    setSubmitting(true);
    setTimeout(() => {
      addRideEvent({ ...eventForm, routeId: id });
      const updatedEvents = getEventsByRouteId(id);
      const newEvent = updatedEvents[updatedEvents.length - 1];
      setSelectedEventId(newEvent.id);
      setTab('join');
      setSubmitting(false);
    }, 400);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinForm.name || !selectedEventId) return;
    setSubmitting(true);
    setTimeout(() => {
      addParticipant(selectedEventId, joinForm);
      navigate(`/route/${id}`);
    }, 400);
  };

  return (
    <div className="page-container">
      <div className="container max-w-4xl">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-3">
          <ArrowLeft className="h-4 w-4" />
          返回路线详情
        </button>

        {/* 路线信息概览 */}
        <div className="card-base p-5 mb-8 flex items-center gap-4">
          <img
            src={route.coverImage}
            alt=""
            className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-white truncate">
              {route.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {route.distance} km · 爬升 {route.elevation}m
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white mb-4 shadow-lg shadow-sky-900/40">
            <Users className="h-4 w-4" />
            约伴骑行
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            找个同伴一起出发
          </h1>
          <p className="text-slate-400">选择现有活动报名或发起新的约骑</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {events.length > 0 && (
            <button
              onClick={() => setTab('list')}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                tab === 'list'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              选择活动 ({events.length})
            </button>
          )}
          <button
            onClick={() => setTab('create')}
            className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              tab === 'create'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-1.5" />
            发起新约骑
          </button>
        </div>

        {/* 活动列表 */}
        {tab === 'list' && events.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((e) => {
                const active = selectedEventId === e.id;
                const hasLeader = e.participants.some((p) => p.canLead);
                return (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEventId(e.id)}
                    className={`card-base p-5 text-left transition-all ${
                      active
                        ? 'border-sky-500/50 ring-2 ring-sky-500/30'
                        : 'hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-bold text-white text-lg">{e.title}</h3>
                      {active && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDateTime(e.meetTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {e.meetPoint}
                      </div>
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-700/50">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                          <Users className="h-4 w-4" />
                          {e.participants.length} 人
                        </span>
                        {hasLeader && (
                          <span className="text-xs bg-emerald-500/15 text-emerald-400 rounded-full px-2.5 py-0.5">
                            ✅ 有领队
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedEvent && (
              <div className="flex justify-end">
                <button onClick={() => setTab('join')} className="btn-primary">
                  报名此活动
                  <ArrowRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 发起活动表单 */}
        {tab === 'create' && (
          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div className="card-base p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 text-sm">
                  🚴
                </span>
                活动信息
              </h2>

              <div className="space-y-5">
                <FormField label="活动标题" required hint="例如：周六休闲滨江骑">
                  <div className="relative">
                    <Bike className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="给这次约骑起个名字"
                      className="input-base pl-11"
                      required
                    />
                  </div>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="集合时间" required>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={eventForm.meetTime}
                        onChange={(e) => setEventForm({ ...eventForm, meetTime: e.target.value })}
                        className="input-base pl-11"
                        required
                      />
                    </div>
                  </FormField>

                  <FormField label="集合地点" required>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={eventForm.meetPoint}
                        onChange={(e) => setEventForm({ ...eventForm, meetPoint: e.target.value })}
                        placeholder="地铁站出口、地标建筑等"
                        className="input-base pl-11"
                        required
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-2">
              <button
                type="button"
                onClick={() => (events.length > 0 ? setTab('list') : navigate(`/route/${id}`))}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-primary min-w-[180px]"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    创建活动
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 报名表单 */}
        {tab === 'join' && selectedEvent && (
          <div className="space-y-6">
            <div className="card-base p-5 border-sky-500/30">
              <h3 className="font-display font-bold text-white mb-3">{selectedEvent.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-sky-400" />
                  {formatDateTime(selectedEvent.meetTime)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  {selectedEvent.meetPoint}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-400" />
                  已报名 {selectedEvent.participants.length} 人
                </span>
              </div>
            </div>

            {/* 已报名同伴 */}
            {selectedEvent.participants.length > 0 && (
              <div className="card-base p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  已报名同伴
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedEvent.participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40"
                      style={{ animation: `staggerIn 0.4s ease-out ${idx * 60}ms both` }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-indigo-500/30 text-lg font-bold text-white flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white truncate">{p.name}</p>
                          {p.canLead && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] rounded-md bg-amber-500/15 text-amber-400 px-2 py-0.5"
                              title="可领骑"
                            >
                              <Crown className="h-3 w-3" />
                              领队
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {BIKE_TYPE_LABELS[p.bikeType].emoji} {BIKE_TYPE_LABELS[p.bikeType].label}
                          {p.note && ` · ${p.note}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-6">
              <div className="card-base p-6 md:p-8">
                <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-sm">
                    ✍️
                  </span>
                  填写报名信息
                </h2>

                <div className="space-y-5">
                  <FormField label="你的昵称" required>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={joinForm.name}
                        onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                        placeholder="怎么称呼你"
                        className="input-base pl-11"
                        required
                      />
                    </div>
                  </FormField>

                  <FormField label="车型" required>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(Object.entries(BIKE_TYPE_LABELS) as [BikeType, typeof BIKE_TYPE_LABELS[BikeType]][]).map(
                        ([key, val]) => {
                          const active = joinForm.bikeType === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setJoinForm({ ...joinForm, bikeType: key })}
                              className={`flex items-center gap-2 rounded-xl px-4 py-3 border-2 transition-all ${
                                active
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 text-slate-300'
                              }`}
                            >
                              <span className="text-xl">{val.emoji}</span>
                              <span className="text-sm font-medium">{val.label}</span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </FormField>

                  <FormField label="能否担任领队">
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={joinForm.canLead}
                          onChange={(e) => setJoinForm({ ...joinForm, canLead: e.target.checked })}
                        />
                        <div className="w-12 h-7 bg-slate-700 rounded-full peer-checked:bg-amber-500 transition-colors" />
                        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                      </div>
                      <div>
                        <span className="text-slate-200 font-medium">可以带路领骑</span>
                        {joinForm.canLead && (
                          <p className="text-xs text-amber-400 mt-0.5">
                            👑 感谢！领队会优先展示给其他骑友
                          </p>
                        )}
                      </div>
                    </label>
                  </FormField>

                  <FormField label="留言 / 备注" hint="例如：会带补胎工具、想约个咖啡等">
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                      <textarea
                        value={joinForm.note}
                        onChange={(e) => setJoinForm({ ...joinForm, note: e.target.value })}
                        rows={3}
                        placeholder="有什么想和其他骑友说的..."
                        className="input-base pl-11 resize-none"
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-2">
                <button type="button" onClick={() => setTab('list')} className="btn-secondary">
                  返回
                </button>
                <button
                  type="submit"
                  className="btn-primary min-w-[180px]"
                  disabled={submitting || !joinForm.name}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      报名中...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      确认报名
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
