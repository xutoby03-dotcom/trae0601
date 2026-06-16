import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDisplayDate, getTodayString, getDateString } from '../utils/storage';
import { getQualifiedStatus, getStatusText, getOdorText } from '../utils/statistics';
import { OdorLevel, ReminderType } from '../types';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Slider from '../components/Slider';
import Toggle from '../components/Toggle';
import EmojiPicker, { odorOptions } from '../components/EmojiPicker';
import AlertBanner from '../components/AlertBanner';

const Records: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { braces, records, reminders, init, initialized, addRecord, updateRecord, deleteRecord, runReminderCheck } = useStore();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedBraces, setSelectedBraces] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [fromReminder, setFromReminder] = useState<{
    reminderId: string;
    type: ReminderType;
    bracesName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    wearHours: 20,
    isBrushed: true,
    isSoaked: true,
    tookBoxOut: false,
    boxReturned: true,
    odorLevel: 0 as OdorLevel,
    hasPain: false,
    painLocation: '',
    hasCrack: false,
    isLoose: false,
    notes: '',
  });

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [init, initialized]);

  useEffect(() => {
    if (!initialized || braces.length === 0) return;

    const bracesId = searchParams.get('bracesId');
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const reminderId = searchParams.get('reminderId');
    const type = searchParams.get('type') as ReminderType;

    if (from === 'reminder' && bracesId) {
      const brace = braces.find(b => b.id === bracesId);
      if (brace) {
        setSelectedBraces(bracesId);
        if (date) {
          setSelectedDate(date);
        }
        if (reminderId && type) {
          const reminder = reminders.find(r => r.id === reminderId && !r.isResolved);
          if (reminder) {
            setFromReminder({
              reminderId,
              type,
              bracesName: brace.name,
            });
          }
        }
      }
    } else if (braces.length > 0 && !selectedBraces) {
      setSelectedBraces(braces[0].id);
    }
  }, [initialized, braces, searchParams, reminders, selectedBraces]);

  useEffect(() => {
    const existingRecord = records.find(
      r => r.recordDate === selectedDate && r.bracesId === selectedBraces
    );
    if (existingRecord) {
      setEditingRecord(existingRecord.id);
      setFormData({
        wearHours: existingRecord.wearHours,
        isBrushed: existingRecord.isBrushed,
        isSoaked: existingRecord.isSoaked,
        tookBoxOut: existingRecord.tookBoxOut,
        boxReturned: existingRecord.boxReturned,
        odorLevel: existingRecord.odorLevel,
        hasPain: existingRecord.hasPain || false,
        painLocation: existingRecord.painLocation || '',
        hasCrack: existingRecord.hasCrack || false,
        isLoose: existingRecord.isLoose || false,
        notes: existingRecord.notes || '',
      });
      setShowForm(true);
    } else {
      setEditingRecord(null);
      setShowForm(false);
      setFormData({
        wearHours: 20,
        isBrushed: true,
        isSoaked: true,
        tookBoxOut: false,
        boxReturned: true,
        odorLevel: 0 as OdorLevel,
        hasPain: false,
        painLocation: '',
        hasCrack: false,
        isLoose: false,
        notes: '',
      });
    }
  }, [selectedDate, selectedBraces, records]);

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = getDateString(i);
    const hasRecord = records.some(
      r => r.recordDate === date && r.bracesId === selectedBraces
    );
    const record = records.find(
      r => r.recordDate === date && r.bracesId === selectedBraces
    );
    const status = record ? getQualifiedStatus(record) : null;
    return { date, hasRecord, status };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBraces) return;

    const recordData = {
      bracesId: selectedBraces,
      recordDate: selectedDate,
      ...formData,
    };

    if (editingRecord) {
      updateRecord(editingRecord, recordData);
    } else {
      addRecord(recordData);
    }

    if (formData.isSoaked && !editingRecord) {
      const inventory = useStore.getState().inventories.find(i => i.bracesId === selectedBraces);
      if (inventory) {
        useStore.getState().updateInventory(selectedBraces, -1);
      }
    }
  };

  const handleDelete = (recordId: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      deleteRecord(recordId);
      setShowForm(false);
      setEditingRecord(null);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  const currentBracesRecords = records
    .filter(r => r.bracesId === selectedBraces)
    .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-primary text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-warm-gray transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display text-warm-dark">每日记录 📝</h1>
          <p className="text-gray-500 mt-1">记录每天的佩戴和清洁情况</p>
        </div>
        {braces.length > 1 && (
          <select
            value={selectedBraces}
            onChange={(e) => setSelectedBraces(e.target.value)}
            className="input-base w-auto"
          >
            {braces.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {fromReminder && (
        <AlertBanner
          type="info"
          title={`来自提醒：${fromReminder.bracesName}`}
          description={`请补全${formatDisplayDate(selectedDate)}的记录，完成后提醒会自动消失`}
          action={{
            label: '返回提醒中心',
            onClick: () => navigate('/reminders'),
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>选择日期</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {dateOptions.map(({ date, hasRecord, status }) => {
              const isSelected = date === selectedDate;
              const isToday = date === getTodayString();
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all min-w-[70px] ${
                    isSelected
                      ? 'bg-primary text-white'
                      : hasRecord
                        ? status?.color === 'bg-primary'
                          ? 'bg-primary/10 text-primary'
                          : status?.color === 'bg-accent-yellow'
                            ? 'bg-accent-yellow/10 text-accent-yellow'
                            : 'bg-accent-coral/10 text-accent-coral'
                        : 'bg-warm-gray/50 text-gray-500'
                  }`}
                >
                  <span className="text-xs font-medium">
                    {getDayName(date)}
                    {isToday && ' (今天)'}
                  </span>
                  <span className="text-xl font-bold font-display mt-1">
                    {new Date(date).getDate()}
                  </span>
                  {hasRecord && (
                    <span className="text-xs mt-1">
                      {status ? getStatusText(status.status).split(' ')[0] : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {editingRecord ? '编辑记录' : '今日记录'}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {formatDisplayDate(selectedDate)}
                </p>
              </div>
              {editingRecord && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingRecord)}
                  className="p-2 rounded-lg text-accent-coral hover:bg-accent-coral/10 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <Slider
                value={formData.wearHours}
                onChange={(v) => setFormData(prev => ({ ...prev, wearHours: v }))}
                label="佩戴时长"
                min={0}
                max={24}
              />

              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  checked={formData.isBrushed}
                  onChange={(v) => setFormData(prev => ({ ...prev, isBrushed: v }))}
                  label="已刷洗 🪥"
                />
                <Toggle
                  checked={formData.isSoaked}
                  onChange={(v) => setFormData(prev => ({ ...prev, isSoaked: v }))}
                  label="已泡片 💧"
                />
                <Toggle
                  checked={formData.tookBoxOut}
                  onChange={(v) => setFormData(prev => ({ ...prev, tookBoxOut: v }))}
                  label="带盒外出 📦"
                />
                <Toggle
                  checked={formData.boxReturned}
                  onChange={(v) => setFormData(prev => ({ ...prev, boxReturned: v }))}
                  label="盒子已带回 ✅"
                  disabled={!formData.tookBoxOut}
                />
              </div>

              <EmojiPicker
                value={formData.odorLevel}
                onChange={(v) => setFormData(prev => ({ ...prev, odorLevel: v as OdorLevel }))}
                options={odorOptions}
                label="异味情况"
              />

              <div className="pt-4 border-t border-warm-gray">
                <h4 className="font-medium text-warm-dark mb-4">复诊相关问题</h4>
                <div className="space-y-4">
                  <Toggle
                    checked={formData.hasPain}
                    onChange={(v) => setFormData(prev => ({ ...prev, hasPain: v }))}
                    label="有压痛 😣"
                  />
                  {formData.hasPain && (
                    <div>
                      <label className="label-base">压痛位置</label>
                      <input
                        type="text"
                        value={formData.painLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, painLocation: e.target.value }))}
                        placeholder="例如：左侧后牙"
                        className="input-base"
                      />
                    </div>
                  )}
                  <Toggle
                    checked={formData.hasCrack}
                    onChange={(v) => setFormData(prev => ({ ...prev, hasCrack: v }))}
                    label="有裂纹 🔍"
                  />
                  <Toggle
                    checked={formData.isLoose}
                    onChange={(v) => setFormData(prev => ({ ...prev, isLoose: v }))}
                    label="感觉松动 📏"
                  />
                </div>
              </div>

              <div>
                <label className="label-base">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="记录其他情况..."
                  className="input-base min-h-[80px]"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {editingRecord ? '保存修改' : '保存记录'}
              </button>
            </CardContent>
          </Card>
        </form>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-bold font-display mb-2">
              {formatDisplayDate(selectedDate)} 还没有记录
            </h3>
            <p className="text-gray-500 mb-4">
              点击下方按钮添加今天的记录
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              添加记录
            </button>
          </CardContent>
        </Card>
      )}

      {formData.tookBoxOut && !formData.boxReturned && (
        <AlertBanner
          type="error"
          title="盒子未带回"
          description="记得确认盒子是否丢失，如有丢失请标记提醒"
          action={{
            label: '去提醒中心',
            onClick: () => navigate('/reminders'),
          }}
        />
      )}

      {currentBracesRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {currentBracesRecords.map(record => {
              const status = getQualifiedStatus(record);
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-warm-gray/30 hover:bg-warm-gray/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedDate(record.recordDate);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <div>
                      <div className="font-medium">{formatDisplayDate(record.recordDate)}</div>
                      <div className="text-sm text-gray-500">
                        佩戴 {record.wearHours} 小时
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{getStatusText(status.status)}</div>
                      <div className="text-xs text-gray-400">
                        {record.isBrushed && '🪥'} {record.isSoaked && '💧'}
                        {record.tookBoxOut && '📦'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(record.recordDate);
                      }}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <Edit2 size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Records;
