import { useState } from 'react';
import {
  Package,
  ArrowRight,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  AlertOctagon,
  AlertCircle,
  MapPinOff,
} from 'lucide-react';
import type { PropFlowWithDetails, IssueType } from '@/types';
import { useAppStore } from '@/store/appStore';

interface PropFlowCardProps {
  propFlow: PropFlowWithDetails;
}

export default function PropFlowCard({ propFlow }: PropFlowCardProps) {
  const { confirmPropFlow, reportIssue } = useAppStore();
  const [showIssueMenu, setShowIssueMenu] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);

  const isConfirmed = propFlow.status === 'confirmed';
  const hasIssue = propFlow.status === 'issue';

  const handleConfirm = () => {
    if (!isConfirmed && !hasIssue) {
      confirmPropFlow(propFlow.id);
    }
  };

  const handleReportIssue = (type: IssueType) => {
    setSelectedIssueType(type);
    setShowDescriptionInput(true);
    setShowIssueMenu(false);
  };

  const submitIssue = () => {
    if (selectedIssueType) {
      reportIssue(
        propFlow.id,
        selectedIssueType,
        issueDescription || '无备注'
      );
      setShowDescriptionInput(false);
      setIssueDescription('');
      setSelectedIssueType(null);
    }
  };

  const cancelIssue = () => {
    setShowDescriptionInput(false);
    setShowIssueMenu(false);
    setIssueDescription('');
    setSelectedIssueType(null);
  };

  const issueTypes: { type: IssueType; label: string; icon: typeof AlertOctagon; color: string }[] = [
    { type: 'lost', label: '道具遗失', icon: AlertOctagon, color: 'text-neon-red border-neon-red hover:bg-neon-red/10' },
    { type: 'damaged', label: '道具损坏', icon: AlertCircle, color: 'text-neon-yellow border-neon-yellow hover:bg-neon-yellow/10' },
    { type: 'wrong_position', label: '位置错误', icon: MapPinOff, color: 'text-neon-blue border-neon-blue hover:bg-neon-blue/10' },
  ];

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
        isConfirmed
          ? 'border-neon-green/50 bg-neon-green/5'
          : hasIssue
          ? 'border-neon-red/50 bg-neon-red/5 animate-flash'
          : 'border-stage-border bg-stage-bg-card hover:border-neon-green/30'
      }`}
    >
      {/* 状态角标 */}
      {isConfirmed && (
        <div className="absolute -top-3 -right-3 bg-neon-green text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-5 h-5" />
          已确认
        </div>
      )}

      {hasIssue && (
        <div className="absolute -top-3 -right-3 bg-neon-red text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-5 h-5" />
          有问题
        </div>
      )}

      {/* 道具名称 */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isConfirmed
                ? 'bg-neon-green/20 text-neon-green'
                : hasIssue
                ? 'bg-neon-red/20 text-neon-red'
                : 'bg-stage-bg-hover text-neon-green'
            }`}
          >
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3
              className={`text-2xl font-bold tracking-wide ${
                isConfirmed
                  ? 'text-neon-green'
                  : hasIssue
                  ? 'text-neon-red'
                  : 'text-stage-text'
              }`}
            >
              {propFlow.prop.name}
            </h3>
            <p className="text-base text-stage-text-secondary mt-1">
              {propFlow.prop.category} · {propFlow.prop.description}
            </p>
          </div>
        </div>
      </div>

      {/* 流向信息 */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 来源 */}
          <div className="bg-stage-bg-secondary rounded-xl p-4">
            <div className="flex items-center gap-2 text-stage-text-secondary text-sm mb-2">
              <MapPin className="w-4 h-4" />
              拿取位置
            </div>
            <div className="text-lg font-semibold text-stage-text">
              {propFlow.from}
            </div>
            <div className="flex items-center gap-2 text-sm text-stage-text-muted mt-2">
              <User className="w-4 h-4" />
              经手人：{propFlow.handler}
            </div>
          </div>

          {/* 箭头 */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neon-green/10 flex items-center justify-center border-2 border-neon-green/30">
              <ArrowRight className="w-6 h-6 text-neon-green" />
            </div>
          </div>

          {/* 放置位置 */}
          <div className="bg-neon-green/5 rounded-xl p-4 border border-neon-green/30">
            <div className="flex items-center gap-2 text-neon-green/80 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              放置位置
            </div>
            <div className="text-xl font-bold text-neon-green">
              {propFlow.to}
            </div>
          </div>
        </div>

        {/* 下一场收走人 - 高亮显示 */}
        <div
          className={`rounded-xl p-5 border-2 ${
            isConfirmed
              ? 'bg-neon-yellow/5 border-neon-yellow/40'
              : 'bg-neon-yellow/10 border-neon-yellow/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isConfirmed ? 'bg-neon-yellow/20' : 'bg-neon-yellow/20'
                }`}
              >
                <User className="w-6 h-6 text-neon-yellow" />
              </div>
              <div>
                <div className="text-sm text-neon-yellow/80 mb-1 font-medium">
                  下一场收走人
                </div>
                <div className="text-2xl font-bold text-neon-yellow tracking-wide">
                  {propFlow.receiver}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neon-yellow/60 mb-1">
                请确认交接
              </div>
              <div className="text-base text-neon-yellow/80 font-medium">
                → 接收无误
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      {!isConfirmed && !hasIssue && !showDescriptionInput && (
        <div className="flex gap-4">
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 px-6 rounded-xl bg-neon-green/10 border-2 border-neon-green text-neon-green text-lg font-bold hover:bg-neon-green hover:text-black transition-all duration-200 flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            确认放置完成
          </button>
          <button
            onClick={() => setShowIssueMenu(!showIssueMenu)}
            className="py-4 px-6 rounded-xl bg-stage-bg-hover border-2 border-stage-border text-stage-text-secondary hover:border-neon-red hover:text-neon-red transition-all duration-200"
          >
            <AlertTriangle className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 问题类型选择菜单 */}
      {showIssueMenu && !showDescriptionInput && (
        <div className="mt-4 p-4 bg-stage-bg-secondary rounded-xl border border-stage-border animate-fade-in">
          <div className="text-base text-stage-text-secondary mb-3 font-medium">
            选择问题类型：
          </div>
          <div className="grid grid-cols-3 gap-3">
            {issueTypes.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => handleReportIssue(type)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium flex flex-col items-center gap-2 transition-all ${color}`}
              >
                <Icon className="w-6 h-6" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 问题描述输入 */}
      {showDescriptionInput && selectedIssueType && (
        <div className="mt-4 p-4 bg-stage-bg-secondary rounded-xl border border-neon-red/30 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-neon-red">
              报告问题 - {issueTypes.find((t) => t.type === selectedIssueType)?.label}
            </span>
            <button
              onClick={cancelIssue}
              className="text-stage-text-muted hover:text-stage-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="请描述问题详情（可选）..."
            className="w-full p-4 bg-stage-bg-card border border-stage-border rounded-xl text-stage-text placeholder-stage-text-muted resize-none focus:border-neon-red/50 focus:outline-none text-base"
            rows={3}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={cancelIssue}
              className="px-5 py-2.5 rounded-lg border border-stage-border text-stage-text-secondary hover:bg-stage-bg-hover text-base"
            >
              取消
            </button>
            <button
              onClick={submitIssue}
              className="px-5 py-2.5 rounded-lg bg-neon-red text-white font-medium hover:bg-neon-red-dim text-base"
            >
              提交报告
            </button>
          </div>
        </div>
      )}

      {/* 确认时间 */}
      {isConfirmed && propFlow.confirmedAt && (
        <div className="flex items-center gap-2 text-sm text-neon-green/70 mt-2">
          <Clock className="w-4 h-4" />
          确认时间：{new Date(propFlow.confirmedAt).toLocaleTimeString('zh-CN')}
        </div>
      )}
    </div>
  );
}
