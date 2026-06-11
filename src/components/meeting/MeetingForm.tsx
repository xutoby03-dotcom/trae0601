import { useState, useEffect } from 'react';
import { X, Plus, User, FileText } from 'lucide-react';
import { Meeting, MeetingType, Attachment, MEETING_TYPE_LABELS, DEPARTMENTS } from '@/types';
import { today } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface MeetingFormProps {
  initialData?: Meeting;
  onSubmit: (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  className?: string;
}

export default function MeetingForm({
  initialData,
  onSubmit,
  onCancel,
  className,
}: MeetingFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('weekly');
  const [date, setDate] = useState(today());
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [participantDept, setParticipantDept] = useState(DEPARTMENTS[0]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setDate(initialData.date);
      setParticipants(initialData.participants);
      setAttachments(initialData.attachments);
    }
  }, [initialData]);

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      const participant = `${newParticipant.trim()}(${participantDept})`;
      if (!participants.includes(participant)) {
        setParticipants([...participants, participant]);
      }
      setNewParticipant('');
    }
  };

  const handleRemoveParticipant = (participant: string) => {
    setParticipants(participants.filter((p) => p !== participant));
  };

  const handleAddAttachment = () => {
    if (newAttachmentName.trim() && newAttachmentUrl.trim()) {
      setAttachments([
        ...attachments,
        {
          name: newAttachmentName.trim(),
          url: newAttachmentUrl.trim(),
          type: newAttachmentName.split('.').pop() || 'unknown',
        },
      ]);
      setNewAttachmentName('');
      setNewAttachmentUrl('');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      type,
      date,
      participants,
      attachments,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden animate-slide-up',
        className
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          {initialData ? '编辑会议' : '新建会议'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            会议主题 <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入会议主题"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              会议类型
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MeetingType)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm bg-white"
            >
              {Object.entries(MEETING_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              会议日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            参会人员
          </label>
          <div className="flex gap-2 mb-2">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                placeholder="姓名"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
              />
              <select
                value={participantDept}
                onChange={(e) => setParticipantDept(e.target.value)}
                className="w-32 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddParticipant}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {participants.map((participant) => (
                <span
                  key={participant}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  {participant}
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(participant)}
                    className="ml-1 hover:text-danger-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            会议附件
          </label>
          <div className="space-y-2 mb-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="文件名称"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
              />
              <input
                type="text"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="文件链接"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-2 mt-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name}-${index}`}
                  className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{attachment.name}</span>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600 ml-2"
                    >
                      查看
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="text-gray-400 hover:text-danger-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {initialData ? '保存修改' : '创建会议'}
        </button>
      </div>
    </form>
  );
}
