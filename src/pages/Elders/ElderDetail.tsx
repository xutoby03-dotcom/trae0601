import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Smartphone,
  Home,
  Eye,
  Ear,
  User,
  PhoneCall,
  FileText,
  Calendar,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useElderStore } from '@/store/elderStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useCourseStore } from '@/store/courseStore';
import { formatDate, formatDateTime } from '@/utils/format';
import { PHONE_SYSTEM_MAP } from '@/types';

export default function ElderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getElderById, deleteElder } = useElderStore();
  const { getAttendancesByElderId } = useAttendanceStore();
  const { getRegistrationsByElderId } = useRegistrationStore();
  const { getCourseById } = useCourseStore();

  const elder = id ? getElderById(id) : undefined;
  const attendances = id ? getAttendancesByElderId(id) : [];
  const registrations = id ? getRegistrationsByElderId(id) : [];

  if (!elder) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">老人不存在</p>
        <Link to="/elders" className="btn-primary mt-4">
          返回列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除这位老人的档案吗？此操作不可撤销。')) {
      deleteElder(elder.id);
      navigate('/elders');
    }
  };

  const infoGroups = [
    {
      title: '基本信息',
      icon: User,
      items: [
        { label: '姓名', value: elder.name },
        { label: '性别', value: elder.gender === 'male' ? '男' : '女' },
        { label: '年龄', value: `${elder.age}岁` },
        { label: '手机号', value: elder.phone },
      ],
    },
    {
      title: '手机信息',
      icon: Smartphone,
      items: [
        { label: '手机型号', value: elder.phoneModel || '未填写' },
        { label: '手机系统', value: PHONE_SYSTEM_MAP[elder.phoneSystem] || '未填写' },
        { label: '常用软件', value: elder.commonApps || '未填写' },
      ],
    },
    {
      title: '健康状况',
      icon: Eye,
      items: [
        { label: '视力情况', value: elder.vision || '正常' },
        { label: '听力情况', value: elder.hearing || '正常' },
      ],
    },
    {
      title: '联系信息',
      icon: Home,
      items: [
        { label: '居住地址', value: elder.address || '未填写' },
        { label: '紧急联系人', value: elder.emergencyContact || '未填写' },
        { label: '紧急电话', value: elder.emergencyPhone || '未填写' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/elders" className="btn-ghost -ml-2">
            <ArrowLeft size={20} />
            返回
          </Link>
          <h1 className="text-2xl font-bold text-neutral-800">老人详情</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/elders/${elder.id}/edit`} className="btn-secondary">
            <Edit size={18} />
            编辑
          </Link>
          <button onClick={handleDelete} className="btn-ghost text-red-500 hover:bg-red-50">
            <Trash2 size={18} />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <img
              src={elder.avatar}
              alt={elder.name}
              className="w-24 h-24 rounded-2xl mx-auto object-cover"
            />
            <h2 className="text-xl font-bold text-neutral-800 mt-4">{elder.name}</h2>
            <p className="text-neutral-500">{elder.age}岁 · {elder.gender === 'male' ? '男' : '女'}</p>
            
            {elder.needHomeVisit && (
              <div className="mt-4 p-3 bg-warning-50 rounded-xl flex items-center justify-center gap-2 text-warning-600">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">需要上门辅导</span>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-neutral-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">{registrations.length}</p>
                  <p className="text-sm text-neutral-500">报名课程</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success-600">{attendances.length}</p>
                  <p className="text-sm text-neutral-500">上课次数</p>
                </div>
              </div>
            </div>

            {elder.notes && (
              <div className="mt-6 pt-6 border-t border-neutral-100 text-left">
                <p className="text-sm font-medium text-neutral-700 mb-2">备注</p>
                <p className="text-sm text-neutral-600">{elder.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {infoGroups.map((group, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <group.icon size={20} className="text-primary-500" />
                <h3 className="font-semibold text-neutral-800">{group.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p className="text-sm text-neutral-500 mb-1">{item.label}</p>
                    <p className="text-neutral-800 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary-500" />
                <h3 className="font-semibold text-neutral-800">报名记录</h3>
              </div>
              <span className="text-sm text-neutral-500">共 {registrations.length} 条</span>
            </div>
            {registrations.length === 0 ? (
              <p className="text-neutral-400 text-center py-6">暂无报名记录</p>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => {
                  const course = getCourseById(reg.courseId);
                  return (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">{course?.title || '未知课程'}</p>
                        <p className="text-sm text-neutral-500">
                          报名时间：{formatDate(reg.createdAt)}
                        </p>
                      </div>
                      <span className={`tag ${
                        reg.status === 'confirmed' ? 'bg-success-100 text-success-600' :
                        reg.status === 'waitlist' ? 'bg-warning-100 text-warning-600' :
                        reg.status === 'completed' ? 'bg-primary-100 text-primary-600' :
                        'bg-neutral-100 text-neutral-600'
                      }`}>
                        {reg.status === 'confirmed' ? '已报名' :
                         reg.status === 'waitlist' ? `候补 #${reg.waitlistPosition}` :
                         reg.status === 'completed' ? '已完成' : '已取消'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary-500" />
                <h3 className="font-semibold text-neutral-800">学习记录</h3>
              </div>
              <span className="text-sm text-neutral-500">共 {attendances.length} 条</span>
            </div>
            {attendances.length === 0 ? (
              <p className="text-neutral-400 text-center py-6">暂无学习记录</p>
            ) : (
              <div className="space-y-3">
                {attendances.map((att) => {
                  const course = getCourseById(att.courseId);
                  return (
                    <Link
                      key={att.id}
                      to={`/attendance/${att.id}`}
                      className="block p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-800">{course?.title || '未知课程'}</p>
                          <p className="text-sm text-neutral-500">
                            {formatDateTime(att.checkInTime)} · {att.volunteerName}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-neutral-400" />
                      </div>
                      {att.learnedFunctions && (
                        <p className="text-sm text-success-600 mt-2">
                          ✓ 学会：{att.learnedFunctions}
                        </p>
                      )}
                      {att.stuckProblems && (
                        <p className="text-sm text-warning-600 mt-1">
                          ⚠ 问题：{att.stuckProblems}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
