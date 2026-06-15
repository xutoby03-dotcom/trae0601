import { useState } from 'react';
import { ScanQrCode, CheckCircle2, AlertTriangle, CalendarClock, XCircle, User, Search, Camera } from 'lucide-react';
import { usePickupStore } from '@/stores/pickupStore';
import { usePrepStore } from '@/stores/prepStore';
import { useStudentStore } from '@/stores/studentStore';
import { PICKUP_STATUS_META, MEAL_TYPE_META, ALLERGY_META } from '@/types';
import type { PickupStatus, MealType, AllergyType } from '@/types';
import AllergyBadge from '@/components/allergy/AllergyBadge';
import { formatDateTime } from '@/utils/dateUtils';

export default function PickupRegister() {
  const { getTodayRecords, scanQrCode, manualPickup, recordException, getTodayStats } = usePickupStore();
  const { getTodayPrepItems } = usePrepStore();
  const todayPrepItems = getTodayPrepItems();
  const { students } = useStudentStore();
  const [activeMeal, setActiveMeal] = useState<MealType>('lunch');
  const [activeStatusFilter, setActiveStatusFilter] = useState<PickupStatus | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState<string | null>(null);
  const [exceptionType, setExceptionType] = useState<'not_picked' | 'wrong_pick' | 'leave'>('not_picked');
  const [exceptionNotes, setExceptionNotes] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [pickedBy, setPickedBy] = useState<'student' | 'teacher'>('teacher');
  const [pickedByName, setPickedByName] = useState('');

  const stats = getTodayStats();
  const todayRecords = getTodayRecords();

  const mealRecords = todayRecords.filter((r) => r.mealType === activeMeal);
  const mealPrepItems = todayPrepItems.filter((p) => p.mealType === activeMeal);

  const allRecords = mealPrepItems.map((prep) => {
    const record = mealRecords.find((r) => r.prepItemId === prep.id);
    const student = students.find((s) => s.id === prep.studentId);
    return {
      prep,
      record,
      student,
      status: record?.status || 'not_picked',
    };
  });

  const filteredRecords = allRecords.filter((item) => {
    if (activeStatusFilter !== 'all' && item.status !== activeStatusFilter) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      return (
        item.prep.studentName.toLowerCase().includes(kw) ||
        item.prep.className.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const handleScan = () => {
    const mockQr = mealPrepItems[Math.floor(Math.random() * mealPrepItems.length)]?.qrCode;
    if (mockQr) {
      const result = scanQrCode(mockQr, pickedBy, pickedByName || '系统管理员');
      setScanResult(result);
      setTimeout(() => setScanResult(null), 2000);
    }
  };

  const handleManualPickup = (studentId: string, prepItemId: string) => {
    manualPickup(studentId, prepItemId, activeMeal, pickedBy, pickedByName || '系统管理员');
  };

  const handleRecordException = (prepItemId: string, studentId: string) => {
    recordException(studentId, prepItemId, activeMeal, exceptionType, exceptionNotes);
    setShowExceptionModal(null);
    setExceptionNotes('');
  };

  const statusFilters: { key: PickupStatus | 'all'; label: string; count: number; className: string }[] = [
    { key: 'all', label: '全部', count: allRecords.length, className: 'bg-slate-100 text-slate-700' },
    { key: 'picked', label: '已领取', count: stats.picked, className: 'bg-primary-100 text-primary-700' },
    { key: 'not_picked', label: '未领取', count: stats.notPicked, className: 'bg-warning-100 text-warning-700' },
    { key: 'wrong_pick', label: '错领', count: stats.wrongPick, className: 'bg-danger-100 text-danger-700' },
    { key: 'leave', label: '请假', count: stats.leave, className: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-slate-800 mb-4">扫码领取</h3>
              <button
                onClick={() => setShowScanModal(true)}
                className="w-full bg-gradient-to-br from-primary-500 to-info-500 text-white rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <ScanQrCode size={32} />
                </div>
                <p className="font-semibold">扫描餐品二维码</p>
                <p className="text-xs text-white/80">快速确认领取</p>
              </button>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="label">领取人身份</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPickedBy('student')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pickedBy === 'student'
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      学生本人
                    </button>
                    <button
                      onClick={() => setPickedBy('teacher')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pickedBy === 'teacher'
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      老师代领
                    </button>
                  </div>
                </div>
                {pickedBy === 'teacher' && (
                  <div>
                    <label className="label">老师姓名</label>
                    <input
                      type="text"
                      value={pickedByName}
                      onChange={(e) => setPickedByName(e.target.value)}
                      className="input"
                      placeholder="请输入老师姓名"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-slate-800 mb-3">今日统计</h3>
              <div className="space-y-2.5">
                {statusFilters.slice(1).map((filter) => (
                  <div key={filter.key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{filter.label}</span>
                    <span className={`badge ${filter.className}`}>{filter.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
                    const meta = MEAL_TYPE_META[meal];
                    const isActive = activeMeal === meal;
                    return (
                      <button
                        key={meal}
                        onClick={() => setActiveMeal(meal)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{meta.icon}</span>
                        <span>{meta.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索学生姓名、班级..."
                    className="pl-9 pr-4 py-2 w-56 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveStatusFilter(filter.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeStatusFilter === filter.key
                        ? `${filter.className} ring-2 ring-offset-1 ring-slate-300`
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-auto">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(({ prep, record, student, status }) => {
                  const statusMeta = PICKUP_STATUS_META[status];
                  const StatusIcon =
                    status === 'picked'
                      ? CheckCircle2
                      : status === 'wrong_pick'
                      ? AlertTriangle
                      : status === 'leave'
                      ? CalendarClock
                      : XCircle;

                  return (
                    <div
                      key={prep.id}
                      className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                        status === 'picked' ? 'bg-primary-50/30' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-info-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {prep.studentName.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-800">{prep.studentName}</p>
                          <span className={`badge ${statusMeta.className}`}>
                            <StatusIcon size={12} className="mr-1" />
                            {statusMeta.name}
                          </span>
                          <span className="text-xs text-slate-400">{prep.className}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">
                            <span className="line-through opacity-60">{prep.originalDish}</span>
                            <span className="mx-1">→</span>
                            <span className="text-primary-600 font-medium">{prep.replacementDish}</span>
                          </span>
                          {student && (
                            <div className="flex gap-1">
                              {student.allergies.slice(0, 2).map((a) => (
                                <AllergyBadge key={a.id} type={a.type} size="sm" showIcon={false} />
                              ))}
                            </div>
                          )}
                        </div>
                        {record?.pickedAt && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            {record.pickedBy === 'teacher' ? <User size={10} className="inline mr-1" /> : null}
                            {record.pickedByName} · {formatDateTime(record.pickedAt)}
                          </p>
                        )}
                        {record?.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded inline-block">
                            {record.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {status === 'not_picked' && (
                          <>
                            <button
                              onClick={() => handleManualPickup(prep.studentId, prep.id)}
                              className="btn-primary !px-3 !py-1.5 !text-xs"
                            >
                              <CheckCircle2 size={14} />
                              确认领取
                            </button>
                            <button
                              onClick={() => {
                                setShowExceptionModal(prep.id);
                                setExceptionType('not_picked');
                              }}
                              className="btn-secondary !px-3 !py-1.5 !text-xs"
                            >
                              异常登记
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-16 text-center text-slate-400">
                  <p>没有找到符合条件的领取记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showScanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ScanQrCode className="text-primary-500" />
              扫码领取
            </h3>

            <div className="relative bg-slate-50 rounded-xl aspect-square flex items-center justify-center mb-4 overflow-hidden">
              <div className="absolute inset-8 border-2 border-dashed border-primary-300 rounded-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={48} className="text-slate-300" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-pulse" />
              </div>
              {scanResult && (
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    scanResult.success ? 'bg-primary-500/90' : 'bg-danger-500/90'
                  }`}
                >
                  <div className="text-center text-white">
                    {scanResult.success ? (
                      <CheckCircle2 size={48} className="mx-auto mb-2" />
                    ) : (
                      <AlertTriangle size={48} className="mx-auto mb-2" />
                    )}
                    <p className="font-medium">{scanResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-500 text-center mb-4">
              将餐品二维码对准扫描框
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScanModal(false)}
                className="btn-secondary flex-1"
              >
                关闭
              </button>
              <button
                onClick={handleScan}
                className="btn-primary flex-1"
              >
                模拟扫描
              </button>
            </div>
          </div>
        </div>
      )}

      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">异常登记</h3>

            <div className="space-y-4">
              <div>
                <label className="label">异常类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'not_picked', label: '未领取', icon: XCircle, className: 'warning' },
                    { key: 'wrong_pick', label: '错领', icon: AlertTriangle, className: 'danger' },
                    { key: 'leave', label: '请假', icon: CalendarClock, className: 'slate' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = exceptionType === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setExceptionType(item.key as any)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          isActive
                            ? item.className === 'danger'
                              ? 'border-danger-400 bg-danger-50'
                              : item.className === 'warning'
                              ? 'border-warning-400 bg-warning-50'
                              : 'border-slate-400 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon size={20} className={isActive ? 'text-slate-700' : 'text-slate-400'} />
                        <span className={`text-xs font-medium ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label">备注说明</label>
                <textarea
                  value={exceptionNotes}
                  onChange={(e) => setExceptionNotes(e.target.value)}
                  rows={3}
                  className="input resize-none"
                  placeholder="请输入异常情况说明..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowExceptionModal(null);
                  setExceptionNotes('');
                }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const prep = mealPrepItems.find((p) => p.id === showExceptionModal);
                  if (prep) {
                    handleRecordException(prep.id, prep.studentId);
                  }
                }}
                className="btn-danger flex-1"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
