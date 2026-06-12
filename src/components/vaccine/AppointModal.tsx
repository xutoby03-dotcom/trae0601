import Modal from '../ui/Modal';
import { useState, useEffect } from 'react';
import type { Vaccine } from '@/types';

interface AppointModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    appointmentTime: string;
    appointmentLocation: string;
    queueNumber?: string;
    appointmentRemark?: string;
  }) => void;
  vaccine?: Vaccine | null;
  defaultLocation?: string;
}

export default function AppointModal({
  open,
  onClose,
  onSubmit,
  vaccine,
  defaultLocation = '',
}: AppointModalProps) {
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [queueNumber, setQueueNumber] = useState('');
  const [appointmentRemark, setAppointmentRemark] = useState('');

  useEffect(() => {
    if (open) {
      if (vaccine) {
        setAppointmentTime(
          vaccine.appointmentTime ||
            `${vaccine.suggestedDate}T09:00`.slice(0, 16),
        );
        setAppointmentLocation(
          vaccine.appointmentLocation || defaultLocation || '',
        );
        setQueueNumber(vaccine.queueNumber || '');
        setAppointmentRemark(vaccine.appointmentRemark || '');
      } else {
        setAppointmentTime('');
        setAppointmentLocation(defaultLocation || '');
        setQueueNumber('');
        setAppointmentRemark('');
      }
    }
  }, [open, vaccine, defaultLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentTime || !appointmentLocation.trim()) {
      alert('请填写预约时间和地点');
      return;
    }
    const [datePart, timePart] = appointmentTime.split('T');
    const formattedTime = `${datePart} ${timePart || '09:00'}`;
    onSubmit({
      appointmentTime: formattedTime,
      appointmentLocation: appointmentLocation.trim(),
      queueNumber: queueNumber.trim() || undefined,
      appointmentRemark: appointmentRemark.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vaccine ? `预约：${vaccine.name} 第${vaccine.dose}剂` : '预约登记'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-accent btn-sm"
          >
            确认预约
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="p-4 rounded-xl bg-accent-50/60 border border-accent-100 mb-2">
          <p className="text-sm text-accent-700">
            建议日期：<span className="font-medium">{vaccine?.suggestedDate}</span>
            ，最晚日期：<span className="font-medium">{vaccine?.latestDate}</span>
          </p>
        </div>
        <div>
          <label className="label">预约时间 *</label>
          <input
            type="datetime-local"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">接种地点 *</label>
          <input
            value={appointmentLocation}
            onChange={(e) => setAppointmentLocation(e.target.value)}
            className="input"
            placeholder="如：朝阳区社区卫生服务中心"
          />
        </div>
        <div>
          <label className="label">排队号 / 预约号</label>
          <input
            value={queueNumber}
            onChange={(e) => setQueueNumber(e.target.value)}
            className="input"
            placeholder="如有请填写"
          />
        </div>
        <div>
          <label className="label">备注</label>
          <textarea
            value={appointmentRemark}
            onChange={(e) => setAppointmentRemark(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="注意事项或备注信息"
          />
        </div>
      </form>
    </Modal>
  );
}
