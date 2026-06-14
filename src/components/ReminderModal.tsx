import { useEffect, useState } from "react";
import {
  X,
  Send,
  MessageSquare,
  Phone,
  Mail,
  Smartphone,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  User,
  Building2,
  CheckCircle2,
  History,
  Star,
} from "lucide-react";
import type { LendRecord, ReminderChannel, ReminderRecord } from "@/types";
import { REMINDER_CHANNELS } from "@/types";
import { formatDateTime, overdueDays, formatDate } from "@/utils/format";

const channelIcons: Record<ReminderChannel, React.FC<{ className?: string }>> = {
  sms: Smartphone,
  phone: Phone,
  wechat: MessageSquare,
  email: Mail,
};

const channelLabels: Record<ReminderChannel, string> = {
  sms: "短信",
  phone: "电话",
  wechat: "企微",
  email: "邮件",
};

interface Props {
  open: boolean;
  onClose: () => void;
  record: LendRecord | null;
  reminders: ReminderRecord[];
  onConfirm: (payload: {
    channel: ReminderChannel;
    note?: string;
  }) => void;
}

export default function ReminderModal({
  open,
  onClose,
  record,
  reminders,
  onConfirm,
}: Props) {
  const [channel, setChannel] = useState<ReminderChannel>("wechat");
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setChannel("wechat");
      setNote("");
      setShowSuccess(false);
    }
  }, [open]);

  if (!open || !record) return null;

  const recordReminders = reminders.filter((r) => r.lendRecordId === record.id);
  const days = overdueDays(record.expectedReturnTime);

  const handleSubmit = () => {
    onConfirm({ channel, note: note.trim() || undefined });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate2-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-gradient-to-r from-signal-500 to-signal-600 text-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">发送逾期催还提醒</h3>
              <p className="text-xs text-white/80 mt-0.5">
                已逾期 <b className="font-mono text-amber-200">{days}</b> 天，
                共催还 <b className="font-mono text-amber-200">{recordReminders.length}</b> 次
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/15 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {showSuccess && (
            <div className="m-4 p-3 rounded-lg bg-forest-50 border border-forest-200 flex items-center gap-2 text-sm text-forest-700 animate-slide-up">
              <CheckCircle2 className="w-5 h-5 text-forest-500 flex-shrink-0" />
              催还提醒已通过「{channelLabels[channel]}」成功发送，记录已归档
            </div>
          )}

          <div className="p-5 border-b border-slate2-100 bg-gradient-to-br from-signal-50/50 to-white">
            <h4 className="text-xs font-semibold text-slate2-500 uppercase tracking-wide mb-3">
              借出信息概览
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white border border-slate2-100">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5 text-steel-500" />
                  <span className="text-xs text-slate2-500">篮子编号</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate2-800">
                    {record.basketCode}
                  </span>
                  {record.hasValuable && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate2-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-steel-500" />
                  <span className="text-xs text-slate2-500">借用人</span>
                </div>
                <p className="font-semibold text-slate2-800 text-sm">
                  {record.borrowerName}
                  <span className="ml-2 text-xs text-slate2-500 font-mono">
                    {record.borrowerPhone}
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate2-100">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-steel-500" />
                  <span className="text-xs text-slate2-500">所属部门</span>
                </div>
                <p className="font-semibold text-slate2-800 text-sm">
                  {record.department}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate2-100">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-steel-500" />
                  <span className="text-xs text-slate2-500">存放地点</span>
                </div>
                <p className="font-semibold text-slate2-800 text-sm truncate">
                  {record.destination}
                </p>
              </div>
              <div className="col-span-2 p-3 rounded-lg bg-white border border-slate2-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-steel-500" />
                  <span className="text-xs text-slate2-500">时间节点</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-[10px] text-slate2-400 uppercase tracking-wide">
                      借出时间
                    </span>
                    <p className="font-mono font-semibold text-slate2-700 text-xs mt-0.5">
                      {formatDate(record.lendTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-signal-400 uppercase tracking-wide">
                      应归还（已过）
                    </span>
                    <p className="font-mono font-semibold text-signal-600 text-xs mt-0.5">
                      {formatDate(record.expectedReturnTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-signal-500 uppercase tracking-wide">
                      逾期天数
                    </span>
                    <p className="font-display font-bold text-signal-500 text-xl tabular-nums mt-0.5">
                      {days} 天
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border-b border-slate2-100">
            <h4 className="text-xs font-semibold text-slate2-500 uppercase tracking-wide mb-3">
              ① 选择通知渠道
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {REMINDER_CHANNELS.map((ch) => {
                const Icon = channelIcons[ch.value];
                const active = channel === ch.value;
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => setChannel(ch.value)}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 ${
                      active
                        ? "border-steel-500 bg-steel-50 shadow-industrial"
                        : "border-slate2-200 bg-white hover:border-steel-300 hover:bg-steel-50/30"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-steel-600" : "text-slate2-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        active ? "text-steel-700" : "text-slate2-600"
                      }`}
                    >
                      {ch.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate2-400">
                      {record.borrowerPhone}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 border-b border-slate2-100">
            <h4 className="text-xs font-semibold text-slate2-500 uppercase tracking-wide mb-3">
              ② 催还备注（可选）
            </h4>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="例如：请务必今日18点前送还，后续会议需使用；或电话沟通结果记录等..."
              className="input-base resize-none text-sm"
            />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate2-500 uppercase tracking-wide flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                历史催还记录
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-steel-100 text-steel-700 font-mono text-[10px]">
                  {recordReminders.length}
                </span>
              </h4>
            </div>
            {recordReminders.length === 0 ? (
              <div className="py-6 text-center rounded-lg bg-slate2-50 border border-dashed border-slate2-200">
                <p className="text-xs text-slate2-400">
                  此借出记录暂无催还历史，上方点击发送即可生成第一条记录
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto scrollbar-thin">
                {recordReminders
                  .slice()
                  .sort(
                    (a, b) =>
                      +new Date(b.remindTime) - +new Date(a.remindTime)
                  )
                  .map((rm, idx) => {
                    const Icon = channelIcons[rm.channel];
                    return (
                      <div
                        key={rm.id}
                        className="p-3 rounded-lg bg-slate2-50 border border-slate2-100"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex flex-col items-center gap-1 pt-0.5">
                            <div className="w-7 h-7 rounded-md bg-white border border-slate2-200 flex items-center justify-center text-steel-600">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            {idx < recordReminders.length - 1 && (
                              <div className="w-px flex-1 min-h-[24px] bg-slate2-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate2-800">
                                  {channelLabels[rm.channel]}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-signal-100 text-signal-600 text-[10px] font-bold font-mono">
                                  逾期 {rm.overdueDays} 天
                                </span>
                                <span className="text-[11px] text-slate2-400">
                                  操作：{rm.operator}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-slate2-500">
                                {formatDateTime(rm.remindTime)}
                              </span>
                            </div>
                            {rm.note && (
                              <p className="text-xs text-slate2-600 bg-white px-2.5 py-1.5 rounded border border-slate2-100 mt-1.5">
                                {rm.note}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate2-400">
                              <span>📦 {rm.basketCode}</span>
                              <span>👤 {rm.borrowerName}</span>
                              <span>📱 {rm.borrowerPhone}</span>
                              <span>📍 {rm.destination}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate2-50 border-t border-slate2-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            关闭
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
            发送「{channelLabels[channel]}」提醒
          </button>
        </div>
      </div>
    </div>
  );
}
