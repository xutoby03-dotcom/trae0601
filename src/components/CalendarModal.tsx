import React, { useState } from 'react';
import { CalendarConfig } from '../types';

interface CalendarModalProps {
  visible: boolean;
  calendar: CalendarConfig;
  onSave: (calendar: CalendarConfig) => void;
  onCancel: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  calendar,
  onSave,
  onCancel,
}) => {
  const [workDays, setWorkDays] = useState<number[]>(calendar.workDays);
  const [holidays, setHolidays] = useState<string[]>(calendar.holidays);
  const [newHoliday, setNewHoliday] = useState('');

  if (!visible) return null;

  const handleToggleWorkDay = (day: number) => {
    if (workDays.includes(day)) {
      setWorkDays(workDays.filter((d) => d !== day));
    } else {
      setWorkDays([...workDays, day].sort());
    }
  };

  const handleAddHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays([...holidays, newHoliday].sort());
      setNewHoliday('');
    }
  };

  const handleRemoveHoliday = (holiday: string) => {
    setHolidays(holidays.filter((h) => h !== holiday));
  };

  const handleSave = () => {
    onSave({
      workDays,
      holidays,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">日历配置</div>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-item">
            <label className="form-label">工作日设置</label>
            <div className="weekday-selector">
              {WEEKDAYS.map((name, index) => (
                <button
                  key={index}
                  className={`weekday-btn ${workDays.includes(index) ? 'selected' : ''}`}
                  onClick={() => handleToggleWorkDay(index)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              点击选择或取消工作日，默认周一至周五
            </div>
          </div>

          <div className="form-item">
            <label className="form-label">假期设置</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="date"
                className="form-input"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                placeholder="选择假期日期"
              />
              <button className="toolbar-btn primary" onClick={handleAddHoliday}>
                添加
              </button>
            </div>
            <div className="holiday-list">
              {holidays.length === 0 ? (
                <div style={{ color: '#999', fontSize: '12px' }}>暂无假期设置</div>
              ) : (
                holidays.map((holiday) => (
                  <div key={holiday} className="holiday-item">
                    <input
                      type="date"
                      className="form-input"
                      value={holiday}
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                    <button
                      className="toolbar-btn danger"
                      onClick={() => handleRemoveHoliday(holiday)}
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="toolbar-btn" onClick={onCancel}>取消</button>
          <button className="toolbar-btn primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
