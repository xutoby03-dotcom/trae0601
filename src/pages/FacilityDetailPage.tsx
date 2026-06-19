import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, MapPin, Calendar, Building2, Shield, Clock, Wrench, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { StatusBadge } from '@/components/Status/StatusBadge';
import { FACILITY_TYPE_LABELS } from '@/types';
import { formatDate, formatDateTime } from '@/utils';

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFacility, getInspectionsByFacility, getIssuesByFacility, getRepairsByFacility, deleteFacility } = useAppStore();
  
  const facility = id ? getFacility(id) : undefined;
  const inspections = id ? getInspectionsByFacility(id) : [];
  const issues = id ? getIssuesByFacility(id) : [];
  const repairs = id ? getRepairsByFacility(id) : [];

  if (!facility) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-500 mb-4">设施不存在</p>
        <Link to="/facilities" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除该设施吗？相关巡检、问题和维修记录也将受到影响。')) {
      if (id) {
        deleteFacility(id);
        navigate('/facilities');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/facilities" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回设施列表
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/facilities/${id}/edit`} className="btn-secondary inline-flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            编辑
          </Link>
          <button onClick={handleDelete} className="btn-danger inline-flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {/* Facility Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo & Basic */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card overflow-hidden">
            <div className="relative h-64">
              <img src={facility.photo} alt={facility.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <StatusBadge type="facility" value={facility.status} />
              </div>
            </div>
            <div className="p-5">
              <h1 className="font-display text-2xl text-gray-800 mb-1">{facility.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {facility.location}
              </p>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                设施类型
              </span>
              <span className="font-medium text-gray-800">{FACILITY_TYPE_LABELS[facility.type]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                材质
              </span>
              <span className="font-medium text-gray-800">{facility.material}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                适用年龄
              </span>
              <span className="font-medium text-gray-800">{facility.ageRange}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                安装日期
              </span>
              <span className="font-medium text-gray-800">{formatDate(facility.installDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                维保单位
              </span>
              <span className="font-medium text-gray-800 text-sm">{facility.maintenanceUnit}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500">上次巡检</span>
                <span className="font-medium text-gray-800">{formatDate(facility.lastInspectionDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">下次巡检</span>
                <span className="font-medium text-primary-600">{formatDate(facility.nextInspectionDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inspections */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-500" />
              巡检记录
              <span className="ml-2 text-sm font-sans text-gray-400">共 {inspections.length} 条</span>
            </h2>
            {inspections.length === 0 ? (
              <p className="text-gray-400 text-center py-6">暂无巡检记录</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-auto scrollbar-thin">
                {inspections.slice().reverse().map((ins) => (
                  <Link key={ins.id} to={`/inspections/${ins.id}`} className="block p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{formatDateTime(ins.inspectionDate)}</span>
                      <StatusBadge type="issue-status" value={ins.status === 'completed' ? 'resolved' : 'pending'} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>巡检人：{ins.inspector}</span>
                      <span>异常项：{ins.items.filter((i) => !i.isNormal).length} 项</span>
                    </div>
                    {ins.remark && <p className="text-sm text-gray-600 mt-2">{ins.remark}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Issues */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              问题记录
              <span className="ml-2 text-sm font-sans text-gray-400">共 {issues.length} 条</span>
            </h2>
            {issues.length === 0 ? (
              <p className="text-gray-400 text-center py-6">暂无问题记录</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-auto scrollbar-thin">
                {issues.slice().reverse().map((issue) => (
                  <div key={issue.id} className="p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{issue.title}</span>
                      <div className="flex items-center gap-2">
                        {issue.level && <StatusBadge type="issue-level" value={issue.level} />}
                        <StatusBadge type="issue-status" value={issue.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span>上报人：{issue.reporter}</span>
                      <span>{formatDate(issue.reportDate)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repairs */}
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-500" />
              维修记录
              <span className="ml-2 text-sm font-sans text-gray-400">共 {repairs.length} 条</span>
            </h2>
            {repairs.length === 0 ? (
              <p className="text-gray-400 text-center py-6">暂无维修记录</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-auto scrollbar-thin">
                {repairs.slice().reverse().map((repair) => (
                  <div key={repair.id} className="p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{repair.title}</span>
                      <StatusBadge type="repair-status" value={repair.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span>处理人：{repair.handler}</span>
                      <span>{formatDate(repair.repairDate)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{repair.result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
