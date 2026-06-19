import { useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Droplets,
  Users,
  MapPin,
  Calendar,
  Package,
  AlertTriangle,
  Plus,
  RefreshCw,
  FlaskConical,
  Droplet,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Tabs, TabPanel } from '../components/Tabs';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { AlertItem } from '../components/AlertItem';
import {
  getFilterStatus,
  getStatusLabel,
  getStatusColor,
  getAlertTypeLabel,
} from '../utils/calculations';
import { formatDateCN, getToday } from '../utils/date';
import { cn } from '../lib/utils';
import { AlertType, AlertSeverity } from '../types';

export default function PitcherDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pitchers = useStore((state) => state.pitchers);
  const deletePitcher = useStore((state) => state.deletePitcher);
  const getCurrentFilter = useStore((state) => state.getCurrentFilter);
  const getFilterLifePercent = useStore((state) => state.getFilterLifePercent);
  const getFilterDaysLeft = useStore((state) => state.getFilterDaysLeft);
  const getFilterStatus = useStore((state) => state.getFilterStatus);
  const getStock = useStore((state) => state.getStock);
  const addRefill = useStore((state) => state.addRefill);
  const getRefillCount = useStore((state) => state.getRefillCount);
  const filterReplacements = useStore((state) => state.filterReplacements);
  const waterRefills = useStore((state) => state.waterRefills);
  const alerts = useStore((state) => state.alerts);
  const replaceFilter = useStore((state) => state.replaceFilter);
  const addAlert = useStore((state) => state.addAlert);
  const updateStock = useStore((state) => state.updateStock);

  const pitcher = pitchers.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState('info');
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const [replaceForm, setReplaceForm] = useState({
    installDate: getToday(),
    batchNo: '',
    expectedLifeDays: 60,
    flushCount: 3,
  });

  const [alertForm, setAlertForm] = useState({
    type: 'slow_flow' as AlertType,
    description: '',
    severity: 'medium' as AlertSeverity,
  });

  const [stockForm, setStockForm] = useState({
    quantity: 0,
  });

  if (!pitcher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">水壶不存在</h3>
          <button
            onClick={() => navigate('/pitchers')}
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            返回水壶列表
          </button>
        </div>
      </div>
    );
  }

  const currentFilter = getCurrentFilter(pitcher.id);
  const lifePercent = getFilterLifePercent(pitcher.id);
  const daysLeft = getFilterDaysLeft(pitcher.id);
  const status = getFilterStatus(pitcher.id);
  const stock = getStock(pitcher.filterModel);
  const refillCount30 = getRefillCount(pitcher.id, 30);

  const pitcherReplacements = filterReplacements
    .filter((r) => r.pitcherId === pitcher.id)
    .sort((a, b) => new Date(b.installDate).getTime() - new Date(a.installDate).getTime());

  const pitcherRefills = waterRefills
    .filter((r) => r.pitcherId === pitcher.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const pitcherAlerts = alerts
    .filter((a) => a.pitcherId === pitcher.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isExpiredNoStock = status === 'expired' && stock === 0;

  const handleAddRefill = () => {
    addRefill(pitcher.id, 1);
  };

  const handleReplaceFilter = () => {
    if (stock <= 0) {
      alert('库存不足，请先补充库存！');
      return;
    }
    replaceFilter(pitcher.id, replaceForm);
    setShowReplaceModal(false);
    setReplaceForm({
      installDate: getToday(),
      batchNo: '',
      expectedLifeDays: 60,
      flushCount: 3,
    });
  };

  const handleAddAlert = () => {
    addAlert({
      pitcherId: pitcher.id,
      type: alertForm.type,
      description: alertForm.description,
      date: getToday(),
      severity: alertForm.severity,
      resolved: false,
    });
    setShowAlertModal(false);
    setAlertForm({
      type: 'slow_flow',
      description: '',
      severity: 'medium',
    });
  };

  const handleDelete = () => {
    deletePitcher(pitcher.id);
    navigate('/pitchers');
  };

  const handleUpdateStock = () => {
    updateStock(pitcher.filterModel, stockForm.quantity);
    setShowStockModal(false);
  };

  const tabs = [
    { key: 'info', label: '档案信息', icon: <Droplet className="w-4 h-4" /> },
    { key: 'history', label: '换芯历史', icon: <RefreshCw className="w-4 h-4" /> },
    { key: 'refills', label: '加水记录', icon: <Droplets className="w-4 h-4" /> },
    { key: 'alerts', label: '异常记录', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/pitchers')}
              className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">水壶详情</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/pitchers/${pitcher.id}/edit`)}
              className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 border border-gray-200 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 rounded-xl bg-white text-red-500 flex items-center justify-center hover:bg-red-50 border border-gray-200 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 水壶信息卡片 */}
        <Card
          className={cn(
            'mb-6 p-0 overflow-hidden',
            isExpiredNoStock && 'ring-2 ring-red-400'
          )}
        >
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-sky-100 to-blue-200 flex-shrink-0">
              <img
                src={pitcher.photo}
                alt={pitcher.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {pitcher.name}
                  </h2>
                  <p className="text-gray-500">{pitcher.brand}</p>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    isExpiredNoStock
                      ? 'bg-red-500 text-white'
                      : status === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : status === 'expired'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  {isExpiredNoStock ? '急需换芯' : getStatusLabel(status)}
                </span>
              </div>

              <div className="mb-5">
                <ProgressBar percent={lifePercent} status={status} height="h-3" />
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-500">
                    剩余 <span className={cn('font-semibold', getStatusColor(status))}>
                      {daysLeft} 天
                    </span>
                  </span>
                  {currentFilter && (
                    <span className="text-gray-500">
                      安装于 {formatDateCN(currentFilter.installDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Droplets className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-800">{pitcher.capacity}L</p>
                  <p className="text-xs text-gray-500">容量</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Users className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-800">{pitcher.userCount}人</p>
                  <p className="text-xs text-gray-500">使用人数</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-800 truncate">{pitcher.location}</p>
                  <p className="text-xs text-gray-500">放置位置</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-800">{refillCount30}</p>
                  <p className="text-xs text-gray-500">近30天加水</p>
                </div>
              </div>

              {/* 库存和操作 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setShowStockModal(true)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all',
                    stock === 0
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : stock <= 1
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  )}
                >
                  <Package className="w-5 h-5" />
                  滤芯库存：{stock} 个
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleAddRefill}
                    className="flex-1 sm:flex-none"
                  >
                    加水
                  </Button>
                  <Button
                    variant="primary"
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => setShowReplaceModal(true)}
                    className="flex-1 sm:flex-none"
                  >
                    换芯
                  </Button>
                </div>
              </div>

              {isExpiredNoStock && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600 font-medium">
                    滤芯已过期且库存为零，请立即购买新滤芯！
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 上报异常按钮 */}
        <button
          onClick={() => setShowAlertModal(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
        >
          <FlaskConical className="w-5 h-5 text-orange-500" />
          上报水质异常
        </button>

        {/* Tab 内容 */}
        <Card className="p-6">
          <Tabs tabs={tabs} defaultTab="info" onTabChange={setActiveTab}>
            <TabPanel activeKey={activeTab} tabKey="info">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">品牌</p>
                    <p className="font-semibold text-gray-800">{pitcher.brand}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">容量</p>
                    <p className="font-semibold text-gray-800">{pitcher.capacity} L</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">滤芯型号</p>
                    <p className="font-semibold text-gray-800">{pitcher.filterModel}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">使用人数</p>
                    <p className="font-semibold text-gray-800">{pitcher.userCount} 人</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">放置位置</p>
                    <p className="font-semibold text-gray-800">{pitcher.location}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">创建时间</p>
                    <p className="font-semibold text-gray-800">{formatDateCN(pitcher.createdAt)}</p>
                  </div>
                </div>
                {currentFilter && (
                  <div className="p-4 bg-sky-50 rounded-xl">
                    <p className="text-sm text-sky-600 font-medium mb-2">当前滤芯信息</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">批次号：</span>
                        <span className="text-gray-800 font-medium">{currentFilter.batchNo || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">预计寿命：</span>
                        <span className="text-gray-800 font-medium">{currentFilter.expectedLifeDays} 天</span>
                      </div>
                      <div>
                        <span className="text-gray-500">冲洗次数：</span>
                        <span className="text-gray-800 font-medium">{currentFilter.flushCount} 次</span>
                      </div>
                      <div>
                        <span className="text-gray-500">更换后库存：</span>
                        <span className="text-gray-800 font-medium">{currentFilter.stockAfter} 个</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel activeKey={activeTab} tabKey="history">
              {pitcherReplacements.length > 0 ? (
                <div className="space-y-3">
                  {pitcherReplacements.map((replacement, index) => (
                    <div
                      key={replacement.id}
                      className="relative pl-8 pb-4"
                    >
                      {index < pitcherReplacements.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-sky-100 border-2 border-sky-500 flex items-center justify-center">
                        <RefreshCw className="w-3 h-3 text-sky-500" />
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            第 {pitcherReplacements.length - index} 次更换
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateCN(replacement.installDate)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">批次：</span>
                            <span className="text-gray-700">{replacement.batchNo || '-'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">寿命：</span>
                            <span className="text-gray-700">{replacement.expectedLifeDays} 天</span>
                          </div>
                          <div>
                            <span className="text-gray-500">冲洗：</span>
                            <span className="text-gray-700">{replacement.flushCount} 次</span>
                          </div>
                          <div>
                            <span className="text-gray-500">库存：</span>
                            <span className="text-gray-700">{replacement.stockAfter} 个</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无换芯记录</p>
                </div>
              )}
            </TabPanel>

            <TabPanel activeKey={activeTab} tabKey="refills">
              {pitcherRefills.length > 0 ? (
                <div className="space-y-2">
                  {pitcherRefills.map((refill) => (
                    <div
                      key={refill.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                          <Droplets className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            加水 {refill.count} 次
                          </p>
                          {refill.note && (
                            <p className="text-sm text-gray-500">{refill.note}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDateCN(refill.date)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <Droplets className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无加水记录</p>
                </div>
              )}
            </TabPanel>

            <TabPanel activeKey={activeTab} tabKey="alerts">
              {pitcherAlerts.length > 0 ? (
                <div className="space-y-2">
                  {pitcherAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无水质异常记录</p>
                </div>
              )}
            </TabPanel>
          </Tabs>
        </Card>
      </div>

      {/* 换芯弹窗 */}
      <Modal
        isOpen={showReplaceModal}
        onClose={() => setShowReplaceModal(false)}
        title="更换滤芯"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              安装日期
            </label>
            <input
              type="date"
              value={replaceForm.installDate}
              onChange={(e) =>
                setReplaceForm({ ...replaceForm, installDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              滤芯批次
            </label>
            <input
              type="text"
              value={replaceForm.batchNo}
              onChange={(e) =>
                setReplaceForm({ ...replaceForm, batchNo: e.target.value })
              }
              placeholder="请输入滤芯批次号"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              预计寿命（天）
            </label>
            <input
              type="number"
              value={replaceForm.expectedLifeDays}
              onChange={(e) =>
                setReplaceForm({
                  ...replaceForm,
                  expectedLifeDays: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              冲洗次数
            </label>
            <input
              type="number"
              value={replaceForm.flushCount}
              onChange={(e) =>
                setReplaceForm({
                  ...replaceForm,
                  flushCount: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700">
              当前库存：<span className="font-semibold">{stock} 个</span>
            </p>
            {stock <= 0 && (
              <p className="text-sm text-red-600 mt-1">库存不足，无法更换！</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowReplaceModal(false)}
              fullWidth
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleReplaceFilter}
              disabled={stock <= 0}
              fullWidth
            >
              确认更换
            </Button>
          </div>
        </div>
      </Modal>

      {/* 异常上报弹窗 */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="上报水质异常"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              异常类型
            </label>
            <select
              value={alertForm.type}
              onChange={(e) =>
                setAlertForm({ ...alertForm, type: e.target.value as AlertType })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="slow_flow">水流变慢</option>
              <option value="odor">异味</option>
              <option value="chlorine_test">余氯测试异常</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              严重程度
            </label>
            <select
              value={alertForm.severity}
              onChange={(e) =>
                setAlertForm({
                  ...alertForm,
                  severity: e.target.value as AlertSeverity,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="low">轻微</option>
              <option value="medium">中等</option>
              <option value="high">严重</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              详细描述
            </label>
            <textarea
              value={alertForm.description}
              onChange={(e) =>
                setAlertForm({ ...alertForm, description: e.target.value })
              }
              placeholder="请描述具体情况..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowAlertModal(false)}
              fullWidth
            >
              取消
            </Button>
            <Button variant="primary" onClick={handleAddAlert} fullWidth>
              提交上报
            </Button>
          </div>
        </div>
      </Modal>

      {/* 库存管理弹窗 */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title="调整库存"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              滤芯型号
            </label>
            <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-gray-700">
              {pitcher.filterModel}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              当前库存：{stock} 个
            </label>
            <input
              type="number"
              value={stockForm.quantity}
              onChange={(e) =>
                setStockForm({ quantity: parseInt(e.target.value) || 0 })
              }
              placeholder="请输入新的库存数量"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowStockModal(false)}
              fullWidth
            >
              取消
            </Button>
            <Button variant="primary" onClick={handleUpdateStock} fullWidth>
              确认调整
            </Button>
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">确定要删除这个水壶吗？</p>
                <p className="text-sm text-red-600 mt-1">
                  删除后将无法恢复，所有相关的换芯记录、加水记录和异常记录都将被清除。
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              fullWidth
            >
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete} fullWidth>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
