import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Phone, Pill, Target, UserCircle } from "lucide-react";
import { useAppStore } from "@/store";

export default function ProfilesList() {
  const navigate = useNavigate();
  const { profiles, deleteProfile, records } = useAppStore();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除 ${name} 的档案吗？相关血压记录也会被删除。`)) {
      deleteProfile(id);
    }
  };

  const getRecordCount = (elderId: string) => {
    return records.filter((r) => r.elderId === elderId && !r.originalRecordId).length;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">老人档案</h1>
          <p className="text-gray-500 mt-1">管理家中老人的健康档案信息</p>
        </div>
        <button onClick={() => navigate("/profiles/new")} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增档案
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="card text-center py-16">
          <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">还没有老人档案</h3>
          <p className="text-gray-500 mb-6">添加第一位老人的健康档案开始记录吧</p>
          <button onClick={() => navigate("/profiles/new")} className="btn-primary">
            添加档案
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="card card-hover group animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-serif text-xl font-bold text-gray-900">{profile.name}</h3>
                    <p className="text-gray-500">{profile.age}岁 · {getRecordCount(profile.id)}条记录</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/profiles/${profile.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id, profile.name)}
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {profile.medications.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <Pill className="w-4 h-4" />
                    <span>常用药</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.medications.map((med, i) => (
                      <span key={i} className="tag bg-primary-50 text-primary-700">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>目标范围</span>
                </div>
                <p className="text-gray-900 font-medium">
                  高压 {profile.targetRange.systolicMin}-{profile.targetRange.systolicMax} /
                  低压 {profile.targetRange.diastolicMin}-{profile.targetRange.diastolicMax}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span>紧急联系人：</span>
                  <span className="text-gray-900 font-medium">
                    {profile.emergencyContact.name} · {profile.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
