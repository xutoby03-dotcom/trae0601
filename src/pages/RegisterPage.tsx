import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import { POSITION_LABELS, TYPE_LABELS } from '../types';
import type { DryingPosition, DryingItemType } from '../types';
import dayjs from 'dayjs';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { dispatch } = useAppState();

  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<DryingPosition>('roof-a');
  const [type, setType] = useState<DryingItemType>('quilt');
  const [startTime, setStartTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [expectedEndTime, setExpectedEndTime] = useState(
    dayjs().add(4, 'hour').format('YYYY-MM-DDTHH:mm')
  );
  const [fearRain, setFearRain] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!owner.trim()) e.owner = '请填写晾晒人姓名';
    if (!phone.trim()) e.phone = '请填写联系电话';
    if (!/^1\d{10}$/.test(phone.trim()) && phone.trim()) e.phone = '请输入正确的手机号';
    if (!startTime) e.startTime = '请选择开始时间';
    if (!expectedEndTime) e.expectedEndTime = '请选择预计收回时间';
    if (dayjs(expectedEndTime).isBefore(dayjs(startTime))) {
      e.expectedEndTime = '收回时间必须晚于开始时间';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: crypto.randomUUID(),
        owner: owner.trim(),
        phone: phone.trim(),
        position,
        type,
        startTime,
        expectedEndTime,
        fearRain,
        status: 'active',
        messages: [],
        createdAt: new Date().toISOString(),
      },
    });
    navigate('/');
  }

  return (
    <div className="page register-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>登记晾晒物</h1>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">晾晒人姓名 *</label>
          <input
            className={`form-input ${errors.owner ? 'form-input--error' : ''}`}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="您的姓名"
          />
          {errors.owner && <span className="form-error">{errors.owner}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">联系电话 *</label>
          <input
            className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11位手机号"
            maxLength={11}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">晾晒位置 *</label>
          <div className="form-radio-group">
            {(Object.entries(POSITION_LABELS) as [DryingPosition, string][]).map(
              ([key, label]) => (
                <label
                  key={key}
                  className={`form-radio ${position === key ? 'form-radio--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="position"
                    value={key}
                    checked={position === key}
                    onChange={() => setPosition(key)}
                  />
                  <span>{label}</span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">晾晒类型 *</label>
          <div className="form-radio-group">
            {(Object.entries(TYPE_LABELS) as [DryingItemType, string][]).map(([key, label]) => (
              <label
                key={key}
                className={`form-radio ${type === key ? 'form-radio--active' : ''}`}
              >
                <input
                  type="radio"
                  name="type"
                  value={key}
                  checked={type === key}
                  onChange={() => setType(key)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group--half">
            <label className="form-label">开始时间 *</label>
            <input
              type="datetime-local"
              className={`form-input ${errors.startTime ? 'form-input--error' : ''}`}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            {errors.startTime && <span className="form-error">{errors.startTime}</span>}
          </div>
          <div className="form-group form-group--half">
            <label className="form-label">预计收回时间 *</label>
            <input
              type="datetime-local"
              className={`form-input ${errors.expectedEndTime ? 'form-input--error' : ''}`}
              value={expectedEndTime}
              onChange={(e) => setExpectedEndTime(e.target.value)}
            />
            {errors.expectedEndTime && (
              <span className="form-error">{errors.expectedEndTime}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={fearRain}
              onChange={(e) => setFearRain(e.target.checked)}
            />
            <span>怕雨（下雨时自动提醒收回）</span>
          </label>
        </div>

        <button type="submit" className="btn btn--primary btn--full">
          确认登记
        </button>
      </form>
    </div>
  );
}
