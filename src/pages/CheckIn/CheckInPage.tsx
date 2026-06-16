import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, CheckCircle, XCircle, LogOut, UserCheck, Users } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { formatTime, formatPhone } from '../../utils/format';
import type { Guest } from '../../../shared/types';

export default function CheckInPage() {
  const { 
    guests, 
    sessions, 
    loading, 
    fetchGuests, 
    fetchSessions, 
    checkInGuest, 
    checkOutGuest,
    markNoShow
  } = useAppStore();

  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchGuests({ sessionId: selectedSessionId });
    }
  }, [fetchGuests, selectedSessionId]);

  const filteredGuests = guests.filter(guest => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return guest.name.toLowerCase().includes(query) || 
           guest.phone.includes(query);
  });

  const currentSession = sessions.find(s => s.id === selectedSessionId);
  
  const totalGuests = guests.length;
  const checkedInCount = guests.filter(g => g.status === 'checked_in' || g.status === 'left').length;
  const confirmedCount = guests.filter(g => g.isConfirmed).length;
  const noShowCount = guests.filter(g => g.status === 'no_show').length;
  const checkInRate = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

  const handleCheckIn = async (id: string) => {
    try {
      await checkInGuest(id);
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await checkOutGuest(id);
    } catch (error) {
      console.error('Failed to check out:', error);
    }
  };

  const handleNoShow = async (id: string) => {
    const reason = window.prompt('请输入爽约原因：');
    if (reason !== null) {
      try {
        await markNoShow(id, reason || '未说明原因');
      } catch (error) {
        console.error('Failed to mark no show:', error);
      }
    }
  };

  const pendingGuests = filteredGuests.filter(g => g.status !== 'checked_in' && g.status !== 'left' && g.status !== 'no_show');
  const arrivedGuests = filteredGuests.filter(g => g.status === 'checked_in' || g.status === 'left');
  const noShowGuests = filteredGuests.filter(g => g.status === 'no_show');

  return (
    <div className="space-y-6">
      {/* 场次选择和搜索 */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-warm-500" />
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="input-field w-56"
            >
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.name} - {session.date}
                </option>
              ))}
            </select>
          </div>
          
          {currentSession && (
            <div className="flex items-center gap-2 text-sm text-brown-500">
              <Clock size={16} />
              <span>{currentSession.startTime} - {currentSession.endTime}</span>
            </div>
          )}
          
          <div className="flex-1 min-w-[200px] max-w-sm ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" size={20} />
              <input
                type="text"
                placeholder="搜索姓名或电话快速签到..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">总邀约</p>
              <p className="text-3xl font-semibold text-brown-800 mt-1">{totalGuests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Users className="text-primary-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">已到店</p>
              <p className="text-3xl font-semibold text-green-600 mt-1">{checkedInCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">到店率</p>
              <p className="text-3xl font-semibold text-blue-600 mt-1">{checkInRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">未到店</p>
              <p className="text-3xl font-semibold text-red-500 mt-1">{noShowCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 签到进度条 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-brown-800">签到进度</h3>
          <span className="text-sm text-brown-500">{checkedInCount} / {totalGuests} 人已到店</span>
        </div>
        <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${checkInRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-brown-500">
          <span>已确认 {confirmedCount} 人</span>
          <span>未确认 {totalGuests - confirmedCount} 人</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 待签到列表 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brown-800">待签到</h3>
            <span className="badge bg-amber-100 text-amber-700">
              {pendingGuests.length} 人
            </span>
          </div>
          
          {loading ? (
            <div className="py-8 text-center text-brown-500">加载中...</div>
          ) : pendingGuests.length === 0 ? (
            <div className="py-8 text-center text-brown-400">
              <CheckCircle size={40} className="mx-auto mb-2 text-green-300" />
              <p>全部已到店</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto -mx-2 px-2">
              {pendingGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onCheckIn={() => handleCheckIn(guest.id)}
                  onNoShow={() => handleNoShow(guest.id)}
                  showCheckInButton
                />
              ))}
            </div>
          )}
        </div>

        {/* 已到店列表 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brown-800">已到店</h3>
            <span className="badge bg-green-100 text-green-700">
              {arrivedGuests.length} 人
            </span>
          </div>
          
          {arrivedGuests.length === 0 ? (
            <div className="py-8 text-center text-brown-400">
              <UserCheck size={40} className="mx-auto mb-2 text-warm-200" />
              <p>暂无到店客人</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto -mx-2 px-2">
              {arrivedGuests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  onCheckOut={() => handleCheckOut(guest.id)}
                  showCheckOutButton
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 爽约列表 */}
      {noShowGuests.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brown-800">临时爽约</h3>
            <span className="badge bg-red-100 text-red-700">
              {noShowGuests.length} 人
            </span>
          </div>
          
          <div className="space-y-3 -mx-2 px-2">
            {noShowGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center gap-4 p-3 bg-red-50/50 rounded-xl border border-red-100"
              >
                <Avatar name={guest.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-brown-800">{guest.name}</h4>
                    {guest.isVIP && (
                      <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-brown-500 mt-0.5">
                    {guest.phone} · {guest.headcount}人
                  </p>
                  {guest.noShowReason && (
                    <p className="text-xs text-red-500 mt-1">原因：{guest.noShowReason}</p>
                  )}
                </div>
                <StatusBadge status={guest.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface GuestCardProps {
  guest: Guest;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onNoShow?: () => void;
  showCheckInButton?: boolean;
  showCheckOutButton?: boolean;
}

function GuestCard({ guest, onCheckIn, onCheckOut, onNoShow, showCheckInButton, showCheckOutButton }: GuestCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-warm-100 hover:border-primary-200 hover:shadow-soft transition-all">
      <Avatar name={guest.name} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-brown-800 truncate">{guest.name}</h4>
          {guest.isVIP && (
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full flex-shrink-0">
              VIP
            </span>
          )}
        </div>
        <p className="text-sm text-brown-500 mt-0.5">
          {formatPhone(guest.phone)} · {guest.headcount}人
        </p>
        {guest.checkedInAt && (
          <p className="text-xs text-green-600 mt-1">
            签到时间：{formatTime(guest.checkedInAt)}
          </p>
        )}
        {guest.leftAt && (
          <p className="text-xs text-brown-500 mt-1">
            离店时间：{formatTime(guest.leftAt)}
          </p>
        )}
      </div>
      
      {showCheckInButton && (
        <div className="flex items-center gap-1">
          <button
            onClick={onCheckIn}
            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
            title="签到"
          >
            <CheckCircle size={18} />
          </button>
          <button
            onClick={onNoShow}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="标记爽约"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}
      
      {showCheckOutButton && guest.status === 'checked_in' && (
        <button
          onClick={onCheckOut}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brown-100 text-brown-700 hover:bg-brown-200 text-sm transition-colors"
        >
          <LogOut size={16} />
          签退
        </button>
      )}
      
      {showCheckOutButton && guest.status === 'left' && (
        <StatusBadge status={guest.status} />
      )}
    </div>
  );
}
