import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock, Upload, FileText, 
  Dog, Cat, PawPrint, Calendar, User, Phone, Syringe, ShieldAlert, 
  Check, X, MessageSquare, Send, Download, Eye, Plus, Trash2,
  CheckCheck, FileWarning, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { Pet, VaccineRecord, VaccinationCheckResult } from '../../../shared/types';
import { 
  SPECIES_NAMES, VACCINE_TYPE_NAMES, EXPIRING_WARNING_DAYS, URGENT_WARNING_DAYS 
} from '../../../shared/types';

type VerificationStatus = 'valid' | 'expiring' | 'expired' | 'missing';

interface MaterialItem {
  type: string;
  label: string;
  hasFile: boolean;
  fileUrl?: string;
  fileName?: string;
}

export default function VaccinationCheck() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [checkResult, setCheckResult] = useState<VaccinationCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<'approve' | 'reject' | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [animateResults, setAnimateResults] = useState(false);

  useEffect(() => {
    if (petId) {
      fetchData();
    }
  }, [petId]);

  useEffect(() => {
    if (checkResult) {
      const timer = setTimeout(() => setAnimateResults(true), 100);
      return () => clearTimeout(timer);
    }
  }, [checkResult]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [petRes, vaccinesRes, checkRes] = await Promise.all([
        apiClient.get<Pet>(`/pets/${petId}`),
        apiClient.get<VaccineRecord[]>(`/pets/${petId}/vaccines`),
        apiClient.get<VaccinationCheckResult>(`/vaccination/check/${petId}`)
      ]);

      if (petRes.success) setPet(petRes.data!);
      if (vaccinesRes.success) setVaccines(vaccinesRes.data || []);
      if (checkRes.success) setCheckResult(checkRes.data!);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const materials: MaterialItem[] = [
    { type: 'vaccine-certificate', label: '疫苗证', hasFile: vaccines.some(v => v.certificateUrl), fileUrl: vaccines.find(v => v.certificateUrl)?.certificateUrl },
    { type: 'deworming-record', label: '驱虫记录', hasFile: vaccines.filter(v => v.type === 'deworming').some(v => v.certificateUrl) },
    { type: 'medical-history', label: '病史记录', hasFile: !!pet?.medicalHistory }
  ];

  const handleFileUpload = async (materialType: string, file: File) => {
    setUploading(materialType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', materialType);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`${materialType} 上传成功（模拟）`);
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleVerify = async (approved: boolean) => {
    if (!petId || !checkResult) return;
    
    try {
      setVerifying(true);
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const verifyPromises = vaccines
        .filter(v => !v.verified)
        .map(v => apiClient.post(`/vaccination/verify/${v.id}`, {
          verified: approved,
          notes,
          verifiedBy: user?.id || 1
        }));
      
      await Promise.all(verifyPromises);
      
      setShowConfirmDialog(null);
      navigate('/vaccination');
    } catch (error) {
      console.error('核验失败:', error);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case 'valid':
        return {
          icon: CheckCircle,
          label: '有效',
          bgClass: 'bg-green-50',
          borderClass: 'border-green-200',
          textClass: 'text-green-600',
          iconClass: 'text-green-500',
          dotClass: 'bg-green-500'
        };
      case 'expiring':
        return {
          icon: AlertTriangle,
          label: '临期',
          bgClass: 'bg-yellow-50',
          borderClass: 'border-yellow-200',
          textClass: 'text-yellow-700',
          iconClass: 'text-yellow-500',
          dotClass: 'bg-yellow-500'
        };
      case 'expired':
        return {
          icon: XCircle,
          label: '过期',
          bgClass: 'bg-red-50',
          borderClass: 'border-red-200',
          textClass: 'text-red-600',
          iconClass: 'text-red-500',
          dotClass: 'bg-red-500'
        };
      case 'missing':
      default:
        return {
          icon: ShieldAlert,
          label: '缺失',
          bgClass: 'bg-gray-50',
          borderClass: 'border-gray-200',
          textClass: 'text-gray-500',
          iconClass: 'text-gray-400',
          dotClass: 'bg-gray-400'
        };
    }
  };

  const getSpeciesIcon = (species: Pet['species']) => {
    switch (species) {
      case 'dog': return Dog;
      case 'cat': return Cat;
      default: return PawPrint;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getDaysColor = (days?: number) => {
    if (days === undefined) return 'text-gray-400';
    if (days <= 0) return 'text-red-600';
    if (days <= URGENT_WARNING_DAYS) return 'text-red-500';
    if (days <= EXPIRING_WARNING_DAYS) return 'text-yellow-600';
    return 'text-green-600';
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

  if (!pet || !checkResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FileWarning className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到相关信息</h3>
          <button
            onClick={() => navigate('/vaccination')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const SpeciesIcon = getSpeciesIcon(pet.species);
  const overallStatus = checkResult.overallPass ? 'valid' : checkResult.missingDocuments.length > 0 ? 'missing' : 'expired';
  const overallConfig = getStatusConfig(overallStatus as VerificationStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/vaccination')}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  疫苗核验详情
                  <span className="text-lg font-normal text-gray-500">- {pet.name}</span>
                </h1>
              </div>
            </div>
            
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border-2",
              overallConfig.bgClass,
              overallConfig.borderClass
            )}>
              <overallConfig.icon className={cn("w-8 h-8", overallConfig.iconClass, "animate-pulse")} />
              <div>
                <p className="text-sm text-gray-500">总体核验结果</p>
                <p className={cn("text-xl font-bold", overallConfig.textClass)}>
                  {checkResult.overallPass ? '核验通过' : '核验不通过'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
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
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-white/50">
                    <SpeciesIcon className="w-3.5 h-3.5" />
                    {SPECIES_NAMES[pet.species]}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{pet.name}</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PawPrint className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-500">品种</p>
                      <p className="font-medium text-gray-900">{pet.breed}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-500">年龄</p>
                      <p className="font-medium text-gray-900">{pet.age} 岁</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-500">主人</p>
                      <p className="font-medium text-gray-900">{pet.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-500">联系电话</p>
                      <p className="font-medium text-gray-900">{pet.ownerPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                材料上传
              </h3>
              <div className="space-y-3">
                {materials.map((material, index) => {
                  const config = material.hasFile ? getStatusConfig('valid') : getStatusConfig('missing');
                  return (
                    <div
                      key={material.type}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300",
                        material.hasFile ? config.bgClass + ' ' + config.borderClass : 'bg-gray-50 border-dashed border-gray-200 hover:border-blue-300'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <config.icon className={cn("w-5 h-5", config.iconClass)} />
                          <span className="font-medium text-gray-900">{material.label}</span>
                        </div>
                        <span className={cn("text-xs font-medium", config.textClass)}>
                          {material.hasFile ? '已上传' : '未上传'}
                        </span>
                      </div>
                      {material.hasFile ? (
                        <div className="flex items-center gap-2">
                          <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors">
                            <Eye className="w-4 h-4" />
                            查看
                          </button>
                          <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors">
                            <Download className="w-4 h-4" />
                            下载
                          </button>
                        </div>
                      ) : (
                        <label className="block">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(material.type, file);
                            }}
                          />
                          <div className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 cursor-pointer transition-colors">
                            {uploading === material.type ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                上传中...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                上传
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-blue-600" />
                自动核验结果
              </h3>
              
              <div className="space-y-4">
                {checkResult.checks.map((check, index) => {
                  const config = getStatusConfig(check.status as VerificationStatus);
                  const isUrgent = check.daysRemaining !== undefined && check.daysRemaining <= URGENT_WARNING_DAYS && check.daysRemaining > 0;
                  
                  return (
                    <div
                      key={check.type}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all duration-500",
                        config.bgClass,
                        config.borderClass,
                        animateResults ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                        isUrgent && "animate-pulse"
                      )}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            check.status === 'valid' ? 'bg-green-100' :
                            check.status === 'expiring' ? 'bg-yellow-100' :
                            check.status === 'expired' ? 'bg-red-100' : 'bg-gray-100'
                          )}>
                            <config.icon className={cn("w-6 h-6", config.iconClass)} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{check.name}</h4>
                            <p className="text-sm text-gray-500">
                              {check.required ? '必检项目' : '建议项目'}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                          config.bgClass,
                          config.textClass,
                          "border",
                          config.borderClass
                        )}>
                          <span className={cn("w-2 h-2 rounded-full", config.dotClass)} />
                          {config.label}
                        </span>
                      </div>

                      {check.hasRecord ? (
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="bg-white/60 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">接种日期</p>
                            <p className="font-semibold text-gray-900">{formatDate(check.expiryDate!)}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">有效期至</p>
                            <p className="font-semibold text-gray-900">{formatDate(check.expiryDate!)}</p>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">{check.message}</p>
                        {check.daysRemaining !== undefined && (
                          <span className={cn(
                            "text-sm font-bold",
                            getDaysColor(check.daysRemaining)
                          )}>
                            {check.daysRemaining > 0 
                              ? `剩余 ${check.daysRemaining} 天`
                              : `已过期 ${Math.abs(check.daysRemaining)} 天`
                            }
                          </span>
                        )}
                      </div>

                      {check.status === 'missing' && check.required && (
                        <button className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                          <Plus className="w-4 h-4" />
                          补充疫苗记录
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {checkResult.warnings.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    注意事项
                  </h4>
                  <ul className="space-y-1">
                    {checkResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {checkResult.missingDocuments.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    缺失材料
                  </h4>
                  <ul className="space-y-1">
                    {checkResult.missingDocuments.map((doc, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                        <Trash2 className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-blue-600" />
                核验报告
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">核验结论</span>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                      checkResult.overallPass 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    )}>
                      {checkResult.overallPass ? (
                        <><CheckCircle className="w-4 h-4" /> 通过</>
                      ) : (
                        <><XCircle className="w-4 h-4" /> 不通过</>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {checkResult.overallPass 
                      ? '所有必检疫苗均在有效期内，符合入住要求。'
                      : `存在 ${checkResult.missingDocuments.length} 项缺失或过期疫苗，需补充后重新核验。`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {checkResult.checks.filter(c => c.status === 'valid').length}
                    </p>
                    <p className="text-xs text-green-600">有效疫苗</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {checkResult.checks.filter(c => c.status === 'expiring').length}
                    </p>
                    <p className="text-xs text-yellow-600">临期疫苗</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {checkResult.checks.filter(c => c.status === 'expired').length}
                    </p>
                    <p className="text-xs text-red-600">过期疫苗</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {checkResult.checks.filter(c => c.status === 'missing').length}
                    </p>
                    <p className="text-xs text-gray-600">缺失记录</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    核验备注
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="请输入核验备注信息..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                审核操作
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowConfirmDialog('approve')}
                  disabled={verifying}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  {verifying ? '处理中...' : '通过核验'}
                </button>
                
                <button
                  onClick={() => setShowConfirmDialog('reject')}
                  disabled={verifying}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock className="w-5 h-5" />
                  要求补充材料
                </button>

                <button
                  onClick={() => navigate('/vaccination')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700">
                  <strong>提示：</strong>通过核验后，该宠物的疫苗状态将更新为已核验，可正常办理入住。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirmDialog === 'approve'}
        title="确认通过核验？"
        description={notes ? `备注：${notes}` : '通过后该宠物疫苗状态将更新为已核验，确认要继续吗？'}
        confirmText="确认通过"
        cancelText="取消"
        confirmVariant="primary"
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        isLoading={verifying}
        onConfirm={() => handleVerify(true)}
        onCancel={() => setShowConfirmDialog(null)}
      />

      <ConfirmDialog
        open={showConfirmDialog === 'reject'}
        title="要求补充材料？"
        description={notes ? `备注：${notes}` : '将通知主人补充缺失的疫苗材料，确认要继续吗？'}
        confirmText="确认发送"
        cancelText="取消"
        confirmVariant="warning"
        icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
        isLoading={verifying}
        onConfirm={() => handleVerify(false)}
        onCancel={() => setShowConfirmDialog(null)}
      />
    </div>
  );
}
