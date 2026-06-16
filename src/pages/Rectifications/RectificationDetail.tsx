import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  Camera,
  FileText,
  CheckCircle,
  Save,
  MapPin
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useRectificationStore } from '@/store/rectificationStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useInspectionStore } from '@/store/inspectionStore';
import { formatDate, daysUntil } from '@/utils/date';

const typeLabels: Record<string, string> = {
  pressure: '压力异常',
  expired: '设备过期',
  obstruction: '杂物遮挡',
  other: '其他问题'
};

export function RectificationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRectificationById, closeRectification, updateRectification } = useRectificationStore();
  const { getDeviceById } = useDeviceStore();
  const { getInspectionById } = useInspectionStore();

  const rectification = id ? getRectificationById(id) : null;
  const device = rectification ? getDeviceById(rectification.deviceId) : null;
  const inspection = rectification ? getInspectionById(rectification.inspectionId) : null;

  const [fixRemark, setFixRemark] = useState('');
  const [fixPhoto, setFixPhoto] = useState('');
  const [showCloseForm, setShowCloseForm] = useState(false);

  if (!rectification || !device) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500">整改单不存在</p>
        <button
          onClick={() => navigate('/rectifications')}
          className="mt-4 text-red-600 hover:underline"
        >
          返回整改列表
        </button>
      </div>
    );
  }

  const days = daysUntil(rectification.deadline);
  const isOverdue = days <= 0 && rectification.status !== 'closed';

  const handleClose = () => {
    if (!fixPhoto.trim()) {
      alert('请上传整改照片');
      return;
    }
    if (!fixRemark.trim()) {
      alert('请填写整改说明');
      return;
    }
    closeRectification(rectification.id, fixPhoto.trim(), fixRemark.trim());
    alert('整改单已关闭');
    navigate('/rectifications');
  };

  const handleStartProcess = () => {
    updateRectification(rectification.id, { status: 'processing' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rectifications')}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              整改单 #{rectification.id.toUpperCase().slice(-6)}
            </h2>
            <StatusBadge status={rectification.status} />
          </div>
          <p className="text-sm text-gray-500">
            {typeLabels[rectification.type]} · 创建于 {formatDate(rectification.createDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              问题描述
            </h3>
            <div className="rounded-xl bg-red-50 p-4 text-red-800">
              {rectification.description}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 text-blue-500" />
              关联巡检记录
            </h3>
            {inspection ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-blue-50 p-4">
                  <div>
                    <p className="text-xs font-medium text-blue-600">巡检日期</p>
                    <p className="mt-1 text-lg font-bold text-blue-900">
                      {formatDate(inspection.inspectDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600">检查人</p>
                    <p className="mt-1 text-lg font-bold text-blue-900">
                      {inspection.inspector}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border-2 border-gray-100 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">检查项详情</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div className={`rounded-xl p-3 text-center ${
                      inspection.pressureStatus === 'normal'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs font-medium text-gray-500">压力值</p>
                      <p className={`mt-1 text-xl font-bold ${
                        inspection.pressureStatus === 'normal'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {inspection.pressure}
                      </p>
                      <p className="text-xs text-gray-500">
                        {device && `标准: ${device.minPressure}-${device.maxPressure} MPa`}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${
                        inspection.pressureStatus === 'normal'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {inspection.pressureStatus === 'normal' ? '✓ 正常' :
                         inspection.pressureStatus === 'low' ? '✗ 偏低' : '✗ 偏高'}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 text-center ${
                      inspection.seal
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs font-medium text-gray-500">铅封</p>
                      <p className={`mt-1 text-xl font-bold ${
                        inspection.seal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.seal ? '✓' : '✗'}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${
                        inspection.seal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.seal ? '完好' : '损坏'}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 text-center ${
                      inspection.hose
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs font-medium text-gray-500">喷管</p>
                      <p className={`mt-1 text-xl font-bold ${
                        inspection.hose ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.hose ? '✓' : '✗'}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${
                        inspection.hose ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.hose ? '完好' : '损坏'}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 text-center ${
                      inspection.boxDoor
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs font-medium text-gray-500">箱门</p>
                      <p className={`mt-1 text-xl font-bold ${
                        inspection.boxDoor ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.boxDoor ? '✓' : '✗'}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${
                        inspection.boxDoor ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {inspection.boxDoor ? '完好' : '变形'}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 text-center ${
                      !inspection.obstruction
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className="text-xs font-medium text-gray-500">遮挡物</p>
                      <p className={`mt-1 text-xl font-bold ${
                        !inspection.obstruction ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {!inspection.obstruction ? '✓' : '✗'}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${
                        !inspection.obstruction ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {!inspection.obstruction ? '无遮挡' : '有遮挡'}
                      </p>
                    </div>
                  </div>
                </div>

                {inspection.remark && (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">巡检备注</p>
                    <p className="mt-1 text-sm text-gray-700">{inspection.remark}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-8 text-gray-400">
                <FileText className="mb-2 h-10 w-10" />
                <p className="text-sm">无关联巡检记录</p>
              </div>
            )}
          </div>

          {rectification.status === 'closed' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <CheckCircle className="h-5 w-5 text-green-500" />
                整改结果
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-gray-500">整改照片</p>
                  <div className="w-48 overflow-hidden rounded-xl bg-gray-100">
                    {rectification.fixPhoto ? (
                      <img
                        src={rectification.fixPhoto}
                        alt="整改照片"
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-gray-400">
                        暂无照片
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">整改说明</p>
                  <p className="text-gray-900">{rectification.fixRemark}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-500">完成时间</p>
                  <p className="text-gray-900">
                    {rectification.fixDate ? formatDate(rectification.fixDate) : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showCloseForm && rectification.status !== 'closed' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Save className="h-5 w-5 text-green-500" />
                关闭整改单
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    整改照片 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start gap-4">
                    {fixPhoto ? (
                      <div className="relative w-32">
                        <img
                          src={fixPhoto}
                          alt="整改照片"
                          className="h-32 w-32 rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFixPhoto('')}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFixPhoto('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fire%20extinguisher%20maintenance%20repair%20after%20fix&image_size=square')}
                        className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600"
                      >
                        <Camera className="h-8 w-8" />
                        <span className="text-xs">上传照片</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    整改说明 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={fixRemark}
                    onChange={e => setFixRemark(e.target.value)}
                    placeholder="请描述整改措施和结果..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCloseForm(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    确认关闭
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">关联设备</h3>
            <Link
              to={`/devices/${device.id}`}
              className="block rounded-xl border border-gray-100 p-3 hover:bg-gray-50"
            >
              <div className="overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={device.photo}
                  alt={device.code}
                  className="h-24 w-full object-cover"
                />
              </div>
              <div className="mt-2">
                <p className="font-medium text-gray-900">{device.code}</p>
                <p className="text-xs text-gray-500">{device.type}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {device.building} {device.floor} {device.location}
                </p>
              </div>
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">处理信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  处理人
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {rectification.handler}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  创建日期
                </span>
                <span className="text-sm text-gray-900">
                  {formatDate(rectification.createDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  截止日期
                </span>
                <span className={`text-sm font-medium ${
                  isOverdue ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatDate(rectification.deadline)}
                  {isOverdue && ' (已超期)'}
                </span>
              </div>
            </div>
          </div>

          {rectification.status !== 'closed' && (
            <div className="space-y-3">
              {rectification.status === 'pending' && (
                <button
                  onClick={handleStartProcess}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  开始处理
                </button>
              )}
              {!showCloseForm && (
                <button
                  onClick={() => setShowCloseForm(true)}
                  className="w-full rounded-xl bg-green-600 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                >
                  提交整改并关闭
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
