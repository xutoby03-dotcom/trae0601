import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Upload,
  Save,
  CheckCircle2,
  Circle,
  AlertTriangle,
  X,
  Package,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDateDisplay,
  getTodayStr,
  checkInItemTypeIcon,
  handleFileUpload,
} from '@/utils';

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    getTaskById,
    getPetById,
    getTaskStatus,
    getTodayCheckIn,
    getCheckInItemsByCheckInId,
    getPhotosByCheckInId,
    addCheckIn,
    addCheckInItem,
    updateCheckInItem,
    updateCheckIn,
    addPhoto,
    deletePhoto,
    ensureTodayCheckIn,
  } = useAppStore();

  const task = id ? getTaskById(id) : undefined;
  const pet = task ? getPetById(task.petId) : undefined;
  const status = task ? getTaskStatus(task) : 'pending';
  const todayCheckin = id ? getTodayCheckIn(id) : null;

  const [checkinData, setCheckinData] = useState({
    notes: '',
    hasAnomaly: false,
    anomalyDescription: '',
    remainingFoodAmount: task?.initialFoodAmount || 0,
  });

  const [items, setItems] = useState(() => {
    if (todayCheckin && task) {
      return getCheckInItemsByCheckInId(todayCheckin.id);
    }
    return [];
  });

  const [photos, setPhotos] = useState(() => {
    if (todayCheckin) {
      return getPhotosByCheckInId(todayCheckin.id);
    }
    return [];
  });

  const [currentCheckinId, setCurrentCheckinId] = useState(todayCheckin?.id || '');

  useEffect(() => {
    if (task) {
      const checkin = ensureTodayCheckIn(task.id);
      if (checkin) {
        setCurrentCheckinId(checkin.id);
        setCheckinData({
          notes: checkin.notes,
          hasAnomaly: checkin.hasAnomaly,
          anomalyDescription: checkin.anomalyDescription,
          remainingFoodAmount: checkin.remainingFoodAmount,
        });
        setItems(getCheckInItemsByCheckInId(checkin.id));
        setPhotos(getPhotosByCheckInId(checkin.id));
      }
    }
  }, [task?.id]);

  useEffect(() => {
    if (currentCheckinId) {
      setItems(getCheckInItemsByCheckInId(currentCheckinId));
      setPhotos(getPhotosByCheckInId(currentCheckinId));
    }
  }, [currentCheckinId]);

  if (!task) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">找不到任务</h3>
        <Link to="/tasks" className="btn-secondary">返回任务列表</Link>
      </div>
    );
  }

  if (status !== 'active') {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          任务{status === 'pending' ? '尚未开始' : '已结束'}
        </h3>
        <p className="text-slate-500 mb-6">
          寄养时间：{formatDateDisplay(task.startDate)} ~ {formatDateDisplay(task.endDate)}
        </p>
        <Link to={`/tasks/${task.id}`} className="btn-secondary">返回任务详情</Link>
      </div>
    );
  }

  const handleToggleItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    updateCheckInItem(itemId, {
      completed: !item.completed,
      completedAt: !item.completed ? new Date().toISOString() : undefined,
    });
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              completed: !i.completed,
              completedAt: !i.completed ? new Date().toISOString() : undefined,
            }
          : i
      )
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentCheckinId) return;

    for (const file of Array.from(files)) {
      const url = await handleFileUpload(file);
      addPhoto({
        checkinId: currentCheckinId,
        photoUrl: url,
        caption: '',
      });
    }
    setPhotos(getPhotosByCheckInId(currentCheckinId));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSave = () => {
    if (!currentCheckinId) return;
    updateCheckIn(currentCheckinId, checkinData);
    navigate(`/tasks/${task.id}`);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const missedItems = items.filter((i) => !i.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to={`/tasks/${task.id}`}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">每日打卡</h1>
          <p className="text-slate-500 mt-0.5">
            {formatDateDisplay(getTodayStr())} · {pet?.name || '宠物'}
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save size={18} />
          保存
        </button>
      </div>

      {missedItems.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-red-700">还有 {missedItems.length} 项待完成！</h3>
            <p className="text-red-600 text-sm mt-1">
              {missedItems.map((item) => `${checkInItemTypeIcon[item.type]} ${item.label}`).join('、')}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">今日照料任务</h2>
          <div className="text-sm">
            <span className="text-slate-500">完成进度：</span>
            <span className="font-bold text-brand-600">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completedCount === totalCount ? 'bg-emerald-500' : 'bg-brand-500'
              }`}
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-slate-500 py-8">暂无待办事项</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  item.completed
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-brand-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  ) : (
                    <Circle size={28} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{checkInItemTypeIcon[item.type]}</span>
                    <span
                      className={`font-semibold ${
                        item.completed
                          ? 'text-slate-400 line-through'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    计划时间：{item.scheduledTime}
                    {item.completedAt &&
                      ` · 完成于 ${new Date(item.completedAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Camera size={20} className="text-brand-500" />
          打卡照片
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={photo.photoUrl}
                alt={photo.caption}
                className="w-full h-full rounded-xl object-cover border border-slate-200"
              />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <label className="aspect-square cursor-pointer">
            <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:bg-brand-50 transition-all">
              <Upload size={28} />
              <span className="text-xs mt-1">上传照片</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Package size={20} className="text-brand-500" />
          剩余粮量
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="0.1"
            className="input max-w-xs"
            value={checkinData.remainingFoodAmount}
            onChange={(e) =>
              setCheckinData((prev) => ({
                ...prev,
                remainingFoodAmount: parseFloat(e.target.value) || 0,
              }))
            }
          />
          <span className="text-slate-600">{task.foodUnit || '份'}</span>
          {task.initialFoodAmount > 0 && (
            <span className="text-sm text-slate-400">
              （初始：{task.initialFoodAmount}{task.foodUnit || '份'}，已消耗：
              {(task.initialFoodAmount - checkinData.remainingFoodAmount).toFixed(1)}
              {task.foodUnit || '份'}）
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-slate-800 mb-4">今日备注</h2>
        <textarea
          className="textarea"
          rows={3}
          value={checkinData.notes}
          onChange={(e) =>
            setCheckinData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="记录今天宠物的状态、心情、发生的事情..."
        />
      </div>

      <div className={`card ${checkinData.hasAnomaly ? 'border-2 border-red-200 bg-red-50' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() =>
              setCheckinData((prev) => ({ ...prev, hasAnomaly: !prev.hasAnomaly }))
            }
            className={`p-2 rounded-xl transition-all duration-200 ${
              checkinData.hasAnomaly
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">异常情况</h2>
            <p className="text-sm text-slate-500">
              如果宠物身体不适、行为异常等，请勾选并记录
            </p>
          </div>
        </div>

        {checkinData.hasAnomaly && (
          <textarea
            className="textarea bg-white"
            rows={3}
            value={checkinData.anomalyDescription}
            onChange={(e) =>
              setCheckinData((prev) => ({ ...prev, anomalyDescription: e.target.value }))
            }
            placeholder="请详细描述异常情况，如：食欲下降、呕吐、精神不佳等..."
          />
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Link to={`/tasks/${task.id}`} className="btn-ghost">
          取消
        </Link>
        <button onClick={handleSave} className="btn-primary">
          <Save size={18} />
          保存打卡记录
        </button>
      </div>
    </div>
  );
}
