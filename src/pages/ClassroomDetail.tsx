import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  MapPin,
  Ruler,
  Calendar,
  Users,
  Building2,
  ClipboardList,
  Wrench,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import { formatDate, formatDateTime, getFloorLifeRemaining, isFloorLifeWarning } from '@/utils/dateUtils';
import { INSPECTION_ITEM_LABELS } from '@/types';

type TabType = 'info' | 'inspections' | 'repairs';

export default function ClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClassroomById, getInspectionsByClassroom, getRepairsByClassroom } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [photoIndex, setPhotoIndex] = useState(0);

  const classroom = getClassroomById(id || '');
  const inspections = getInspectionsByClassroom(id || '');
  const repairs = getRepairsByClassroom(id || '');

  if (!classroom) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">教室不存在</p>
        <button
          onClick={() => navigate('/classrooms')}
          className="mt-4 text-teal-600 font-medium"
        >
          返回列表
        </button>
      </div>
    );
  }

  const lifeWarning = isFloorLifeWarning(classroom.installDate);
  const lifeRemaining = getFloorLifeRemaining(classroom.installDate);

  const inspectionTimeline = inspections.map((i) => ({
    id: i.id,
    title: `巡检 - ${i.classroomName}`,
    description: i.notes || `整体状态：${i.overallStatus === 'normal' ? '正常' : i.overallStatus === 'warning' ? '预警' : '严重'}，巡检人：${i.inspectorName}`,
    time: formatDateTime(i.createdAt),
    status: 'completed' as const,
    type: 'inspection' as const,
  }));

  const repairTimeline = repairs.map((r) => {
    const status: 'completed' | 'current' | 'pending' =
      r.status === 'completed' ? 'completed' : r.status === 'in_progress' ? 'current' : 'pending';
    return {
      id: r.id,
      title: `维修 - ${r.description || r.classroomName}`,
      description: r.workerName ? `施工人：${r.workerName}` : '待分配',
      time: formatDateTime(r.updatedAt),
      status,
      type: 'repair' as const,
    };
  });

  const prevPhoto = () => {
    setPhotoIndex((prev) => (prev === 0 ? classroom.photos.length - 1 : prev - 1));
  };

  const nextPhoto = () => {
    setPhotoIndex((prev) => (prev === classroom.photos.length - 1 ? 0 : prev + 1));
  };

  const tabs = [
    { id: 'info', label: '档案信息', icon: Building2 },
    { id: 'inspections', label: '巡检记录', icon: ClipboardList, count: inspections.length },
    { id: 'repairs', label: '维修记录', icon: Wrench, count: repairs.length },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/classrooms')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">返回教室列表</span>
      </button>

      {/* Header with photo */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="relative h-64 sm:h-80">
          <img
            src={classroom.photos[photoIndex]}
            alt={classroom.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          {/* Photo navigation */}
          {classroom.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {classroom.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === photoIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{classroom.name}</h1>
                  <StatusBadge status={classroom.status} type="classroom" />
                </div>
                <p className="text-white/80 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {classroom.floor}楼
                </p>
              </div>
              <button
                onClick={() => navigate(`/classrooms/${classroom.id}/edit`)}
                className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-4 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-teal-600 border-teal-600'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-bold text-slate-800 mb-4">基本信息</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Ruler className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">教室面积</p>
                        <p className="font-medium text-slate-800">{classroom.area} 平方米</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building2 className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">地胶品牌</p>
                        <p className="font-medium text-slate-800">{classroom.floorBrand}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Calendar className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">安装日期</p>
                        <p className="font-medium text-slate-800">{formatDate(classroom.installDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Users className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">使用社团</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {classroom.clubs.map((club) => (
                            <span
                              key={club}
                              className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full"
                            >
                              {club}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent inspections summary */}
                {inspections.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h3 className="font-bold text-slate-800 mb-4">最近巡检结果</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {inspections[0].items.map((item) => (
                        <div
                          key={item.type}
                          className={`p-3 rounded-lg text-center ${
                            item.status === 'normal'
                              ? 'bg-emerald-50'
                              : item.status === 'warning'
                              ? 'bg-amber-50'
                              : 'bg-rose-50'
                          }`}
                        >
                          <p
                            className={`text-xs font-medium ${
                              item.status === 'normal'
                                ? 'text-emerald-600'
                                : item.status === 'warning'
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {INSPECTION_ITEM_LABELS[item.type]}
                          </p>
                          <p className="text-lg font-bold mt-1">
                            {item.status === 'normal' ? '✓' : item.severity || '!'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveTab('inspections')}
                      className="mt-4 text-sm text-teal-600 font-medium hover:text-teal-700"
                    >
                      查看全部巡检记录 →
                    </button>
                  </div>
                )}
              </div>

              {/* Side info */}
              <div className="space-y-4">
                {/* Floor life */}
                <div
                  className={`rounded-xl p-5 border ${
                    lifeWarning
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock
                      className={`w-5 h-5 ${
                        lifeWarning ? 'text-amber-600' : 'text-slate-500'
                      }`}
                    />
                    <h3
                      className={`font-bold ${
                        lifeWarning ? 'text-amber-800' : 'text-slate-700'
                      }`}
                    >
                      地胶寿命
                    </h3>
                  </div>
                  {lifeWarning ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-700 font-medium">即将到期</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-800">
                        {lifeRemaining.years}年{lifeRemaining.months}月
                      </p>
                      <p className="text-sm text-amber-600 mt-1">
                        设计寿命5年，建议提前规划更换
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-slate-700">
                        {lifeRemaining.years}年{lifeRemaining.months}月
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        剩余使用寿命
                      </p>
                    </>
                  )}
                </div>

                {/* Quick actions */}
                <div className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-bold text-slate-700 mb-3">快捷操作</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/inspections/new', { state: { classroomId: classroom.id } })}
                      className="w-full py-2.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      开始巡检
                    </button>
                    <button
                      onClick={() => navigate('/repairs/new')}
                      className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      创建维修单
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inspections' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">共 {inspections.length} 条巡检记录</p>
                <button
                  onClick={() => navigate('/inspections/new', { state: { classroomId: classroom.id } })}
                  className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增巡检
                </button>
              </div>
              {inspections.length === 0 ? (
                <p className="text-center text-slate-400 py-8">暂无巡检记录</p>
              ) : (
                <Timeline items={inspectionTimeline} />
              )}
            </div>
          )}

          {activeTab === 'repairs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">共 {repairs.length} 条维修记录</p>
                <button
                  onClick={() => {}}
                  className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  新增维修
                </button>
              </div>
              {repairs.length === 0 ? (
                <p className="text-center text-slate-400 py-8">暂无维修记录</p>
              ) : (
                <Timeline items={repairTimeline} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
