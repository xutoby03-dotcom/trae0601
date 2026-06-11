import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Utensils,
  Footprints,
  Pill,
  AlertTriangle,
  ClipboardCheck,
  FileText,
  Package,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  statusLabel,
  statusColor,
  formatDateDisplay,
  getTodayStr,
  checkInItemTypeIcon,
} from '@/utils';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    getTaskById,
    getPetById,
    getTaskStatus,
    getCheckInsByTaskId,
    getCheckInItemsByCheckInId,
    getPhotosByCheckInId,
    getMissedItems,
    getTodayCheckIn,
    ensureTodayCheckIn,
  } = useAppStore();

  const task = id ? getTaskById(id) : undefined;
  const pet = task ? getPetById(task.petId) : undefined;
  const status = task ? getTaskStatus(task) : 'pending';
  const checkins = id ? getCheckInsByTaskId(id) : [];
  const today = getTodayStr();
  const missedItems = id ? getMissedItems(id, today) : [];
  const todayCheckin = id ? getTodayCheckIn(id) : null;

  useEffect(() => {
    if (task && status === 'active') {
      ensureTodayCheckIn(task.id);
    }
  }, [task?.id, status]);

  if (!task) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">找不到这个寄养任务</h3>
        <p className="text-slate-500 mb-6">可能已被删除</p>
        <Link to="/tasks" className="btn-secondary">返回任务列表</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tasks" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{task.title}</h1>
          <p className="text-slate-500 mt-0.5">
            {pet?.name || '宠物'} · 由 {task.caretakerName || '待定'} 照料
          </p>
        </div>
        <span className={`tag ${statusColor[status]} text-base`}>
          {statusLabel[status]}
        </span>
      </div>

      {missedItems.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-red-700">有 {missedItems.length} 项待办遗漏！</h3>
            <p className="text-red-600 text-sm mt-1">
              {missedItems.map((item) => `${checkInItemTypeIcon[item.type]} ${item.label}`).join('、')}
            </p>
          </div>
          <Link to={`/tasks/${task.id}/checkin`} className="btn-danger text-sm">
            立即处理
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand-500" />
              照料交接说明
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <Utensils className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-amber-800">喂食安排</h4>
                  <p className="text-amber-700 mt-0.5">
                    每天 {task.feedingTimesPerDay} 餐
                  </p>
                  {task.feedingNotes && (
                    <p className="text-amber-600 text-sm mt-1">{task.feedingNotes}</p>
                  )}
                  {pet?.foodBrand && (
                    <p className="text-amber-600 text-sm mt-1">
                      粮食品牌：{pet.foodBrand}
                      {pet.foodAmount && `（每顿 ${pet.foodAmount}）`}
                    </p>
                  )}
                </div>
              </div>

              {task.walkingRequirements && (
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                  <Footprints className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-emerald-800">遛弯要求</h4>
                    <p className="text-emerald-700 mt-0.5">{task.walkingRequirements}</p>
                  </div>
                </div>
              )}

              {task.medicationInstructions && (
                <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl">
                  <Pill className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-rose-800">用药提醒</h4>
                    <p className="text-rose-700 mt-0.5 whitespace-pre-wrap">
                      {task.medicationInstructions}
                    </p>
                  </div>
                </div>
              )}

              {pet?.allergies && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-red-800">⚠️ 过敏禁忌</h4>
                    <p className="text-red-700 mt-0.5 whitespace-pre-wrap">{pet.allergies}</p>
                  </div>
                </div>
              )}
            </div>

            {status === 'active' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                <Link to={`/tasks/${task.id}/checkin`} className="btn-primary flex-1 justify-center">
                  <ClipboardCheck size={18} />
                  {todayCheckin ? '继续今日打卡' : '开始今日打卡'}
                </Link>
              </div>
            )}

            {status === 'completed' && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                <Link to={`/tasks/${task.id}/review`} className="btn-primary flex-1 justify-center">
                  <FileText size={18} />
                  查看交接回顾
                </Link>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-brand-500" />
              打卡记录
            </h2>

            {checkins.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-slate-500">还没有打卡记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkins.map((checkin) => {
                  const items = getCheckInItemsByCheckInId(checkin.id);
                  const photos = getPhotosByCheckInId(checkin.id);
                  const completedCount = items.filter((i) => i.completed).length;
                  const totalCount = items.length;
                  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                  return (
                    <div
                      key={checkin.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800">
                          {formatDateDisplay(checkin.checkinDate)}
                        </h4>
                        {checkin.hasAnomaly && (
                          <span className="tag bg-red-100 text-red-700">
                            <AlertTriangle size={12} />
                            有异常
                          </span>
                        )}
                      </div>

                      {totalCount > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">完成进度</span>
                            <span className="font-medium text-slate-800">
                              {completedCount}/{totalCount}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {items.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {items.map((item) => (
                            <span
                              key={item.id}
                              className={`tag text-xs ${
                                item.completed
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {checkInItemTypeIcon[item.type]} {item.label}
                              {item.completed ? ' ✓' : ''}
                            </span>
                          ))}
                        </div>
                      )}

                      {photos.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                          {photos.map((photo) => (
                            <img
                              key={photo.id}
                              src={photo.photoUrl}
                              alt={photo.caption}
                              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                            />
                          ))}
                        </div>
                      )}

                      {checkin.notes && (
                        <p className="text-sm text-slate-600 bg-white p-3 rounded-xl">
                          {checkin.notes}
                        </p>
                      )}

                      {checkin.hasAnomaly && checkin.anomalyDescription && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mt-2 border border-red-100">
                          ⚠️ {checkin.anomalyDescription}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {pet && (
            <div className="card">
              <h2 className="text-lg font-bold text-slate-800 mb-4">宠物信息</h2>
              <div className="flex items-center gap-4">
                {pet.avatarUrl ? (
                  <img
                    src={pet.avatarUrl}
                    alt={pet.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-3xl">
                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800">{pet.name}</h3>
                  <p className="text-sm text-slate-500">{pet.breed || ''} {pet.age}岁</p>
                </div>
              </div>
              <Link to={`/pets/${pet.id}`} className="btn-secondary w-full mt-4 justify-center text-sm">
                查看完整资料
              </Link>
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-brand-500" />
              寄养时间
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="tag bg-emerald-100 text-emerald-700">开始</span>
                <span className="text-slate-700 font-medium">{formatDateDisplay(task.startDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tag bg-slate-100 text-slate-600">结束</span>
                <span className="text-slate-700 font-medium">{formatDateDisplay(task.endDate)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-brand-500" />
              联系人信息
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">接手人</p>
                <p className="font-medium text-slate-800">{task.caretakerName || '待定'}</p>
                {task.caretakerPhone && (
                  <a
                    href={`tel:${task.caretakerPhone}`}
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm mt-1"
                  >
                    <Phone size={14} />
                    {task.caretakerPhone}
                  </a>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-1">紧急联系人</p>
                <p className="font-medium text-slate-800">
                  {task.emergencyContactName || '待定'}
                </p>
                {task.emergencyContactPhone && (
                  <a
                    href={`tel:${task.emergencyContactPhone}`}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm mt-1 font-medium"
                  >
                    <Phone size={14} />
                    {task.emergencyContactPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-brand-500" />
              物资情况
            </h2>
            <div>
              <p className="text-sm text-slate-500 mb-1">初始粮食量</p>
              <p className="font-medium text-slate-800">
                {task.initialFoodAmount} {task.foodUnit || '份'}
              </p>
              {checkins.length > 0 && (
                <p className="text-sm text-slate-500 mt-2">
                  上次记录剩余：{checkins[0].remainingFoodAmount} {task.foodUnit || '份'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
