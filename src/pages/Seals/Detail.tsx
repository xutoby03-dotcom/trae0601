import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, FileText, ShieldAlert, Hash, Image } from 'lucide-react';
import { useStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, formatDateOnly } from '@/utils/helpers';

export default function SealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getSealById = useStore((s) => s.getSealById);
  const deleteSeal = useStore((s) => s.deleteSeal);
  const records = useStore((s) => s.records);
  const applications = useStore((s) => s.applications);

  const seal = id ? getSealById(id) : undefined;

  const sealRecords = useMemo(() => {
    if (!id) return [];
    return records
      .filter((r) => r.sealId === id)
      .sort((a, b) => new Date(b.checkoutTime).getTime() - new Date(a.checkoutTime).getTime());
  }, [records, id]);

  if (!seal) {
    return (
      <div className="card-seal p-16 text-center">
        <p className="text-primary-500">印章不存在</p>
        <button className="btn-ghost mt-4" onClick={() => navigate('/seals')}>
          返回列表
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('确定要删除该印章吗？此操作不可恢复。')) {
      deleteSeal(seal.id);
      navigate('/seals');
    }
  };

  const getApplicationInfo = (applicationId: string) => {
    return applications.find((a) => a.id === applicationId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-ghost p-2" onClick={() => navigate('/seals')}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-800">{seal.type}</h1>
            <p className="text-sm text-primary-500 mt-1">编号：{seal.sealNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => navigate(`/seals/${seal.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
          <button className="btn-danger flex items-center gap-2" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-seal p-6">
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-seal-paper border border-primary-100">
            <img
              src={seal.photoUrl}
              alt={seal.type}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge type="seal" status={seal.status} />
              <StatusBadge type="risk" status={seal.riskLevel} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-seal p-6">
            <h2 className="section-title">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label-seal flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-gold-500" />
                  印章编号
                </label>
                <p className="text-primary-800 font-medium">{seal.sealNumber}</p>
              </div>
              <div>
                <label className="label-seal flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gold-500" />
                  保管人
                </label>
                <p className="text-primary-800 font-medium">{seal.custodian}</p>
              </div>
              <div>
                <label className="label-seal flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-gold-500" />
                  风险等级
                </label>
                <StatusBadge type="risk" status={seal.riskLevel} />
              </div>
              <div>
                <label className="label-seal flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-gold-500" />
                  状态
                </label>
                <StatusBadge type="seal" status={seal.status} />
              </div>
              <div className="md:col-span-2">
                <label className="label-seal flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gold-500" />
                  适用范围
                </label>
                <p className="text-primary-800 bg-seal-paper rounded-lg p-3 border border-primary-50">
                  {seal.scope}
                </p>
              </div>
              <div>
                <label className="label-seal">建档时间</label>
                <p className="text-primary-600">{formatDate(seal.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="card-seal p-6">
            <h2 className="section-title">历史外带记录</h2>
            {sealRecords.length === 0 ? (
              <p className="text-primary-400 text-center py-8">暂无外带记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-100">
                      <th className="text-left py-3 px-3 text-sm font-medium text-primary-600">外带时间</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-primary-600">申请人</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-primary-600">用途</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-primary-600">预计归还</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-primary-600">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sealRecords.map((record) => {
                      const app = getApplicationInfo(record.applicationId);
                      return (
                        <tr key={record.id} className="border-b border-primary-50 hover:bg-seal-paper">
                          <td className="py-3 px-3 text-sm text-primary-800">
                            {formatDateOnly(record.checkoutTime)}
                          </td>
                          <td className="py-3 px-3 text-sm text-primary-800">{app?.applicant || '-'}</td>
                          <td className="py-3 px-3 text-sm text-primary-600 max-w-[200px] truncate">
                            {app?.purpose || '-'}
                          </td>
                          <td className="py-3 px-3 text-sm text-primary-600">
                            {app ? formatDateOnly(app.expectedReturn) : '-'}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge type="record" status={record.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
