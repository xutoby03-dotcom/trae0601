import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  User,
  UserCheck,
  Droplets,
  Clock,
  Calendar,
  MapPin,
  Box,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UsageRecord, DisinfectionTask } from '@shared/types';
import { UsageBadge, MaskBadge, DisinfectionBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { formatDateTime, formatDuration } from '@/lib/format';
import { useAppStore } from '@/store';

function UsageDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    devices,
    disinfectionRecords,
    fetchUsages,
    fetchDevices,
    fetchDisinfectionRecords,
  } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [disinfection, setDisinfection] = useState<DisinfectionTask | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsages(), fetchDevices(), fetchDisinfectionRecords()]);
      const data = await api.getUsage(id!);
      setUsage(data);
      const related = disinfectionRecords.find((t) => t.usageId === id);
      setDisinfection(related || null);
    } catch (err: any) {
      alert(err.message);
      navigate('/usage');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full mr-3" />
        <span className="text-slate-600">加载中...</span>
      </div>
    );
  }

  if (!usage) return null;

  const device = devices.find((d) => d.id === usage.deviceId);

  const infoCards = [
    {
      title: '设备信息',
      icon: Box,
      color: 'bg-blue-100 text-blue-600',
      items: [
        { label: '设备编号', value: usage.deviceCode || '-' },
        { label: '品牌型号', value: device ? `${device.brand} ${device.model}` : '-' },
        { label: '所在诊室', value: device?.clinicRoom || '-' },
      ],
    },
    {
      title: '患者信息',
      icon: User,
      color: 'bg-purple-100 text-purple-600',
      items: [
        { label: '姓名', value: usage.patientName },
        { label: '年龄', value: `${usage.patientAge}岁` },
      ],
    },
    {
      title: '治疗信息',
      icon: Droplets,
      color: 'bg-teal-100 text-teal-600',
      items: [
        { label: '主治医生', value: usage.doctor, icon: UserCheck },
        { label: '药液名称', value: usage.medicine },
        { label: '药液剂量', value: `${usage.medicineDose}ml` },
        { label: '面罩类型', value: <MaskBadge type={usage.maskType} /> as any, isBadge: true },
      ],
    },
    {
      title: '时间信息',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
      items: [
        { label: '开始时间', value: formatDateTime(usage.startTime), icon: Clock },
        { label: '结束时间', value: usage.endTime ? formatDateTime(usage.endTime) : '进行中' },
        { label: '总时长', value: formatDuration(usage.durationMinutes), icon: Activity },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/usage')} className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2 rounded-lg bg-indigo-100">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">使用记录详情</h1>
            <p className="text-sm text-slate-500">{usage.deviceCode}</p>
          </div>
        </div>
        <UsageBadge status={usage.status} className="!text-sm !py-1 !px-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {infoCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              </div>
              <div className="space-y-4">
                {card.items.map((item) => (
                  <div key={item.label} className="flex items-start justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      {item.icon && <item.icon className="w-3.5 h-3.5" />}
                      {item.label}
                    </span>
                    <span className={`text-sm font-medium text-slate-800 ${item.isBadge ? '' : 'text-right'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {disinfection && (
        <div className="card border-teal-200 bg-teal-50/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-teal-100">
                <ExternalLink className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">关联消毒任务</h3>
                <p className="text-sm text-slate-500 mb-3">
                  该使用记录已创建消毒任务
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">消毒状态</p>
                    <DisinfectionBadge status={disinfection.status} className="!text-sm !py-1" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">创建时间</p>
                    <p className="text-sm font-medium text-slate-800">
                      {formatDateTime(disinfection.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">当前进度</p>
                    <p className="text-sm font-medium text-slate-800">
                      {disinfection.currentStep} / 5 步骤
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Link to={`/disinfection/${disinfection.id}`} className="btn-primary">
              去消毒
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )}

      {usage.remark && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-600" />
            备注
          </h3>
          <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
            {usage.remark}
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Link to="/usage" className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回使用记录列表
        </Link>
      </div>
    </div>
  );
}

export default UsageDetailPage;
