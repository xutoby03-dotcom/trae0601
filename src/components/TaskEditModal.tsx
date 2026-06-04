import React, { useState, useEffect } from 'react';
import { TaskNode, CalendarConfig } from '../types';
import { getWorkDaysBetween } from '../utils/dateUtils';

interface TaskEditModalProps {
  visible: boolean;
  task: TaskNode | null;
  resources: string[];
  calendar: CalendarConfig;
  onSave: (task: TaskNode) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onAddResource: (name: string) => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  visible,
  task,
  resources,
  calendar,
  onSave,
  onCancel,
  onDelete,
  onAddResource,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
      setProgress(task.progress);
      setIsMilestone(task.isMilestone);
      setAssignees(task.assignees);
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setProgress(0);
      setIsMilestone(false);
      setAssignees([]);
    }
  }, [task, visible]);

  if (!visible || !task) return null;

  const handleToggleAssignee = (resource: string) => {
    if (assignees.includes(resource)) {
      setAssignees(assignees.filter((a) => a !== resource));
    } else if (assignees.length < 2) {
      setAssignees([...assignees, resource]);
    } else {
      alert('最多只能指派2个负责人');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入任务名称');
      return;
    }
    if (!startDate || !endDate) {
      alert('请选择开始和结束日期');
      return;
    }
    if (startDate > endDate && !isMilestone) {
      alert('开始日期不能晚于结束日期');
      return;
    }

    const duration = isMilestone ? 0 : getWorkDaysBetween(startDate, endDate, calendar);

    onSave({
      ...task,
      name: name.trim(),
      startDate: isMilestone ? startDate : startDate,
      endDate: isMilestone ? startDate : endDate,
      progress,
      isMilestone,
      assignees,
      duration,
    });
  };

  const duration = isMilestone ? 0 : getWorkDaysBetween(startDate, endDate, calendar);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{task.id.startsWith('new-') ? '新建任务' : '编辑任务'}</div>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-item">
            <label className="form-label">任务名称</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入任务名称"
            />
          </div>

          <div className="form-row">
            <div className="form-item">
              <label className="form-label">开始日期</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isMilestone}
              />
            </div>
            <div className="form-item">
              <label className="form-label">结束日期</label>
              <input
                type="date"
                className="form-input"
                value={isMilestone ? startDate : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isMilestone}
              />
            </div>
          </div>

          {!isMilestone && (
            <div className="form-item">
              <label className="form-label">
                工期: {duration} 工作日
              </label>
            </div>
          )}

          <div className="form-row">
            <div className="form-item">
              <label className="form-label">进度 (%)</label>
              <input
                type="range"
                className="form-input"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                min={0}
                max={100}
                step={5}
              />
              <input
                type="number"
                className="form-input progress-input"
                value={progress}
                onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                min={0}
                max={100}
                style={{ width: '80px', marginTop: '8px' }}
              />
            </div>
            <div className="form-item">
              <label className="form-label">里程碑</label>
              <div style={{ display: 'flex', alignItems: 'center', height: '40px', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={isMilestone}
                  onChange={(e) => setIsMilestone(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>标记为里程碑节点</span>
              </div>
            </div>
          </div>

          <div className="form-item">
            <label className="form-label">负责人 (最多2人)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {resources.map((resource) => (
                <label
                  key={resource}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: assignees.includes(resource) ? '#e6f7ff' : '#f5f5f5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: assignees.includes(resource) ? '1px solid #1890ff' : '1px solid transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assignees.includes(resource)}
                    onChange={() => handleToggleAssignee(resource)}
                    style={{ display: 'none' }}
                  />
                  {resource}
                </label>
              ))}
            </div>
            {assignees.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                已选择: {assignees.join(', ')}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="添加新负责人"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newResource.trim()) {
                    e.preventDefault();
                    const trimmed = newResource.trim();
                    onAddResource(trimmed);
                    if (!assignees.includes(trimmed) && assignees.length < 2) {
                      setAssignees([...assignees, trimmed]);
                    }
                    setNewResource('');
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {onDelete && !task.id.startsWith('new-') && (
            <button className="toolbar-btn danger" onClick={onDelete}>
              删除任务
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="toolbar-btn" onClick={onCancel}>取消</button>
          <button className="toolbar-btn primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
