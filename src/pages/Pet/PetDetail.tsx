import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Syringe, FileText, Home as HomeIcon, Upload, CheckCircle,
  AlertTriangle, Clock, Dog, Cat, PawPrint, Heart, Calendar, Phone, User,
  Scale, AlertCircle, ShieldCheck, FileX, BedDouble, Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pet, VaccineRecord, Stay } from '../../../shared/types';
import { SPECIES_NAMES, VACCINE_TYPE_NAMES, STATUS_NAMES } from '../../../shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

type TabType = 'vaccines' | 'medical' | 'stays';

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('vaccines');

  useEffect(() => {
    if (id) {
      fetchPetData(parseInt(id));
    }
  }, [id]);

  const fetchPetData = async (petId: number) => {
    try {
      setLoading(true);
      const [petRes, vaccinesRes, staysRes] = await Promise.all([
        fetch(`/api/pets/${petId}`),
        fetch(`/api/pets/${petId}/vaccines`),
        fetch(`/api/pets/${petId}/stays`),
      ]);

      const [petData, vaccinesData, staysData] = await Promise.all([
        petRes.json() as Promise<ApiResponse<Pet>>,
        vaccinesRes.json() as Promise<ApiResponse<VaccineRecord[]>>,
        staysRes.json() as Promise<ApiResponse<Stay[]>>,
      ]);

      if (petData.success) {
        setPet(petData.data);
      }
      if (vaccinesData.success) {
        setVaccines(vaccinesData.data || []);
      }
      if (staysData.success) {
        setStays(staysData.data || []);
      }
    } catch (error) {
      console.error('获取宠物详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      default: return PawPrint;
    }
  };

  const getVaccineStatusConfig = (record: VaccineRecord) => {
    const now = new Date();
    const expiry = new Date(record.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      return { label: '已过期', className: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle };
    } else if (daysUntilExpiry <= 30) {
      return { label: '即将过期', className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock };
    }
    return { label: '有效', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  };

  const getStayStatusConfig = (status: Stay['status']) => {
    switch (status) {
      case 'checked-in':
        return { className: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
      case 'confirmed':
        return { className: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' };
      case 'pending':
        return { className: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' };
      case 'checked-out':
        return { className: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
      case 'cancelled':
        return { className: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
      default:
        return { className: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const handleVerifyVaccine = async (recordId: number) => {
    try {
      const res = await fetch(`/api/vaccination/verify/${recordId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verified: true,
          verifiedBy: 1,
          notes: '核验通过',
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (id) fetchPetData(parseInt(id));
      }
    } catch (error) {
      console.error('疫苗核验失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">宠物不存在</h3>
          <Link
            to="/pets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const SpeciesIcon = getSpeciesIcon(pet.species);
  const tabs = [
    { id: 'vaccines' as TabType, label: '疫苗记录', icon: Syringe, count: vaccines.length },
    { id: 'medical' as TabType, label: '病史信息', icon: FileText },
    { id: 'stays' as TabType, label: '寄养历史', icon: BedDouble, count: stays.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/pets"
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <SpeciesIcon className="w-8 h-8 text-blue-600" />
              {pet.name} 的档案
            </h1>
            <p className="text-gray-500 mt-1">
              {SPECIES_NAMES[pet.species]} · {pet.breed}
            </p>
          </div>
          <Link
            to={`/pets/${pet.id}/edit`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Edit className="w-5 h-5" />
            编辑档案
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-56 bg-gradient-to-br from-blue-100 to-indigo-100">
                {pet.photoUrl ? (
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <SpeciesIcon className="w-24 h-24 text-blue-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {pet.name}
                    {pet.sterilized && (
                      <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    )}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    <SpeciesIcon className="w-4 h-4" />
                    {SPECIES_NAMES[pet.species]}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">品种</p>
                      <p className="font-medium text-gray-900">{pet.breed}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">年龄</p>
                      <p className="font-medium text-gray-900">{pet.age} 岁</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">体重</p>
                      <p className="font-medium text-gray-900">{pet.weight} kg</p>
                    </div>
                  </div>

                  {pet.personality && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">性格特点</p>
                      <p className="text-gray-700 bg-gray-50 rounded-xl p-3">
                        {pet.personality}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                主人信息
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">主人姓名</p>
                    <p className="font-medium text-gray-900">{pet.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">联系电话</p>
                    <p className="font-medium text-gray-900">{pet.ownerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <nav className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all",
                          activeTab === tab.id
                            ? "border-blue-600 text-blue-600 bg-blue-50/50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                        {tab.count !== undefined && (
                          <span className={cn(
                            "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium",
                            activeTab === tab.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'vaccines' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">疫苗接种记录</h3>
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
                        <Syringe className="w-4 h-4" />
                        添加疫苗
                      </button>
                    </div>

                    {vaccines.length === 0 ? (
                      <div className="text-center py-16">
                        <FileX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">暂无疫苗记录</h4>
                        <p className="text-gray-500">该宠物还没有疫苗接种记录</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">疫苗类型</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">疫苗名称</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">接种日期</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">有效期至</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">核验</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vaccines.map((record) => {
                              const statusConfig = getVaccineStatusConfig(record);
                              return (
                                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 px-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                      {VACCINE_TYPE_NAMES[record.type]}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-gray-900 font-medium">{record.name}</td>
                                  <td className="py-4 px-4 text-gray-600">{formatDate(record.vaccinationDate)}</td>
                                  <td className="py-4 px-4 text-gray-600">{formatDate(record.expiryDate)}</td>
                                  <td className="py-4 px-4">
                                    <span className={cn(
                                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                                      statusConfig.className
                                    )}>
                                      <statusConfig.icon className="w-3.5 h-3.5" />
                                      {statusConfig.label}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    {record.verified ? (
                                      <span className="inline-flex items-center gap-1.5 text-green-600 text-sm">
                                        <ShieldCheck className="w-4 h-4" />
                                        已核验
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 text-gray-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        待核验
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" title="上传证明">
                                        <Upload className="w-4 h-4" />
                                      </button>
                                      {!record.verified && (
                                        <button
                                          onClick={() => handleVerifyVaccine(record.id)}
                                          className="p-2 rounded-lg hover:bg-green-100 text-gray-500 hover:text-green-600 transition-colors"
                                          title="核验"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        既往病史
                      </h4>
                      {pet.medicalHistory ? (
                        <p className="text-gray-700 leading-relaxed">{pet.medicalHistory}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-4 h-4" />
                          <span>暂无记录</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        过敏史
                      </h4>
                      {pet.allergies ? (
                        <p className="text-gray-700 leading-relaxed">{pet.allergies}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Check className="w-4 h-4" />
                          <span>无过敏记录</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        特殊需求
                      </h4>
                      {pet.specialRequirements ? (
                        <p className="text-gray-700 leading-relaxed">{pet.specialRequirements}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <X className="w-4 h-4" />
                          <span>暂无特殊需求</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'stays' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">寄养历史记录</h3>
                    </div>

                    {stays.length === 0 ? (
                      <div className="text-center py-16">
                        <HomeIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">暂无寄养记录</h4>
                        <p className="text-gray-500">该宠物还没有寄养记录</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stays.map((stay) => {
                          const statusConfig = getStayStatusConfig(stay.status);
                          return (
                            <div
                              key={stay.id}
                              className="border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                    statusConfig.className.replace('text-', 'bg-').replace('700', '100')
                                  )}>
                                    <HomeIcon className={cn("w-6 h-6", statusConfig.className.match(/text-\w+-\d+/)?.[0])} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-gray-900">寄养订单 #{stay.id}</p>
                                      <span className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                        statusConfig.className
                                      )}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                                        {STATUS_NAMES[stay.status]}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                      入住: {formatDate(stay.checkInDate)}
                                      {stay.checkOutDate && ` → 退房: ${formatDate(stay.checkOutDate)}`}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">笼位</p>
                                  <p className="font-medium text-gray-900">
                                    {stay.cageId ? `#${stay.cageId}` : '未分配'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">疫苗核验</p>
                                  <p className={cn(
                                    "font-medium",
                                    stay.vaccinationVerified ? "text-green-600" : "text-red-600"
                                  )}>
                                    {stay.vaccinationVerified ? '已通过' : '未通过'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">需要隔离</p>
                                  <p className={cn(
                                    "font-medium",
                                    stay.requiresIsolation ? "text-orange-600" : "text-gray-600"
                                  )}>
                                    {stay.requiresIsolation ? '是' : '否'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">高风险</p>
                                  <p className={cn(
                                    "font-medium",
                                    stay.highRisk ? "text-red-600" : "text-gray-600"
                                  )}>
                                    {stay.highRisk ? '是' : '否'}
                                  </p>
                                </div>
                              </div>

                              {stay.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">备注</p>
                                  <p className="text-sm text-gray-700">{stay.notes}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
