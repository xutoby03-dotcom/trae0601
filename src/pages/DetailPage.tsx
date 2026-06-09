import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../store/AppContext';
import { POSITION_LABELS, TYPE_LABELS, TYPE_ICONS } from '../types';
import dayjs from 'dayjs';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useAppState();

  const item = state.items.find((i) => i.id === id);

  const [showRetrieveModal, setShowRetrieveModal] = useState(false);
  const [wasWet, setWasWet] = useState(false);
  const [wasMoved, setWasMoved] = useState(false);
  const [msgAuthor, setMsgAuthor] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    const template = searchParams.get('template');
    if (template) {
      setMsgContent(decodeURIComponent(template));
    }
  }, [searchParams]);

  if (!item) {
    return (
      <div className="page detail-page">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← 返回
          </button>
          <h1>未找到该晾晒物</h1>
        </div>
      </div>
    );
  }

  const now = dayjs();
  const end = dayjs(item.expectedEndTime);
  const diff = end.diff(now, 'minute');
  const isOvertime = diff < 0;
  const isRetrieved = item.status === 'retrieved';

  function handleRetrieve() {
    if (!id) return;
    dispatch({
      type: 'RETRIEVE_ITEM',
      payload: { id, wasWet, wasMoved },
    });
    setShowRetrieveModal(false);
  }

  function handleAddMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgAuthor.trim() || !msgContent.trim()) {
      setMsgError('请填写姓名和留言内容');
      return;
    }
    if (!id) return;
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { itemId: id, author: msgAuthor.trim(), content: msgContent.trim() },
    });
    setMsgContent('');
    setMsgError('');
  }

  return (
    <div className="page detail-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← 返回
        </button>
        <h1>晾晒详情</h1>
      </div>

      <div className={`detail-card ${isOvertime && !isRetrieved ? 'detail-card--overtime' : ''} ${isRetrieved ? 'detail-card--retrieved' : ''}`}>
        <div className="detail-card__status">
          {isRetrieved ? (
            <span className="status-badge status-badge--retrieved">✅ 已收回</span>
          ) : isOvertime ? (
            <span className="status-badge status-badge--overtime">🚨 已超时</span>
          ) : (
            <span className="status-badge status-badge--active">🕐 晾晒中</span>
          )}
        </div>

        <div className="detail-info">
          <div className="detail-info__row">
            <span className="detail-info__label">类型</span>
            <span className="detail-info__value">
              {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}
            </span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">位置</span>
            <span className="detail-info__value">{POSITION_LABELS[item.position]}</span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">晾晒人</span>
            <span className="detail-info__value">{item.owner}</span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">联系电话</span>
            <span className="detail-info__value">
              <a href={`tel:${item.phone}`}>{item.phone}</a>
            </span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">开始时间</span>
            <span className="detail-info__value">
              {dayjs(item.startTime).format('YYYY-MM-DD HH:mm')}
            </span>
          </div>
          <div className="detail-info__row">
            <span className="detail-info__label">预计收回</span>
            <span className="detail-info__value">
              {dayjs(item.expectedEndTime).format('YYYY-MM-DD HH:mm')}
            </span>
          </div>
          {!isRetrieved && (
            <div className="detail-info__row">
              <span className="detail-info__label">剩余时间</span>
              <span className={`detail-info__value ${isOvertime ? 'text-danger' : 'text-warning'}`}>
                {isOvertime
                  ? `已超时 ${Math.abs(Math.ceil(diff / 60))} 小时 ${Math.abs(diff % 60)} 分钟`
                  : `${Math.floor(diff / 60)} 小时 ${diff % 60} 分钟`}
              </span>
            </div>
          )}
          <div className="detail-info__row">
            <span className="detail-info__label">怕雨</span>
            <span className="detail-info__value">{item.fearRain ? '🌧️ 是' : '否'}</span>
          </div>
          {isRetrieved && (
            <>
              <div className="detail-info__row">
                <span className="detail-info__label">收回时间</span>
                <span className="detail-info__value">
                  {item.retrievedAt ? dayjs(item.retrievedAt).format('YYYY-MM-DD HH:mm') : '-'}
                </span>
              </div>
              <div className="detail-info__row">
                <span className="detail-info__label">是否被淋湿</span>
                <span className="detail-info__value">{item.wasWet ? '😢 是' : '否'}</span>
              </div>
              <div className="detail-info__row">
                <span className="detail-info__label">是否被挪动</span>
                <span className="detail-info__value">{item.wasMoved ? '😤 是' : '否'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {!isRetrieved && (
        <div className="detail-actions">
          <button
            className="btn btn--success btn--full"
            onClick={() => setShowRetrieveModal(true)}
          >
            ✅ 标记已收回
          </button>
        </div>
      )}

      <div className="detail-messages">
        <h2 className="detail-messages__title">💬 邻居留言</h2>

        {item.messages.length > 0 && (
          <div className="message-list">
            {item.messages.map((msg) => (
              <div key={msg.id} className="message-item">
                <div className="message-item__header">
                  <span className="message-item__author">{msg.author}</span>
                  <span className="message-item__time">
                    {dayjs(msg.createdAt).format('HH:mm')}
                  </span>
                </div>
                <div className="message-item__content">{msg.content}</div>
              </div>
            ))}
          </div>
        )}

        {item.messages.length === 0 && (
          <div className="message-empty">暂无留言，来做第一个提醒的邻居吧～</div>
        )}

        {!isRetrieved && (
          <form className="message-form" onSubmit={handleAddMessage}>
            <div className="form-group">
              <input
                className="form-input"
                value={msgAuthor}
                onChange={(e) => setMsgAuthor(e.target.value)}
                placeholder="您的姓名"
              />
            </div>
            <div className="form-group">
              <textarea
                className="form-textarea"
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                placeholder="留言提醒，如：风大快掉了、挡住别人位置了..."
                rows={3}
              />
            </div>
            {msgError && <span className="form-error">{msgError}</span>}
            <button type="submit" className="btn btn--primary btn--full">
              发送留言
            </button>
          </form>
        )}
      </div>

      {showRetrieveModal && (
        <div className="modal-overlay" onClick={() => setShowRetrieveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">标记已收回</h2>
            <div className="modal__body">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={wasWet}
                  onChange={(e) => setWasWet(e.target.checked)}
                />
                <span>被淋湿了</span>
              </label>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={wasMoved}
                  onChange={(e) => setWasMoved(e.target.checked)}
                />
                <span>被别人挪动了</span>
              </label>
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setShowRetrieveModal(false)}>
                取消
              </button>
              <button className="btn btn--success" onClick={handleRetrieve}>
                确认收回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
